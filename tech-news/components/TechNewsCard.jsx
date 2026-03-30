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

export default function TechNewsCard({ item, index }) {
  const [imgError, setImgError] = useState(false)
  const { title, summary, image, source, url, category } = item
  const catStyle = CATEGORY_STYLES[category] ?? 'bg-[#555] text-white'

  return (
    <article
      className="group bg-white border border-[#ece8e0] rounded-sm overflow-hidden
                 shadow-[0_1px_4px_rgba(0,0,0,0.06)]
                 hover:shadow-[0_8px_28px_rgba(10,22,40,0.14)]
                 hover:-translate-y-1 hover:scale-[1.005]
                 transition-all duration-300 ease-out
                 flex flex-col fade-up"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Thumbnail */}
      <div className="relative w-full bg-[#0a1628] overflow-hidden flex-shrink-0"
           style={{ aspectRatio: '16/9' }}>
        {image && !imgError ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl opacity-15 text-white">💻</div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        {category && (
          <span className={`inline-block self-start text-[0.58rem] font-bold tracking-[0.14em] uppercase px-3 py-1 rounded-full mb-3 ${catStyle}`}>
            {category}
          </span>
        )}

        <h3 className="font-display font-bold text-[1rem] leading-[1.35] mb-3 group-hover:text-[#1e3a5f] transition-colors duration-200">
          {title}
        </h3>

        <p className="text-[0.82rem] leading-relaxed text-[#555] flex-1">
          {summary}
        </p>

        <div className="mt-4 pt-3 border-t border-[#ece8e0] flex items-center justify-between">
          {source && (
            <span className="text-[0.62rem] tracking-[0.08em] uppercase text-[#888]">
              {source}
            </span>
          )}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.68rem] font-bold tracking-[0.06em] uppercase text-[#1e3a5f]
                         no-underline hover:underline flex items-center gap-1 ml-auto"
            >
              Read more
              <span className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">→</span>
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
