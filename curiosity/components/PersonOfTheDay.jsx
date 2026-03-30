'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function PersonOfTheDay({ data }) {
  const [imgError, setImgError] = useState(false)
  if (!data) return null

  const { name, bio, image, lifespan, category } = data
  const initials = (name || '').split(' ').map(w => w[0]).slice(0, 2).join('')
  const bioParagraphs = (bio || '').split(/\n+/).filter(Boolean)

  return (
    <section className="fade-up">
      <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-6 sm:gap-8 items-start bg-white border border-subtle rounded-sm p-6 sm:p-8 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">

        {/* Portrait */}
        <div className="relative w-full sm:w-[160px] rounded-sm overflow-hidden bg-gradient-to-br from-curiosity to-[#3d2000] flex-shrink-0 flex items-center justify-center"
             style={{ height: '200px' }}>
          {image && !imgError ? (
            <Image src={image} alt={name} fill className="object-cover"
              onError={() => setImgError(true)} sizes="160px" />
          ) : (
            <span className="font-display font-black text-5xl text-white/50 select-none">
              {initials}
            </span>
          )}
        </div>

        {/* Info */}
        <div>
          <h2 className="font-display font-black text-[1.5rem] leading-tight mb-2">{name}</h2>
          <div className="flex flex-wrap gap-2 mb-5">
            {lifespan && (
              <span className="text-[0.68rem] font-bold tracking-[0.1em] uppercase text-muted border border-border px-3 py-1 rounded-full">
                {lifespan}
              </span>
            )}
            {category && (
              <span className="text-[0.62rem] font-bold tracking-[0.12em] uppercase text-white bg-curiosity px-3 py-1 rounded-full">
                {category}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {bioParagraphs.map((p, i) => (
              <p key={i} className="text-[0.87rem] leading-[1.8] text-muted">{p}</p>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
