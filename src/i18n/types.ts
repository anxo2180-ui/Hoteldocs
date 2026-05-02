export type Lang = 'es' | 'en' | 'de'

export type Translations = {
  common: Record<string, string>
  navigation: Record<string, string>
  login: Record<string, string>
  dashboard: Record<string, string>
}

export type Namespace = keyof Translations

export type I18nContextType = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (namespace: Namespace, key: string, fallback?: string) => string
}
