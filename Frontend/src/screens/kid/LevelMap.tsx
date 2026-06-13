import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Lock, Star, Mountain } from 'lucide-react'
import { Screen, Loading } from '../../components/ui'
import Mascot from '../../components/Mascot'
import { BottomNav } from '../../components/KidChrome'
import { useGame } from '../../store/GameStore'
import { useT } from '../../lib/lang'
import type { QuestionPack } from '../../types'

const mapBackground = new URL('../../assets/Icons_Illustration/background.png', import.meta.url).href

export default function LevelMap() {
  const { packId } = useParams()
  const nav = useNavigate()
  const t = useT()
  const { activeChild, packs, ready } = useGame()
  const pack = packs.find((p) => p.id === packId)

  if (!ready) return <Loading />
  if (!activeChild) return <Navigate to="/kid/scan" replace />
  if (!pack) return <Navigate to="/kid/home" replace />

  const completed = activeChild.completedLevels[pack.id] ?? 0
  const current = completed + 1

  // Nepali Words gets the immersive 3D candy-crush style scrolling map.
  if (pack.subject === 'nepali') {
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

  return (
    <Screen>
      <div className="flex min-h-svh flex-col bg-gradient-to-b from-[#bfe9ff] via-[#e7f6e9] to-cream">
        {/* header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 bg-teal/95 px-4 py-3 text-white backdrop-blur">
          <button onClick={() => nav('/kid/home')}>
            <ArrowLeft size={26} />
          </button>
          <div>
            <div className="text-lg font-extrabold leading-tight">{pack.title}</div>
            <div className="text-xs opacity-90">{pack.titleNp}</div>
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
              const offset = idx % 2 === 0 ? -54 : 54
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
                    <div className="my-1 h-8 w-1 rounded-full border-l-4 border-dotted border-teal/40" />
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
  const total = pack.levels.length

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
            <div className="text-lg font-extrabold leading-tight">{pack.title}</div>
            <div className="text-xs opacity-90">{pack.titleNp}</div>
          </div>
        </div>

        {/* scrolling 3D map */}
        <div ref={scrollRef} className="relative flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex min-h-full w-full flex-col justify-end">
            <div className="relative w-full leading-[0]">
              <img
                src={mapBackground}
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
                  // bottom (level 1) → top (last level)
                  const topPct = 92 - tt * 84
                  const leftPct = 50 + 26 * Math.sin(idx * 0.95 + 0.4)
                  return (
                    <PathNode
                      key={lvl.id}
                      seq={seq}
                      state={state}
                      topPct={topPct}
                      leftPct={leftPct}
                      onClick={() => !isLocked && onPlay(seq)}
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
}: {
  seq: number
  state: 'done' | 'current' | 'locked'
  topPct: number
  leftPct: number
  onClick: () => void
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
      {state === 'current' && (
        <div className="absolute -top-[60px] left-1/2 -translate-x-1/2 drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]">
          <Mascot mood="happy" size={58} />
        </div>
      )}
      <motion.button
        whileTap={{ scale: 0.9, y: 3 }}
        onClick={onClick}
        animate={state === 'current' ? { scale: [1, 1.08, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.4 }}
        className={`flex h-16 w-16 items-center justify-center rounded-full border-[3px] font-extrabold ${
          state === 'done'
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
