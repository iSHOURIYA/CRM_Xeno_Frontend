import { useEffect, useState } from 'react'

function getStoredTheme(): string | null {
  return localStorage.getItem('theme')
}

function setTheme(theme: string) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

export function applyTheme() {
  const stored = getStoredTheme()
  if (stored) {
    setTheme(stored)
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark')
  } else {
    setTheme('light')
  }
}

export function DarkModeToggle() {
  const [dark, setDark] = useState(() => {
    const stored = getStoredTheme()
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    setTheme(dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button
      className="theme-toggle"
      onClick={() => setDark(d => !d)}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? '☀ Light' : '☾ Dark'}
    </button>
  )
}
