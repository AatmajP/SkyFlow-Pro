import React, { createContext, useContext, useState, useEffect } from 'react'

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED'

interface CurrencyContextType {
  currency: CurrencyCode
  symbol: string
  rate: number
  setCurrency: (code: CurrencyCode) => void
  formatPrice: (amountInINR: number) => string
}

const EXCHANGE_RATES: Record<CurrencyCode, { rate: number; symbol: string }> = {
  INR: { rate: 1, symbol: '₹' },
  USD: { rate: 0.012, symbol: '$' },
  EUR: { rate: 0.011, symbol: '€' },
  GBP: { rate: 0.0095, symbol: '£' },
  AED: { rate: 0.044, symbol: 'د.إ' },
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(
    (localStorage.getItem('currency') as CurrencyCode) || 'INR'
  )

  const { rate, symbol } = EXCHANGE_RATES[currency]

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code)
    localStorage.setItem('currency', code)
  }

  const formatPrice = (amountInINR: number) => {
    const converted = amountInINR * rate
    
    // Custom formatting for different currencies
    if (currency === 'INR') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(converted)
    }

    return `${symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, symbol, rate, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
