/**
 * Theme Toggle Component
 * 
 * Allows users to switch between light, dark, and system themes.
 */

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme, type Theme } from '@/context'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor },
    ]

    return (
        <div className="inline-flex rounded-xl bg-slate-900/80 p-1 ring-1 ring-slate-800">
            {themes.map(({ value, label, icon: Icon }) => (
                <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 ${theme === value
                            ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-500/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        }`}
                    aria-pressed={theme === value}
                    aria-label={`${label} theme`}
                >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{label}</span>
                </button>
            ))}
        </div>
    )
}
