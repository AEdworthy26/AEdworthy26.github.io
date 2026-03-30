'use client'

import { useEffect } from 'react'

export default function ProgressBar({ targetId }) {
  useEffect(() => {
    const bar = document.getElementById('read-progress')
    if (!bar) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    function onScroll() {
      const article = document.getElementById(targetId)
      if (!article) return
      const total = article.offsetHeight - window.innerHeight
      const pct   = total > 0 ? Math.min(100, Math.max(0, (-article.getBoundingClientRect().top / total) * 100)) : 0
      bar.style.width = pct + '%'
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [targetId])

  return null
}
