import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'

export type Lang = 'en' | 'np' | 'both'

const KEY = 'nanigo-lang'

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
}

const Ctx = createContext<LangCtx>({ lang: 'both', setLang: () => {} })

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem(KEY) as Lang) || 'both',
  )
  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem(KEY, l)
  }
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  return useContext(Ctx)
}

/**
 * Bilingual text that respects the chosen app language:
 * - 'en'   → English only
 * - 'np'   → Nepali only
 * - 'both' → English with a small Nepali subtitle
 */
export function Bi({
  en,
  np,
  className = '',
}: {
  en: string
  np: string
  className?: string
}) {
  const { lang } = useLang()
  if (lang === 'en') return <span className={className}>{en}</span>
  if (lang === 'np') return <span className={className}>{np}</span>
  return (
    <span className={`flex flex-col leading-tight ${className}`}>
      <span>{en}</span>
      <span className="text-[0.72em] font-medium opacity-70">{np}</span>
    </span>
  )
}

/** Inline string helper for places that need a plain string (no JSX). */
// eslint-disable-next-line react-refresh/only-export-components
export function pick(lang: Lang, en: string, np: string): string {
  if (lang === 'en') return en
  if (lang === 'np') return np
  return `${en} / ${np}`
}
