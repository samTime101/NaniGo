import { motion } from 'framer-motion'
import { Navigate, useNavigate } from 'react-router-dom'
import { BookOpen, LayoutGrid, LayoutList, Heart, Flame } from 'lucide-react'
import { Screen, Loading } from '../../components/ui'
import { BottomNav } from '../../components/KidChrome'
import { useGame } from '../../store/GameStore'
import { useT, useLang } from '../../lib/lang'
import { useState } from 'react'
import type { SubjectId } from '../../types'

const heroPanda = new URL('../../assets/Icons_Illustration/Hello_Panda.png', import.meta.url).href
const coinIcon = new URL('../../assets/Icons_Illustration/Icon_Coin.png', import.meta.url).href
const booksIcon = new URL('../../assets/Icons_Illustration/Icon_Books.png', import.meta.url).href

const SUBJECT_META: Record<
  SubjectId,
  { color: string; np: string; illustration: string }
> = {
  math: { 
    color: '#FE6538', 
    np: 'गणित',
    illustration: new URL('../../assets/Icons_Illustration/Homepage/Math_Illustration.jpeg', import.meta.url).href
  },
  nepali: { 
    color: '#0DA8A7', 
    np: 'नेपाली',
    illustration: new URL('../../assets/Icons_Illustration/Homepage/NepaliWord_illustration.jpeg', import.meta.url).href
  },
  science: { 
    color: '#22C55E', 
    np: 'विज्ञान',
    illustration: new URL('../../assets/Icons_Illustration/Homepage/Science_Illustration.jpeg', import.meta.url).href
  },
}

export default function KidHome() {
  const nav = useNavigate()
  const t = useT()
  const { lang } = useLang()
  const { activeChild, packs, ready } = useGame()
  const [layoutMode, setLayoutMode] = useState<'horizontal' | 'vertical'>('vertical')

  if (!ready) return <Loading />
  if (!activeChild) return <Navigate to="/kid/scan" replace />

  const defaultPacks = packs.filter((p) => p.type === 'default')
  const myBooks = packs
    .filter(
      (p) =>
        p.type === 'personalized' &&
        p.status === 'ready' &&
        p.childId === activeChild.id,
    )
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))

  return (
    <Screen>
      <div className="flex min-h-svh flex-col bg-gradient-to-b from-peach/50 to-cream">
        {/* Hero header — full panda + background scene with floating stats & greeting */}
        <div className="relative w-full overflow-hidden">
          <img
            src={heroPanda}
            alt=""
            className="block w-full select-none object-cover"
            draggable={false}
          />

          {/* Floating stat pills */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3 sm:p-4">
            {/* Hearts */}
            <div className="flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.12)] backdrop-blur">
              {[0, 1, 2].map((i) => {
                const filled = i < activeChild.hearts
                return (
                  <motion.span
                    key={i}
                    animate={filled ? { scale: [1, 1.25, 1] } : undefined}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      delay: i * 0.2,
                      ease: 'easeInOut',
                    }}
                    className="inline-flex"
                  >
                    <Heart
                      size={20}
                      className={
                        filled ? 'fill-heart text-heart' : 'fill-mist text-mist'
                      }
                    />
                  </motion.span>
                )
              })}
            </div>

            <div className="flex items-center gap-2">
              {/* Streak */}
              <span className="flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 font-extrabold text-orange shadow-[0_4px_12px_rgba(0,0,0,0.12)] backdrop-blur">
                <Flame size={18} className="fill-orange text-orange" />
                {activeChild.streakDays}
              </span>
              {/* Coins */}
              <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 font-extrabold text-[#a07c00] shadow-[0_4px_12px_rgba(0,0,0,0.12)] backdrop-blur">
                <img src={coinIcon} alt="" className="h-5 w-5 object-contain" />
                {activeChild.totalXp}
              </span>
            </div>
          </div>

          {/* Greeting overlay on the right side, over the sky */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-4 top-[40%] w-[44%] text-center sm:right-10"
          >
            <p className="text-sm font-bold uppercase tracking-wide text-[#1e3a8a]/80 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] sm:text-base">
              {t('namaste')}
            </p>
            <motion.h1
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
              className="mt-0.5 text-3xl font-black leading-none text-teal drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)] sm:text-5xl"
            >
              {activeChild.name}
            </motion.h1>
            <p className="mt-2 text-xs font-semibold text-[#64748b] drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] sm:text-sm">
              {t('readyToPlay')}
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 -mt-5 flex-1 px-5 pt-2">
          {/* My Book personalized cards (targeted to this child) */}
          {myBooks.map((book) => (
            <motion.button
              key={book.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => nav(`/kid/map/${book.id}`)}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative mb-3 flex w-full items-center gap-4 overflow-hidden rounded-3xl border border-[#eef1f4] bg-[#f7f8fa] p-4 text-left shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                <img src={booksIcon} alt="" className="h-9 w-9 object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-lg font-extrabold text-[#334155]">
                  {lang === 'np' ? book.titleNp : book.title}
                </div>
                <div className="text-sm font-semibold text-[#94a3b8]">
                  {t('newFrom')} {book.createdBy ?? 'Mom/Dad'}!
                </div>
              </div>
              <span className="absolute right-3 top-3 rounded-full bg-[#e8eef0] px-2 py-0.5 text-xs font-extrabold text-[#64748b]">
                {t('new')}
              </span>
            </motion.button>
          ))}
          {myBooks.length > 0 && <div className="mb-2" />}

          {/* Subjects header with layout toggle */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="text-teal" />
              <span className="text-lg font-extrabold text-[#444]">
                {t('subjects')}
              </span>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setLayoutMode(mode => mode === 'horizontal' ? 'vertical' : 'horizontal')}
              className="flex items-center gap-1 rounded-xl bg-teal/10 px-3 py-1.5 text-sm font-bold text-teal"
            >
              {layoutMode === 'horizontal' ? (
                <>
                  <LayoutGrid size={16} />
                  <span>Grid</span>
                </>
              ) : (
                <>
                  <LayoutList size={16} />
                  <span>List</span>
                </>
              )}
            </motion.button>
          </div>
          
          {/* Horizontal Banner Layout */}
          {layoutMode === 'horizontal' && (
            <div className="flex flex-col gap-3 pb-28">
              {defaultPacks.map((p, i) => {
                const meta = SUBJECT_META[p.subject]
                const done = activeChild.completedLevels[p.id] ?? 0
                const progress = (done / p.levels.length) * 100
                const title = lang === 'np' ? p.titleNp : p.title
                return (
                  <motion.button
                    key={p.id}
                    whileTap={{ scale: 0.98 }}
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => nav(`/kid/map/${p.id}`)}
                    className="relative flex h-28 w-full items-center overflow-hidden rounded-3xl shadow-[0_6px_0_0_#dfe9e4]"
                    style={{ backgroundColor: `${meta.color}08` }}
                  >
                    {/* Banner illustration on the right */}
                    <div className="absolute right-0 top-0 h-full w-32 opacity-80">
                      <img
                        src={meta.illustration}
                        alt={title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Gradient overlay for better text readability */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent"
                      style={{ 
                        background: `linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 60%, transparent 100%)`
                      }}
                    />

                    {/* Content */}
                    <div className="relative z-10 flex flex-1 flex-col items-start gap-2 px-5 py-4">
                      <div className="text-left">
                        <div className="text-xl font-extrabold text-[#333]">{title}</div>
                        <div className="text-xs font-semibold text-[#999]">
                          {done}/{p.levels.length} {t('chapter')}
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="h-2 w-full max-w-[160px] overflow-hidden rounded-full bg-white/60 shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, delay: i * 0.08 + 0.2 }}
                          className="h-full rounded-full"
                          style={{ background: meta.color }}
                        />
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          )}

          {/* Vertical Grid Layout */}
          {layoutMode === 'vertical' && (
            <div className="grid grid-cols-2 gap-4 pb-28">
              {defaultPacks.map((p, i) => {
                const meta = SUBJECT_META[p.subject]
                const done = activeChild.completedLevels[p.id] ?? 0
                const progress = (done / p.levels.length) * 100
                const title = lang === 'np' ? p.titleNp : p.title
                return (
                  <motion.button
                    key={p.id}
                    whileTap={{ scale: 0.95 }}
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => nav(`/kid/map/${p.id}`)}
                    className="relative flex flex-col items-start overflow-hidden rounded-3xl bg-white shadow-[0_6px_0_0_#dfe9e4]"
                  >
                    {/* Banner illustration at the top */}
                    <div className="relative h-24 w-full overflow-hidden">
                      <img
                        src={meta.illustration}
                        alt={title}
                        className="h-full w-full object-cover"
                      />
                      <div 
                        className="absolute inset-0"
                        style={{ 
                          background: `linear-gradient(to bottom, transparent 0%, ${meta.color}22 100%)`
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex w-full flex-col gap-2 p-4">
                      <div>
                        <div className="text-lg font-extrabold text-[#333]">{title}</div>
                        <div className="text-xs font-semibold text-[#999]">
                          {done}/{p.levels.length} {t('chapter')}
                        </div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-mist">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, delay: i * 0.08 + 0.2 }}
                          className="h-full rounded-full"
                          style={{ background: meta.color }}
                        />
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </Screen>
  )
}
