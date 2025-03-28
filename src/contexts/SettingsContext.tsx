import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface Settings {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const SettingsContext = createContext<Settings | undefined>(undefined)

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('system')

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved) setThemeState(saved as Theme)
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', theme)

    if (theme == 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
    } else {
      document.documentElement.dataset.theme = theme
    }

    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const setTheme = (t: Theme) => setThemeState(t);

  return (
    <SettingsContext.Provider value={{ theme, setTheme }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider')
  return ctx
}