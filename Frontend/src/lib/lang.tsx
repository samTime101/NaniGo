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

// ===== TRANSLATION DICTIONARY =====
// All UI strings (not quiz content) should be translated
const translations = {
  // Common
  subjects: { en: 'Subjects', np: 'विषयहरू' },
  newLabel: { en: 'NEW', np: 'नयाँ' },
  new: { en: 'NEW', np: 'नयाँ' },
  newFrom: { en: 'New from', np: 'नयाँ' },
  readyToPlay: { en: 'Ready to play?', np: 'खेल्न तयार?' },
  namaste: { en: 'Namaste', np: 'नमस्ते' },
  
  // Navigation
  map: { en: 'Map', np: 'नक्सा' },
  battle: { en: 'Battle', np: 'लडाइँ' },
  top: { en: 'Top', np: 'शीर्ष' },
  me: { en: 'Me', np: 'म' },
  home: { en: 'Home', np: 'गृह' },
  books: { en: 'Books', np: 'किताबहरू' },
  upload: { en: 'Upload', np: 'अपलोड' },
  settings: { en: 'Settings', np: 'सेटिङहरू' },
  
  // Subjects
  math: { en: 'Math', np: 'गणित' },
  nepali: { en: 'Nepali', np: 'नेपाली' },
  science: { en: 'Science', np: 'विज्ञान' },
  english: { en: 'English', np: 'अंग्रेजी' },
  
  // Profile
  streak: { en: 'Streak', np: 'क्रम' },
  xp: { en: 'XP', np: 'अंक' },
  accuracy: { en: 'Accuracy', np: 'शुद्धता' },
  recentWins: { en: 'Recent Wins', np: 'हालका जीतहरू' },
  noWinsYet: { en: "No wins yet — let's play!", np: 'अहिलेसम्म कुनै जीत छैन — खेलौं!' },
  switchUser: { en: 'Switch User', np: 'प्रयोगकर्ता बदल्नुहोस्' },
  class: { en: 'Class', np: 'कक्षा' },
  age: { en: 'Age', np: 'उमेर' },
  
  // Level Map
  gettingStarted: { en: 'Getting Started', np: 'सुरुवात गर्दै' },
  shapesAndSizes: { en: 'Shapes & Sizes', np: 'आकार र साइज' },
  goingFurther: { en: 'Going Further', np: 'अगाडि बढ्दै' },
  chapter: { en: 'Chapter', np: 'अध्याय' },
  
  // Game/Quiz
  score: { en: 'Score', np: 'स्कोर' },
  loading: { en: 'Loading...', np: 'लोड गर्दै...' },
  checkAnswer: { en: 'Check Answer', np: 'उत्तर जाँच गर्नुहोस्' },
  continue: { en: 'Continue', np: 'जारी राख्नुहोस्' },
  tapToCheck: { en: 'Tap to check', np: 'जाँच गर्न ट्याप गर्नुहोस्' },
  correct: { en: 'Correct!', np: 'सही!' },
  tryAgain: { en: 'Try again!', np: 'फेरि प्रयास गर्नुहोस्!' },
  wellDone: { en: 'Well done!', np: 'राम्रो गर्नुभयो!' },
  awesome: { en: 'Awesome!', np: 'उत्कृष्ट!' },
  
  // Battle
  findOpponent: { en: 'Finding opponent…', np: 'प्रतिद्वन्द्वी खोज्दै…' },
  waiting: { en: 'Waiting...', np: 'पर्खदै...' },
  you: { en: 'You', np: 'तपाईं' },
  youWon: { en: 'You Won!', np: 'तपाईं जित्नुभयो!' },
  goodTry: { en: 'Good Try!', np: 'राम्रो प्रयास!' },
  rematch: { en: 'Rematch', np: 'पुनः खेल्नुहोस्' },
  
  // Leaderboard
  leaderboard: { en: 'Leaderboard', np: 'लिडरबोर्ड' },
  topLearners: { en: 'Top Learners', np: 'शीर्ष शिक्षार्थीहरू' },
  classTab: { en: 'Class', np: 'कक्षा' },
  allNepal: { en: 'All Nepal', np: 'सम्पूर्ण नेपाल' },
  youIndicator: { en: 'You', np: 'तपाईं' },
  
  // Level Complete
  amazingWork: { en: 'Amazing Work!', np: 'उत्कृष्ट काम!' },
  youEarned: { en: 'You Earned', np: 'तपाईंले पाउनुभयो' },
  replay: { en: 'Replay', np: 'पुनः खेल्नुहोस्' },
  
  // Banner subject selection
  chooseSubject: { en: 'Choose a Subject', np: 'विषय छान्नुहोस्' },
  letsPractice: { en: "Let's practice", np: 'अभ्यास गरौं' },
  tapToStart: { en: 'Tap to start learning', np: 'सिक्न सुरु गर्न ट्याप गर्नुहोस्' },
  
  // Lesson screen
  letsLearnFirst: { en: "Let's Learn First!", np: 'पहिले सिकौं!' },
  readAloud: { en: 'Listen', np: 'सुन्नुहोस्' },
  quickCheck: { en: 'Quick Check', np: 'छिटो जाँच' },
  notQuiteAgain: { en: 'Not quite!', np: 'फेरि प्रयास गर्नुहोस्!' },
  startQuestions: { en: 'Start Questions', np: 'प्रश्नहरू सुरु गर्नुहोस्' },
  
  // Question types
  matchThePairs: { en: 'Match the Pairs', np: 'जोडी मिलाउनुहोस्' },
  dragIntoOrder: { en: 'Put in Order', np: 'क्रममा राख्नुहोस्' },
  sayItOutLoud: { en: 'Say it out loud!', np: 'ठूलो स्वरमा भन्नुहोस्!' },
  
  // Break screen
  takeABreak: { en: 'Take a Break!', np: 'विश्राम लिनुहोस्!' },
  heartRefill: { en: 'Your hearts will refill soon', np: 'तपाईंको मुटु चाँडै भरिनेछ' },
  backHome: { en: 'Back Home', np: 'घर फर्कनुहोस्' },
} as const

type TranslationKey = keyof typeof translations

/** Hook to get translation function */
// eslint-disable-next-line react-refresh/only-export-components
export function useT() {
  const { lang } = useLang()
  return (key: TranslationKey): string => {
    const t = translations[key]
    if (!t) return key
    if (lang === 'en') return t.en
    if (lang === 'np') return t.np
    return `${t.en} / ${t.np}`
  }
}

/** Component version for JSX contexts */
export function T({ k }: { k: TranslationKey }) {
  const t = useT()
  return <>{t(k)}</>
}
