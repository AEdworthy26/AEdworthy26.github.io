import { readFileSync } from 'fs'
import path from 'path'
import MainArticle    from '@/components/MainArticle'
import PersonOfTheDay from '@/components/PersonOfTheDay'
import OnThisDay      from '@/components/OnThisDay'
import ProgressBar    from '@/components/ProgressBar'

export const revalidate = 3600

const NAV_LINKS = [
  { label: '⌂ Home',           href: '../personal_hub.html' },
  { label: 'RICS Study',       href: '../rics-study.html' },
  { label: 'World News',       href: '../world-news.html' },
  { label: 'Tech News',        href: '../tech-news.html' },
  { label: 'Curiosity Corner', href: '#',                active: true },
  { label: 'Reads',            href: '../reads.html' },
  { label: 'Monthly Goals',    href: '../monthly-goals.html' },
  { label: 'Achievements',     href: '../achievements.html' },
]

function getData() {
  try {
    const fp = path.join(process.cwd(), 'data', 'curiosity.json')
    return JSON.parse(readFileSync(fp, 'utf8'))
  } catch { return null }
}

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-5 my-14">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[0.62rem] font-bold tracking-[0.2em] uppercase text-curiosity border border-curiosity px-3 py-1 rounded-full whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

export default function CuriosityPage() {
  const data  = getData()
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-paper">
      <div id="read-progress" />
      <ProgressBar targetId="main-article" />

      {/* Meta bar */}
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex justify-between items-center text-[0.68rem] tracking-[0.1em] uppercase text-muted border-b border-rule py-2 mt-4 mb-2">
          <span>{today}</span>
          <span>Alfie Edworthy &bull; Private</span>
        </div>
      </div>

      {/* Masthead */}
      <div className="max-w-screen-xl mx-auto px-6 text-center py-3">
        <div className="font-display font-black text-[clamp(2.4rem,5vw,4.2rem)] leading-none tracking-tight">Personal Hub</div>
        <div className="text-[0.75rem] italic text-muted mt-1 mb-2">Alfie Edworthy</div>
      </div>
      <div className="max-w-screen-xl mx-auto px-6"><div className="border-t-[3px] border-double border-rule" /></div>

      {/* Nav */}
      <nav className="bg-accent">
        <div className="max-w-screen-xl mx-auto px-4 flex flex-wrap items-center">
          {NAV_LINKS.map(({ label, href, active }) => (
            <a key={label} href={href}
              className={['text-[0.72rem] font-bold tracking-[0.07em] uppercase px-[0.85rem] py-2 rounded-sm transition-colors duration-150 whitespace-nowrap no-underline',
                active ? 'bg-white/20 text-white' : 'text-white/85 hover:bg-white/20 hover:text-white'].join(' ')}>
              {label}
            </a>
          ))}
        </div>
      </nav>

      {/* Page header */}
      <div className="max-w-[780px] mx-auto px-6 pt-8 pb-6 border-b-[3px] border-double border-rule mb-10">
        <div className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-curiosity mb-2">
          Curiosity Corner &middot; History, Ideas &amp; the Wider World
        </div>
        <h1 className="font-display font-black text-[clamp(2rem,4vw,3rem)] leading-tight">Curiosity Corner</h1>
        <p className="text-[0.92rem] text-muted mt-2 max-w-xl leading-relaxed">
          Long-form stories from history, remarkable lives, and the events that shaped the world &mdash; one curiosity at a time.
        </p>
      </div>

      {/* Content */}
      <main className="max-w-[780px] mx-auto px-6 pb-24">
        {data ? (
          <>
            <MainArticle data={data.mainArticle} />
            <SectionDivider label="Person of the Day" />
            <PersonOfTheDay data={data.personOfTheDay} />
            <SectionDivider label="On This Day" />
            <OnThisDay data={data.onThisDay} />
            <div className="mt-14 pt-4 border-t border-border flex justify-end">
              <span className="text-[0.62rem] tracking-[0.12em] uppercase text-light">
                Last updated: {new Date(data.date).toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
              </span>
            </div>
          </>
        ) : (
          <div className="text-center py-24 border border-dashed border-border rounded-md bg-white/40 fade-up">
            <span className="block text-5xl mb-5 opacity-25">🧭</span>
            <h2 className="font-display text-2xl font-bold mb-3">No content available</h2>
            <p className="text-[0.88rem] text-muted max-w-sm mx-auto leading-relaxed">
              Run <code className="bg-subtle px-1.5 py-0.5 rounded text-xs">npm run generate</code> to populate this page.
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
