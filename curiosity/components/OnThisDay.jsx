'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function OnThisDay({ data }) {
  const [imgError, setImgError] = useState(false)
  if (!data) return null

  const { headline, summary, date, image } = data
  const summaryParagraphs = (summary || '').split(/\n+/).filter(Boolean)
  const hasImage = !!(image && !imgError)

  return (
    <section className="fade-up" style={{ animationDelay: '100ms' }}>
      <div className="bg-white border border-subtle rounded-sm overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className={`grid grid-cols-1 ${hasImage || image ? 'sm:grid-cols-[1fr_280px]' : ''}`}>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {date && (
              <span className="inline-block font-display font-black text-[0.78rem] tracking-[0.05em] text-curiosity border-2 border-curiosity px-3 py-1 rounded-sm mb-4">
                {date}
              </span>
            )}
            <h3 className="font-display font-black text-[clamp(1.2rem,2.5vw,1.65rem)] leading-[1.2] mb-4">
              {headline}
            </h3>
            <div className="space-y-3">
              {summaryParagraphs.map((p, i) => (
                <p key={i} className="text-[0.87rem] leading-[1.8] text-muted">{p}</p>
              ))}
            </div>
          </div>

          {/* Image */}
          {image && (
            <div className="relative overflow-hidden bg-subtle sm:max-h-[320px]">
              {!imgError ? (
                <Image src={image} alt={headline} fill className="object-cover"
                  onError={() => setImgError(true)} sizes="280px" />
              ) : null}
            </div>
          )}

        </div>
      </div>
    </section>
  )
}
