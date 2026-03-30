#!/usr/bin/env python3
"""
Generate a daily RICS APC study article using the Claude API.

Each article is saved as articles/day-XX.js and loaded automatically
by rics-study.html when that day arrives in the 33-day rotation cycle.

Usage:
  python3 tools/generate_article.py              # generate today's article
  python3 tools/generate_article.py --day 5      # generate article for day 5
  python3 tools/generate_article.py --all        # generate all 33 articles
  python3 tools/generate_article.py --day 5 --force   # overwrite existing file
"""

import argparse
import json
import os
import re
import sys
import time
from datetime import date, datetime
from pathlib import Path

import anthropic

# ── Paths ──────────────────────────────────────────────────────────────────
ROOT        = Path(__file__).parent.parent
TOPICS_FILE = ROOT / "rics-topics.json"
ARTICLES    = ROOT / "articles"

# ── Rotation epoch (must match rics-study.html) ────────────────────────────
EPOCH = date(2026, 3, 28)
CYCLE = 33

# ── System prompt ──────────────────────────────────────────────────────────
SYSTEM = """You are an expert RICS APC tutor writing daily study articles for a \
Planning and Development pathway candidate preparing for their Assessment of \
Professional Competence. Write clearly, practically, and without unnecessary jargon. \
The candidate is not highly technical but is learning the subject in depth.

Your output must be a single valid JSON object — no markdown fences, no commentary \
outside the JSON, nothing before or after the opening and closing braces."""

# ── HTML classes reference for the prompt ──────────────────────────────────
HTML_GUIDE = """
AVAILABLE HTML CLASSES (use only these in main and tables fields):
  Headings:      <h2> for section heading (one only), <h3> for sub-headings
  Body text:     <p>, <ul><li>, <ol><li>, <strong>, <em>
  Key term box:  <div class="key-term"><strong>Key Term — Label</strong><p>Definition.</p></div>
  APC tip box:   <div class="callout-tip"><strong>APC Tip — Title</strong><p>Content.</p></div>
  Warning box:   <div class="callout-warn"><strong>Watch Out — Title</strong><p>Content.</p></div>
  Table wrap:    <div class="diagram-wrap"><div class="diagram-label">Table N — Title</div>
                   <table class="data-table"><thead>...</thead><tbody>...</tbody></table></div>
  Diagram hold:  <div class="diagram-wrap"><div class="diagram-label">Figure N — Title</div>
                   <div class="diagram-placeholder">Description of diagram concept</div></div>

SVG COLOUR PALETTE (for image.svg_markup):
  Navy blue #003399, Dark green #1a5c2a, Amber #c17f24,
  Ink #0d0d0d, Paper #f4f0e6, Muted grey #555
  Font: Georgia, serif. All SVGs: viewBox="0 0 800 300"
"""

# ── Build user prompt ───────────────────────────────────────────────────────
def build_prompt(entry: dict) -> str:
    return f"""Generate a complete RICS APC study article for the following topic.

Day: {entry['day']}
Module: {entry['module']}
APC Competency: {entry['apc_competency']}
Competency Level: {entry['level']}
Topic: {entry['topic']}
Study Focus: {entry['focus']}

{HTML_GUIDE}

Return ONLY a JSON object with this exact structure:

{{
  "sections": {{
    "image": {{
      "svg_markup": "<svg viewBox=\\"0 0 800 300\\" xmlns=\\"http://www.w3.org/2000/svg\\" style=\\"width:100%;height:auto;display:block;background:#f4f0e6;border:1px solid #ccc;\\">...</svg>",
      "caption": "Figure 1 — descriptive caption"
    }},
    "main": "<h2>Section heading</h2><p>...</p>...",
    "tables": "<h2>Visual Summary</h2><div class=\\"diagram-wrap\\">...</div>",
    "summary_points": [
      "Point 1 — may contain <strong> tags",
      "Point 2",
      "Point 3",
      "Point 4",
      "Point 5"
    ],
    "summary_closing": "<p>Closing sentence linking to the APC competency.</p>",
    "qa": [
      {{"q": "Question text", "a": "Answer text"}},
      {{"q": "Question text", "a": "Answer text"}},
      {{"q": "Question text", "a": "Answer text"}},
      {{"q": "Question text", "a": "Answer text"}},
      {{"q": "Question text", "a": "Answer text"}}
    ],
    "news": [
      {{"tag": "Category", "headline": "Headline", "body": "2–3 sentence summary and why it matters."}},
      {{"tag": "Category", "headline": "Headline", "body": "2–3 sentence summary and why it matters."}},
      {{"tag": "Category", "headline": "Headline", "body": "2–3 sentence summary and why it matters."}}
    ]
  }}
}}

CONTENT REQUIREMENTS:
- image.svg_markup: A self-contained inline SVG diagram relevant to the topic.
  Use the palette colours above. Include a title, labels, and at least one visual element
  (bar chart, timeline, flow diagram, etc.) that helps explain a key concept.
- main: 800–1200 words. Include at least one key-term box, one callout-tip, one callout-warn.
  Use real UK examples and APC-relevant context. Aim for Level {entry['level']} depth.
- tables: One or two data tables with meaningful, accurate content.
  Use realistic UK figures where applicable.
- summary_points: 5–6 bullet points. Each may contain <strong> for emphasis.
- qa: 5–6 questions. Mix recall and applied thinking. Include at least one
  numerical/calculation question if the topic involves figures.
  Answers should be 2–5 sentences. May contain <strong> and basic HTML.
- news: 3 brief UK real estate news items relevant to this topic, set in 2026 context.
  Each body: what happened + why it matters to P&D practice.
- Use HTML entities: &mdash; &ndash; &pound; &times; &rsquo; &ldquo; &rdquo; &hellip;
- Do NOT include backticks, markdown, or code fences anywhere in the output.
"""


def today_day_number() -> int:
    delta = (date.today() - EPOCH).days
    return ((delta % CYCLE) + CYCLE) % CYCLE + 1


def load_schedule() -> dict:
    with open(TOPICS_FILE, encoding="utf-8") as f:
        data = json.load(f)
    return {entry["day"]: entry for entry in data["schedule"]}


def generate(day: int, schedule: dict, client: anthropic.Anthropic) -> str:
    entry = schedule.get(day)
    if not entry:
        sys.exit(f"Error: no topic found for day {day}.")

    print(f"  Generating Day {day:02d}: {entry['topic']} ...", end=" ", flush=True)

    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=8192,
        system=SYSTEM,
        messages=[{"role": "user", "content": build_prompt(entry)}],
    )

    raw = message.content[0].text.strip()

    # Strip markdown code fences if Claude includes them despite instructions
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    raw = raw.strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        print("FAILED")
        print(f"\nJSON parse error for day {day}: {e}")
        print(f"Raw output (first 500 chars):\n{raw[:500]}")
        sys.exit(1)

    # Validate required keys
    required = {"image", "main", "tables", "summary_points", "summary_closing", "qa", "news"}
    missing = required - set(data.get("sections", {}).keys())
    if missing:
        print("FAILED")
        sys.exit(f"Missing keys in generated article: {missing}")

    # Wrap as JS file
    js = (
        f"// RICS APC Study Article — Day {day:02d}: {entry['topic']}\n"
        f"// Module: {entry['module']} | Level: {entry['level']}"
        f" | Competency: {entry['apc_competency']}\n"
        f"// Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        f" by tools/generate_article.py\n\n"
        f"window.RICS_ARTICLE = {{\n"
        f"  sections: {json.dumps(data['sections'], indent=2, ensure_ascii=False)}\n"
        f"}};\n"
    )

    print("done")
    return js


def save(day: int, content: str, force: bool) -> bool:
    ARTICLES.mkdir(exist_ok=True)
    path = ARTICLES / f"day-{day:02d}.js"
    if path.exists() and not force:
        print(f"  Day {day:02d}: already exists — skipping (use --force to overwrite)")
        return False
    path.write_text(content, encoding="utf-8")
    print(f"  Saved  → articles/day-{day:02d}.js")
    return True


def main():
    parser = argparse.ArgumentParser(
        description="Generate RICS APC study articles via Claude API.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--day", type=int, metavar="N", help="Day number 1–33")
    group.add_argument("--all", action="store_true", help="Generate all 33 articles")
    parser.add_argument("--force", action="store_true", help="Overwrite existing files")
    args = parser.parse_args()

    # Load API key
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        # Try loading from .env in project root
        env_file = ROOT / ".env"
        if env_file.exists():
            for line in env_file.read_text().splitlines():
                if line.startswith("ANTHROPIC_API_KEY="):
                    api_key = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break
    if not api_key:
        sys.exit(
            "Error: ANTHROPIC_API_KEY not found.\n"
            "Set it in your environment or add it to .env:\n"
            "  ANTHROPIC_API_KEY=your-key-here"
        )

    client = anthropic.Anthropic(api_key=api_key)
    schedule = load_schedule()

    if args.all:
        days = list(range(1, CYCLE + 1))
        print(f"Generating all {CYCLE} articles. This will make {CYCLE} API calls.")
        print("Estimated cost: ~$2–5 using claude-opus-4-6.\n")
    elif args.day:
        if not 1 <= args.day <= CYCLE:
            sys.exit(f"Error: day must be between 1 and {CYCLE}.")
        days = [args.day]
    else:
        days = [today_day_number()]
        print(f"No day specified — generating today's article (Day {days[0]}).\n")

    generated = 0
    for i, day in enumerate(days):
        content = generate(day, schedule, client)
        if save(day, content, args.force):
            generated += 1
        # Polite pause between API calls when running --all
        if args.all and i < len(days) - 1:
            time.sleep(1.5)

    print(f"\nDone. {generated} article(s) written to articles/")


if __name__ == "__main__":
    main()
