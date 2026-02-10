import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
    id: string
    type: ToastType
    title: string
    message?: string
}

interface ToasterContextType {
    toasts: Toast[]
    addToast: (toast: Omit<Toast, 'id'>) => void
    removeToast: (id: string) => void
}

const ToasterContext = createContext<ToasterContextType | null>(null)

export function useToaster() {
    const context = useContext(ToasterContext)
    if (!context) {
        return {
            toasts: [],
            addToast: () => { },
            removeToast: () => { },
        }
    }
    return context
}

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
}

const colors = {
    success: {
        bg: 'bg-emerald-950/90',
        border: 'border-emerald-500/30',
        icon: 'text-emerald-400',
        title: 'text-emerald-300',
    },
    error: {
        bg: 'bg-red-950/90',
        border: 'border-red-500/30',
        icon: 'text-red-400',
        title: 'text-red-300',
    },
    info: {
        bg: 'bg-sky-950/90',
        border: 'border-sky-500/30',
        icon: 'text-sky-400',
        title: 'text-sky-300',
    },
    warning: {
        bg: 'bg-amber-950/90',
        border: 'border-amber-500/30',
        icon: 'text-amber-400',
        title: 'text-amber-300',
    },
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
    const Icon = icons[toast.type]
    const color = colors[toast.type]

    return (
        <div
            className={`animate-slide-left pointer-events-auto flex items-start gap-3 rounded-xl border ${color.bg} ${color.border} p-4 shadow-xl backdrop-blur-sm`}
        >
            <Icon className={`h-5 w-5 shrink-0 ${color.icon}`} />
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${color.title}`}>{toast.title}</p>
                {toast.message && <p className="mt-1 text-xs text-slate-400">{toast.message}</p>}
            </div>
            <button
                onClick={onRemove}
                className="shrink-0 p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}

export function ToasterProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(7)
        setToasts((prev) => [...prev, { ...toast, id }])
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 5000)
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    return (
        <ToasterContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToasterContext.Provider>
    )
}

export function Toaster() {
    const { toasts, removeToast } = useToaster()

    if (toasts.length === 0) return null

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
            ))}
        </div>
    )
}
