# Workflow: Generate RICS APC Daily Study Article

## Purpose

Automatically generate a full study article for any day in the 33-day RICS APC topic
rotation using the Claude API. Each article is saved as a self-contained JavaScript
file that `rics-study.html` loads automatically when that day arrives.

---

## Prerequisites

**1. Install the Anthropic Python SDK**
```bash
pip install anthropic
```

**2. Set your API key**

Add this line to the `.env` file in the project root (create the file if it does not exist):
```
ANTHROPIC_API_KEY=your-key-here
```
The script reads this automatically. You can also set it as an environment variable:
```bash
export ANTHROPIC_API_KEY=your-key-here
```

---

## Usage

Run all commands from the project root (`/Users/alfieedworthy/Documents/AI`).

### Generate today's article
```bash
python3 tools/generate_article.py
```

### Generate a specific day
```bash
python3 tools/generate_article.py --day 7
```

### Generate all 33 articles in one go
```bash
python3 tools/generate_article.py --all
```
> This makes 33 API calls. Takes 3–5 minutes. Estimated cost: **~$2–5** using claude-opus-4-6.
> Day 5 (Project Finance) is already hand-authored — it will be skipped unless you add `--force`.

### Overwrite an existing article
```bash
python3 tools/generate_article.py --day 5 --force
```

---

## What the Script Does

1. Reads the topic for the requested day from `rics-topics.json`
2. Sends a detailed prompt to `claude-opus-4-6` requesting structured article content
3. Parses the JSON response and validates all required fields are present
4. Saves the result as `articles/day-XX.js`

---

## Output Format

Each file sets `window.RICS_ARTICLE` with the following structure:

```
articles/
  day-01.js   ← Development Appraisals: Residual Valuation
  day-02.js   ← Planning & Development Management: Types of Application
  ...
  day-05.js   ← Project Finance: Senior Debt, Mezzanine and Equity  (hand-authored)
  ...
  day-33.js   ← Sustainability: BREEAM, EPC, Net Zero
```

Each file contains:
- `image` — inline SVG diagram + caption
- `main` — full learning content as HTML (h3s, paragraphs, key-term boxes, callouts)
- `tables` — one or two data tables as HTML
- `summary_points` — array of key takeaway strings (may contain `<strong>`)
- `summary_closing` — one closing paragraph as HTML
- `qa` — array of `{q, a}` objects (5–6 questions)
- `news` — array of `{tag, headline, body}` objects (3 news items)

---

## How the Page Loads Articles

`rics-study.html` uses `document.write` to synchronously inject today's article script
tag during page parsing. This works when opening the file directly in a browser
(`file://` protocol — no server needed). The rendering happens before the page finishes
loading, so there is no flash of empty content.

If today's article file does not exist yet, the static fallback content in the HTML
remains visible until the article is generated.

---

## Recommended Setup: Generate Articles Nightly

To keep articles pre-generated, run the script each day before you sit down to study.
The simplest approach is to run `--all` once to generate all 33 articles upfront,
then regenerate individual days if you want refreshed content.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `ANTHROPIC_API_KEY not found` | Add the key to `.env` or export it in your shell |
| `JSON parse error` | Re-run the same command — occasional API response formatting issues usually resolve on retry |
| `ModuleNotFoundError: No module named 'anthropic'` | Run `pip install anthropic` |
| Article file exists but page shows old content | Hard-refresh the browser (Cmd+Shift+R on Mac) |
| Day shows wrong article | Check that `EPOCH` in `rics-study.html` and the script both read `2026-03-28` |
