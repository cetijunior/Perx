import { useEffect, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'perx-theme'
const THEME_CHANGE_EVENT = 'perx-theme-change'
let currentTheme = getPreferredTheme()

function notifyThemeChange() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
}

export function getPreferredTheme() {
  if (typeof window === 'undefined') return 'light'

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // Ignore storage access issues and fall back to system preference.
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.classList.toggle('light', theme === 'light')
  root.style.colorScheme = theme

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#111318' : '#F6F7F9')
}

export function setTheme(theme) {
  currentTheme = theme
  applyTheme(theme)

  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Ignore write failures in restricted browsing modes.
  }

  notifyThemeChange()
}

function subscribe(listener) {
  if (typeof window === 'undefined') return () => {}

  const onStorage = (event) => {
    if (event.key !== STORAGE_KEY) return
    currentTheme = getPreferredTheme()
    listener()
  }

  const onThemeChange = () => listener()

  window.addEventListener('storage', onStorage)
  window.addEventListener(THEME_CHANGE_EVENT, onThemeChange)

  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange)
  }
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    () => currentTheme,
    () => 'light',
  )

  useEffect(() => {
    applyTheme(currentTheme)
  }, [])

  return {
    theme,
    setTheme,
    toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    isDark: theme === 'dark',
  }
}