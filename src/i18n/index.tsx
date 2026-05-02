import React, { createContext, useContext, useState, useCallback } from 'react'
import type { Lang, Namespace, Translations, I18nContextType } from './types'
import { es } from './locales/es'
import { en } from './locales/en'
import { de } from './locales/de'

const translations: Record<Lang, Translations> = { es, en, de }

function getValue(obj: any, path: string): string | undefined {
  const keys = path.split('.')
  let val = obj
  for (const key of keys) {
    if (val === undefined || val === null) return undefined
    val = val[key]
  }
  if (typeof val === 'string') return val
  return undefined
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('hoteldocs_lang') as Lang
    return saved && ['es', 'en', 'de'].includes(saved) ? saved : 'es'
  })

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang)
    localStorage.setItem('hoteldocs_lang', newLang)
    document.documentElement.lang = newLang
  }, [])

  const t = useCallback(
    (namespace: Namespace, key: string, fallback?: string): string => {
      const val = getValue(translations[lang][namespace], key)
      if (val !== undefined) return val
      const esVal = getValue(translations.es[namespace], key)
      return fallback ?? esVal ?? key
    },
    [lang]
  )

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

export function useTranslation(namespace: Namespace) {
  const { t, lang, setLang } = useI18n()
  return {
    t: (key: string, fallback?: string) => t(namespace, key, fallback),
    lang,
    setLang,
  }
}
