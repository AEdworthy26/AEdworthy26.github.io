'use client'

import Image from 'next/image'
import { useState } from 'react'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default function MainHeadline({ data, date }) {
  const [imgError, setImgError] = useState(false)

  if (!data) return null

  const { title, content, image, source, sourceUrl } = data

  // Split content into paragraphs
  const paragraphs = (content || '')
    .split(/\n+/)
    .map(p => p.trim())
    .filter(Boolean)

  return (
    <article className="mb-16 fade-up">

      {/* Eyebrow */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[0.62rem] font-bold tracking-[0.2em] uppercase text-white bg-accent px-2.5 py-1">
          Main Story
        </span>
        <time className="text-[0.68rem] tracking-[0.08em] uppercase text-light" dateTime={date}>
          {formatDate(date)}
        </time>
      </div>

      {/* Headline */}
      <h2 className="font-display font-black text-[clamp(1.9rem,4vw,3rem)] leading-[1.1] mb-6 max-w-3xl">
        {title}
      </h2>

      {/* Hero image */}
      {image && !imgError ? (
        <div className="relative w-full aspect-[16/7] mb-8 overflow-hidden rounded-sm bg-subtle">
          <Image
            src={image}
            alt={title}
            fill
            priority
            className="object-cover transition-opacity duration-500"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 100vw, 1024px"
          />
          {/* Bottom gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        </div>
      ) : (
        /* Placeholder when no image */
        <div className="w-full aspect-[16/7] mb-8 bg-subtle rounded-sm flex items-center justify-center">
          <span className="text-4xl opacity-20">🌍</span>
        </div>
      )}

      {/* Article body — editorial two-column on wide screens */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">

        {/* Body text */}
        <div className="space-y-5">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className={[
                'leading-[1.85] text-[0.97rem]',
                i === 0
                  ? 'text-[1.05rem] font-medium first-letter:text-[3.4rem] first-letter:font-black first-letter:font-display first-letter:float-left first-letter:leading-[0.8] first-letter:mr-2 first-letter:mt-1.5'
                  : '',
              ].join(' ')}
            >
              {p}
            </p>
          ))}
        </div>

        {/* Sidebar pull-quote + source */}
        <aside className="space-y-6">
          {/* Pull quote — first sentence of content */}
          <blockquote className="border-l-4 border-accent pl-5 py-1">
            <p className="font-display italic text-[1.05rem] leading-snug text-ink/80">
              &ldquo;{paragraphs[0]?.split('.')[0]}.&rdquo;
            </p>
          </blockquote>

          {/* Source */}
          {source && (
            <div className="text-[0.68rem] tracking-[0.1em] uppercase text-light border-t border-subtle pt-4">
              <span className="block mb-1 text-muted font-bold">Source</span>
              {sourceUrl ? (
                <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
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
