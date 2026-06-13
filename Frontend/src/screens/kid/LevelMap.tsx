import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Lock, Star, Mountain, Crown } from 'lucide-react'
import { Screen, Loading } from '../../components/ui'
import Mascot from '../../components/Mascot'
import { BottomNav } from '../../components/KidChrome'
import { useGame } from '../../store/GameStore'
import { useT, useLang } from '../../lib/lang'
import type { QuestionPack } from '../../types'

const mapBackground = new URL('../../assets/Icons_Illustration/background.png', import.meta.url).href
const mathBackground = new URL('../../assets/Icons_Illustration/background_Math.png', import.meta.url).href
const scienceBackground = new URL('../../assets/Icons_Illustration/background_science.png', import.meta.url).href

export default function LevelMap() {
  const { packId } = useParams()
  const nav = useNavigate()
  const t = useT()
  const { lang } = useLang()
  const { activeChild, packs, ready } = useGame()
  const pack = packs.find((p) => p.id === packId)

  if (!ready) return <Loading />
  if (!activeChild) return <Navigate to="/kid/scan" replace />
  if (!pack) return <Navigate to="/kid/home" replace />

  const completed = activeChild.completedLevels[pack.id] ?? 0
  const current = completed + 1

  // Nepali, Math, and Science get the immersive 3D candy-crush style scrolling map.
  if (pack.subject === 'nepali' || pack.subject === 'math' || pack.subject === 'science') {
    return (
      <PathMap
        pack={pack}
        completed={completed}
        current={current}
        onBack={() => nav('/kid/home')}
        onPlay={(seq) => nav(`/kid/play/${pack.id}/${seq}`)}
      />
    )
  }

  // Get pack title based on language
  const packTitle = lang === 'np' ? pack.titleNp : pack.title
  const packSubtitle = lang === 'both' ? pack.titleNp : undefined

  return (
    <Screen>
      <div className="flex min-h-svh flex-col bg-gradient-to-b from-[#bfe9ff] via-[#e7f6e9] to-cream">
        {/* header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 bg-teal/95 px-4 py-3 text-white backdrop-blur">
          <button onClick={() => nav('/kid/home')}>
            <ArrowLeft size={26} />
          </button>
          <div>
            <div className="text-lg font-extrabold leading-tight">{packTitle}</div>
            {packSubtitle && <div className="text-xs opacity-90">{packSubtitle}</div>}
          </div>
        </div>

        {/* scrolling path */}
        <div className="relative flex-1 overflow-y-auto pb-28">
          {/* decorative mountains */}
          <Mountain className="absolute left-4 top-24 text-white/50" size={70} />
          <Mountain className="absolute right-6 top-72 text-white/40" size={90} />

          <div className="relative mx-auto flex max-w-[360px] flex-col-reverse items-center gap-0 px-6 py-8">
            {pack.levels.map((lvl, idx) => {
              const seq = lvl.sequenceNo
              const isDone = seq <= completed
              const isCurrent = seq === current
              const isLocked = seq > current
              // zigzag horizontal offset
              const offset = idx % 2 === 0 ? -5 : 54
              const showChapter = idx % 5 === 0

              return (
                <div key={lvl.id} className="flex w-full flex-col items-center">
                  <Node
                    seq={seq}
                    state={isDone ? 'done' : isCurrent ? 'current' : 'locked'}
                    offset={offset}
                    onClick={() =>
                      !isLocked && nav(`/kid/play/${pack.id}/${seq}`)
                    }
                  />
                  {/* dotted connector */}
                  {idx < pack.levels.length - 1 && (
                    <div className="my-1 h-80 w-1 rounded-full border-l-4 border-dotted border-teal/40" />
                  )}
                  {showChapter && (
                    <ChapterBanner
                      title={getChapterTitle(Math.floor(idx / 5), t)}
                      n={Math.floor(idx / 5) + 1}
                      t={t}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <BottomNav />
      </div>
    </Screen>
  )
}

function Node({
  seq,
  state,
  offset,
  onClick,
}: {
  seq: number
  state: 'done' | 'current' | 'locked'
  offset: number
  onClick: () => void
}) {
  return (
    <div style={{ transform: `translateX(${offset}px)` }} className="relative">
      {state === 'current' && (
        <div className="absolute -top-[78px] left-1/2 -translate-x-1/2">
          <Mascot mood="happy" size={70} />
        </div>
      )}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        animate={state === 'current' ? { scale: [1, 1.08, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.4 }}
        className={`flex h-20 w-20 items-center justify-center rounded-full border-4 font-extrabold shadow-lg ${
          state === 'done'
            ? 'border-gold-dark bg-gold text-white'
            : state === 'current'
              ? 'border-white bg-orange text-white shadow-[0_0_0_8px_rgba(254,101,56,0.25)]'
              : 'border-[#cfd8d4] bg-mist text-[#9aa0a6]'
        }`}
      >
        {state === 'done' ? (
          <Star size={34} className="fill-white" />
        ) : state === 'locked' ? (
          <Lock size={28} />
        ) : (
          <span className="text-2xl">{seq}</span>
        )}
      </motion.button>
    </div>
  )
}

function ChapterBanner({ title, n, t }: { title: string; n: number; t: (key: string) => string }) {
  return (
    <div className="my-4 w-full rounded-2xl bg-white/80 px-4 py-2 text-center shadow-sm backdrop-blur">
      <div className="text-xs font-bold uppercase tracking-wide text-orange">
        {t('chapter')} {n}
      </div>
      <div className="font-extrabold text-teal">{title}</div>
    </div>
  )
}

function getChapterTitle(chapterIndex: number, t: (key: string) => string): string {
  const chapters = [t('gettingStarted'), t('shapesAndSizes'), t('goingFurther')]
  return chapters[chapterIndex] ?? `${t('chapter')} ${chapterIndex + 1}`
}


/**
 * Immersive candy-crush style map: a tall 3D background illustration that
 * scrolls vertically, with level "steps" placed along the painted path.
 */
function PathMap({
  pack,
  completed,
  current,
  onBack,
  onPlay,
}: {
  pack: QuestionPack
  completed: number
  current: number
  onBack: () => void
  onPlay: (seq: number) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { lang } = useLang()
  const total = pack.levels.length

  // Get pack title based on language
  const packTitle = lang === 'np' ? pack.titleNp : pack.title
  const packSubtitle = lang === 'both' ? pack.titleNp : undefined

  // Begin at the bottom of the path (level 1) and climb upward.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  return (
    <Screen>
      <div className="flex min-h-svh flex-col bg-[#0b2138]">
        {/* header */}
        <div className="sticky top-0 z-20 flex items-center gap-3 bg-teal/95 px-4 py-3 text-white backdrop-blur">
          <button onClick={onBack}>
            <ArrowLeft size={26} />
          </button>
          <div>
            <div className="text-lg font-extrabold leading-tight">{packTitle}</div>
            {packSubtitle && <div className="text-xs opacity-90">{packSubtitle}</div>}
          </div>
        </div>

        {/* scrolling 3D map */}
        <div ref={scrollRef} className="relative flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex min-h-full w-full flex-col justify-end">
            <div className="relative w-full leading-[0]">
              <img
                src={
                  pack.subject === 'math' 
                    ? mathBackground 
                    : pack.subject === 'science'
                    ? scienceBackground
                    : mapBackground
                }
                alt=""
                className="block w-full select-none"
                draggable={false}
              />

              {/* level steps following the path painted in the picture */}
              <div className="absolute inset-0">
                {pack.levels.map((lvl, idx) => {
                  const seq = lvl.sequenceNo
                  const state =
                    seq <= completed ? 'done' : seq === current ? 'current' : 'locked'
                  const isLocked = seq > current
                  const tt = total > 1 ? idx / (total - 1) : 0
                  
                  // Define exact positions for each level per subject
                  const nepaliPositions = [
                    { top: 90, left: 35 },  // Level 1: bottom left
                    { top: 75, left: 60 },  // Level 2: right
                    { top: 64, left: 37 },  // Level 3: left
                    { top: 50, left: 62 },  // Level 4: right
                    { top: 36, left: 56 },  // Level 5: center-right
                    { top: 12, left: 50 },  // Level 6: top-center
                    { top: 8, left: 50 },   // Level 7: top center
                  ]
                  
                  const mathPositions = [
                    { top: 90, left: 50 },  // Level 1: bottom left
                    { top: 75, left: 59 },  // Level 2: right
                    { top: 64, left: 42 },  // Level 3: left
                    { top: 50, left: 55 },  // Level 4: right
                    { top: 30, left: 54 },  // Level 5: center-right
                    { top: 19, left: 50 },  // Level 6: top-center
                    { top: 8, left: 50 },   // Level 7: top center
                  ]
                  
                  const sciencePositions = [
                    { top: 90, left: 53 },  // Level 1: bottom left
                    { top: 75, left: 52 },  // Level 2: right
                    { top: 64, left: 47 },  // Level 3: left
                    { top: 50, left: 61 },  // Level 4: right
                    { top: 36, left: 58 },  // Level 5: center-right
                    { top: 16, left: 50 },  // Level 6: top-center
                    { top: 8, left: 50 },   // Level 7: top center
                  ]
                  
                  // Select position array based on subject
                  const positions = 
                    pack.subject === 'math' 
                      ? mathPositions 
                      : pack.subject === 'science'
                      ? sciencePositions
                      : nepaliPositions
                  
                  const pos = positions[idx] || { top: 92 - tt * 84, left: 50 }
                  const topPct = pos.top
                  const leftPct = pos.left
                  
                  return (
                    <PathNode
                      key={lvl.id}
                      seq={seq}
                      state={state}
                      topPct={topPct}
                      leftPct={leftPct}
                      onClick={() => !isLocked && onPlay(seq)}
                      isTopLevel={idx === pack.levels.length - 1}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </Screen>
  )
}

function PathNode({
  seq,
  state,
  topPct,
  leftPct,
  onClick,
  isTopLevel,
}: {
  seq: number
  state: 'done' | 'current' | 'locked'
  topPct: number
  leftPct: number
  onClick: () => void
  isTopLevel?: boolean
}) {
  return (
    <div
      className="absolute"
      style={{
        top: `${topPct}%`,
        left: `${leftPct}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Crown above top level */}
      {isTopLevel && (
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="absolute -top-[56px] left-1/2 -translate-x-1/2"
        >
          <Crown size={44} className="fill-gold text-gold drop-shadow-[0_4px_8px_rgba(255,215,0,0.6)]" />
        </motion.div>
      )}
      
      {state === 'current' && !isTopLevel && (
        <div className="absolute -top-[60px] left-1/2 -translate-x-1/2 drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]">
          <Mascot mood="happy" size={58} />
        </div>
      )}
      <motion.button
        whileTap={{ scale: 0.9, y: 3 }}
        onClick={onClick}
        animate={state === 'current' ? { scale: [1, 1.08, 1] } : isTopLevel ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: isTopLevel ? 2 : 1.4 }}
        className={`flex h-16 w-16 items-center justify-center rounded-full border-[3px] font-extrabold ${
          isTopLevel
            ? 'border-[#b8860b] bg-gradient-to-b from-gold via-[#ffd700] to-gold-dark text-white shadow-[0_7px_0_0_#a07c00,0_12px_20px_rgba(255,215,0,0.5),0_0_0_4px_rgba(255,215,0,0.3)]'
            : state === 'done'
            ? 'border-[#b8860b] bg-gradient-to-b from-gold to-gold-dark text-white shadow-[0_7px_0_0_#a07c00,0_12px_16px_rgba(0,0,0,0.45)]'
            : state === 'current'
              ? 'border-white bg-gradient-to-b from-orange-light to-orange text-white shadow-[0_7px_0_0_#e54f24,0_12px_16px_rgba(0,0,0,0.45),0_0_0_8px_rgba(254,101,56,0.3)]'
              : 'border-white/70 bg-gradient-to-b from-[#c7d0cb] to-[#94a09a] text-white/90 shadow-[0_7px_0_0_#7e8a84,0_12px_16px_rgba(0,0,0,0.4)]'
        }`}
      >
        {state === 'done' ? (
          <Star size={28} className="fill-white" />
        ) : state === 'locked' ? (
          <Lock size={24} />
        ) : (
          <span className="text-xl">{seq}</span>
        )}
      </motion.button>
    </div>
  )
}
