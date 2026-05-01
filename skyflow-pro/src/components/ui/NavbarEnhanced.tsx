/**
 * Enhanced Navbar Component
 * 
 * BACKWARD COMPATIBLE - Preserves existing layout and design
 * 
 * New features added:
 * - Light/Dark mode toggle
 * - Working notification panel
 * - Help panel
 * - Login/Profile functionality
 * 
 * All enhancements are configuration-driven and modular.
 */

import { Settings as SettingsIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Plane, Menu, X, User, Bell, HelpCircle } from 'lucide-react'
import { useAuth } from '../../stores/authStore'
import { useNotifications } from '../../stores/notificationStore'
import { ThemeToggle } from '../theme/ThemeToggle'
import { NotificationPanel } from '../notifications/NotificationPanel'
import { HelpPanel } from '../help/HelpPanel'
import { ProfileModal } from '../auth/ProfileModal'
import { SettingsPanel } from '../settings/SettingsPanel'

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
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo - UNCHANGED */}
                        <Link
                            to="/"
                            className="flex items-center gap-3 transition-transform duration-300 hover:scale-105"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 rounded-xl bg-slate-200 blur-lg opacity-50" />
                                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-200">
                                    <Plane className="h-5 w-5 text-slate-800" />
                                </div>
                            </div>
                            <div>
                                <span className="text-lg font-black text-slate-900">SkyFlow</span>
                                <span className="ml-1 text-lg font-bold text-slate-400">Pro</span>
                            </div>
                        </Link>

                        {/* Desktop Navigation - UNCHANGED */}
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

                        {/* Right side actions - ENHANCED */}
                        <div className="flex items-center gap-2">
                            {/* Theme Toggle - NEW */}
                            <div className="hidden lg:block">
                                <ThemeToggle />
                            </div>

                            {/* Settings Button - NEW */}
                            <button
                                onClick={() => setIsSettingsPanelOpen(true)}
                                className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all duration-300"
                                aria-label="Settings"
                                title="Settings & Preferences"
                            >
                                <SettingsIcon className="h-5 w-5" />
                            </button>

                            {/* Help Button - NEW */}
                            <button
                                onClick={() => setIsHelpPanelOpen(true)}
                                className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all duration-300"
                                aria-label="Help"
                                title="Help & Support"
                            >
                                <HelpCircle className="h-5 w-5" />
                            </button>

                            {/* Notification bell - ENHANCED (now functional) */}
                            <button
                                onClick={() => setIsNotificationPanelOpen(true)}
                                className="relative p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all duration-300"
                                aria-label="Notifications"
                                title="Notifications"
                            >
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <>
                                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    </>
                                )}
                            </button>

                            {/* User menu - ENHANCED (now functional) */}
                            <div className="hidden sm:flex items-center gap-3 ml-2 pl-4 border-l border-slate-200">
                                <button
                                    onClick={() => setIsProfileModalOpen(true)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all duration-300"
                                    title={isAuthenticated ? 'My Profile' : 'Sign In'}
                                >
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200">
                                        <User className="h-4 w-4 text-slate-700" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">
                                        {isAuthenticated && user ? user.name : 'Guest'}
                                    </span>
                                </button>
                            </div>

                            {/* Mobile menu button - UNCHANGED */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all duration-300"
                                aria-label="Toggle menu"
                            >
                                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu - UNCHANGED */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-slate-200 animate-fade-in shadow-xl">
                        <div className="px-4 py-4 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${location.pathname === link.path
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {/* Mobile Theme Toggle */}
                            <div className="px-4 py-3">
                                <ThemeToggle />
                            </div>

                            {/* Mobile Profile Button */}
                            <button
                                onClick={() => {
                                    setIsProfileModalOpen(true)
                                    setIsMobileMenuOpen(false)
                                }}
                                className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-300"
                            >
                                {isAuthenticated && user ? `Profile (${user.name})` : 'Sign In'}
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Notification Panel */}
            <NotificationPanel
                isOpen={isNotificationPanelOpen}
                onClose={() => setIsNotificationPanelOpen(false)}
            />

            {/* Help Panel */}
            <HelpPanel
                isOpen={isHelpPanelOpen}
                onClose={() => setIsHelpPanelOpen(false)}
            />

            {/* Profile Modal */}
            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />

            {/* Settings Panel */}
            <SettingsPanel
                isOpen={isSettingsPanelOpen}
                onClose={() => setIsSettingsPanelOpen(false)}
            />
        </>
    )
}
