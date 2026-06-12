import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Users, Gamepad2, ChevronRight } from 'lucide-react'
import { Screen } from '../components/ui'
import Mascot from '../components/Mascot'

export default function RoleSelect() {
  const nav = useNavigate()
  return (
    <Screen>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-svh flex-col items-center px-6 pt-10 pb-8 bg-gradient-to-b from-peach/60 to-cream"
      >
        <img src="/nanigo_logo.png" alt="NaniGO" className="w-28" />
        <div className="-mt-2">
          <Mascot mood="wave" size={120} />
        </div>
        <h1 className="mt-2 text-3xl font-extrabold text-teal">
          Welcome to NaniGO
        </h1>
        <p className="mb-8 text-base font-semibold text-orange">
          स्वागत छ — Who is playing?
        </p>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => nav('/kid/scan')}
          className="mb-5 w-full rounded-3xl bg-teal p-6 text-left text-white shadow-[0_8px_0_0_#0a8584]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white/20 p-3">
                <Gamepad2 size={40} />
              </div>
              <div>
                <div className="text-2xl font-extrabold">I'm a Kid</div>
                <div className="text-base opacity-90">म बच्चा हुँ</div>
              </div>
            </div>
            <ChevronRight size={32} />
          </div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => nav('/parent/auth')}
          className="w-full rounded-3xl bg-white p-6 text-left text-teal shadow-[0_8px_0_0_#dfe9e4]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-orange/15 p-3 text-orange">
                <Users size={40} />
              </div>
              <div>
                <div className="text-2xl font-extrabold">I'm a Parent</div>
                <div className="text-base text-orange">म अभिभावक हुँ</div>
              </div>
            </div>
            <ChevronRight size={32} />
          </div>
        </motion.button>
      </motion.div>
    </Screen>
  )
}
