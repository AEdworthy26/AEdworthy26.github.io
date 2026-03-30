/**
 * generate-news.js
 *
 * Fetches the BBC World News RSS feed, extracts the top stories,
 * and writes a structured news.json file to /data/news.json.
 *
 * Usage:
 *   node scripts/generate-news.js
 *
 * Requires:
 *   npm install rss-parser axios
 */

import Parser from 'rss-parser'
import axios  from 'axios'
import { writeFileSync, mkdirSync } from 'fs'
import path   from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT      = path.join(__dirname, '..')
const OUT_PATH  = path.join(ROOT, 'data', 'news.json')

// ── RSS sources ────────────────────────────────────────────────────────────
const FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml',          source: 'BBC World' },
  { url: 'https://feeds.bbci.co.uk/news/world/europe/rss.xml',   source: 'BBC Europe' },
  { url: 'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml', source: 'BBC Americas' },
]

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Try to extract an image URL from an RSS item.
 * BBC uses <media:thumbnail url="..."> and <media:content url="...">.
 */
function extractImage(item) {
  // rss-parser exposes custom fields as raw objects
  if (item.mediaThumbnail?.$.url)  return item.mediaThumbnail.$.url
  if (item.mediaContent?.$.url)    return item.mediaContent.$.url
  if (item['media:thumbnail']?.$.url) return item['media:thumbnail'].$.url
  if (item.enclosure?.url)         return item.enclosure.url

  // Last resort: scrape og:image from the article page (skip if slow)
  return null
}

/**
 * Truncate text to a target word count, ending on a sentence boundary where possible.
 */
function truncate(text, words = 80) {
  const parts = text.split(' ')
  if (parts.length <= words) return text
  return parts.slice(0, words).join(' ').replace(/[,;]?\s*$/, '') + '.'
}

/**
 * Derive a rough category from the item link or title.
 */
function inferCategory(item) {
  const text = (item.link + ' ' + item.title).toLowerCase()
  if (/election|vote|parliament|president|minister|government/.test(text)) return 'Politics'
  if (/war|conflict|attack|ceasefire|military|troops/.test(text))          return 'Conflict'
  if (/economy|bank|inflation|trade|gdp|market|finance/.test(text))        return 'Economy'
  if (/climate|environment|carbon|emission|flood|wildfire/.test(text))     return 'Climate'
  if (/health|virus|pandemic|disease|hospital|who/.test(text))             return 'Health'
  return 'World'
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const parser = new Parser({
    customFields: {
      item: [
        ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
        ['media:content',   'mediaContent',   { keepArray: false }],
      ],
    },
  })

  console.log('Fetching RSS feeds…')

  // Collect items from all feeds
  const allItems = []
  for (const feed of FEEDS) {
    try {
      const result = await parser.parseURL(feed.url)
      result.items.forEach(item => allItems.push({ ...item, _source: feed.source }))
      console.log(`  ✓ ${feed.source} — ${result.items.length} items`)
    } catch (err) {
      console.warn(`  ✗ ${feed.source} failed: ${err.message}`)
    }
  }

  if (allItems.length === 0) {
    console.error('No items fetched. Aborting — existing news.json unchanged.')
    process.exit(1)
  }

  // Remove duplicates by title similarity (keep first occurrence)
  const seen  = new Set()
  const deduped = allItems.filter(item => {
    const key = item.title?.slice(0, 40).toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // ── Build main story ──────────────────────────────────────────────────
  const mainItem = deduped[0]
  const mainContent = [
    mainItem.contentSnippet || mainItem.summary || mainItem.content || '',
    '', // blank line
    'Full coverage and analysis available from the source link below.',
  ]
    .join('\n')
    .replace(/<[^>]+>/g, '')   // strip any stray HTML tags
    .trim()

  const main = {
    title:     mainItem.title,
    content:   mainContent,
    image:     extractImage(mainItem),
    source:    mainItem._source,
    sourceUrl: mainItem.link,
  }

  // ── Build secondary stories ───────────────────────────────────────────
  const secondary = deduped.slice(1, 4).map((item, i) => ({
    id:       `s${i + 1}`,
    title:    item.title,
    summary:  truncate((item.contentSnippet || item.summary || '').replace(/<[^>]+>/g, ''), 40),
    image:    extractImage(item),
    source:   item._source,
    url:      item.link,
    category: inferCategory(item),
  }))

  // ── Write output ──────────────────────────────────────────────────────
  const output = {
    date:      new Date().toISOString().slice(0, 10),
    main,
    secondary,
  }

  mkdirSync(path.join(ROOT, 'data'), { recursive: true })
  writeFileSync(OUT_PATH, JSON.stringify(output, null, 2), 'utf8')

  console.log(`\n✓ news.json written — ${secondary.length + 1} stories for ${output.date}`)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
