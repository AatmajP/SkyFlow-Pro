import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Plane, Menu, X, User, Bell, Settings, Sun, Moon } from 'lucide-react'
import { NotificationDrawer } from './NotificationDrawer'
import { SettingsDrawer } from './SettingsDrawer'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'

export function Navbar() {
    const { t } = useTranslation()
    const { theme, toggleTheme } = useTheme()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const location = useLocation()

    const navLinks = [
        { path: '/', label: t('common.searchFlights', 'Search Flights') },
        { path: '/results', label: t('common.results', 'Flight Results') },
    ]

    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    return (
        <nav className="sticky top-0 z-50 glass border-b border-slate-200 dark:border-slate-800/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-3 transition-transform duration-300 hover:scale-105"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-500 to-purple-500 blur-lg opacity-50" />
                            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-purple-600">
                                <Plane className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div>
                            <span className="text-lg font-bold gradient-text">SkyFlow</span>
                            <span className="ml-1 text-lg font-light text-slate-500 dark:text-slate-400">Pro</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="relative hidden sm:flex items-center w-14 h-8 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 p-1 transition-all duration-500 overflow-hidden group hover:border-sky-500/30"
                            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            <div 
                                className={`absolute inset-y-1 w-6 rounded-full bg-white dark:bg-sky-500 shadow-md transition-all duration-500 ease-out ${
                                    theme === 'dark' ? 'left-7 shadow-sky-500/20' : 'left-1'
                                }`} 
                            />
                            <div className={`relative z-10 flex flex-1 items-center justify-center transition-colors duration-300 ${theme === 'light' ? 'text-sky-600' : 'text-slate-400'}`}>
                                <Sun className="h-3.5 w-3.5" />
                            </div>
                            <div className={`relative z-10 flex flex-1 items-center justify-center transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-slate-400'}`}>
                                <Moon className="h-3.5 w-3.5" />
                            </div>
                        </button>
                        {/* Notification bell */}
                        <button
                            onClick={() => setIsNotificationsOpen(true)}
                            className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-300"
                            aria-label={t('common.notifications', 'Notifications')}
                        >
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                        </button>

                        {/* Settings */}
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-300"
                            aria-label={t('common.settings', 'Settings')}
                        >
                            <Settings className="h-5 w-5" />
                        </button>

                        <NotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
                        <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

                        <div className="hidden sm:flex items-center gap-3 ml-2 pl-4 border-l border-slate-200 dark:border-slate-800">
                            <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-300">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-purple-600">
                                    <User className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.guest', 'Guest')}</span>
                            </button>
                        </div>

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-300"
                            aria-label={t('nav.toggleMenu', 'Toggle Menu')}
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden glass border-t border-slate-200 dark:border-slate-800/50 animate-fade-in">
                    <div className="px-4 py-4 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${location.pathname === link.path
                                        ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-50'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        
                        {/* Mobile Theme Toggle */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/50">
                            <button
                                onClick={toggleTheme}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-sm font-bold text-slate-700 dark:text-slate-300 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    {theme === 'dark' ? (
                                        <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                                            <Moon className="h-4 w-4" />
                                        </div>
                                    ) : (
                                        <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                                            <Sun className="h-4 w-4" />
                                        </div>
                                    )}
                                    <span>{theme === 'dark' ? t('settings.darkMode', 'Dark Mode') : t('settings.lightMode', 'Light Mode')}</span>
                                </div>
                                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{t('results.refresh', 'Refresh')}</div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
