import { X, Moon, Sun, Monitor, Bell, Shield, Smartphone } from 'lucide-react'
import { useTheme } from '@/context'
import { useState, useEffect } from 'react'

interface SettingsPanelProps {
    isOpen: boolean
    onClose: () => void
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
    const { theme, setTheme } = useTheme()
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false,
        offers: false,
    })

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) window.addEventListener('keydown', handleEscape)
        return () => window.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            <div
                className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950 shadow-2xl transition-transform duration-300 ease-in-out dark:bg-slate-950 bg-slate-50 border-l dark:border-slate-800 border-slate-200"
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-title"
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 px-6 py-4">
                        <h2 id="settings-title" className="text-lg font-semibold dark:text-slate-50 text-slate-900">
                            Settings & Preferences
                        </h2>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 dark:text-slate-400 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Close settings"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <div className="space-y-8">

                            {/* Appearance Section */}
                            <section>
                                <h3 className="mb-4 text-sm font-medium uppercase tracking-wider dark:text-slate-400 text-slate-500">
                                    Appearance
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={`flex flex-col items-center justify-center rounded-xl border p-4 transition-all duration-200 ${theme === 'light'
                                                ? 'border-sky-500 bg-sky-500/10 text-sky-500'
                                                : 'dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-white dark:text-slate-400 text-slate-600 hover:border-sky-500/50'
                                            }`}
                                    >
                                        <Sun className="mb-2 h-6 w-6" />
                                        <span className="text-sm font-medium">Light</span>
                                    </button>
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={`flex flex-col items-center justify-center rounded-xl border p-4 transition-all duration-200 ${theme === 'dark'
                                                ? 'border-sky-500 bg-sky-500/10 text-sky-500'
                                                : 'dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-white dark:text-slate-400 text-slate-600 hover:border-sky-500/50'
                                            }`}
                                    >
                                        <Moon className="mb-2 h-6 w-6" />
                                        <span className="text-sm font-medium">Dark</span>
                                    </button>
                                    <button
                                        onClick={() => setTheme('system')}
                                        className={`flex flex-col items-center justify-center rounded-xl border p-4 transition-all duration-200 ${theme === 'system'
                                                ? 'border-sky-500 bg-sky-500/10 text-sky-500'
                                                : 'dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-white dark:text-slate-400 text-slate-600 hover:border-sky-500/50'
                                            }`}
                                    >
                                        <Monitor className="mb-2 h-6 w-6" />
                                        <span className="text-sm font-medium">System</span>
                                    </button>
                                </div>
                            </section>

                            {/* Notifications Section */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Bell className="h-4 w-4 text-sky-500" />
                                    <h3 className="text-sm font-medium uppercase tracking-wider dark:text-slate-400 text-slate-500">
                                        Notifications
                                    </h3>
                                </div>

                                <div className="space-y-3 dark:bg-slate-900 bg-white rounded-xl border dark:border-slate-800 border-slate-200 overflow-hidden">
                                    <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="font-medium dark:text-slate-200 text-slate-900">Email Notifications</span>
                                            <span className="text-xs dark:text-slate-400 text-slate-500">Get booking confirmations and ticket PDFs</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notifications.email}
                                            onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
                                            className="h-5 w-5 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                                        />
                                    </label>

                                    <div className="h-px bg-slate-200 dark:bg-slate-800" />

                                    <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="font-medium dark:text-slate-200 text-slate-900">Push Notifications</span>
                                            <span className="text-xs dark:text-slate-400 text-slate-500">Real-time flight status and gate changes</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notifications.push}
                                            onChange={(e) => setNotifications(prev => ({ ...prev, push: e.target.checked }))}
                                            className="h-5 w-5 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                                        />
                                    </label>

                                    <div className="h-px bg-slate-200 dark:bg-slate-800" />

                                    <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="font-medium dark:text-slate-200 text-slate-900">SMS Alerts</span>
                                            <span className="text-xs dark:text-slate-400 text-slate-500">Text messages for urgent updates</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notifications.sms}
                                            onChange={(e) => setNotifications(prev => ({ ...prev, sms: e.target.checked }))}
                                            className="h-5 w-5 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                                        />
                                    </label>
                                </div>
                            </section>

                            {/* Privacy & Security */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Shield className="h-4 w-4 text-emerald-500" />
                                    <h3 className="text-sm font-medium uppercase tracking-wider dark:text-slate-400 text-slate-500">
                                        Privacy
                                    </h3>
                                </div>
                                <div className="rounded-xl border dark:border-slate-800 border-slate-200 p-4 dark:bg-slate-900 bg-white">
                                    <p className="text-sm dark:text-slate-300 text-slate-600 mb-2">
                                        Your data is encrypted and secure. We value your privacy.
                                    </p>
                                    <button className="text-sm text-sky-500 hover:text-sky-400 font-medium">
                                        Download my data
                                    </button>
                                </div>
                            </section>

                            {/* Version Info */}
                            <div className="flex items-center justify-center gap-2 pt-8 opacity-50">
                                <Smartphone className="h-4 w-4" />
                                <span className="text-xs font-mono">SkyFlow Pro v2.4.0</span>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
