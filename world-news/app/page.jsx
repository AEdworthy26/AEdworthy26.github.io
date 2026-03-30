import { readFileSync } from 'fs'
import path from 'path'
import MainHeadline from '@/components/MainHeadline'
import SecondaryNewsGrid from '@/components/SecondaryNewsGrid'

// ISR: allow revalidation every hour so a manual content push is picked up quickly
export const revalidate = 3600

const NAV_LINKS = [
  { label: '⌂ Home',           href: '../personal_hub.html' },
  { label: 'RICS Study',       href: '../rics-study.html' },
  { label: 'World News',       href: '#',                               active: true },
  { label: 'Tech News',        href: '../personal_hub.html#tech-news' },
  { label: 'Curiosity Corner', href: '../personal_hub.html#curiosity-corner' },
  { label: 'Reads',            href: '../reads.html' },
  { label: 'Monthly Goals',    href: '../monthly-goals.html' },
  { label: 'Achievements',     href: '../achievements.html' },
]

function getNewsData() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'news.json')
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch {
    return null
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default function WorldNewsPage() {
  const newsData = getNewsData()
  const today    = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-paper">

      {/* ── Meta bar ── */}
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex justify-between items-center text-[0.68rem] tracking-[0.1em] uppercase text-muted border-b border-rule py-2 mt-4 mb-2">
          <span>{today}</span>
          <span>Alfie Edworthy &bull; Private</span>
        </div>
      </div>

      {/* ── Masthead ── */}
      <div className="max-w-screen-xl mx-auto px-6 text-center py-3">
        <div className="font-display font-black text-[clamp(2.4rem,5vw,4.2rem)] leading-none tracking-tight">
          Personal Hub
        </div>
        <div className="text-[0.75rem] italic text-muted mt-1 mb-2">Alfie Edworthy</div>
      </div>

      {/* ── Double rule ── */}
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="border-t-[3px] border-double border-rule" />
      </div>

      {/* ── Nav ribbon ── */}
      <nav className="bg-accent">
        <div className="max-w-screen-xl mx-auto px-4 flex flex-wrap items-center gap-0 py-0">
          {NAV_LINKS.map(({ label, href, active }) => (
            <a
              key={label}
              href={href}
              className={[
                'text-[0.72rem] font-bold tracking-[0.07em] uppercase px-[0.85rem] py-2 rounded-sm transition-colors duration-150 whitespace-nowrap no-underline',
                active
                  ? 'bg-white/20 text-white'
                  : 'text-white/85 hover:bg-white/20 hover:text-white',
              ].join(' ')}
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      {/* ── Page header ── */}
      <div className="max-w-screen-lg mx-auto px-6 pt-8 pb-6 border-b-[3px] border-double border-rule mb-10">
        <div className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-accent mb-2">
          World News &middot; International Affairs
        </div>
        <h1 className="font-display font-black text-[clamp(2rem,4vw,3rem)] leading-tight">
          World News
        </h1>
        <p className="text-[0.92rem] text-muted mt-2 max-w-xl leading-relaxed">
          A daily briefing on international affairs, global politics, and world events.
        </p>
      </div>

      {/* ── Main content ── */}
      <main className="max-w-screen-lg mx-auto px-6 pb-24">
        {newsData ? (
          <>
            <MainHeadline data={newsData.main} date={newsData.date} />

            {newsData.secondary?.length > 0 && (
              <SecondaryNewsGrid items={newsData.secondary} />
            )}

            {/* Last updated */}
            <div className="mt-12 pt-4 border-t border-border flex justify-end">
              <span className="text-[0.62rem] tracking-[0.12em] uppercase text-light">
                Last updated: {formatDate(newsData.date)}
              </span>
            </div>
          </>
        ) : (
          /* ── Fallback ── */
          <div className="text-center py-24 border border-dashed border-border rounded-md bg-white/40 fade-up">
            <span className="block text-5xl mb-5 opacity-25">🌍</span>
            <h2 className="font-display text-2xl font-bold mb-3">No news available</h2>
            <p className="text-[0.88rem] text-muted max-w-sm mx-auto leading-relaxed">
              Run <code className="bg-subtle px-1.5 py-0.5 rounded text-xs">npm run generate-news</code> to
              populate this page, or check back after the daily automated update.
            </p>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="text-center text-[0.62rem] tracking-[0.12em] uppercase text-light border-t border-border py-6">
        Personal Hub &mdash; Alfie Edworthy &mdash; Private &amp; Confidential
      </footer>

    </div>
  )
}
