import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, Coins, Target, LogOut, Star } from 'lucide-react'
import { Screen, Button, Loading } from '../../components/ui'
import Avatar from '../../components/Avatar'
import Mascot from '../../components/Mascot'
import { BottomNav } from '../../components/KidChrome'
import { useGame } from '../../store/GameStore'

export default function Profile() {
  const nav = useNavigate()
  const { activeChild, setActiveChild, ready } = useGame()

  if (!ready) return <Loading />
  if (!activeChild) return <Navigate to="/kid/scan" replace />

  return (
    <Screen>
      <div className="flex min-h-svh flex-col bg-gradient-to-b from-peach/50 to-cream">
        <div className="flex flex-1 flex-col items-center px-6 pt-10 pb-32">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
            <Avatar id={activeChild.avatar} size={110} ring />
          </motion.div>
          <h1 className="mt-4 text-3xl font-extrabold text-teal">{activeChild.name}</h1>
          <p className="font-semibold text-orange">Class {activeChild.grade} · Age {activeChild.age}</p>

          <div className="mt-6 grid w-full grid-cols-3 gap-3">
            <Stat icon={<Flame className="text-orange" />} label="Streak" value={activeChild.streakDays} />
            <Stat icon={<Coins className="text-gold" />} label="XP" value={activeChild.totalXp} />
            <Stat icon={<Target className="text-teal" />} label="Accuracy" value={`${activeChild.accuracy}%`} />
          </div>

          <div className="mt-6 w-full rounded-3xl bg-white p-5 shadow-sm">
            <div className="mb-3 font-extrabold text-[#444]">Recent Wins</div>
            {activeChild.activity.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <Mascot mood="sleep" size={80} />
                <p className="text-[#999]">No wins yet — let's play!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {activeChild.activity.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-2xl bg-cream p-3">
                    <span className="font-semibold text-[#555]">{a.text}</span>
                    <span className="flex">
                      {Array.from({ length: a.stars }).map((_, i) => (
                        <Star key={i} size={14} className="fill-gold text-gold" />
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 w-full">
            <Button
              variant="white"
              full
              onClick={() => {
                setActiveChild(null)
                nav('/role')
              }}
            >
              <span className="flex items-center justify-center gap-2 text-heart">
                <LogOut size={20} /> Switch User / बाहिरिनुहोस्
              </span>
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    </Screen>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-white p-3 shadow-sm">
      {icon}
      <span className="text-xl font-extrabold text-[#333]">{value}</span>
      <span className="text-xs font-semibold text-[#999]">{label}</span>
    </div>
  )
}
