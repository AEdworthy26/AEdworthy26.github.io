'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function NewsCard({ item, index }) {
  const [imgError, setImgError] = useState(false)

  const { title, summary, image, source, url, category } = item

  return (
    <article
      className="group bg-white border border-subtle rounded-sm overflow-hidden
                 shadow-[0_1px_4px_rgba(0,0,0,0.06)]
                 hover:shadow-[0_6px_24px_rgba(0,0,0,0.11)]
                 hover:-translate-y-1
                 transition-all duration-300 ease-out
                 flex flex-col
                 fade-up"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-[16/9] bg-subtle overflow-hidden flex-shrink-0">
        {image && !imgError ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl opacity-20">📰</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">

        {/* Category tag */}
        {category && (
          <span className="text-[0.58rem] font-bold tracking-[0.18em] uppercase text-accent mb-2 block">
            {category}
          </span>
        )}

        {/* Headline */}
        <h3 className="font-display font-bold text-[1rem] leading-[1.35] mb-3 group-hover:text-accent transition-colors duration-200">
          {title}
        </h3>

        {/* Summary */}
        <p className="text-[0.82rem] leading-relaxed text-muted flex-1">
          {summary}
        </p>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-subtle flex items-center justify-between">
          {source && (
            <span className="text-[0.62rem] tracking-[0.08em] uppercase text-light">
              {source}
            </span>
          )}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.68rem] font-bold tracking-[0.06em] uppercase text-accent
                         no-underline hover:underline flex items-center gap-1 ml-auto"
            >
              Read more
              <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </a>
          )}
        </div>

      </div>
    </article>
  )
}
