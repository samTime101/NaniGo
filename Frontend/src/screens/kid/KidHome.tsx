import { motion } from 'framer-motion'
import { Navigate, useNavigate } from 'react-router-dom'
import { Calculator, Languages, FlaskConical, Sparkles, BookOpen } from 'lucide-react'
import { Screen, Loading } from '../../components/ui'
import Mascot from '../../components/Mascot'
import { KidTopBar, BottomNav } from '../../components/KidChrome'
import { useGame } from '../../store/GameStore'
import type { SubjectId } from '../../types'

const SUBJECT_META: Record<
  SubjectId,
  { icon: typeof Calculator; color: string; np: string }
> = {
  math: { icon: Calculator, color: '#FE6538', np: 'गणित' },
  nepali: { icon: Languages, color: '#0DA8A7', np: 'नेपाली' },
  science: { icon: FlaskConical, color: '#22C55E', np: 'विज्ञान' },
  english: { icon: BookOpen, color: '#FBBF24', np: 'अंग्रेजी' },
}

export default function KidHome() {
  const nav = useNavigate()
  const { activeChild, packs, ready } = useGame()

  if (!ready) return <Loading />
  if (!activeChild) return <Navigate to="/kid/scan" replace />

  const defaultPacks = packs.filter((p) => p.type === 'default')
  const readyPersonalized = packs.find(
    (p) => p.type === 'personalized' && p.status === 'ready',
  )

  return (
    <Screen>
      <div className="flex min-h-svh flex-col bg-gradient-to-b from-peach/50 to-cream">
        <KidTopBar child={activeChild} />

        <div className="flex items-center gap-3 px-5 pt-2">
          <Mascot mood="wave" size={92} />
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-extrabold text-teal"
            >
              Namaste, {activeChild.name}!
            </motion.h1>
            <p className="font-semibold text-orange">नमस्ते! Ready to play?</p>
          </div>
        </div>

        <div className="flex-1 px-5 pt-5">
          {/* My Book personalized card */}
          {readyPersonalized && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => nav(`/kid/map/${readyPersonalized.id}`)}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative mb-5 flex w-full items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-r from-gold to-orange p-5 text-left text-white shadow-[0_8px_0_0_#e6c000]"
            >
              <motion.span
                animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Sparkles size={36} />
              </motion.span>
              <div>
                <div className="text-xl font-extrabold">My Book</div>
                <div className="text-sm font-semibold">
                  New questions from Mom/Dad! · नयाँ प्रश्न
                </div>
              </div>
              <span className="absolute right-3 top-3 animate-pulse rounded-full bg-white px-2 py-0.5 text-xs font-extrabold text-orange">
                NEW
              </span>
            </motion.button>
          )}

          {/* Subjects */}
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="text-teal" />
            <span className="text-lg font-extrabold text-[#444]">
              Subjects · विषयहरू
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 pb-28">
            {defaultPacks.map((p, i) => {
              const meta = SUBJECT_META[p.subject]
              const Icon = meta.icon
              const done = activeChild.completedLevels[p.id] ?? 0
              return (
                <motion.button
                  key={p.id}
                  whileTap={{ scale: 0.95 }}
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => nav(`/kid/map/${p.id}`)}
                  className="flex flex-col items-start gap-3 rounded-3xl bg-white p-5 shadow-[0_6px_0_0_#dfe9e4]"
                >
                  <div className="rounded-2xl p-3" style={{ background: `${meta.color}22`, color: meta.color }}>
                    <Icon size={32} />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-[#333]">{p.title}</div>
                    <div className="text-sm font-semibold text-[#999]">{p.titleNp}</div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-mist">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(done / p.levels.length) * 100}%`, background: meta.color }}
                    />
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        <BottomNav />
      </div>
    </Screen>
  )
}
