import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Navigate } from 'react-router-dom'
import { Crown } from 'lucide-react'
import { Screen, Loading } from '../../components/ui'
import Avatar from '../../components/Avatar'
import { BottomNav } from '../../components/KidChrome'
import { useGame } from '../../store/GameStore'
import { api } from '../../lib/api'
import { useT } from '../../lib/lang'
import type { LeaderboardEntry } from '../../types'

export default function Leaderboard() {
  const t = useT()
  const { activeChild, ready } = useGame()
  const [tab, setTab] = useState<'class' | 'nepal'>('class')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    if (!activeChild) return
    api
      .leaderboard(
        tab === 'class' ? 'class' : 'all',
        tab === 'class' ? activeChild.grade : undefined,
        activeChild.id,
      )
      .then(setEntries)
      .catch(() => setEntries([]))
  }, [tab, activeChild])

  if (!ready) return <Loading />
  if (!activeChild) return <Navigate to="/kid/scan" replace />

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)
  const current = entries.find((e) => e.isCurrent)
  const currentRank = entries.findIndex((e) => e.isCurrent) + 1

  return (
    <Screen>
      <div className="flex min-h-svh flex-col bg-gradient-to-b from-teal/10 to-cream">
        <div className="px-5 pt-6">
          <h1 className="text-3xl font-extrabold text-teal">{t('leaderboard')}</h1>

          <div className="mb-5 mt-4 flex rounded-2xl bg-mist p-1">
            {(['class', 'nepal'] as const).map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => setTab(tabKey)}
                className={`flex-1 rounded-xl py-2.5 font-bold transition-colors ${
                  tab === tabKey ? 'bg-white text-teal shadow' : 'text-[#7a8a86]'
                }`}
              >
                {tabKey === 'class' ? t('classTab') : t('allNepal')}
              </button>
            ))}
          </div>

          {/* podium */}
          <div className="mb-6 flex items-end justify-center gap-3">
            {[top3[1], top3[0], top3[2]].map((e, i) =>
              e ? (
                <motion.div
                  key={e.id}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center"
                >
                  {i === 1 && <Crown className="mb-1 text-gold" />}
                  <Avatar id={e.avatar} size={i === 1 ? 72 : 56} ring={e.isCurrent} />
                  <span className="mt-1 text-sm font-bold text-[#444]">{e.name}</span>
                  <span className="text-xs font-extrabold text-teal">{e.xp}</span>
                  <div
                    className="mt-1 w-16 rounded-t-xl text-center font-extrabold text-white"
                    style={{
                      height: i === 1 ? 70 : 46,
                      background: i === 1 ? '#FFD600' : i === 0 ? '#c0c7c4' : '#e6a06a',
                    }}
                  >
                    {i === 1 ? 1 : i === 0 ? 2 : 3}
                  </div>
                </motion.div>
              ) : null,
            )}
          </div>
        </div>

        {/* ranked list */}
        <div className="flex-1 overflow-y-auto px-5 pb-40">
          <div className="flex flex-col gap-2">
            {rest.map((e, i) => (
              <div
                key={e.id}
                className={`flex items-center gap-3 rounded-2xl p-3 ${
                  e.isCurrent ? 'bg-teal text-white' : 'bg-white'
                }`}
              >
                <span className={`w-6 text-center font-extrabold ${e.isCurrent ? 'text-white' : 'text-[#999]'}`}>
                  {i + 4}
                </span>
                <Avatar id={e.avatar} size={40} />
                <span className="flex-1 font-bold">{e.name}</span>
                <span className="font-extrabold">{e.xp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* sticky current */}
        {current && currentRank > 3 && (
          <div className="sticky bottom-[68px] mx-5 mb-2 flex items-center gap-3 rounded-2xl bg-orange p-3 text-white shadow-lg">
            <span className="w-6 text-center font-extrabold">{currentRank}</span>
            <Avatar id={current.avatar} size={40} ring />
            <span className="flex-1 font-bold">{t('youIndicator')} · {current.name}</span>
            <span className="font-extrabold">{current.xp}</span>
          </div>
        )}

        <BottomNav />
      </div>
    </Screen>
  )
}
