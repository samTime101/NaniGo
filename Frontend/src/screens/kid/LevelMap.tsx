import { motion } from 'framer-motion'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Lock, Star, Mountain } from 'lucide-react'
import { Screen, Loading } from '../../components/ui'
import Mascot from '../../components/Mascot'
import { BottomNav } from '../../components/KidChrome'
import { useGame } from '../../store/GameStore'

const CHAPTERS = ['Getting Started', 'Shapes & Sizes', 'Going Further']

export default function LevelMap() {
  const { packId } = useParams()
  const nav = useNavigate()
  const { activeChild, packs, ready } = useGame()
  const pack = packs.find((p) => p.id === packId)

  if (!ready) return <Loading />
  if (!activeChild) return <Navigate to="/kid/scan" replace />
  if (!pack) return <Navigate to="/kid/home" replace />

  const completed = activeChild.completedLevels[pack.id] ?? 0
  const current = completed + 1

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
                      title={CHAPTERS[Math.floor(idx / 5)] ?? `Chapter ${Math.floor(idx / 5) + 1}`}
                      n={Math.floor(idx / 5) + 1}
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

function ChapterBanner({ title, n }: { title: string; n: number }) {
  return (
    <div className="my-4 w-full rounded-2xl bg-white/80 px-4 py-2 text-center shadow-sm backdrop-blur">
      <div className="text-xs font-bold uppercase tracking-wide text-orange">
        Chapter {n}
      </div>
      <div className="font-extrabold text-teal">{title}</div>
    </div>
  )
}
