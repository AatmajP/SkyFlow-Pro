/**
 * Enhanced Navbar Component - Main application header
 */

import { Settings as SettingsIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Plane, Menu, X, User, Bell, HelpCircle } from 'lucide-react'
import { useAuth } from '@/stores'
import { useNotifications } from '@/stores'
import { ThemeToggle } from '@/components/features/theme/ThemeToggle'
import { NotificationPanel } from '@/components/features/notifications/NotificationPanel'
import { HelpPanel } from '@/components/features/help/HelpPanel'
import { ProfileModal } from '@/components/features/auth/ProfileModal'
import { SettingsPanel } from '@/components/features/settings/SettingsPanel'

export function NavbarEnhanced() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false)
    const [isHelpPanelOpen, setIsHelpPanelOpen] = useState(false)
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
    const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false)
    const location = useLocation()
    const { user, isAuthenticated } = useAuth()
    const { getUnreadCount } = useNotifications()
    const unreadCount = getUnreadCount()

    const navLinks = [
        { path: '/', label: 'Search Flights' },
        { path: '/results', label: 'Results' },
    ]

    return (
        <>
            <nav className="sticky top-0 z-50 glass border-b border-slate-800/50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <Link to="/" className="flex items-center gap-3 transition-transform duration-300 hover:scale-105">
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

                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link key={link.path} to={link.path} className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}>
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden lg:block"><ThemeToggle /></div>
                            <button onClick={() => setIsSettingsPanelOpen(true)} className="p-2 rounded-lg text-slate-400 hover:text-slate-50 hover:bg-slate-800/50 transition-all duration-300" aria-label="Settings">
                                <SettingsIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => setIsHelpPanelOpen(true)} className="p-2 rounded-lg text-slate-400 hover:text-slate-50 hover:bg-slate-800/50 transition-all duration-300" aria-label="Help">
                                <HelpCircle className="h-5 w-5" />
                            </button>
                            <button onClick={() => setIsNotificationPanelOpen(true)} className="relative p-2 rounded-lg text-slate-400 hover:text-slate-50 hover:bg-slate-800/50 transition-all duration-300" aria-label="Notifications">
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <>
                                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-[10px] font-bold text-white">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    </>
                                )}
                            </button>
                            <div className="hidden sm:flex items-center gap-3 ml-2 pl-4 border-l border-slate-800">
                                <button onClick={() => setIsProfileModalOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all duration-300" title={isAuthenticated ? 'My Profile' : 'Sign In'}>
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-purple-600">
                                        <User className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-300">
                                        {isAuthenticated && user ? user.name : 'Guest'}
                                    </span>
                                </button>
                            </div>
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-50 hover:bg-slate-800/50 transition-all duration-300" aria-label="Toggle menu">
                                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="md:hidden glass border-t border-slate-800/50 animate-fade-in">
                        <div className="px-4 py-4 space-y-1">
                            {navLinks.map((link) => (
                                <Link key={link.path} to={link.path} onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${location.pathname === link.path ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-50'}`}>
                                    {link.label}
                                </Link>
                            ))}
                            <div className="px-4 py-3"><ThemeToggle /></div>
                            <button onClick={() => { setIsProfileModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-50 transition-all duration-300">
                                {isAuthenticated && user ? `Profile (${user.name})` : 'Sign In'}
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            <NotificationPanel isOpen={isNotificationPanelOpen} onClose={() => setIsNotificationPanelOpen(false)} />
            <HelpPanel isOpen={isHelpPanelOpen} onClose={() => setIsHelpPanelOpen(false)} />
            <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
            <SettingsPanel isOpen={isSettingsPanelOpen} onClose={() => setIsSettingsPanelOpen(false)} />
        </>
    )
}
