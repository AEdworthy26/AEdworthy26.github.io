import { readFileSync } from 'fs'
import path from 'path'
import TechMainHeadline from '@/components/TechMainHeadline'
import TechSecondaryGrid from '@/components/TechSecondaryGrid'

export const revalidate = 3600

const NAV_LINKS = [
  { label: '⌂ Home',           href: '../personal_hub.html' },
  { label: 'RICS Study',       href: '../rics-study.html' },
  { label: 'World News',       href: '../world-news.html' },
  { label: 'Tech News',        href: '#',                                   active: true },
  { label: 'Curiosity Corner', href: '../personal_hub.html#curiosity-corner' },
  { label: 'Reads',            href: '../reads.html' },
  { label: 'Monthly Goals',    href: '../monthly-goals.html' },
  { label: 'Achievements',     href: '../achievements.html' },
]

const CATEGORY_STYLES = {
  'AI':       'bg-[#0a1628] text-white',
  'Big Tech': 'bg-[#1e3a5f] text-white',
  'Startups': 'bg-[#1a6630] text-white',
  'Gadgets':  'bg-[#7a3c00] text-white',
  'Security': 'bg-[#7a0000] text-white',
  'Science':  'bg-[#5b1a8b] text-white',
}

export function CategoryPill({ category }) {
  if (!category) return null
  const style = CATEGORY_STYLES[category] ?? 'bg-[#555] text-white'
  return (
    <span className={`inline-block text-[0.58rem] font-bold tracking-[0.14em] uppercase px-3 py-1 rounded-full whitespace-nowrap ${style}`}>
      {category}
    </span>
  )
}

function getNewsData() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'tech-news.json')
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

export default function TechNewsPage() {
  const newsData = getNewsData()
  const today    = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-paper">

      {/* Meta bar */}
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex justify-between items-center text-[0.68rem] tracking-[0.1em] uppercase text-muted border-b border-rule py-2 mt-4 mb-2">
          <span>{today}</span>
          <span>Alfie Edworthy &bull; Private</span>
        </div>
      </div>

      {/* Masthead */}
      <div className="max-w-screen-xl mx-auto px-6 text-center py-3">
        <div className="font-display font-black text-[clamp(2.4rem,5vw,4.2rem)] leading-none tracking-tight">
          Personal Hub
        </div>
        <div className="text-[0.75rem] italic text-muted mt-1 mb-2">Alfie Edworthy</div>
      </div>
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="border-t-[3px] border-double border-rule" />
      </div>

      {/* Nav ribbon */}
      <nav className="bg-accent">
        <div className="max-w-screen-xl mx-auto px-4 flex flex-wrap items-center gap-0 py-0">
          {NAV_LINKS.map(({ label, href, active }) => (
            <a
              key={label}
              href={href}
              className={[
                'text-[0.72rem] font-bold tracking-[0.07em] uppercase px-[0.85rem] py-2 rounded-sm transition-colors duration-150 whitespace-nowrap no-underline',
                active ? 'bg-white/20 text-white' : 'text-white/85 hover:bg-white/20 hover:text-white',
              ].join(' ')}
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      {/* Page header */}
      <div className="max-w-screen-lg mx-auto px-6 pt-8 pb-6 border-b-[3px] border-double border-rule mb-10">
        <div className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-accent mb-2">
          Tech News &middot; Technology &amp; Innovation
        </div>
        <h1 className="font-display font-black text-[clamp(2rem,4vw,3rem)] leading-tight">Tech News</h1>
        <p className="text-[0.92rem] text-muted mt-2 max-w-xl leading-relaxed">
          The week&rsquo;s most important developments in artificial intelligence, software, startups, and the technology shaping our world.
        </p>
      </div>

      {/* Main content */}
      <main className="max-w-screen-lg mx-auto px-6 pb-24">
        {newsData ? (
          <>
            <TechMainHeadline data={newsData.main} date={newsData.date} />
            {newsData.secondary?.length > 0 && (
              <TechSecondaryGrid items={newsData.secondary} />
            )}
            <div className="mt-12 pt-4 border-t border-border flex justify-end">
              <span className="text-[0.62rem] tracking-[0.12em] uppercase text-light">
                Last updated: {formatDate(newsData.date)}
              </span>
            </div>
          </>
        ) : (
          <div className="text-center py-24 border border-dashed border-border rounded-md bg-white/40 fade-up">
            <span className="block text-5xl mb-5 opacity-25">💻</span>
            <h2 className="font-display text-2xl font-bold mb-3">No tech news available</h2>
            <p className="text-[0.88rem] text-muted max-w-sm mx-auto leading-relaxed">
              Run <code className="bg-subtle px-1.5 py-0.5 rounded text-xs">npm run generate-news</code> to
              populate this page.
            </p>
          </div>
        )}
      </main>

      <footer className="text-center text-[0.62rem] tracking-[0.12em] uppercase text-light border-t border-border py-6">
        Personal Hub &mdash; Alfie Edworthy &mdash; Private &amp; Confidential
      </footer>

    </div>
  )
}
