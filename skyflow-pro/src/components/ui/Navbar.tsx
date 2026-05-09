import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Plane, Menu, X, User, Bell, Settings } from 'lucide-react'
import { NotificationDrawer } from './NotificationDrawer'
import { SettingsDrawer } from './SettingsDrawer'
import { useTranslation } from 'react-i18next'

export function Navbar() {
    const { t } = useTranslation()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const location = useLocation()

    const navLinks = [
        { path: '/', label: t('common.searchFlights') },
        { path: '/results', label: t('common.results') },
    ]

    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    return (
        <nav className="sticky top-0 z-50 glass border-b border-slate-800/50">
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
                            <span className="ml-1 text-lg font-light text-slate-400">Pro</span>
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
                    <div className="flex items-center gap-2">
                        {/* Notification bell */}
                        <button
                            onClick={() => setIsNotificationsOpen(true)}
                            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-50 hover:bg-slate-800/50 transition-all duration-300"
                            aria-label={t('common.notifications')}
                        >
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                        </button>

                        {/* Settings */}
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-50 hover:bg-slate-800/50 transition-all duration-300"
                            aria-label={t('common.settings')}
                        >
                            <Settings className="h-5 w-5" />
                        </button>

                        <NotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
                        <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

                        <div className="hidden sm:flex items-center gap-3 ml-2 pl-4 border-l border-slate-800">
                            <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all duration-300">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-purple-600">
                                    <User className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm font-medium text-slate-300">{t('common.guest')}</span>
                            </button>
                        </div>

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-50 hover:bg-slate-800/50 transition-all duration-300"
                            aria-label={t('nav.toggleMenu')}
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden glass border-t border-slate-800/50 animate-fade-in">
                    <div className="px-4 py-4 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${location.pathname === link.path
                                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-50'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    )
}
