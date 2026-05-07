#!/usr/bin/env python3
"""
Daily Hub Content Update
────────────────────────
Fetches live news via RSS, then calls the Claude API to generate/summarise
content for every data file. Finally commits and pushes to GitHub so the
live site updates automatically.

Run manually:  python3 tools/daily_update.py
Scheduled by:  GitHub Actions (.github/workflows/daily-update.yml)
               OR ~/Library/LaunchAgents/com.alfieedworthy.daily-hub.plist
"""

import subprocess
import datetime
import os
import re
import sys
import time
import random

try:
    import feedparser
except ImportError:
    print("Installing feedparser...")
    subprocess.run([sys.executable, '-m', 'pip', 'install', 'feedparser'], check=True)
    import feedparser

import glob
import ssl
import urllib.request

# Fix SSL certificate verification on Mac (common Python install issue)
ssl._create_default_https_context = ssl._create_unverified_context

# ── Load .env ─────────────────────────────────────────────────────────────────
_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env')
if os.path.exists(_env_path):
    with open(_env_path) as _ef:
        for _line in _ef:
            _line = _line.strip()
            if _line and not _line.startswith('#') and '=' in _line:
                _k, _v = _line.split('=', 1)
                os.environ.setdefault(_k.strip(), _v.strip().strip('"\''))

# ── Config ────────────────────────────────────────────────────────────────────

TODAY      = datetime.date.today().isoformat()
LOG_FILE   = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'daily_update.log')

def find_repo_root():
    """Walk up from the script looking for a .git directory."""
    d = os.path.dirname(os.path.abspath(__file__))
    for _ in range(6):
        if os.path.isdir(os.path.join(d, '.git')):
            return d
        d = os.path.dirname(d)
    # Fallback: known location
    return os.path.expanduser('~/Documents/AI/Personal Hub')

REPO_DIR = find_repo_root()

def find_claude():
    """Find the Claude Code binary, handling version number changes."""
    # Check standard PATH first
    r = subprocess.run(['which', 'claude'], capture_output=True, text=True)
    if r.returncode == 0 and r.stdout.strip():
        return r.stdout.strip()
    # Fall back to known install locations (sorted so highest version wins)
    patterns = [
        os.path.expanduser('~/Library/Application Support/Claude/claude-code/*/claude.app/Contents/MacOS/claude'),
        os.path.expanduser('~/.local/bin/claude'),
        '/usr/local/bin/claude',
    ]
    for pattern in patterns:
        matches = sorted(glob.glob(pattern))
        if matches:
            return matches[-1]  # highest version
    return None

CLAUDE_BIN = find_claude()

# ── Helpers ───────────────────────────────────────────────────────────────────

def log(msg):
    line = f"[{datetime.datetime.now().strftime('%H:%M:%S')}] {msg}"
    print(line)
    with open(LOG_FILE, 'a') as f:
        f.write(line + '\n')

def call_claude(prompt, timeout=180, max_tokens=4096, model='claude-sonnet-4-6'):
    """Call Claude — uses Anthropic Python SDK (works locally and in GitHub Actions)."""
    import threading
    api_key = os.environ.get('ANTHROPIC_API_KEY', '')
    if api_key:
        import anthropic
        # Use httpx Timeout to enforce both connect and total-read deadline
        import httpx
        http_timeout = httpx.Timeout(timeout=float(timeout), connect=10.0)
        client = anthropic.Anthropic(api_key=api_key, timeout=http_timeout)
        for attempt in range(4):
            result_box = [None]
            error_box  = [None]

            def _call():
                try:
                    message = client.messages.create(
                        model=model,
                        max_tokens=max_tokens,
                        messages=[{'role': 'user', 'content': prompt}]
                    )
                    result_box[0] = message.content[0].text.strip()
                except Exception as exc:
                    error_box[0] = exc

            t = threading.Thread(target=_call, daemon=True)
            t.start()
            t.join(timeout)
            if t.is_alive():
                log(f"  [timeout] Claude took too long — skipping this file")
                return None

            if error_box[0] is not None:
                e = error_box[0]
                if isinstance(e, anthropic.APIStatusError) and e.status_code in (500, 529, 429) and attempt < 3:
                    wait = 30 * (attempt + 1)
                    log(f"  [retry] API error {e.status_code}, waiting {wait}s (attempt {attempt+1}/4)...")
                    time.sleep(wait)
                    continue
                log(f"  [warning] Anthropic SDK failed: {e}")
                return None

            return result_box[0]
        return None  # API key set but all attempts failed — skip this file gracefully

    # Fallback: Claude CLI (local Mac only, no API key set)
    if not CLAUDE_BIN:
        log("  [fatal] No ANTHROPIC_API_KEY set and Claude CLI not found.")
        sys.exit(1)
    try:
        result = subprocess.run(
            [CLAUDE_BIN, '-p', prompt,
             '--dangerously-skip-permissions',
             '--output-format', 'text'],
            capture_output=True, text=True, timeout=timeout, cwd='/tmp'
        )
        if result.returncode != 0:
            log(f"  [claude error] {result.stderr.strip()[:200]}")
            return None
        return result.stdout.strip()
    except subprocess.TimeoutExpired:
        log("  [timeout] Claude took too long — skipping this file")
        return None

def extract_js(text):
    """Strip markdown fences, isolate the JS block, validate output."""
    if not text:
        return None
    # Strip outer code fences if present
    text = re.sub(r'^```(?:javascript|js)?\s*\n?', '', text.strip())
    text = re.sub(r'\n?```\s*$', '', text)
    text = text.strip()
    # Fix unescaped mid-word apostrophes (e.g. Zhuangzi's, don't) inside single-quoted strings
    text = re.sub(r"(?<=[a-zA-Z])'(?=[a-zA-Z])", r"\\'", text)
    # Reject permission prompts
    if 'grant permission' in text.lower() or 'waiting for your permission' in text.lower():
        log("  [error] Claude returned a permission request — skipping")
        return None
    # If Claude appended a prose summary after the JS, truncate at the last }; or ];
    # Find the last top-level statement terminator
    last_js = max(text.rfind('};'), text.rfind('];'))
    if last_js != -1 and last_js < len(text) - 3:
        trailing = text[last_js + 2:].strip()
        if trailing:  # there is non-JS text after the last };
            log(f"  [info] Trimmed trailing prose ({len(trailing)} chars) from Claude output")
            text = text[:last_js + 2]
    # Strip any leading prose before the first JS statement
    js_start = -1
    for kw in ('var ', 'window.', 'const ', 'let '):
        idx = text.find('\n' + kw)
        if idx != -1 and (js_start == -1 or idx < js_start):
            js_start = idx + 1  # skip the newline
    if js_start > 0:
        leading = text[:js_start].strip()
        log(f"  [info] Stripped leading prose ({len(leading)} chars) from Claude output")
        text = text[js_start:]
    # Reject if the output still doesn't start with a JS statement
    first_line = text.lstrip().split('\n')[0]
    if not any(first_line.startswith(kw) for kw in ('var ', 'window.', 'const ', 'let ', '//')):
        log(f"  [error] Output doesn't look like JavaScript (starts with: {first_line[:60]!r}) — skipping")
        return None
    # Reject if braces/brackets are unbalanced (truncated response)
    brace_balance  = text.count('{') - text.count('}')
    bracket_balance = text.count('[') - text.count(']')
    if brace_balance != 0 or bracket_balance != 0:
        log(f"  [error] JS is unbalanced (braces={brace_balance} arrays={bracket_balance}) — Claude response was likely truncated, skipping")
        return None
    return text.strip()

def recent_values(filename, field, days=7):
    """Read the last N days of a field from a data file via git log, to avoid repeating content."""
    values = []
    try:
        log_out = subprocess.run(
            ['git', '-C', REPO_DIR, 'log', '--pretty=format:%H', f'--since={days} days ago', '--', filename],
            capture_output=True, text=True
        ).stdout.strip().split('\n')
        for commit in log_out:
            if not commit:
                continue
            content = subprocess.run(
                ['git', '-C', REPO_DIR, 'show', f'{commit}:{filename}'],
                capture_output=True, text=True
            ).stdout
            matches = re.findall(field + r'[:\s]+["\']([^"\']{4,80})["\']', content)
            for m in matches:
                if m not in values:
                    values.append(m)
    except Exception:
        pass
    return values


def write_file(filename, content):
    path = os.path.join(REPO_DIR, filename)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    log(f"  ✓ Written: {filename}")
    return filename

import json
import urllib.parse

def fetch_book_cover(title, author):
    """Fetch book cover URL and Amazon UK URL from Open Library (no API key needed)."""
    try:
        q = urllib.parse.quote(f'{title} {author}')
        url = f'https://openlibrary.org/search.json?q={q}&limit=1&fields=cover_i,isbn'
        req = urllib.request.Request(url, headers={'User-Agent': 'PersonalHub/1.0'})
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read())
        docs = data.get('docs', [])
        if not docs:
            return None, None
        doc = docs[0]
        cover_url = None
        if doc.get('cover_i'):
            cover_url = f'https://covers.openlibrary.org/b/id/{doc["cover_i"]}-L.jpg'
        # Pick a 10-digit ISBN (ISBN-10) for Amazon dp URL, preferring UK editions
        amazon_url = None
        isbns = doc.get('isbn', [])
        isbn10 = next((i for i in isbns if len(i) == 10), None)
        if isbn10:
            amazon_url = f'https://www.amazon.co.uk/dp/{isbn10}'
        return cover_url, amazon_url
    except Exception as e:
        log(f'  [warning] book cover fetch failed: {e}')
    return None, None

def fetch_film_poster(title, year):
    """Fetch film poster from Wikipedia (no API key needed)."""
    variants = [
        f'{title} ({year} film)',
        f'{title} (film)',
        title,
    ]
    for variant in variants:
        try:
            slug = urllib.parse.quote(variant.replace(' ', '_'))
            url = f'https://en.wikipedia.org/api/rest_v1/page/summary/{slug}'
            req = urllib.request.Request(url, headers={'User-Agent': 'PersonalHub/1.0'})
            with urllib.request.urlopen(req, timeout=10) as r:
                data = json.loads(r.read())
            thumb = data.get('originalimage', data.get('thumbnail', {})).get('source')
            if thumb:
                return thumb
        except Exception:
            continue
    return None

def fetch_wikipedia_image(name):
    """Fetch an image for a person, place, org, or topic from Wikipedia (free, no API key needed).
    For news titles, tries the full title first, then extracts likely proper nouns to search individually."""
    import string

    def _try_slug(term):
        try:
            slug = urllib.parse.quote(term.strip().replace(' ', '_'))
            url = f'https://en.wikipedia.org/api/rest_v1/page/summary/{slug}'
            req = urllib.request.Request(url, headers={'User-Agent': 'PersonalHub/1.0'})
            with urllib.request.urlopen(req, timeout=8) as r:
                data = json.loads(r.read())
            return data.get('originalimage', data.get('thumbnail', {})).get('source')
        except Exception:
            return None

    # 1. Try the name/title directly
    result = _try_slug(name)
    if result:
        return result

    # 2. Extract capitalised multi-word phrases (likely proper nouns: people, orgs, places)
    #    Split on common stop words and punctuation, keep runs of Title Case words
    stop = {'the','a','an','and','or','but','in','on','at','to','for','of','with','by',
            'as','is','are','was','were','has','have','had','be','been','that','this',
            'from','after','over','amid','says','say','amid','amid','its','their'}
    words = re.sub(r'[^\w\s\-]', ' ', name).split()
    # Build runs of capitalised words (excluding sentence-start heuristic)
    candidates = []
    current = []
    for w in words:
        if w[0].isupper() and w.lower() not in stop:
            current.append(w)
        else:
            if len(current) >= 1:
                candidates.append(' '.join(current))
            current = []
    if current:
        candidates.append(' '.join(current))

    # Try longest candidates first (more specific = better Wikipedia match)
    candidates.sort(key=len, reverse=True)
    for candidate in candidates[:4]:
        if len(candidate) < 3:
            continue
        result = _try_slug(candidate)
        if result:
            return result

    return None

def fetch_pexels_image(query, orientation='landscape'):
    """Fetch a relevant photo from Pexels free API (requires PEXELS_API_KEY in .env)."""
    try:
        key = os.environ.get('PEXELS_API_KEY', '')
        if not key:
            return None
        url = ('https://api.pexels.com/v1/search?query='
               + urllib.parse.quote(query)
               + '&per_page=3&orientation=' + orientation)
        req = urllib.request.Request(url, headers={'Authorization': key, 'User-Agent': 'PersonalHub/1.0'})
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read())
        photos = data.get('photos', [])
        if photos:
            src = photos[0]['src']
            return src.get('large2x') or src.get('large') or src.get('original')
    except Exception as e:
        log(f'  [warning] Pexels fetch failed for "{query}": {e}')
    return None

def fetch_unsplash_image(query, orientation='landscape', face_crop=False):
    """Fetch a high-quality photo from Unsplash API (requires UNSPLASH_ACCESS_KEY in .env).
    Set face_crop=True for portrait/person images to ensure faces aren't cropped out."""
    try:
        key = os.environ.get('UNSPLASH_ACCESS_KEY', '')
        if not key:
            return None
        url = ('https://api.unsplash.com/search/photos?query='
               + urllib.parse.quote(query)
               + '&per_page=5&orientation=' + orientation
               + '&order_by=relevant')
        req = urllib.request.Request(url, headers={
            'Authorization': 'Client-ID ' + key,
            'User-Agent': 'PersonalHub/1.0'
        })
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read())
        results = data.get('results', [])
        if results:
            urls = results[0].get('urls', {})
            img_url = urls.get('regular') or urls.get('full')
            if img_url and face_crop:
                # Append face-aware crop parameters
                sep = '&' if '?' in img_url else '?'
                img_url = img_url + sep + 'crop=faces,entropy&fit=crop'
            return img_url
    except Exception as e:
        log(f'  [warning] Unsplash fetch failed for "{query}": {e}')
    return None


def upgrade_image_url(url):
    """Bump known CDN URLs to a larger size."""
    if not url:
        return url
    # BBC: standard/240 → standard/1536
    url = re.sub(r'(ichef\.bbci\.co\.uk/ace/standard/)\d+/', r'\g<1>1536/', url)
    # Guardian: width=140 → width=1200
    url = re.sub(r'(i\.guim\.co\.uk/.+?width=)\d+', r'\g<1>1200', url)
    return url

def extract_rss_image(entry):
    """Try every common RSS image location, return first URL found (full size)."""
    # media:content
    for m in entry.get('media_content', []):
        if m.get('url') and 'image' in m.get('medium', 'image'):
            return upgrade_image_url(m['url'])
    # media:thumbnail
    for m in entry.get('media_thumbnail', []):
        if m.get('url'):
            return upgrade_image_url(m['url'])
    # enclosures
    for enc in entry.get('enclosures', []):
        if enc.get('type', '').startswith('image/') and enc.get('href'):
            return upgrade_image_url(enc['href'])
    # <img> tag inside summary/description HTML
    raw = entry.get('summary', entry.get('description', ''))
    img_m = re.search(r'<img[^>]+src=[\"\'](.*?)[\"\']', raw)
    if img_m:
        return upgrade_image_url(img_m.group(1))
    return None

def fetch_rss(*urls, max_per_feed=4):
    """Fetch multiple RSS feeds, return combined list of article dicts (deduplicated by title)."""
    import socket
    articles = []
    seen_titles = set()
    for url in urls:
        try:
            old_timeout = socket.getdefaulttimeout()
            socket.setdefaulttimeout(15)  # 15s max per feed — prevents hanging
            try:
                feed = feedparser.parse(url)
            finally:
                socket.setdefaulttimeout(old_timeout)
            for entry in feed.entries[:max_per_feed]:
                title = entry.get('title', '').strip()
                # Normalise for comparison: lowercase, strip punctuation
                norm = re.sub(r'[^a-z0-9 ]', '', title.lower()).strip()
                # Skip if we've seen a very similar title already
                if norm in seen_titles:
                    continue
                # Also skip if first 6 words match an existing title (catches same story with slightly different headline)
                prefix = ' '.join(norm.split()[:6])
                if any(t.startswith(prefix) for t in seen_titles if prefix):
                    continue
                seen_titles.add(norm)
                raw_summary = entry.get('summary', entry.get('description', ''))
                clean_summary = re.sub(r'<[^>]+>', '', raw_summary).strip()
                articles.append({
                    'title':   title,
                    'summary': clean_summary[:400],
                    'source':  feed.feed.get('title', url),
                    'link':    entry.get('link', ''),
                    'image':   extract_rss_image(entry),
                })
        except Exception as e:
            log(f"  [warning] RSS failed for {url}: {e}")
    return articles

def articles_to_text(articles, max=20):
    lines = []
    for i, a in enumerate(articles[:max], 1):
        lines.append(f"{i}. [{a['source']}] {a['title']}")
        if a.get('link'):
            lines.append(f"   URL: {a['link']}")
        if a['summary']:
            lines.append(f"   {a['summary']}")
    return '\n'.join(lines)

# ── Image pools (by category) ─────────────────────────────────────────────────
# Using curated Unsplash IDs so images are stable and load reliably.

IMAGES = {
    'world': [
        'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1526470498-9ae73c665de8?w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=1200&auto=format&fit=crop',
    ],
    'uk': [
        'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1580130775562-0ef92da028de?w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&auto=format&fit=crop',
    ],
    'us': [
        'https://images.unsplash.com/photo-1617531653332-bd46c16f4d68?w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&auto=format&fit=crop',
    ],
    'financial': [
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop',
    ],
    'tech': [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop',
    ],
    'secondary': [
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1526470498-9ae73c665de8?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1580130775562-0ef92da028de?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800&auto=format&fit=crop',
    ]
}

def img(category='world'):
    return random.choice(IMAGES.get(category, IMAGES['world']))

def sec_imgs():
    pool = IMAGES['secondary'][:]
    random.shuffle(pool)
    return pool[:3]

# ── RSS feed definitions ───────────────────────────────────────────────────────

RSS = {
    'world': [
        'https://feeds.bbci.co.uk/news/world/rss.xml',
        'https://www.theguardian.com/world/rss',
        'https://feeds.npr.org/1004/rss.xml',                      # NPR World
        'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',  # NYT World
        'https://feeds.reuters.com/reuters/worldNews',             # Reuters World
        'https://www.aljazeera.com/xml/rss/all.xml',               # Al Jazeera
    ],
    'uk_politics': [
        'https://feeds.bbci.co.uk/news/politics/rss.xml',
        'https://www.theguardian.com/politics/rss',
        'https://www.independent.co.uk/news/uk/politics/rss',      # The Independent
        'https://www.telegraph.co.uk/politics/rss.xml',            # The Telegraph
        'https://feeds.skynews.com/feeds/rss/politics.xml',        # Sky News Politics
    ],
    'us_politics': [
        'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml',
        'https://feeds.npr.org/1014/rss.xml',                      # NPR Politics
        'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml', # NYT Politics
        'https://feeds.washingtonpost.com/rss/politics',           # Washington Post
        'https://thehill.com/rss/syndicator/19110',                # The Hill
        'https://feeds.reuters.com/Reuters/PoliticsNews',          # Reuters Politics
    ],
    'financial': [
        'https://feeds.bbci.co.uk/news/business/rss.xml',
        'https://www.theguardian.com/uk/business/rss',
        'https://feeds.ft.com/rss/companies',
        'https://feeds.reuters.com/reuters/businessNews',
        'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', # NYT Business
        'https://feeds.marketwatch.com/marketwatch/topstories/',   # MarketWatch
        'https://feeds.bloomberg.com/markets/news.rss',            # Bloomberg Markets
    ],
    'tech': [
        'https://feeds.bbci.co.uk/news/technology/rss.xml',
        'https://www.theguardian.com/uk/technology/rss',
        'https://feeds.arstechnica.com/arstechnica/index',         # Ars Technica
        'https://www.wired.com/feed/rss',                          # Wired
        'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', # NYT Tech
        'https://feeds.reuters.com/reuters/technologyNews',        # Reuters Tech
        'https://feeds.feedburner.com/TechCrunch/',                # TechCrunch
    ],
}

# ── News generator ─────────────────────────────────────────────────────────────

def gen_news(category, var_name, img_key, secondary_ids, focus_hint='', all_articles=None):
    """Fetch RSS and use Claude to write a structured news briefing."""
    log(f"\n── {category.replace('_', ' ').title()} news")
    articles = all_articles if all_articles is not None else fetch_rss(*RSS[category])
    if not articles:
        log("  [skip] No articles fetched from RSS")
        return None

    art_text = articles_to_text(articles)
    main_img = img(img_key)
    s_imgs   = sec_imgs()

    prompt = f"""You are writing a daily news briefing for a personal reading website. Today is {TODAY}.
{(chr(10) + focus_hint + chr(10)) if focus_hint else ''}
Here are today's real headlines from reputable news sources:
{art_text}

Output ONLY valid JavaScript — absolutely no explanation, no markdown, no preamble. Start directly with "var {var_name}".

Use only real stories from the headlines above. Write 5 substantial, well-crafted paragraphs for the main story (each at least 3 sentences). Pick the most category-appropriate story as the main piece — follow the section instructions above strictly. Write 3 secondary stories with a one-sentence summary each.

IMPORTANT: Each story above includes a URL field — use the exact URL provided for that story in the sourceUrl/url fields below.

var {var_name} = {{
  date: "{TODAY}",
  main: {{
    title: "THE MOST SIGNIFICANT HEADLINE FROM ABOVE",
    category: "CATEGORY (e.g. Politics, Economics, International)",
    content: ["paragraph 1 (3+ sentences)", "paragraph 2 (3+ sentences)", "paragraph 3 (3+ sentences)", "paragraph 4 (3+ sentences)", "paragraph 5 (3+ sentences)"],
    image: "__IMG_MAIN__",
    source: "SOURCE NAME",
    sourceUrl: "EXACT URL FROM THE ARTICLE ABOVE"
  }},
  secondary: [
    {{ id: "{secondary_ids[0]}", title: "SECOND STORY TITLE", summary: "One sentence summary.", body: ["First paragraph — 2-3 sentences expanding on the story.", "Second paragraph — 2-3 sentences of context or significance."], image: "__IMG_S1__", source: "SOURCE", url: "EXACT URL FROM THE ARTICLE ABOVE", category: "CATEGORY" }},
    {{ id: "{secondary_ids[1]}", title: "THIRD STORY TITLE", summary: "One sentence summary.", body: ["First paragraph — 2-3 sentences expanding on the story.", "Second paragraph — 2-3 sentences of context or significance."], image: "__IMG_S2__", source: "SOURCE", url: "EXACT URL FROM THE ARTICLE ABOVE", category: "CATEGORY" }},
    {{ id: "{secondary_ids[2]}", title: "FOURTH STORY TITLE", summary: "One sentence summary.", body: ["First paragraph — 2-3 sentences expanding on the story.", "Second paragraph — 2-3 sentences of context or significance."], image: "__IMG_S3__", source: "SOURCE", url: "EXACT URL FROM THE ARTICLE ABOVE", category: "CATEGORY" }}
  ]
}};"""

    js = extract_js(call_claude(prompt))
    if not js:
        return None
    # Inject images: RSS article image → Pexels → Unsplash fallback
    try:
        titles = re.findall(r'title:\s*["\'](.+?)["\']', js)
        # Build a title→rss_image lookup from fetched articles
        rss_lookup = {a['title']: a['image'] for a in articles if a.get('image')}
        fallbacks = [img(img_key)] + sec_imgs()
        sentinels = ['__IMG_MAIN__', '__IMG_S1__', '__IMG_S2__', '__IMG_S3__']
        for i, sentinel in enumerate(sentinels):
            if sentinel not in js:
                continue
            title = titles[i] if i < len(titles) else ''
            url = None

            # 1. Try RSS image — exact match first, then fuzzy word-overlap match
            rss_url = rss_lookup.get(title)
            if not rss_url:
                # Fuzzy: score by how many words the titles share
                title_words = set(title.lower().split())
                best_score, best_img = 0, None
                for rss_title, rss_img in rss_lookup.items():
                    if not rss_img:
                        continue
                    shared = len(title_words & set(rss_title.lower().split()))
                    if shared > best_score:
                        best_score, best_img = shared, rss_img
                if best_score >= 3:  # at least 3 words in common
                    rss_url = best_img
            if rss_url:
                url = rss_url
                log(f'  ✓ RSS image [{i}]: {title[:40]}')

            # 2. Unsplash using the article title as the search query
            if not url:
                url = fetch_unsplash_image(title or category) or fetch_pexels_image(title or category)
                if url:
                    log(f'  ✓ Unsplash image [{i}]: {title[:40]}')

            # 3. Unsplash fallback
            if not url:
                url = fallbacks[i] if i < len(fallbacks) else img(img_key)
                log(f'  ✓ Unsplash fallback [{i}]: {title[:40]}')

            js = js.replace(f'"{sentinel}"', f'"{url}"', 1)
    except Exception as e:
        log(f'  [warning] News image injection failed: {e}')
        for sentinel in ['__IMG_MAIN__', '__IMG_S1__', '__IMG_S2__', '__IMG_S3__']:
            js = js.replace(f'"{sentinel}"', f'"{img(img_key)}"')
    return js

# ── AI-generated content ───────────────────────────────────────────────────────

def gen_quiz():
    log("\n── Quiz of the day")
    recent_q = recent_values('quiz-data.js', 'question', days=730)
    avoid_q = '\n'.join(f'- {q}' for q in recent_q) if recent_q else 'None'
    prompt = f"""Generate a pub-quiz style general knowledge question of the day for {TODAY}.

Think of this like a good pub quiz question — specific, surprising, and satisfying when you know the answer. It should feel like it belongs in a real quiz night, not a school exam.

Pick ONE category completely at random — rotate unpredictably across all of these:
Geography, Sport, Science, Nature, Food & Drink, Music, Film & TV, Literature, Art, Architecture, Technology, Medicine, Space & Astronomy, Language & Words, Mythology, Religion & Culture, Law & Justice, Fashion & Design, Economics, British History, World History, British Politics, World Politics, Exploration & Discovery, Philosophy, Animals, Transport, TV Catchphrases, Famous Firsts, Record Breakers, Inventions.

Rules:
- Pitch it at genuine pub quiz level — the kind of question a table of reasonably well-read adults has a fair chance of getting. Not too easy (capital cities, obvious dates) but not specialist trivia either.
- Ask about specific details: a year, a name, a place, a number, a first — not vague concepts.
- Avoid obscure or niche facts that only an expert in that field would know. If someone hasn't heard of the subject at all, it's too hard.
- Do NOT repeat or closely resemble any of these recent questions:
{avoid_q}

Output ONLY this JavaScript. No explanation, no markdown. Start directly with "window.QUIZ_DATA".

window.QUIZ_DATA = {{
  date: '{TODAY}',
  category: 'CATEGORY',
  question: 'Full question here?',
  answer: 'Concise but complete answer.',
  funFact: 'An interesting elaboration in 2-3 sentences that the reader will find satisfying.'
}};"""
    return extract_js(call_claude(prompt, timeout=60))


def gen_philosophy():
    log("\n── Philosophy Corner")
    recent_titles = recent_values('philosophy-data.js', 'title', days=730)
    recent_philosophers = recent_values('philosophy-data.js', 'name', days=730)
    avoid = '\n'.join(f'- {t}' for t in recent_titles) if recent_titles else 'None'
    avoid_people = '\n'.join(f'- {p}' for p in recent_philosophers) if recent_philosophers else 'None'
    prompt = f"""Generate a daily philosophy article for a personal learning website. Today is {TODAY}.

CRITICAL — you must choose a genuinely different topic each day. Do NOT default to the most famous or well-known philosophers. Deliberately explore the full breadth of philosophy: non-Western traditions (Confucian, Daoist, Buddhist, Islamic, African, Indian, Aztec), lesser-known Western thinkers, niche schools of thought, philosophy of mind, language, science, ethics, aesthetics, political philosophy, existentialism, absurdism, analytic philosophy, continental philosophy, and more. Think of the entire history of human philosophical thought and pick something fresh and surprising.

IMPORTANT — do NOT repeat any of these recently covered topics (hard rule, no exceptions):
{avoid}

IMPORTANT — the Philosopher of the Day must NOT be any of these recently featured people (hard rule, no exceptions):
{avoid_people}

Write in the style of a high-quality long-read magazine — engaging, intelligent, structured with subheadings.
Main article: EXACTLY 8 content blocks (mix of paragraphs and headings). Each paragraph: 4-5 sentences.
Counter theories: 2 real philosophers who challenged this theory, 2-3 paragraph argument each.
Philosopher of the Day: a real historical philosopher (different from the main theory's thinker), accurate biography.

Output ONLY this JavaScript. No explanation, no markdown. Start directly with "window.PHILOSOPHY_DATA".

window.PHILOSOPHY_DATA = {{
  date: '{TODAY}',
  mainTheory: {{
    title: 'TITLE',
    subject: 'The primary philosopher, movement, or concept (e.g. \'Plato\', \'Stoicism\', \'The Allegory of the Cave\'). Used for image search.',
    subtitle: 'A compelling one-sentence hook subtitle.',
    readTime: 'X min',
    image: '__IMG_PHILOSOPHY__',
    content: [
      {{ type: 'paragraph', text: '...' }},
      {{ type: 'heading', text: '...' }},
      {{ type: 'paragraph', text: '...' }},
      {{ type: 'heading', text: '...' }},
      {{ type: 'paragraph', text: '...' }},
      {{ type: 'heading', text: '...' }},
      {{ type: 'paragraph', text: '...' }},
      {{ type: 'paragraph', text: '...' }}
    ]
  }},
  keyTakeaways: [
    'Key point 1',
    'Key point 2',
    'Key point 3',
    'Key point 4'
  ],
  counterTheories: [
    {{
      philosopher: 'PHILOSOPHER NAME',
      period: 'c. YYYY–YYYY',
      school: 'School of thought',
      argument: [
        {{ type: 'paragraph', text: '...' }},
        {{ type: 'paragraph', text: '...' }},
        {{ type: 'paragraph', text: '...' }}
      ],
      contrast: 'One sentence contrasting their view with the main theory.'
    }},
    {{
      philosopher: 'PHILOSOPHER NAME',
      period: 'c. YYYY–YYYY',
      school: 'School of thought',
      argument: [
        {{ type: 'paragraph', text: '...' }},
        {{ type: 'paragraph', text: '...' }}
      ],
      contrast: 'One sentence contrasting their view with the main theory.'
    }}
  ],
  whyItMatters: {{
    content: [
      {{ type: 'paragraph', text: '...' }},
      {{ type: 'paragraph', text: '...' }}
    ]
  }},
  philosopherOfTheDay: {{
    name: 'FULL NAME',
    lifespan: 'YYYY–YYYY',
    category: 'e.g. Metaphysics & Epistemology',
    image: null,
    bio: '3-paragraph biography as a single string. Use \\\\n\\\\n to separate paragraphs.',
    contributions: 'Their main philosophical contributions in 2-3 sentences.',
    rivals: 'Their key intellectual rivals or critics in 1-2 sentences.'
  }}
}};"""
    js = extract_js(call_claude(prompt, timeout=420, max_tokens=8192))
    if not js:
        return None
    # Inject image for the main theory: Wikipedia first (person/place/concept), then Pexels
    try:
        title_m   = re.search(r'mainTheory\s*:\s*\{[^{]*?title\s*:\s*["\'](.+?)["\']', js, re.DOTALL)
        subject_m = re.search(r'mainTheory\s*:\s*\{[^{]*?subject\s*:\s*["\'](.+?)["\']', js, re.DOTALL)
        phil_m    = re.search(r'philosopherOfTheDay\s*:\s*\{[^{]*?name\s*:\s*["\'](.+?)["\']', js, re.DOTALL)
        if '__IMG_PHILOSOPHY__' in js:
            title_str   = title_m.group(1)   if title_m   else ''
            subject_str = subject_m.group(1) if subject_m else ''
            search_term = subject_str or title_str or 'philosophy'
            # Try Wikipedia first (great for named philosophers, concepts, places)
            url = fetch_wikipedia_image(search_term)
            if url:
                log(f'  ✓ Philosophy main image (Wikipedia): {search_term[:40]}')
            else:
                url = (fetch_unsplash_image(search_term + ' philosophy')
                       or fetch_pexels_image(search_term + ' philosophy')
                       or 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&fit=crop&q=80')
                log(f'  ✓ Philosophy main image (Unsplash): {search_term[:40]}')
            js = js.replace("'__IMG_PHILOSOPHY__'", f"'{url}'", 1)
            js = js.replace('"__IMG_PHILOSOPHY__"', f'"{url}"', 1)
        if 'image: null' in js and phil_m:
            name = phil_m.group(1)
            url = fetch_wikipedia_image(name)
            if url:
                log(f'  ✓ Philosopher of day image (Wikipedia): {name[:40]}')
            else:
                url = fetch_unsplash_image(name + ' portrait', orientation='squarish', face_crop=True) or fetch_pexels_image(name + ' philosopher portrait')
                if url:
                    log(f'  ✓ Philosopher of day image (Unsplash): {name[:40]}')
            if url:
                js = js.replace('image: null', f'image: "{url}"', 1)
    except Exception as e:
        log(f'  [warning] Philosophy image injection failed: {e}')
        js = js.replace("'__IMG_PHILOSOPHY__'", "'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&fit=crop&q=80'", 1)
        js = js.replace('"__IMG_PHILOSOPHY__"', '"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&fit=crop&q=80"', 1)
    return js


def gen_rics():
    log("\n── RICS Study")
    recent_topics = recent_values('rics-data.js', 'topic', days=60)
    recent_competencies = recent_values('rics-data.js', 'apc_competency', days=14)
    avoid_topics = '\n'.join(f'- {t}' for t in recent_topics) if recent_topics else 'None'
    avoid_competencies = '\n'.join(f'- {c}' for c in recent_competencies) if recent_competencies else 'None'
    # Extract keyword blocklist from recent topics — prevents subtle rephrasing of the same subject
    keyword_blocks = set()
    for t in recent_topics:
        for kw in ['Section 73', 'BNG', 'biodiversity net gain', 'S106', 'viability', 'CIL', 'golden brick', 'overage']:
            if kw.lower() in t.lower():
                keyword_blocks.add(kw)
    keyword_block_str = ', '.join(sorted(keyword_blocks)) if keyword_blocks else 'None'
    # Fallback images if Unsplash fetch fails
    rics_fallback_images = [
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&auto=format&fit=crop',  # construction crane
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop',  # glass office tower
        'https://images.unsplash.com/photo-1574920162043-b872873f19bc?w=1200&auto=format&fit=crop',  # residential terrace
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&auto=format&fit=crop',  # modern apartment block
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop',  # housing development
        'https://images.unsplash.com/photo-1582407947304-fd86f28f82f7?w=1200&auto=format&fit=crop',  # city skyline
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop',  # residential exterior
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop',  # mixed-use development
    ]

    def topic_is_duplicate(topic):
        """Return matching recent topic string if too similar, else None."""
        t = topic.lower()
        for rt in recent_topics:
            rt_lower = rt.lower()
            if rt_lower[:55] in t or t[:55] in rt_lower:
                return rt
            rt_words = set(rt_lower.split()[:8])
            gen_words = set(t.split()[:8])
            if len(rt_words & gen_words) >= 4:
                return rt
        return None

    def build_prompt(extra_notice=''):
        forbidden_block = f"""⛔ FORBIDDEN — DO NOT USE ANY OF THESE TOPICS ⛔
The topics below have already been covered. Choosing any of them — or any topic that covers the same ground from a different angle — is NOT ALLOWED. This is a hard rule, not a suggestion.
{avoid_topics}
{extra_notice}
KEYWORD BLOCK — these subjects appeared recently; do NOT cover them today even with a different title: {keyword_block_str}

Before writing a single word of JavaScript, verify the topic you intend to use does NOT appear in the list above and shares NO significant keywords with any item in the list. If it does, stop and pick something entirely different."""
        return f"""Generate a daily RICS APC study lesson for {TODAY} for the Planning and Development (P&D) pathway.

CANDIDATE PROFILE:
Alfie is an Assistant Development Manager at Latimer by Clarion Housing Group, the development arm of one of the UK's largest housing associations. His role spans the full development lifecycle on residential-led, mixed-tenure schemes (market sale, shared ownership, affordable/social rent). Key areas of his role include:

  PRE-ACQUISITION & APPRAISAL: Initial site appraisals, feasibility assessments, development briefs, supporting investment committee papers and business cases, due diligence (title, surveys, constraints).

  ACQUISITION & LAND: Land-led and JV-focused — negotiating option agreements, conditional contracts, overage, deferred payments, golden brick structures. Structuring joint ventures with landowners, LAs and private developers.

  PLANNING: Taking schemes from pre-app through to consent — coordinating pre-application engagement with LPAs, managing design and planning teams, EIA/ES coordination, design and access statements, heritage assessments, NPPF sequential tests. Post-consent: discharging planning conditions and obligations, DOVs, non-material amendments, planning appeals (written reps, hearings, inquiries).

  DESIGN TEAM MANAGEMENT: Appointing and managing architects, planning consultants, structural/civil engineers, M&E, landscape, ecologists and other specialists. Running design team meetings, managing briefs, reviewing drawings, ensuring NDSS/HQI compliance and building standards.

  STAKEHOLDER ENGAGEMENT: Community consultation, public exhibitions, liaison with ward councillors and local representatives. Building relationships with LPAs, Homes England, GLA, statutory consultees (highways, ecology, drainage, heritage). Managing objections and political risk to secure planning permission.

  FINANCIAL & COMMERCIAL: Development appraisals, residual land value, GDV, cashflow modelling, sensitivity analysis. Budget monitoring, cost reporting, grant funding (Homes England AHP) applications and drawdowns. Investment committee submissions and scheme updates.

  LEGAL & COMPLIANCE: S106 negotiations and obligations management, CIL, building safety compliance, collateral warranties, title and planning risk.

  REPORTING & ADMINISTRATION: Project risk registers, programme management, critical path analysis, monthly project reports, investment committee updates, scheme close-out.

Affordable housing and RP context is a recurring theme but NOT the only one. Contractor/procurement is NOT part of his role.

{forbidden_block}

RECENTLY COVERED COMPETENCIES in last 14 days (try to avoid repeating — rotate to something different):
{avoid_competencies}

TOPIC ROTATION — rotate fairly across ALL levels and competencies. Target: Level 3 (40%), Level 2 (35%), Level 1 (25%):
  Level 3 (deep mastery): Development Appraisals, Development/Project Briefs, Project Finance, Planning and Development Management
  Level 2 (applied knowledge): Masterplanning and Urban Design, Spatial Policy and Infrastructure, Legal/Regulatory Compliance, Valuation
  Level 1 (awareness): Measurement and Survey, Building Pathology, Construction Technology, Contaminated Land, Sustainability

TOPIC GUIDANCE — pick a niche sub-topic, vary widely, and do NOT default to S106 viability every session. Examples:
  - Land & JV: option agreement structures, overage mechanisms, golden brick JVs, CPO risk and compensation, development agreement clawback, deferred land payments, marriage value and ransom strips
  - Planning: pre-app strategy, EIA screening and scoping, design and access statements, heritage impact assessments, NPPF sequential and exception tests, planning appeals processes, Grampian and pre-commencement conditions, DOVs, NMAs, listed building consent, environmental impact assessment
  - Stakeholder engagement: community consultation best practice, managing political risk, statutory consultee roles (highways, ecology, heritage, drainage), public exhibition strategy, councillor briefings
  - Design team: appointing consultants (RIBA stages, fee structures, PI insurance), managing design briefs, NDSS and space standards, HQI, design review panels, design codes
  - Appraisals: residual land value methodology, GDV calculation, profit on cost vs GDV, cashflow timing, sensitivity and scenario analysis, development finance assumptions
  - Project finance: development loan facilities, DSCR, drawdown mechanics, mezzanine finance, equity waterfalls, Homes England grant conditions and additionality
  - Masterplanning: parameter plans, design codes, density metrics, place-making, public realm standards, housing mix policy
  - Valuation: comparable evidence, RICS Red Book, hope value, EUV+, special purchaser value
  - Legal/compliance: CIL liability and exemptions, infrastructure levy, building safety act gateway process, collateral warranties, title due diligence
  - Sustainability: biodiversity net gain (mandatory BNG), Future Homes Standard, BREEAM, embodied carbon, EPC ratings, climate adaptation in planning
  - Measurement: IPMS, GIA/NIA/GEA, unit mix schedules, NSA, site coverage and density calculations
  - Building pathology / construction technology: substructure options, ground conditions, façade systems, fire safety, party wall act
  - Contaminated land: Phase 1/2 surveys, remediation strategies, liability under EPA 1990

RULES:
- Pick a NICHE SUB-TOPIC, not a broad overview
- Worked examples and APC tips must feel authentic to Alfie's role — land-led, planning-focused, JV and RP context
- Write at a high level — APC preparation for a practitioner, not a student
- Content blocks: mix of paragraphs, headings, callout (APC tips with worked examples), and key_term blocks
- At least 8 content blocks
- 5 specific technical Q&A pairs an APC assessor would ask this candidate
- 6 news items: 3 focused on the RP / housing association sector (affordable housing, Homes England, RSH, development finance, RP strategy), and 3 on the wider UK real estate market (commercial property, residential investment, planning policy, PropTech, construction). Each must have a one-sentence body teaser and a summary array with 1 detailed paragraph (3-4 sentences) for the popup

Output ONLY valid JavaScript. No explanation, no markdown. Start directly with "var RICS_DATA".

var RICS_DATA = {{
  date: "{TODAY}",
  topic: "NICHE SPECIFIC TOPIC TITLE",
  module: "MODULE NAME",
  level: 3,
  apc_competency: "Competency Name (Level X)",
  focus: "2-3 sentence description of what this lesson covers and why it matters for the APC.",
  image: "__IMG_RICS__",
  content: [
    {{ type: "paragraph", text: "Opening paragraph..." }},
    {{ type: "heading", text: "Section heading" }},
    {{ type: "paragraph", text: "..." }},
    {{ type: "key_term", term: "Term Name", text: "Definition and context." }},
    {{ type: "paragraph", text: "..." }},
    {{ type: "callout", label: "APC Tip", text: "Worked example or examiner tip..." }},
    {{ type: "heading", text: "Another section" }},
    {{ type: "paragraph", text: "..." }},
    {{ type: "paragraph", text: "..." }},
    {{ type: "paragraph", text: "..." }}
  ],
  summary: [
    "Key point 1 — specific and actionable",
    "Key point 2",
    "Key point 3",
    "Key point 4",
    "Key point 5"
  ],
  qa: [
    {{ q: "Specific APC-style question?", a: "Precise technical answer with any relevant figures or thresholds." }},
    {{ q: "...", a: "..." }},
    {{ q: "...", a: "..." }},
    {{ q: "...", a: "..." }},
    {{ q: "...", a: "..." }}
  ],
  news: [
    {{ tag: "RP / Housing Association", headline: "RP or HA sector headline", body: "One sentence teaser.", summary: ["Detailed paragraph of 3-4 sentences explaining the story and its significance."] }},
    {{ tag: "RP / Housing Association", headline: "...", body: "...", summary: ["..."] }},
    {{ tag: "RP / Housing Association", headline: "...", body: "...", summary: ["..."] }},
    {{ tag: "Real Estate Market", headline: "Wider real estate/commercial/planning headline", body: "One sentence teaser.", summary: ["Detailed paragraph of 3-4 sentences explaining the story and its significance."] }},
    {{ tag: "Real Estate Market", headline: "...", body: "...", summary: ["..."] }},
    {{ tag: "Real Estate Market", headline: "...", body: "...", summary: ["..."] }}
  ]
}};"""

    # Retry loop — up to 3 attempts to get a non-duplicate topic
    last_js = None
    for attempt in range(3):
        extra_notice = ''
        if attempt > 0:
            extra_notice = (f'⚠️ YOUR PREVIOUS ATTEMPT CHOSE A FORBIDDEN TOPIC. '
                            f'You MUST pick something completely different. '
                            f'Do NOT write about planning conditions, Grampian, pre-commencement, '
                            f'S106, S73, BNG, viability, or anything already on the forbidden list.\n')
        js = extract_js(call_claude(build_prompt(extra_notice), timeout=600, max_tokens=8192))
        if not js:
            return last_js
        last_js = js
        topic_m = re.search(r'topic:\s*"([^"]+)"', js)
        if topic_m:
            dup = topic_is_duplicate(topic_m.group(1))
            if dup:
                log(f'  [retry {attempt+1}/3] Duplicate topic "{topic_m.group(1)[:60]}"'
                    f' ≈ "{dup[:60]}" — retrying')
                continue
            log(f'  ✓ Topic accepted (attempt {attempt+1}): {topic_m.group(1)[:70]}')
        break
    js = last_js
    if not js:
        return None
    # Inject a topic-relevant image from Unsplash
    try:
        topic_m = re.search(r'topic:\s*"([^"]+)"', js)
        module_m = re.search(r'module:\s*"([^"]+)"', js)
        topic_str = topic_m.group(1) if topic_m else ''
        module_str = module_m.group(1) if module_m else ''
        # Use only a couple of topic keywords + strong architectural anchors
        # to avoid people/social images when topics mention community, housing, etc.
        topic_kw = ' '.join((topic_str or module_str or '').split()[:3])
        search_term = (topic_kw + ' UK property architecture building exterior').strip()
        url = (fetch_unsplash_image(search_term)
               or fetch_pexels_image(search_term)
               or random.choice(rics_fallback_images))
        js = js.replace('"__IMG_RICS__"', f'"{url}"', 1)
        log(f'  ✓ RICS image: {search_term[:50]}')
    except Exception as e:
        log(f'  [warning] RICS image injection failed: {e}')
        js = js.replace('"__IMG_RICS__"', f'"{random.choice(rics_fallback_images)}"', 1)
    return js


def append_rics_log(rics_js):
    """Extract summary fields from today's RICS lesson and append to the rolling logbook."""
    try:
        def get_str(field):
            m = re.search(rf'{field}:\s*"([^"]*)"', rics_js)
            return m.group(1) if m else ''
        def get_int(field):
            m = re.search(rf'{field}:\s*(\d+)', rics_js)
            return int(m.group(1)) if m else 0

        summary_m = re.search(r'summary:\s*\[([\s\S]*?)\]', rics_js)
        summary = re.findall(r'"([^"]{10,})"', summary_m.group(1)) if summary_m else []

        qa_m = re.search(r'qa:\s*\[([\s\S]*?)\](?:\s*,\s*\n\s*news|\s*\n\s*\})', rics_js)
        qa = []
        if qa_m:
            qs = re.findall(r'q:\s*"([^"]+)"', qa_m.group(1))
            as_ = re.findall(r'a:\s*"([^"]+)"', qa_m.group(1))
            qa = [{'q': q, 'a': a} for q, a in zip(qs, as_)]

        # Extract full lesson content array for retrospective reading
        content = []
        try:
            obj_m = re.search(r'var RICS_DATA\s*=\s*(\{[\s\S]*\});', rics_js)
            if obj_m:
                data_obj = json.loads(obj_m.group(1))
                content = data_obj.get('content', [])
        except Exception:
            pass

        entry = {
            'date': TODAY,
            'topic': get_str('topic'),
            'module': get_str('module'),
            'level': get_int('level'),
            'apc_competency': get_str('apc_competency'),
            'focus': get_str('focus'),
            'image': get_str('image'),
            'content': content,
            'summary': summary,
            'qa': qa,
        }

        log_path = os.path.join(REPO_DIR, 'rics-log.js')
        entries = []
        if os.path.exists(log_path):
            raw = open(log_path).read()
            arr_m = re.search(r'var RICS_LOG\s*=\s*(\[[\s\S]*?\]);', raw)
            if arr_m:
                try:
                    entries = json.loads(arr_m.group(1))
                except Exception:
                    entries = []

        # Remove any existing entry for today before prepending fresh one
        entries = [e for e in entries if e.get('date') != TODAY]
        entries.insert(0, entry)
        entries = entries[:90]  # keep ~3 months

        with open(log_path, 'w', encoding='utf-8') as f:
            f.write('// rics-log.js\n// Auto-generated — do not edit manually\n\n')
            f.write('var RICS_LOG = ' + json.dumps(entries, indent=2) + ';\n')
        log('  ✓ RICS log updated')
        return log_path
    except Exception as e:
        log(f'  [warning] RICS log append failed: {e}')
        return None


def gen_curiosity():
    log("\n── Curiosity Corner")
    recent_titles = recent_values('curiosity-data.js', 'title', days=730)
    recent_people = recent_values('curiosity-data.js', 'name', days=730)
    avoid = '\n'.join(f'- {t}' for t in recent_titles) if recent_titles else 'None'
    avoid_people = '\n'.join(f'- {p}' for p in recent_people) if recent_people else 'None'
    prompt = f"""Generate curiosity corner content for a personal learning website. Today is {TODAY}.
The user loves: ancient history, political history, exploration, remarkable lives, science, art, great events.

CRITICAL — you must choose a genuinely different, surprising topic each day. Actively avoid repeating subject areas even if the specific title differs. Rotate widely across: ancient civilisations (Rome, Greece, Egypt, Persia, Mesopotamia, China, Maya, etc.), medieval history, early modern, modern, exploration and discovery, natural world, scientific breakthroughs, war and diplomacy, art and architecture, religion and mythology, economics and trade, maritime history, biography, and more. Pick something that would make the reader say "I didn't know that."

IMPORTANT — do NOT repeat any of these recently covered main article topics (hard rule, no exceptions):
{avoid}

IMPORTANT — the Person of the Day must NOT be any of these recently featured people (hard rule, no exceptions):
{avoid_people}

Write in the style of a high-quality long-read. The main article should have EXACTLY 8 content blocks — no more.
Each paragraph should be 3-4 sentences (not longer). Keep the bio to 3 paragraphs.
The onThisDay section must be a REAL event that actually happened on {datetime.date.today().strftime('%B %-d')} in history.
The personOfTheDay must be a real historical figure with an accurate biography.

Output ONLY this JavaScript. No explanation, no markdown. Start directly with "var CURIOSITY_DATA".

var CURIOSITY_DATA = {{
  date: "{TODAY}",
  mainArticle: {{
    title: "TITLE",
    subject: "The primary person, place, or object the article is about (e.g. 'Julius Caesar', 'Pompeii', 'The Silk Road'). Used for image search.",
    subtitle: "A compelling subtitle hook.",
    image: "__IMG_CURIOSITY_MAIN__",
    readTime: "X min",
    content: [
      {{ type: "paragraph", text: "..." }},
      {{ type: "heading", text: "..." }},
      {{ type: "paragraph", text: "..." }},
      {{ type: "heading", text: "..." }},
      {{ type: "paragraph", text: "..." }},
      {{ type: "heading", text: "..." }},
      {{ type: "paragraph", text: "..." }},
      {{ type: "heading", text: "..." }},
      {{ type: "paragraph", text: "..." }},
      {{ type: "paragraph", text: "..." }}
    ]
  }},
  personOfTheDay: {{
    name: "FULL NAME",
    lifespan: "YYYY\u2013YYYY",
    category: "e.g. Science & Engineering",
    image: null,
    bio: "4-5 paragraph biography as a single string. Use \\n\\n to separate paragraphs."
  }},
  onThisDay: {{
    headline: "SHORT PUNCHY HEADLINE",
    date: "{datetime.date.today().strftime('%B %-d, %Y — replace year with actual historical year')}",
    summary: "2-3 paragraph account of the event. Must be a real event.",
    image: "__IMG_CURIOSITY_OTD__"
  }}
}};"""
    js = extract_js(call_claude(prompt, timeout=420, max_tokens=8192))
    if not js:
        return None
    # Inject images: Wikipedia first (person/place/event), then Pexels fallback
    try:
        main_title_m    = re.search(r'mainArticle\s*:\s*\{[^{]*?title\s*:\s*["\'](.+?)["\']', js, re.DOTALL)
        main_subject_m  = re.search(r'mainArticle\s*:\s*\{[^{]*?subject\s*:\s*["\'](.+?)["\']', js, re.DOTALL)
        otd_m           = re.search(r'onThisDay\s*:\s*\{[^{]*?headline\s*:\s*["\'](.+?)["\']', js, re.DOTALL)
        person_m        = re.search(r'personOfTheDay\s*:\s*\{[^{]*?name\s*:\s*["\'](.+?)["\']', js, re.DOTALL)
        if '__IMG_CURIOSITY_MAIN__' in js:
            title_str   = main_title_m.group(1)   if main_title_m   else ''
            subject_str = main_subject_m.group(1) if main_subject_m else ''
            search_term = subject_str or title_str or 'ancient history exploration'
            url = fetch_wikipedia_image(search_term)
            if url:
                log(f'  ✓ Curiosity main image (Wikipedia): {search_term[:40]}')
            else:
                url = (fetch_unsplash_image(search_term)
                       or fetch_pexels_image(search_term)
                       or 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=1200&auto=format&fit=crop')
                log(f'  ✓ Curiosity main image (Unsplash): {search_term[:40]}')
            js = js.replace('"__IMG_CURIOSITY_MAIN__"', f'"{url}"', 1)
        if '__IMG_CURIOSITY_OTD__' in js:
            otd_query = otd_m.group(1) if otd_m else 'historical event'
            url = fetch_wikipedia_image(otd_query)
            if url:
                log(f'  ✓ On this day image (Wikipedia): {otd_query[:40]}')
            else:
                url = (fetch_unsplash_image(otd_query)
                       or fetch_pexels_image(otd_query)
                       or 'https://images.unsplash.com/photo-1489447068241-b3490214e879?w=800&auto=format&fit=crop')
                log(f'  ✓ On this day image (Unsplash): {otd_query[:40]}')
            js = js.replace('"__IMG_CURIOSITY_OTD__"', f'"{url}"', 1)
        if 'image: null' in js and person_m:
            name = person_m.group(1)
            url = fetch_wikipedia_image(name)
            if url:
                log(f'  ✓ Person of day image (Wikipedia): {name[:40]}')
            else:
                url = fetch_unsplash_image(name + ' portrait', orientation='squarish', face_crop=True) or fetch_pexels_image(name + ' portrait')
                if url:
                    log(f'  ✓ Person of day image (Unsplash): {name[:40]}')
            if url:
                js = js.replace('image: null', f'image: "{url}"', 1)
    except Exception as e:
        log(f'  [warning] Curiosity image injection failed: {e}')
        js = js.replace('"__IMG_CURIOSITY_MAIN__"', '"https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=1200&auto=format&fit=crop"', 1)
        js = js.replace('"__IMG_CURIOSITY_OTD__"', '"https://images.unsplash.com/photo-1489447068241-b3490214e879?w=800&auto=format&fit=crop"', 1)
    return js

def gen_reads():
    log("\n── Book of the Day")
    recent_books = recent_values('reads-data.js', 'title', days=30)
    avoid_list = ['Sapiens', 'Wolf Hall', 'Rubicon'] + recent_books
    avoid = ', '.join(avoid_list)

    prompt = f"""Pick a single book to recommend today ({TODAY}) on a personal reading website.
The user reads very broadly across all subjects and genres — do not default to history or ancient history.
Range freely across: literary fiction, science, philosophy, politics, economics, nature, sport, art, music, travel, biography, memoir, true crime, psychology, sociology, technology, food, humour, and more.
Aim for roughly 60% non-fiction, 40% fiction overall, but today just pick whichever is the most compelling choice.
The book must be genuinely well-regarded (critically acclaimed or beloved by readers). Avoid obscure picks. Avoid: {avoid}.
Write a rich 4-5 sentence description and explain why it's worth reading now.

Output ONLY valid JavaScript. No explanation, no markdown. Start directly with "var READS_DATA".

var READS_DATA = {{
  date: "{TODAY}",
  book: {{
    title: "EXACT BOOK TITLE",
    author: "AUTHOR NAME",
    year: YYYY,
    genres: ["Genre 1", "Genre 2", "Genre 3"],
    desc: "4-5 sentence description that captures what makes this book special.",
    whyRead: "1-2 sentence hook — why read this one, right now.",
    rating: 4.3,
    ratingSource: "Goodreads",
    ratingCount: "X,000+",
    coverUrl: null,
    amazonUrl: null
  }}
}};"""
    js = extract_js(call_claude(prompt, timeout=60))
    if not js:
        return None
    # Inject cover URL and Amazon URL from Open Library
    try:
        title_m = re.search(r'title:\s*["\'](.+?)["\']', js)
        author_m = re.search(r'author:\s*["\'](.+?)["\']', js)
        if title_m and author_m:
            cover_url, amazon_url = fetch_book_cover(title_m.group(1), author_m.group(1))
            if cover_url:
                js = js.replace('coverUrl: null', f'coverUrl: "{cover_url}"', 1)
                log(f'  ✓ Cover: {cover_url}')
            else:
                log('  [warning] No cover found, using SVG fallback')
            if amazon_url:
                js = js.replace('amazonUrl: null', f'amazonUrl: "{amazon_url}"', 1)
                log(f'  ✓ Amazon: {amazon_url}')
            else:
                log('  [warning] No ISBN found, Amazon button will use search fallback')
    except Exception as e:
        log(f'  [warning] Cover/Amazon injection failed: {e}')
    return js


def gen_films():
    log("\n── Film of the Day")
    recent_films = recent_values('films-data.js', 'title', days=730)
    avoid_list = ['No Country for Old Men', 'Lawrence of Arabia', 'The Battle of Algiers', 'Spirited Away'] + recent_films
    avoid = ', '.join(avoid_list)

    prompt = f"""Pick a single film to recommend today ({TODAY}) on a personal reading website.
IMPORTANT: Be genuinely unpredictable — do not default to safe, famous, or frequently cited titles. Surprise the reader.
Range freely and equally across: comedy, romance, sci-fi, horror, animation, documentary, crime, fantasy, westerns, musicals, sports films, family films, world cinema, thriller, drama, and more.
Do NOT default to animated Japanese films, Pixar, or widely-known studio classics unless you have not recommended them in a very long time.
The film must be genuinely well-regarded — critically acclaimed or a widely loved classic. Avoid: {avoid}.
Write a rich 4-5 sentence description.

Output ONLY valid JavaScript. No explanation, no markdown. Start directly with "var FILMS_DATA".

var FILMS_DATA = {{
  date: "{TODAY}",
  film: {{
    title: "EXACT FILM TITLE",
    director: "DIRECTOR NAME",
    year: YYYY,
    genres: ["Genre 1", "Genre 2"],
    desc: "4-5 sentence description that captures what makes this film special.",
    cast: ["Actor 1", "Actor 2", "Actor 3"],
    rating: 95,
    ratingSource: "Rotten Tomatoes",
    ratingExtra: "X Academy Awards",
    posterUrl: null
  }}
}};"""
    js = extract_js(call_claude(prompt, timeout=60))
    if not js:
        return None
    # Replace null posterUrl with real URL fetched from Wikipedia
    try:
        title_m = re.search(r'title:\s*["\'](.+?)["\']', js)
        year_m  = re.search(r'year:\s*(\d{4})', js)
        if title_m and year_m:
            poster_url = fetch_film_poster(title_m.group(1), year_m.group(1))
            if poster_url:
                js = js.replace('posterUrl: null', f'posterUrl: "{poster_url}"', 1)
                log(f'  ✓ Poster: {poster_url}')
            else:
                log('  [warning] No poster found, using SVG fallback')
    except Exception as e:
        log(f'  [warning] Poster injection failed: {e}')
    return js


def gen_quote():
    log("\n── Quote of the Day")
    import hashlib
    QUOTES = [
        {"text": "Waste no more time arguing what a good man should be. Be one.", "author": "Marcus Aurelius"},
        {"text": "You have power over your mind, not outside events. Realise this, and you will find strength.", "author": "Marcus Aurelius"},
        {"text": "The impediment to action advances action. What stands in the way becomes the way.", "author": "Marcus Aurelius"},
        {"text": "The best revenge is to be unlike him who performed the injury.", "author": "Marcus Aurelius"},
        {"text": "He who is brave is free.", "author": "Seneca"},
        {"text": "While we are postponing, life speeds by.", "author": "Seneca"},
        {"text": "One who is everywhere is nowhere.", "author": "Seneca"},
        {"text": "Luck is what happens when preparation meets opportunity.", "author": "Seneca"},
        {"text": "Difficulties strengthen the mind, as labour does the body.", "author": "Seneca"},
        {"text": "Character is fate.", "author": "Heraclitus"},
        {"text": "No man ever steps in the same river twice, for it's not the same river and he's not the same man.", "author": "Heraclitus"},
        {"text": "The only constant in life is change.", "author": "Heraclitus"},
        {"text": "One of the penalties for refusing to participate in politics is that you end up being governed by your inferiors.", "author": "Plato"},
        {"text": "It is the mark of an educated mind to be able to entertain a thought without accepting it.", "author": "Aristotle"},
        {"text": "The educated differ from the uneducated as much as the living from the dead.", "author": "Aristotle"},
        {"text": "He who learns but does not think is lost; he who thinks but does not learn is in great danger.", "author": "Confucius"},
        {"text": "Knowing others is intelligence; knowing yourself is true wisdom.", "author": "Laozi"},
        {"text": "Seek not that the things which happen should happen as you wish; but wish the things which happen to be as they are.", "author": "Epictetus"},
        {"text": "The greatest thing in the world is to know how to belong to oneself.", "author": "Michel de Montaigne"},
        {"text": "Every man carries the whole stamp of the human condition within him.", "author": "Michel de Montaigne"},
        {"text": "Nothing is so firmly believed as what we least know.", "author": "Michel de Montaigne"},
        {"text": "It is better to be feared than loved, if you cannot be both.", "author": "Niccolò Machiavelli"},
        {"text": "This above all: to thine own self be true.", "author": "William Shakespeare"},
        {"text": "Brevity is the soul of wit.", "author": "William Shakespeare"},
        {"text": "We know what we are, but know not what we may be.", "author": "William Shakespeare"},
        {"text": "Cowards die many times before their deaths; the valiant never taste of death but once.", "author": "William Shakespeare"},
        {"text": "All truths are easy to understand once they are discovered; the point is to discover them.", "author": "Galileo Galilei"},
        {"text": "The best is the enemy of the good.", "author": "Voltaire"},
        {"text": "To hold a pen is to be at war.", "author": "Voltaire"},
        {"text": "The more I read, the more I acquire, the more certain I am that I know nothing.", "author": "Voltaire"},
        {"text": "Patriotism is the last refuge of a scoundrel.", "author": "Samuel Johnson"},
        {"text": "The chains of habit are too weak to be felt until they are too strong to be broken.", "author": "Samuel Johnson"},
        {"text": "Nothing concentrates the mind so wonderfully as the prospect of being hanged in a fortnight.", "author": "Samuel Johnson"},
        {"text": "Liberty for wolves is death to the lambs.", "author": "Isaiah Berlin"},
        {"text": "Little else is requisite to carry a state to the highest degree of opulence from the lowest barbarism, but peace, easy taxes, and a tolerable administration of justice.", "author": "Adam Smith"},
        {"text": "Man is an animal that makes bargains: no other animal does this.", "author": "Adam Smith"},
        {"text": "Those who would give up essential liberty to purchase a little temporary safety deserve neither liberty nor safety.", "author": "Benjamin Franklin"},
        {"text": "Well done is better than well said.", "author": "Benjamin Franklin"},
        {"text": "An investment in knowledge pays the best interest.", "author": "Benjamin Franklin"},
        {"text": "Life can only be understood backwards; but it must be lived forwards.", "author": "Søren Kierkegaard"},
        {"text": "The most common form of despair is not being who you are.", "author": "Søren Kierkegaard"},
        {"text": "There are two ways to be fooled. One is to believe what is not true; the other is to refuse to believe what is true.", "author": "Søren Kierkegaard"},
        {"text": "Without music, life would be a mistake.", "author": "Friedrich Nietzsche"},
        {"text": "He who fights with monsters should look to it that he himself does not become a monster.", "author": "Friedrich Nietzsche"},
        {"text": "There are no facts, only interpretations.", "author": "Friedrich Nietzsche"},
        {"text": "And those who were seen dancing were thought to be insane by those who could not hear the music.", "author": "Friedrich Nietzsche"},
        {"text": "Beauty will save the world.", "author": "Fyodor Dostoyevsky"},
        {"text": "The degree of civilisation in a society can be judged by entering its prisons.", "author": "Fyodor Dostoyevsky"},
        {"text": "Pain and suffering are always inevitable for a large intelligence and a deep heart.", "author": "Fyodor Dostoyevsky"},
        {"text": "Everyone thinks of changing the world, but no one thinks of changing himself.", "author": "Leo Tolstoy"},
        {"text": "Respect was invented to cover the empty place where love should be.", "author": "Leo Tolstoy"},
        {"text": "The philosophers have only interpreted the world, in various ways. The point is to change it.", "author": "Karl Marx"},
        {"text": "Men make their own history, but they do not make it as they please.", "author": "Karl Marx"},
        {"text": "Give me six hours to chop down a tree and I will spend the first four sharpening the axe.", "author": "Abraham Lincoln"},
        {"text": "Better to remain silent and be thought a fool than to speak out and remove all doubt.", "author": "Abraham Lincoln"},
        {"text": "Whenever you find yourself on the side of the majority, it is time to pause and reflect.", "author": "Mark Twain"},
        {"text": "It is easier to fool people than to convince them that they have been fooled.", "author": "Mark Twain"},
        {"text": "Get your facts first, then you can distort them as you please.", "author": "Mark Twain"},
        {"text": "A cynic is a man who knows the price of everything and the value of nothing.", "author": "Oscar Wilde"},
        {"text": "The truth is rarely pure and never simple.", "author": "Oscar Wilde"},
        {"text": "I can resist everything except temptation.", "author": "Oscar Wilde"},
        {"text": "A man who does not think for himself does not think at all.", "author": "Oscar Wilde"},
        {"text": "We are all in the gutter, but some of us are looking at the stars.", "author": "Oscar Wilde"},
        {"text": "Chance favours the prepared mind.", "author": "Louis Pasteur"},
        {"text": "It is not the strongest of the species that survives, nor the most intelligent, but the one most responsive to change.", "author": "Charles Darwin"},
        {"text": "No bird soars too high if he soars with his own wings.", "author": "William Blake"},
        {"text": "Think where man's glory most begins and ends, and say my glory was I had such friends.", "author": "W. B. Yeats"},
        {"text": "Things fall apart; the centre cannot hold.", "author": "W. B. Yeats"},
        {"text": "Education is not the filling of a pail, but the lighting of a fire.", "author": "W. B. Yeats"},
        {"text": "Treat a man as he is, and he will remain as he is. Treat a man as he could and should be, and he will become as he could and should be.", "author": "Johann Wolfgang von Goethe"},
        {"text": "Knowing is not enough; we must apply. Willing is not enough; we must do.", "author": "Johann Wolfgang von Goethe"},
        {"text": "Whatever you can do, or dream you can do, begin it. Boldness has genius, power, and magic in it.", "author": "Johann Wolfgang von Goethe"},
        {"text": "The price of anything is the amount of life you exchange for it.", "author": "Henry David Thoreau"},
        {"text": "Our life is frittered away by detail. Simplify, simplify.", "author": "Henry David Thoreau"},
        {"text": "You cannot find peace by avoiding life.", "author": "Virginia Woolf"},
        {"text": "Arrange whatever pieces come your way.", "author": "Virginia Woolf"},
        {"text": "Mistakes are the portals of discovery.", "author": "James Joyce"},
        {"text": "A book must be the axe for the frozen sea within us.", "author": "Franz Kafka"},
        {"text": "One must imagine Sisyphus happy.", "author": "Albert Camus"},
        {"text": "In the depth of winter, I finally learned that within me there lay an invincible summer.", "author": "Albert Camus"},
        {"text": "We are condemned to be free.", "author": "Jean-Paul Sartre"},
        {"text": "The past is never dead. It is not even past.", "author": "William Faulkner"},
        {"text": "The only journey is the one within.", "author": "Rainer Maria Rilke"},
        {"text": "Don't tell me the moon is shining; show me the glint of light on broken glass.", "author": "Anton Chekhov"},
        {"text": "If you only read the books that everyone else is reading, you can only think what everyone else is thinking.", "author": "Haruki Murakami"},
        {"text": "The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.", "author": "Marcel Proust"},
        {"text": "There is nothing noble in being superior to your fellow man; true nobility is being superior to your former self.", "author": "Ernest Hemingway"},
        {"text": "Courage is grace under pressure.", "author": "Ernest Hemingway"},
        {"text": "The world breaks everyone, and afterward, some are strong at the broken places.", "author": "Ernest Hemingway"},
        {"text": "The test of a first-rate intelligence is the ability to hold two opposed ideas in mind at the same time.", "author": "F. Scott Fitzgerald"},
        {"text": "Time forks perpetually toward innumerable futures.", "author": "Jorge Luis Borges"},
        {"text": "Only those who will risk going too far can possibly find out how far one can go.", "author": "T. S. Eliot"},
        {"text": "Be regular and orderly in your life, so that you may be violent and original in your work.", "author": "Gustave Flaubert"},
        {"text": "Political language is designed to make lies sound truthful and murder respectable.", "author": "George Orwell"},
        {"text": "The most effective way to destroy people is to deny and obliterate their own understanding of their history.", "author": "George Orwell"},
        {"text": "All animals are equal, but some animals are more equal than others.", "author": "George Orwell"},
        {"text": "A lie gets halfway around the world before the truth has a chance to get its trousers on.", "author": "Winston Churchill"},
        {"text": "If you're going through hell, keep going.", "author": "Winston Churchill"},
        {"text": "Success consists of going from failure to failure without loss of enthusiasm.", "author": "Winston Churchill"},
        {"text": "To improve is to change; to be perfect is to change often.", "author": "Winston Churchill"},
        {"text": "The only thing we have to fear is fear itself.", "author": "Franklin D. Roosevelt"},
        {"text": "Ask not what your country can do for you — ask what you can do for your country.", "author": "John F. Kennedy"},
        {"text": "The time is always right to do what is right.", "author": "Martin Luther King Jr."},
        {"text": "Darkness cannot drive out darkness; only light can do that.", "author": "Martin Luther King Jr."},
        {"text": "Freedom is never voluntarily given by the oppressor; it must be demanded by the oppressed.", "author": "Martin Luther King Jr."},
        {"text": "The arc of the moral universe is long, but it bends toward justice.", "author": "Theodore Parker"},
        {"text": "It always seems impossible until it is done.", "author": "Nelson Mandela"},
        {"text": "I never lose. I either win or learn.", "author": "Nelson Mandela"},
        {"text": "Education is the most powerful weapon which you can use to change the world.", "author": "Nelson Mandela"},
        {"text": "Not everything that is faced can be changed, but nothing can be changed until it is faced.", "author": "James Baldwin"},
        {"text": "If you have some power, then your job is to empower somebody else.", "author": "Toni Morrison"},
        {"text": "Hope is not a feeling of certainty that everything ends well. Hope is just a feeling that life and work have meaning.", "author": "Václav Havel"},
        {"text": "The most radical revolutionary will become a conservative the day after the revolution.", "author": "Hannah Arendt"},
        {"text": "There are no dangerous thoughts; thinking itself is dangerous.", "author": "Hannah Arendt"},
        {"text": "The good life is one inspired by love and guided by knowledge.", "author": "Bertrand Russell"},
        {"text": "The fundamental cause of trouble in the world today is that the stupid are cocksure while the intelligent are full of doubt.", "author": "Bertrand Russell"},
        {"text": "The most savage controversies are those about matters as to which there is no good evidence either way.", "author": "Bertrand Russell"},
        {"text": "What can be said at all can be said clearly, and what one cannot speak about one must pass over in silence.", "author": "Ludwig Wittgenstein"},
        {"text": "If a lion could speak, we could not understand him.", "author": "Ludwig Wittgenstein"},
        {"text": "In the long run we are all dead.", "author": "John Maynard Keynes"},
        {"text": "When the facts change, I change my mind. What do you do, sir?", "author": "John Maynard Keynes"},
        {"text": "The first principle is that you must not fool yourself — and you are the easiest person to fool.", "author": "Richard Feynman"},
        {"text": "Nothing in life is to be feared, it is only to be understood.", "author": "Marie Curie"},
        {"text": "We can only see a short distance ahead, but we can see plenty there that needs to be done.", "author": "Alan Turing"},
        {"text": "Don't play what's there, play what's not there.", "author": "Miles Davis"},
        {"text": "It takes a long time to play like yourself.", "author": "Miles Davis"},
        {"text": "There is a crack in everything. That's how the light gets in.", "author": "Leonard Cohen"},
        {"text": "I don't know where I'm going from here, but I promise it won't be boring.", "author": "David Bowie"},
        {"text": "If you are first you are first. If you are second, you are nothing.", "author": "Bill Shankly"},
        {"text": "Some people believe football is a matter of life and death. I am very disappointed with that attitude. I can assure you it is much, much more important than that.", "author": "Bill Shankly"},
        {"text": "Rome wasn't built in a day, but I wasn't on that particular job.", "author": "Brian Clough"},
        {"text": "Every disadvantage has its advantage.", "author": "Johan Cruyff"},
        {"text": "Playing football is very simple, but playing simple football is the hardest thing there is.", "author": "Johan Cruyff"},
        {"text": "Float like a butterfly, sting like a bee.", "author": "Muhammad Ali"},
        {"text": "Service to others is the rent you pay for your room here on earth.", "author": "Muhammad Ali"},
        {"text": "The man who has no imagination has no wings.", "author": "Muhammad Ali"},
        {"text": "The man who can drive himself further once the effort gets painful is the man who will win.", "author": "Roger Bannister"},
        {"text": "Being second is to be the first of the ones who lose.", "author": "Ayrton Senna"},
        {"text": "Form follows function.", "author": "Louis Sullivan"},
        {"text": "Less is more.", "author": "Ludwig Mies van der Rohe"},
        {"text": "The details are not the details. They make the design.", "author": "Charles Eames"},
        {"text": "Simplicity is the ultimate sophistication.", "author": "Leonardo da Vinci"},
        {"text": "Show me a sane man and I will cure him for you.", "author": "Carl Jung"},
        {"text": "Until you make the unconscious conscious, it will direct your life and you will call it fate.", "author": "Carl Jung"},
        {"text": "Who looks outside, dreams; who looks inside, awakes.", "author": "Carl Jung"},
        {"text": "History is a set of lies agreed upon.", "author": "Napoleon Bonaparte"},
        {"text": "Never interrupt your enemy when he is making a mistake.", "author": "Napoleon Bonaparte"},
        {"text": "Impossible is a word to be found only in the dictionary of fools.", "author": "Napoleon Bonaparte"},
        {"text": "The reasonable man adapts himself to the world; the unreasonable one persists in trying to adapt the world to himself. Therefore all progress depends on the unreasonable man.", "author": "George Bernard Shaw"},
        {"text": "A room without books is like a body without a soul.", "author": "Marcus Tullius Cicero"},
        {"text": "The more you know, the more you know you don't know.", "author": "Aristotle"},
        {"text": "Read not to contradict and confute, nor to believe and take for granted, but to weigh and consider.", "author": "Francis Bacon"},
        {"text": "Knowledge is power.", "author": "Francis Bacon"},
        {"text": "The unexamined life is not worth living.", "author": "Socrates"},
        {"text": "There is only one good, knowledge, and one evil, ignorance.", "author": "Socrates"},
        {"text": "I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel.", "author": "Maya Angelou"},
        {"text": "There is no greater agony than bearing an untold story inside you.", "author": "Maya Angelou"},
        {"text": "A society grows great when old men plant trees whose shade they know they shall never sit in.", "author": "Greek Proverb"},
        {"text": "Do not go where the path may lead, go instead where there is no path and leave a trail.", "author": "Ralph Waldo Emerson"},
        {"text": "What lies behind us and what lies before us are tiny matters compared to what lies within us.", "author": "Ralph Waldo Emerson"},
        {"text": "Foolish consistency is the hobgoblin of little minds.", "author": "Ralph Waldo Emerson"},
        {"text": "Beauty is truth, truth beauty — that is all ye know on earth, and all ye need to know.", "author": "John Keats"},
        {"text": "Not all those who wander are lost.", "author": "J. R. R. Tolkien"},
        {"text": "Management is doing things right; leadership is doing the right things.", "author": "Peter Drucker"},
        {"text": "Culture eats strategy for breakfast.", "author": "Peter Drucker"},
        {"text": "A little learning is a dangerous thing; drink deep, or taste not the Pierian spring.", "author": "Alexander Pope"},
        {"text": "The best time to plant a tree was twenty years ago. The second best time is now.", "author": "Chinese Proverb"},
        {"text": "Fall seven times, stand up eight.", "author": "Japanese Proverb"},
        {"text": "I am not afraid of an army of lions led by a sheep; I am afraid of an army of sheep led by a lion.", "author": "Alexander the Great"},
        {"text": "History is a gallery of pictures in which there are few originals and many copies.", "author": "Alexis de Tocqueville"},
        {"text": "The health of a democratic society may be measured by the quality of functions performed by private citizens.", "author": "Alexis de Tocqueville"},
        {"text": "Great minds discuss ideas; average minds discuss events; small minds discuss people.", "author": "Eleanor Roosevelt"},
        {"text": "No one can make you feel inferior without your consent.", "author": "Eleanor Roosevelt"},
        {"text": "The future belongs to those who believe in the beauty of their dreams.", "author": "Eleanor Roosevelt"},
        {"text": "Champions keep playing until they get it right.", "author": "Billie Jean King"},
        {"text": "You miss 100 per cent of the shots you don't take.", "author": "Wayne Gretzky"},
        {"text": "I skate to where the puck is going to be, not where it has been.", "author": "Wayne Gretzky"},
        {"text": "Difficulties are just things to overcome, after all.", "author": "Ernest Shackleton"},
        {"text": "The most important thing in communication is hearing what isn't said.", "author": "Peter Drucker"},
        {"text": "In three words I can sum up everything I've learned about life: it goes on.", "author": "Robert Frost"},
        {"text": "History repeats itself, first as tragedy, second as farce.", "author": "Karl Marx"},
        {"text": "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", "author": "Ralph Waldo Emerson"},
        {"text": "Imagination is more important than knowledge. For knowledge is limited, whereas imagination encircles the world.", "author": "Albert Einstein"},
        {"text": "A people that elect corrupt politicians are not victims but accomplices.", "author": "George Orwell"},
        {"text": "The whole problem with the world is that fools and fanatics are always so certain of themselves, and wiser people so full of doubts.", "author": "Bertrand Russell"},
        {"text": "It is not the man who has too little, but the man who craves more, that is poor.", "author": "Seneca"},
        {"text": "Don't explain your philosophy. Embody it.", "author": "Epictetus"},
        {"text": "Make the best use of what is in your power, and take the rest as it happens.", "author": "Epictetus"},
        {"text": "First say to yourself what you would be; and then do what you have to do.", "author": "Epictetus"},
        {"text": "The curious paradox is that when I accept myself just as I am, then I can change.", "author": "Carl Rogers"},
        {"text": "Whoever fights monsters should see to it that in the process he does not become a monster.", "author": "Friedrich Nietzsche"},
        {"text": "The higher we soar, the smaller we appear to those who cannot fly.", "author": "Friedrich Nietzsche"},
        {"text": "Not I, but the city teaches.", "author": "Socrates"},
        {"text": "Buy when there's blood in the streets, even if the blood is your own.", "author": "Baron Rothschild"},
        {"text": "Price is what you pay. Value is what you get.", "author": "Warren Buffett"},
        {"text": "It's far better to buy a wonderful company at a fair price than a fair company at a wonderful price.", "author": "Warren Buffett"},
        {"text": "Rule No. 1: Never lose money. Rule No. 2: Never forget Rule No. 1.", "author": "Warren Buffett"},
        {"text": "The secret of getting ahead is getting started.", "author": "Mark Twain"},
        {"text": "You become what you think about most of the time.", "author": "Earl Nightingale"},
        {"text": "If your actions inspire others to dream more, learn more, do more and become more, you are a leader.", "author": "John Quincy Adams"},
        {"text": "The two most important days in your life are the day you are born and the day you find out why.", "author": "Mark Twain"},
        {"text": "Success is not final, failure is not fatal: it is the courage to continue that counts.", "author": "Winston Churchill"},
        {"text": "Do what you can, with what you have, where you are.", "author": "Theodore Roosevelt"},
        {"text": "Speak softly and carry a big stick.", "author": "Theodore Roosevelt"},
        {"text": "Far better it is to dare mighty things, to win glorious triumphs, even though chequered by failure.", "author": "Theodore Roosevelt"},
        {"text": "Optimism is the faith that leads to achievement. Nothing can be done without hope and confidence.", "author": "Helen Keller"},
        {"text": "The only way to do great work is to love what you do.", "author": "Steve Jobs"},
        {"text": "Stay hungry, stay foolish.", "author": "Stewart Brand"},
        {"text": "An eye for an eye only ends up making the whole world blind.", "author": "Mahatma Gandhi"},
        {"text": "Be the change you wish to see in the world.", "author": "Mahatma Gandhi"},
        {"text": "Speak only if it improves upon the silence.", "author": "Mahatma Gandhi"},
        {"text": "The greatest glory in living lies not in never falling, but in rising every time we fall.", "author": "Nelson Mandela"},
        {"text": "Not everything that counts can be counted, and not everything that can be counted counts.", "author": "William Bruce Cameron"},
        {"text": "A man who dares to waste one hour of time has not discovered the value of life.", "author": "Charles Darwin"},
        {"text": "In theory there is no difference between theory and practice. In practice there is.", "author": "Yogi Berra"},
        {"text": "It ain't over till it's over.", "author": "Yogi Berra"},
        {"text": "Whenever I hear anyone arguing for slavery, I feel a strong impulse to see it tried on him personally.", "author": "Abraham Lincoln"},
        {"text": "The ballot is stronger than the bullet.", "author": "Abraham Lincoln"},
        {"text": "I never had a policy; I have just tried to do my very best each and every day.", "author": "Abraham Lincoln"},
        {"text": "To me, boxing is like a ballet, except there's no music, no choreography, and the dancers hit each other.", "author": "Jack Handey"},
        {"text": "The aim of art is to represent not the outward appearance of things, but their inward significance.", "author": "Aristotle"},
        {"text": "He who has a why to live can bear almost any how.", "author": "Friedrich Nietzsche"},
        {"text": "Without deviation from the norm, progress is not possible.", "author": "Frank Zappa"},
        {"text": "Some painters transform the sun into a yellow spot; others transform a yellow spot into the sun.", "author": "Pablo Picasso"},
        {"text": "Everything you can imagine is real.", "author": "Pablo Picasso"},
        {"text": "Others have seen what is and asked why. I have seen what could be and asked why not.", "author": "Pablo Picasso"},
        {"text": "What we think, we become.", "author": "Buddha"},
        {"text": "Three things cannot be long hidden: the sun, the moon, and the truth.", "author": "Buddha"},
        {"text": "The mind is everything. What you think you become.", "author": "Buddha"},
        {"text": "It does not matter how slowly you go as long as you do not stop.", "author": "Confucius"},
        {"text": "Our greatest glory is not in never falling, but in rising every time we fall.", "author": "Confucius"},
        {"text": "When you see a good person, think of becoming like her/him. When you see someone not so good, reflect on your own weak points.", "author": "Confucius"},
    ]
    day_hash = int(hashlib.md5(TODAY.encode()).hexdigest(), 16)
    q = QUOTES[day_hash % len(QUOTES)]
    text = q['text'].replace('"', '\\"').replace("'", "\\'")
    author = q['author'].replace('"', '\\"')
    js = f'var QUOTE_DATA = {{\n  date: "{TODAY}",\n  text: "{text}",\n  author: "{author}"\n}};'
    log(f"  ✓ Quote selected: {q['author']}")
    return js


def gen_recipes():
    log("\n── Suggested Recipes")
    recent_recipe_titles = recent_values('suggested-recipes-data.js', 'title', days=30)
    avoid_recipes = '\n'.join(f'- {t}' for t in recent_recipe_titles) if recent_recipe_titles else 'None'
    prompt = f"""Generate exactly 3 recipe suggestions for today ({TODAY}) for a personal recipe website.
The user loves: bold flavours, European and world cuisines, seasonal ingredients, and genuinely delicious food.
The recipes should be genuinely delicious and feel special, but achievable for an everyday home cook — no cheffy techniques like spherification, sous vide, or complex pastry work. Think flavour-forward dishes that come together without specialist equipment or hard-to-find ingredients. Impressive results from straightforward cooking.

VARIETY IS ESSENTIAL — the 3 recipes must span completely different cuisines, protein sources, and meal styles. Do NOT repeat ingredients, proteins, or cuisines across the 3 recipes today.

RECENTLY SUGGESTED RECIPES — do NOT repeat any of these titles or their primary ingredients/proteins:
{avoid_recipes}

AVOID defaulting to the same ingredients repeatedly (lamb, sea bass, asparagus have been overused). Rotate broadly across:
  Proteins: chicken, beef, pork, duck, lamb, venison, salmon, cod, prawns, mussels, crab, tofu, eggs, legumes, halloumi — vary every day
  Cuisines: Italian, French, Spanish, Greek, Moroccan, Middle Eastern, Indian, Thai, Japanese, Korean, Mexican, Vietnamese, American, British — rotate widely
  Meal types: pasta, risotto, curry, stew, stir-fry, salad, soup, tart, pie, roast, burger, noodles, grain bowl, tagine, braise — vary every session
  Categories: include a mix of Dinner, Lunch, and Breakfast/Brunch across the week

Each recipe should feel distinctly different from the others in today's set.

Output ONLY valid JavaScript. No explanation, no markdown. Start directly with "window.SUGGESTED_RECIPES".

window.SUGGESTED_RECIPES = [
  {{
    id: "sug1",
    title: "Recipe Title",
    category: "Dinner",
    time: "45 mins",
    serves: "4",
    desc: "2-3 sentence description of what makes this dish special.",
    emoji: "🍽️",
    image: "__IMG_R1__",
    ingredientGroups: [
      {{ group: "Main", items: [
        {{ name: "Ingredient name", quantity: 200, unit: "g" }},
        {{ name: "Another ingredient", quantity: 2, unit: "tbsp" }}
      ]}},
      {{ group: "Sauce", items: [
        {{ name: "Sauce ingredient", quantity: 3, unit: "tbsp" }}
      ]}}
    ],
    substitutes: [
      {{ ingredient: "Key ingredient", alternatives: ["Substitute 1", "Substitute 2"] }},
      {{ ingredient: "Another ingredient", alternatives: ["Alternative A", "Alternative B"] }}
    ],
    instructions: [
      "Step 1 — detailed, technique-forward instruction.",
      "Step 2 — continue with the same quality."
    ]
  }},
  {{
    id: "sug2",
    title: "Second Recipe Title",
    category: "Lunch",
    time: "30 mins",
    serves: "2",
    desc: "2-3 sentence description.",
    emoji: "🐟",
    image: "__IMG_R2__",
    ingredientGroups: [
      {{ group: "Main", items: [{{ name: "Ingredient", quantity: 1, unit: "" }}] }},
      {{ group: "Dressing", items: [{{ name: "Dressing ingredient", quantity: 2, unit: "tbsp" }}] }}
    ],
    substitutes: [
      {{ ingredient: "Key ingredient", alternatives: ["Substitute 1", "Substitute 2"] }}
    ],
    instructions: [
      "Step 1."
    ]
  }},
  {{
    id: "sug3",
    title: "Third Recipe Title",
    category: "Dinner",
    time: "1 hr",
    serves: "4",
    desc: "2-3 sentence description.",
    emoji: "🥗",
    image: "__IMG_R3__",
    ingredientGroups: [
      {{ group: "Main", items: [{{ name: "Ingredient", quantity: 100, unit: "g" }}] }},
      {{ group: "Marinade", items: [{{ name: "Marinade ingredient", quantity: 2, unit: "tbsp" }}] }}
    ],
    substitutes: [
      {{ ingredient: "Key ingredient", alternatives: ["Substitute 1", "Substitute 2"] }}
    ],
    instructions: [
      "Step 1."
    ]
  }}
];"""
    js = extract_js(call_claude(prompt, timeout=240, max_tokens=8192))
    if not js:
        return None
    # Inject Pexels images using each recipe title
    try:
        titles = re.findall(r'title:\s*["\'](.+?)["\']', js)
        sentinels = ['__IMG_R1__', '__IMG_R2__', '__IMG_R3__']
        for i, sentinel in enumerate(sentinels):
            if f'"{sentinel}"' in js or f"'{sentinel}'" in js:
                query = (titles[i] + ' food dish') if i < len(titles) else 'gourmet food'
                url = fetch_unsplash_image(query, orientation='landscape') or fetch_pexels_image(query, orientation='landscape')
                if url:
                    js = js.replace(f'"{sentinel}"', f'"{url}"', 1)
                    js = js.replace(f"'{sentinel}'", f"'{url}'", 1)
                    log(f'  ✓ Recipe image [{i+1}]: {query[:40]}')
                else:
                    js = js.replace(f'"{sentinel}"', 'null', 1)
                    js = js.replace(f"'{sentinel}'", 'null', 1)
    except Exception as e:
        log(f'  [warning] Recipe image injection failed: {e}')
        for s in ['__IMG_R1__', '__IMG_R2__', '__IMG_R3__']:
            js = js.replace(f'"{s}"', 'null', 1)
    return js


# ── Cache buster ──────────────────────────────────────────────────────────────

def bump_cache_busters():
    """Update ?v= query strings in every HTML file in the repo so the CDN always serves fresh data."""
    version = datetime.datetime.now().strftime('%Y%m%d%H%M')
    changed = []
    html_files = [f for f in os.listdir(REPO_DIR) if f.endswith('.html')]
    for html_file in sorted(html_files):
        html_path = os.path.join(REPO_DIR, html_file)
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()
        # Replace ?v=... on any .js script src (versioned or unversioned)
        new_content = re.sub(
            r'(<script src="[^"]+\.js)(\?v=[^"]*)?(">)',
            lambda m: m.group(1) + f'?v={version}' + m.group(3),
            content
        )
        if new_content != content:
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            log(f"  ✓ Cache-busted: {html_file}")
            changed.append(html_file)
    return changed

# ── Git ────────────────────────────────────────────────────────────────────────

def git_push(files):
    log("\n── Git commit & push")
    git_env = os.environ.copy()
    git_env['GIT_TERMINAL_PROMPT'] = '0'

    in_actions = os.environ.get('GITHUB_ACTIONS') == 'true'
    if in_actions:
        # Configure git identity for the Actions bot
        subprocess.run(['git', '-C', REPO_DIR, 'config', 'user.email', 'actions@github.com'], env=git_env)
        subprocess.run(['git', '-C', REPO_DIR, 'config', 'user.name', 'github-actions'], env=git_env)
    else:
        # launchd: HOME not set in minimal environment
        git_env['HOME'] = os.path.expanduser('~')

    cmds = [
        (['git', '-C', REPO_DIR, 'add', '-A'], 'add'),  # stage ALL changes so nothing is missed
        (['git', '-C', REPO_DIR, 'commit', '-m', f'Daily content update {TODAY}'], 'commit'),
        (['git', '-C', REPO_DIR, 'push'], 'push'),
    ]
    for cmd, label in cmds:
        r = subprocess.run(cmd, capture_output=True, text=True, env=git_env)
        if r.returncode != 0 and label != 'commit':
            log(f"  [warning] git {label}: {r.stderr.strip()[:200]}")
        else:
            log(f"  ✓ git {label}")

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    with open(LOG_FILE, 'a') as f:
        f.write(f"\n{'='*60}\n")
    log(f"Daily Hub Update — {TODAY}")

    updated = []
    PAUSE = 5  # seconds between Claude calls to avoid rate limits

    # ── News files (RSS + AI summarise) ──────────────────────────────────────
    # Each category fetches ONLY its own RSS feeds so Claude gets category-specific
    # articles and is not dominated by the same global story across all sections.
    log("\n── Fetching RSS feeds per category")

    news_tasks = [
        ('world',      'WORLD_NEWS',       'world',     ['s1','s2','s3'],   'world-news-data.js',
         'This is the WORLD NEWS section. Focus on international affairs, geopolitics, conflicts, diplomacy, and major events outside the UK. The main story must be a genuinely global or international story — not domestic UK or US politics.'),
        ('uk_politics','UK_POLITICS_NEWS', 'uk',        ['uk1','uk2','uk3'],'uk-politics-news-data.js',
         'This is the UK POLITICS section. The main story must be specifically about British domestic politics — Westminster, Parliament, UK government policy, political parties, devolved governments, or UK elections. Do NOT use a story about Trump, US politics, or international affairs as the main story even if it is in the feed.'),
        ('us_politics','US_POLITICS_NEWS', 'us',        ['us1','us2','us3'],'us-politics-news-data.js',
         'This is the US POLITICS section. The main story must be specifically about American domestic politics — the White House, Congress, US federal policy, US elections, or US political figures. Focus on the political decision-making, not just the international consequences.'),
        ('financial',  'FINANCIAL_NEWS',   'financial', ['fn1','fn2','fn3'],'financial-news-data.js',
         'This is the FINANCIAL NEWS section. The main story must be about markets, business, economics, corporate earnings, mergers and acquisitions, or monetary policy. If a political story (e.g. tariffs) has a significant market or economic angle, you may cover its financial impact — but frame it through the economic/market lens, not the political one.'),
        ('tech',       'TECH_NEWS',        'tech',      ['tc1','tc2','tc3'],'tech-news-data.js',
         'This is the TECHNOLOGY NEWS section. The main story must be specifically about technology — AI, software, hardware, the tech industry, cybersecurity, space, or science. Do NOT use a political story as the main piece even if it involves tech companies. Pick the most significant genuinely tech-focused story.'),
    ]

    for category, var_name, img_key, ids, filename, focus_hint in news_tasks:
        category_articles = fetch_rss(*RSS[category])
        log(f"  ✓ {len(category_articles)} articles for {category}")
        js = gen_news(category, var_name, img_key, ids, focus_hint, all_articles=category_articles)
        if js:
            header = f"// {filename}\n// Auto-updated {TODAY} — do not edit manually\n\n"
            updated.append(write_file(filename, header + js + '\n'))
        time.sleep(PAUSE)

    # ── Pure AI-generated content ─────────────────────────────────────────────
    ai_tasks = [
        (gen_quote,       'quote-data.js'),
        (gen_quiz,        'quiz-data.js'),
        (gen_philosophy,  'philosophy-data.js'),
        (gen_curiosity,   'curiosity-data.js'),
        (gen_rics,        'rics-data.js'),
        (gen_reads,       'reads-data.js'),
        (gen_films,       'films-data.js'),
        (gen_recipes,     'suggested-recipes-data.js'),
    ]

    for generator, filename in ai_tasks:
        js = generator()
        if js is None and filename == 'curiosity-data.js':
            log("  Retrying curiosity corner with extended timeout...")
            js = gen_curiosity()
        if js is None and filename == 'suggested-recipes-data.js':
            log("  Retrying recipes with extended timeout...")
            js = gen_recipes()
        if js:
            header = f"// {filename}\n// Auto-updated {TODAY} — do not edit manually\n\n"
            updated.append(write_file(filename, header + js + '\n'))
            # Append RICS lesson to rolling logbook
            if filename == 'rics-data.js':
                log_file = append_rics_log(js)
                if log_file:
                    updated.append('rics-log.js')
        time.sleep(PAUSE)

    # ── Bump cache busters in HTML pages ─────────────────────────────────────
    log("\n── Bumping cache busters")
    html_changed = bump_cache_busters()

    # ── Commit & push ─────────────────────────────────────────────────────────
    if updated or html_changed:
        git_push(updated + html_changed)
        log(f"\nDone — {len(updated)} data files + {len(html_changed)} HTML files updated and pushed.")
    else:
        log("\nNo files were updated (all generators failed or returned nothing).")

if __name__ == '__main__':
    main()
