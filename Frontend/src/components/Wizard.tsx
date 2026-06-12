import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Screen } from './ui'
import Mascot, { type MascotMood } from './Mascot'

/** Duolingo-style wizard frame: back + progress bar, content, sticky footer. */
export function WizardShell({
  progress,
  onBack,
  children,
  footer,
}: {
  progress: number
  onBack: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <Screen>
      <div className="flex min-h-svh flex-col px-6 pb-8 pt-5">
        <div className="mb-6 flex items-center gap-3">
          <button onClick={onBack} className="text-teal">
            <ArrowLeft size={26} />
          </button>
          <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-mist">
            <motion.div
              animate={{ width: `${Math.round(progress * 100)}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="h-full rounded-full bg-success"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col">{children}</div>

        {footer && <div className="pt-4">{footer}</div>}
      </div>
    </Screen>
  )
}

/** Mascot with a speech bubble — the friendly Duolingo "owl says" pattern. */
export function MascotSay({
  children,
  mood = 'happy',
  size = 110,
}: {
  children: ReactNode
  mood?: MascotMood
  size?: number
}) {
  return (
    <div className="flex items-end gap-2">
      <Mascot mood={mood} size={size} />
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="relative mb-3 flex-1 rounded-3xl border-2 border-mist bg-white p-4 text-lg font-bold text-[#444] shadow-sm"
      >
        <span className="absolute -left-2 bottom-4 h-4 w-4 rotate-45 border-b-2 border-l-2 border-mist bg-white" />
        {children}
      </motion.div>
    </div>
  )
}
