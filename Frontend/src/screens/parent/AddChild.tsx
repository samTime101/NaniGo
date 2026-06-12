import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { Screen, Button } from '../../components/ui'
import Avatar, { AVATAR_IDS } from '../../components/Avatar'
import { useGame } from '../../store/GameStore'
import type { AvatarId } from '../../types'

export default function AddChild() {
  const nav = useNavigate()
  const { addChild } = useGame()
  const [name, setName] = useState('')
  const [age, setAge] = useState(7)
  const [grade, setGrade] = useState(2)
  const [avatar, setAvatar] = useState<AvatarId>('tiger')

  const save = async () => {
    const child = await addChild({ name: name || 'Little Star', age, grade, avatar })
    nav(`/parent/child/${child.id}/card`)
  }

  return (
    <Screen>
      <div className="flex min-h-svh flex-col px-6 pt-6 pb-10">
        <button onClick={() => nav(-1)} className="mb-2 w-fit text-teal">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-3xl font-extrabold text-teal">Add Child</h1>
        <p className="mb-5 font-semibold text-orange">बच्चा थप्नुहोस्</p>

        <label className="mb-1 font-bold text-[#555]">Name / नाम</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Aarav"
          className="mb-5 min-h-[56px] rounded-2xl border-2 border-mist bg-white px-4 text-lg outline-none focus:border-teal"
        />

        <label className="mb-2 font-bold text-[#555]">Age / उमेर</label>
        <div className="mb-5 flex items-center justify-center gap-4 rounded-2xl bg-white p-3 shadow-sm">
          <WheelBtn onClick={() => setAge((a) => Math.max(3, a - 1))}>−</WheelBtn>
          <motion.div
            key={age}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 text-center text-5xl font-extrabold text-teal"
          >
            {age}
          </motion.div>
          <WheelBtn onClick={() => setAge((a) => Math.min(12, a + 1))}>+</WheelBtn>
        </div>

        <label className="mb-2 font-bold text-[#555]">Class / कक्षा</label>
        <div className="mb-5 grid grid-cols-4 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
            <button
              key={g}
              onClick={() => setGrade(g)}
              className={`min-h-[52px] rounded-2xl font-extrabold transition-colors ${
                grade === g ? 'bg-teal text-white' : 'bg-white text-teal shadow-sm'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <label className="mb-2 font-bold text-[#555]">Avatar / चित्र</label>
        <div className="mb-6 grid grid-cols-4 gap-3">
          {AVATAR_IDS.map((a) => (
            <button
              key={a}
              onClick={() => setAvatar(a)}
              className="relative flex items-center justify-center"
            >
              <Avatar id={a} size={64} ring={avatar === a} />
              {avatar === a && (
                <span className="absolute -right-1 -top-1 rounded-full bg-success p-1 text-white">
                  <Check size={14} />
                </span>
              )}
            </button>
          ))}
        </div>

        <Button full variant="accent" onClick={save}>
          Create Card / कार्ड बनाउनुहोस्
        </Button>
      </div>
    </Screen>
  )
}

function WheelBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="h-14 w-14 rounded-2xl bg-orange text-3xl font-extrabold text-white shadow-[0_4px_0_0_#e54f24]"
    >
      {children}
    </motion.button>
  )
}
