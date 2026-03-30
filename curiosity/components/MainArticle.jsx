'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function MainArticle({ data }) {
  const [imgError, setImgError] = useState(false)
  if (!data) return null

  const { title, subtitle, content, image, readTime } = data
  const blocks = Array.isArray(content)
    ? content
    : (content || '').split(/\n+/).filter(Boolean).map(t => ({ type: 'paragraph', text: t }))

  return (
    <article id="main-article" className="mb-0 fade-up">

      {/* Eyebrow */}
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <span className="text-[0.62rem] font-bold tracking-[0.2em] uppercase text-white bg-curiosity px-2.5 py-1">
          Main Article
        </span>
        {readTime && (
          <span className="text-[0.68rem] tracking-[0.08em] uppercase text-light">
            🕐 {readTime} read
          </span>
        )}
      </div>

      {/* Title */}
      <h2 className="font-display font-black text-[clamp(1.75rem,3.5vw,2.6rem)] leading-[1.15] mb-4">
        {title}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-[1rem] leading-[1.65] italic text-muted mb-6 border-l-4 border-curiosity pl-4">
          {subtitle}
        </p>
      )}

      {/* Hero image */}
      <div className="relative w-full mb-9 overflow-hidden rounded-sm bg-subtle" style={{ aspectRatio: '16/7' }}>
        {image && !imgError ? (
          <>
            <Image src={image} alt={title} fill priority className="object-cover transition-opacity duration-500"
              onError={() => setImgError(true)} sizes="780px" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#6b3a00]/25 via-transparent to-transparent pointer-events-none" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl opacity-15">🌍</div>
        )}
      </div>

      {/* Body */}
      <div className="text-[1.02rem] leading-[1.9]">
        {blocks.map((block, i) =>
          block.type === 'heading' ? (
            <h3 key={i} className="font-display font-bold text-[1.25rem] leading-snug mt-10 mb-4 pb-2 border-b border-subtle">
              {block.text}
            </h3>
          ) : (
            <p key={i} className={['mb-5', i === 0 ? 'article-drop-cap' : ''].join(' ')}>
              {block.text}
            </p>
          )
        )}
      </div>

    </article>
  )
}
