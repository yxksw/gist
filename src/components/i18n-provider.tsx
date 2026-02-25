'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { siteConfig, Locale } from '../../config'
import { getTranslations, Translations } from '@/lib/i18n'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: keyof Translations, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(siteConfig.defaultLocale)

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && siteConfig.locales.includes(savedLocale)) {
      setLocaleState(savedLocale)
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  const t = (key: keyof Translations, params?: Record<string, string | number>): string => {
    const translations = getTranslations(locale)
    let value = translations[key] || key
    
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = value.replace(`{${paramKey}}`, String(paramValue))
      })
    }
    
    return value
  }

  // Prevent hydration mismatch by rendering children only on client
  // or use suppressHydrationWarning on the html element
  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      <span suppressHydrationWarning>
        {children}
      </span>
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
