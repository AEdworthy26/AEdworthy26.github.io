'use client'

import Image from 'next/image'
import { useState } from 'react'

const CATEGORY_STYLES = {
  'AI':       'bg-[#0a1628] text-white',
  'Big Tech': 'bg-[#1e3a5f] text-white',
  'Startups': 'bg-[#1a6630] text-white',
  'Gadgets':  'bg-[#7a3c00] text-white',
  'Security': 'bg-[#7a0000] text-white',
  'Science':  'bg-[#5b1a8b] text-white',
}

function CategoryPill({ category }) {
  if (!category) return null
  const style = CATEGORY_STYLES[category] ?? 'bg-[#555] text-white'
  return (
    <span className={`inline-block text-[0.58rem] font-bold tracking-[0.14em] uppercase px-3 py-1 rounded-full ${style}`}>
      {category}
    </span>
  )
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default function TechMainHeadline({ data, date }) {
  const [imgError, setImgError] = useState(false)
  if (!data) return null

  const { title, content, image, category, source, sourceUrl } = data
  const paragraphs = Array.isArray(content)
    ? content
    : (content || '').split(/\n+/).map(p => p.trim()).filter(Boolean)
  const pullQuote = paragraphs[0]?.split('.')[0] + '.'

  return (
    <article className="mb-16 fade-up">

      {/* Eyebrow row */}
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <CategoryPill category={category} />
        <time className="text-[0.68rem] tracking-[0.08em] uppercase text-[#888]" dateTime={date}>
          {formatDate(date)}
        </time>
      </div>

      {/* Headline */}
      <h2 className="font-display font-black text-[clamp(1.9rem,4vw,3rem)] leading-[1.1] mb-6 max-w-3xl">
        {title}
      </h2>

      {/* Hero image */}
      <div className="relative w-full mb-8 overflow-hidden rounded-sm bg-[#0a1628]"
           style={{ aspectRatio: '16/7' }}>
        {image && !imgError ? (
          <>
            <Image
              src={image}
              alt={title}
              fill
              priority
              className="object-cover transition-opacity duration-500"
              onError={() => setImgError(true)}
              sizes="(max-width: 768px) 100vw, 1024px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/50 via-transparent to-transparent pointer-events-none" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-15 text-5xl text-white">💻</div>
        )}
      </div>

      {/* Article body */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">

        {/* Body text */}
        <div className="space-y-5">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className={[
                'leading-[1.85] text-[0.97rem]',
                i === 0
                  ? 'first-letter:text-[3.4rem] first-letter:font-black first-letter:font-display first-letter:float-left first-letter:leading-[0.8] first-letter:mr-2 first-letter:mt-1.5 first-letter:text-[#0a1628]'
                  : '',
              ].join(' ')}
            >
              {p}
            </p>
          ))}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <blockquote className="border-l-4 border-[#0a1628] pl-5 py-1">
            <p className="font-display italic text-[1.05rem] leading-snug text-[#0d0d0d]/80">
              &ldquo;{pullQuote}&rdquo;
            </p>
          </blockquote>

          {source && (
            <div className="text-[0.68rem] tracking-[0.1em] uppercase text-[#888] border-t border-[#ece8e0] pt-4">
              <span className="block mb-1 text-[#555] font-bold">Source</span>
              {sourceUrl ? (
                <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[#1e3a5f] hover:underline">
                  {source}
                </a>
              ) : (
                <span>{source}</span>
              )}
            </div>
          )}
        </aside>

      </div>
    </article>
  )
}
