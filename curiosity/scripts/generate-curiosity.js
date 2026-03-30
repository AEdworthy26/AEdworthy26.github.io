/**
 * generate-curiosity.js
 *
 * Uses Claude (Anthropic API) to generate today's Curiosity Corner content:
 * a long-form article, a Person of the Day, and an On This Day event.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... node scripts/generate-curiosity.js
 *
 * Or set ANTHROPIC_API_KEY in a .env file and run:
 *   node scripts/generate-curiosity.js
 */

import Anthropic from '@anthropic-ai/sdk'
import { writeFileSync, mkdirSync, readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT      = path.join(__dirname, '..')
const OUT_PATH  = path.join(ROOT, 'data', 'curiosity.json')

// Load .env manually (no dotenv dependency needed)
try {
  const env = readFileSync(path.join(ROOT, '.env'), 'utf8')
  env.split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k && v.length) process.env[k.trim()] = v.join('=').trim()
  })
} catch { /* .env optional */ }

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const today     = new Date()
const todayStr  = today.toISOString().slice(0, 10)
const monthDay  = today.toLocaleDateString('en-GB', { month: 'long', day: 'numeric' })

// ── Prompt ─────────────────────────────────────────────────────────────────
const PROMPT = `Today's date is ${monthDay} (${todayStr}).

Generate a structured JSON object for a "Curiosity Corner" personal website section.
The audience is an educated, curious adult with interests in ancient history, general history, biographies, cultural insights, and world events.

Return ONLY a valid JSON object — no markdown, no commentary, no code fences — matching this exact structure:

{
  "date": "${todayStr}",
  "mainArticle": {
    "title": "...",
    "subtitle": "...",
    "image": "https://images.unsplash.com/...",
    "readTime": "15 min",
    "content": [
      { "type": "paragraph", "text": "..." },
      { "type": "heading",   "text": "..." },
      ...
    ]
  },
  "personOfTheDay": {
    "name": "...",
    "lifespan": "YYYY–YYYY",
    "category": "...",
    "image": null,
    "bio": "Paragraph one.\\n\\nParagraph two.\\n\\nParagraph three."
  },
  "onThisDay": {
    "headline": "...",
    "date": "${monthDay}, YYYY",
    "summary": "Paragraph one.\\n\\nParagraph two.",
    "image": "https://images.unsplash.com/..."
  }
}

Requirements:
- mainArticle.content must be an array of at least 18 blocks (paragraphs and headings mixed). Paragraphs should be 80–130 words each. Include 4–6 section headings. Total article length ~2,500 words.
- mainArticle.image: use a thematically relevant Unsplash URL in the format https://images.unsplash.com/photo-XXXXXXXXXX?w=1200&auto=format&fit=crop
- personOfTheDay: a historically significant person (pre-2000), not a current politician. Set image to null.
- onThisDay: a fascinating event that occurred on ${monthDay} in any year before 2020. Make the headline punchy and engaging.
- onThisDay.image: use a thematically relevant Unsplash URL in the format https://images.unsplash.com/photo-XXXXXXXXXX?w=800&auto=format&fit=crop
- Write in confident, elegant, British-inflected prose. Avoid clichés.
- All text must be factually accurate.`

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Generating Curiosity Corner content for ${todayStr}…`)

  const message = await client.messages.create({
    model:      'claude-opus-4-6',
    max_tokens: 8192,
    messages:   [{ role: 'user', content: PROMPT }],
  })

  const raw = message.content[0].text.trim()

  // Strip any accidental markdown fences
  const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')

  let data
  try {
    data = JSON.parse(jsonStr)
  } catch (e) {
    console.error('JSON parse failed. Raw response saved to data/curiosity-raw.txt')
    mkdirSync(path.join(ROOT, 'data'), { recursive: true })
    writeFileSync(path.join(ROOT, 'data', 'curiosity-raw.txt'), raw, 'utf8')
    throw e
  }

  mkdirSync(path.join(ROOT, 'data'), { recursive: true })
  writeFileSync(OUT_PATH, JSON.stringify(data, null, 2), 'utf8')
  console.log(`✓ curiosity.json written for ${todayStr}`)
  console.log(`  Article: "${data.mainArticle?.title}"`)
  console.log(`  Person:  ${data.personOfTheDay?.name}`)
  console.log(`  On This Day: ${data.onThisDay?.headline}`)
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
