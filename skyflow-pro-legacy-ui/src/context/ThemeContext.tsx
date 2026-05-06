/**
 * Theme Context - Global theme state management
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextType {
    theme: Theme
    resolvedTheme: ResolvedTheme
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = 'skyflow-theme'

function getSystemTheme(): ResolvedTheme {
    if (typeof window === 'undefined') return 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyThemeToDOM(resolvedTheme: ResolvedTheme) {
    const root = document.documentElement
    if (resolvedTheme === 'dark') {
        root.classList.add('dark')
        root.style.colorScheme = 'dark'
    } else {
        root.classList.remove('dark')
        root.style.colorScheme = 'light'
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) {
        metaTheme.setAttribute('content', resolvedTheme === 'dark' ? '#0f172a' : '#ffffff')
    }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        return (stored as Theme) || 'dark'
    })

    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
        if (theme === 'system') return getSystemTheme()
        return theme as ResolvedTheme
    })

    useEffect(() => {
        const resolved = theme === 'system' ? getSystemTheme() : (theme as ResolvedTheme)
        setResolvedTheme(resolved)
        applyThemeToDOM(resolved)
    }, [theme])

    useEffect(() => {
        if (theme !== 'system') return
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e: MediaQueryListEvent) => {
            const newTheme = e.matches ? 'dark' : 'light'
            setResolvedTheme(newTheme)
            applyThemeToDOM(newTheme)
        }
        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [theme])

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
        localStorage.setItem(STORAGE_KEY, newTheme)
        const resolved = newTheme === 'system' ? getSystemTheme() : (newTheme as ResolvedTheme)
        setResolvedTheme(resolved)
        applyThemeToDOM(resolved)
    }

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) throw new Error('useTheme must be used within ThemeProvider')
    return context
}
