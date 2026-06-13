import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import { Screen, Button } from '../../components/ui'
import Mascot from '../../components/Mascot'
import { rain, cue } from '../../lib/confetti'
import { useT } from '../../lib/lang'

interface State {
  xpEarned: number
  stars: number
  correct: number
  total: number
  packId: string
  seq: number
}

export default function LevelComplete() {
  const nav = useNavigate()
  const t = useT()
  const loc = useLocation()
  const state = loc.state as State | null
  const [xp, setXp] = useState(0)

  useEffect(() => {
    if (!state) return
    cue('win')
    rain()
    const target = state.xpEarned
    let n = 0
    const t = setInterval(() => {
      n += Math.max(1, Math.round(target / 30))
      if (n >= target) {
        n = target
        clearInterval(t)
      }
      setXp(n)
    }, 40)
    return () => clearInterval(t)
  }, [state])

  if (!state) return <Navigate to="/kid/home" replace />

  return (
    <Screen>
      <div className="flex min-h-svh flex-col items-center justify-center gap-5 bg-gradient-to-b from-gold/30 via-peach/40 to-cream px-8 text-center">
        <motion.h1
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-4xl font-extrabold text-teal"
        >
          {t('amazingWork')}
        </motion.h1>

        {/* stars */}
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3 + i * 0.2, type: 'spring', stiffness: 260 }}
            >
              <Star
                size={64}
                className={i < state.stars ? 'fill-gold text-gold' : 'fill-mist text-mist'}
              />
            </motion.div>
          ))}
        </div>

        <Mascot mood="jump" size={150} />

        <div className="rounded-3xl bg-white px-10 py-5 shadow">
          <div className="text-sm font-bold text-[#999]">{t('youEarned')}</div>
          <div className="text-5xl font-extrabold text-gold">+{xp}</div>
          <div className="mt-1 font-semibold text-[#888]">
            {state.correct}/{state.total} {t('accuracy')}
          </div>
        </div>

        <div className="flex w-full max-w-[320px] gap-3 pt-2">
          <Button
            variant="white"
            full
            onClick={() => nav(`/kid/play/${state.packId}/${state.seq}`)}
          >
            {t('replay')}
          </Button>
          <Button
            variant="primary"
            full
            onClick={() => nav(`/kid/map/${state.packId}`)}
          >
            {t('continue')}
          </Button>
        </div>
      </div>
    </Screen>
  )
}
