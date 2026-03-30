/**
 * generate-news.js — Tech News
 *
 * Fetches tech RSS feeds, extracts the top stories,
 * and writes a structured tech-news.json to /data/tech-news.json.
 *
 * Usage:
 *   node scripts/generate-news.js
 */

import Parser from 'rss-parser'
import { writeFileSync, mkdirSync } from 'fs'
import path   from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT      = path.join(__dirname, '..')
const OUT_PATH  = path.join(ROOT, 'data', 'tech-news.json')

// ── RSS sources ────────────────────────────────────────────────────────────
const FEEDS = [
  { url: 'https://techcrunch.com/feed/',                     source: 'TechCrunch' },
  { url: 'https://feeds.arstechnica.com/arstechnica/index',  source: 'Ars Technica' },
  { url: 'https://www.wired.com/feed/rss',                   source: 'Wired' },
]

// ── Category inference ─────────────────────────────────────────────────────
function inferCategory(item) {
  const text = ((item.title || '') + ' ' + (item.contentSnippet || '')).toLowerCase()
  if (/\bai\b|openai|anthropic|gemini|llm|machine learning|neural|gpt/.test(text)) return 'AI'
  if (/apple|google|microsoft|amazon|meta|alphabet|tesla/.test(text))              return 'Big Tech'
  if (/startup|funding|series [abc]|venture|yc|y combinator|raise/.test(text))    return 'Startups'
  if (/iphone|ipad|android|gadget|device|hardware|chip|semiconductor/.test(text)) return 'Gadgets'
  if (/hack|breach|security|malware|ransomware|vulnerability|cyber/.test(text))   return 'Security'
  if (/space|nasa|climate|science|research|study/.test(text))                     return 'Science'
  return 'Tech'
}

// ── Extract image ──────────────────────────────────────────────────────────
function extractImage(item) {
  if (item.mediaThumbnail?.$.url) return item.mediaThumbnail.$.url
  if (item.mediaContent?.$.url)   return item.mediaContent.$.url
  if (item.enclosure?.url)        return item.enclosure.url
  // TechCrunch puts images in content — extract first <img> src
  const match = (item.content || item['content:encoded'] || '').match(/<img[^>]+src="([^"]+)"/)
  return match ? match[1] : null
}

// ── Truncate to ~40 words ──────────────────────────────────────────────────
function truncate(text, words = 40) {
  const parts = (text || '').replace(/<[^>]+>/g, '').trim().split(/\s+/)
  if (parts.length <= words) return parts.join(' ')
  return parts.slice(0, words).join(' ').replace(/[,;]?\s*$/, '') + '.'
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const parser = new Parser({
    customFields: {
      item: [
        ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
        ['media:content',   'mediaContent',   { keepArray: false }],
        ['content:encoded', 'content:encoded'],
      ],
    },
  })

  console.log('Fetching tech RSS feeds…')

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
    console.error('No items fetched. Aborting — existing file unchanged.')
    process.exit(1)
  }

  // Deduplicate by title
  const seen   = new Set()
  const deduped = allItems.filter(item => {
    const key = item.title?.slice(0, 40).toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Main story
  const mainItem = deduped[0]
  const mainContent = (mainItem.contentSnippet || mainItem.summary || '')
    .replace(/<[^>]+>/g, '')
    .trim()

  const main = {
    title:     mainItem.title,
    category:  inferCategory(mainItem),
    content:   mainContent || 'Read the full story at the source link.',
    image:     extractImage(mainItem),
    source:    mainItem._source,
    sourceUrl: mainItem.link,
  }

  // Secondary stories
  const secondary = deduped.slice(1, 4).map((item, i) => ({
    id:       `t${i + 1}`,
    title:    item.title,
    summary:  truncate(item.contentSnippet || item.summary),
    image:    extractImage(item),
    source:   item._source,
    url:      item.link,
    category: inferCategory(item),
  }))

  const output = {
    date: new Date().toISOString().slice(0, 10),
    main,
    secondary,
  }

  mkdirSync(path.join(ROOT, 'data'), { recursive: true })
  writeFileSync(OUT_PATH, JSON.stringify(output, null, 2), 'utf8')
  console.log(`\n✓ tech-news.json written — ${secondary.length + 1} stories for ${output.date}`)
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
