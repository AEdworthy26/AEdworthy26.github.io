'use client'
import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(initialValue)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) setState(JSON.parse(stored))
    } catch (_) {}
    setHydrated(true)
  }, [key])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch (_) {}
  }, [key, state, hydrated])

  return [state, setState]
}
