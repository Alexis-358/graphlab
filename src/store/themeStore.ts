import { create } from 'zustand'

interface ThemeStore {
  dark: boolean
  toggleDark: () => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  dark: window.matchMedia('(prefers-color-scheme: dark)').matches,
  toggleDark: () => set((s) => {
    const next = !s.dark
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('graphlab-theme', next ? 'dark' : 'light')
    return { dark: next }
  }),
}))