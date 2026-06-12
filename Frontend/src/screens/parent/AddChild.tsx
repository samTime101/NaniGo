import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Button } from '../../components/ui'
import { WizardShell, MascotSay } from '../../components/Wizard'
import Avatar, { AVATAR_IDS } from '../../components/Avatar'
import { useGame } from '../../store/GameStore'
import { Bi } from '../../lib/lang'
import type { AvatarId } from '../../types'

const STEPS = ['name', 'age', 'class', 'avatar'] as const
type Step = (typeof STEPS)[number]

export default function AddChild() {
  const nav = useNavigate()
  const { addChild } = useGame()
  const [stepIdx, setStepIdx] = useState(0)
  const [name, setName] = useState('')
  const [age, setAge] = useState(7)
  const [grade, setGrade] = useState(2)
  const [avatar, setAvatar] = useState<AvatarId>('tiger')
  const [busy, setBusy] = useState(false)

  const step: Step = STEPS[stepIdx]
  const progress = (stepIdx + 1) / STEPS.length

  const back = () => {
    if (stepIdx === 0) nav('/parent/dashboard')
    else setStepIdx((i) => i - 1)
  }

  const next = async () => {
    if (stepIdx < STEPS.length - 1) {
      setStepIdx((i) => i + 1)
      return
    }
    setBusy(true)
    const child = await addChild({
      name: name.trim() || 'Little Star',
      age,
      grade,
      avatar,
    })
    nav(`/parent/child/${child.id}/card`)
  }

  const footer = (
    <Button full variant="primary" onClick={next} disabled={busy}>
      {stepIdx < STEPS.length - 1 ? (
        <Bi en="Continue" np="अगाडि बढ्नुहोस्" />
      ) : (
        <Bi en="Create Card" np="कार्ड बनाउनुहोस्" />
      )}
    </Button>
  )

  return (
    <WizardShell progress={progress} onBack={back} footer={footer}>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="flex flex-1 flex-col gap-5"
        >
          {step === 'name' && (
            <>
              <MascotSay mood="wave">
                <Bi en="Who are we adding today?" np="आज कसलाई थप्दै?" />
              </MascotSay>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Child's name"
                className="min-h-[60px] rounded-2xl border-2 border-mist bg-white px-5 text-xl font-bold outline-none focus:border-teal"
              />
            </>
          )}

          {step === 'age' && (
            <>
              <MascotSay>
                <Bi
                  en={`How old is ${name.trim() || 'your child'}?`}
                  np="उमेर कति हो?"
                />
              </MascotSay>
              <div className="flex items-center justify-center gap-5 rounded-3xl bg-white p-5 shadow-sm">
                <WheelBtn onClick={() => setAge((a) => Math.max(3, a - 1))}>−</WheelBtn>
                <motion.div
                  key={age}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-24 text-center text-6xl font-extrabold text-teal"
                >
                  {age}
                </motion.div>
                <WheelBtn onClick={() => setAge((a) => Math.min(12, a + 1))}>+</WheelBtn>
              </div>
              <p className="text-center font-semibold text-[#999]">
                <Bi en="years old" np="वर्ष" />
              </p>
            </>
          )}

          {step === 'class' && (
            <>
              <MascotSay>
                <Bi en="Which class are they in?" np="कुन कक्षामा छन्?" />
              </MascotSay>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                  <motion.button
                    key={g}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setGrade(g)}
                    className={`min-h-[64px] rounded-2xl text-2xl font-extrabold transition-colors ${
                      grade === g
                        ? 'bg-teal text-white shadow-[0_4px_0_0_#0a8584]'
                        : 'bg-white text-teal shadow-sm'
                    }`}
                  >
                    {g}
                  </motion.button>
                ))}
              </div>
            </>
          )}

          {step === 'avatar' && (
            <>
              <MascotSay mood="happy">
                <Bi en="Pick a fun buddy!" np="एउटा साथी छान्नुहोस्!" />
              </MascotSay>
              <div className="grid grid-cols-4 gap-3">
                {AVATAR_IDS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAvatar(a)}
                    className="relative flex items-center justify-center"
                  >
                    <Avatar id={a} size={68} ring={avatar === a} />
                    {avatar === a && (
                      <span className="absolute -right-1 -top-1 rounded-full bg-success p-1 text-white">
                        <Check size={14} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </WizardShell>
  )
}

function WheelBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="h-16 w-16 rounded-2xl bg-orange text-4xl font-extrabold text-white shadow-[0_4px_0_0_#e54f24]"
    >
      {children}
    </motion.button>
  )
}
