import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { MatchPair } from '../types'

const RIGHT_COLORS = ['#FFE3D6', '#D8F3F2', '#FFF3C4', '#E2F5E4', '#EDE0FF']

interface Props {
  pairs: MatchPair[]
  disabled: boolean
  onResult: (correct: boolean) => void
}

/** Tap a left item, then tap a right item to connect them. */
export default function MatchQuestion({ pairs, disabled, onResult }: Props) {
  const rights = useMemo(
    () => pairs.map((p) => p.right).sort(() => Math.random() - 0.5),
    [pairs],
  )
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [matches, setMatches] = useState<Record<number, string>>({})
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (done) return
    if (Object.keys(matches).length === pairs.length) {
      const allCorrect = pairs.every((p, i) => matches[i] === p.right)
      setDone(true)
      setTimeout(() => onResult(allCorrect), 400)
    }
  }, [matches, pairs, onResult, done])

  const usedRights = new Set(Object.values(matches))

  const pickRight = (right: string) => {
    if (disabled || done || selectedLeft === null) return
    setMatches((m) => ({ ...m, [selectedLeft]: right }))
    setSelectedLeft(null)
  }

  return (
    <div className="mt-4 flex gap-3">
      <div className="flex flex-1 flex-col gap-2">
        {pairs.map((p, i) => {
          const matched = matches[i]
          const isSel = selectedLeft === i
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.96 }}
              disabled={disabled || done || !!matched}
              onClick={() => setSelectedLeft(i)}
              className={`min-h-[56px] rounded-2xl px-3 py-2 text-left font-bold shadow-sm ${
                isSel
                  ? 'bg-teal text-white'
                  : matched
                    ? 'bg-success/15 text-success'
                    : 'bg-white text-[#444]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span>{p.left}</span>
                {matched && (
                  <span className="rounded-lg bg-white/30 px-2 py-0.5 text-sm">
                    {matched}
                  </span>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {rights.map((r, i) => {
          const used = usedRights.has(r)
          return (
            <motion.button
              key={r}
              whileTap={{ scale: 0.96 }}
              disabled={disabled || done || used}
              onClick={() => pickRight(r)}
              style={{ background: used ? '#eef2f0' : RIGHT_COLORS[i % RIGHT_COLORS.length] }}
              className={`flex min-h-[56px] items-center justify-center rounded-2xl px-3 py-2 font-bold shadow-sm ${
                used ? 'text-[#aaa]' : 'text-[#5a4a2a]'
              }`}
            >
              {used ? <Check size={20} /> : r}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
