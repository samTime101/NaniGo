import { useMemo, useState } from 'react'
import { Reorder, motion } from 'framer-motion'
import { GripVertical, Check } from 'lucide-react'

interface Props {
  sequence: string[]
  disabled: boolean
  onResult: (correct: boolean) => void
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  // avoid an already-correct shuffle
  if (a.join('|') === arr.join('|') && arr.length > 1) {
    ;[a[0], a[1]] = [a[1], a[0]]
  }
  return a
}

/** Drag items into the correct order, then tap Check. */
export default function OrderQuestion({ sequence, disabled, onResult }: Props) {
  const initial = useMemo(() => shuffle(sequence), [sequence])
  const [items, setItems] = useState<string[]>(initial)
  const [done, setDone] = useState(false)

  const check = () => {
    if (done || disabled) return
    setDone(true)
    const correct = items.join('|') === sequence.join('|')
    setTimeout(() => onResult(correct), 300)
  }

  return (
    <div className="mt-4">
      <Reorder.Group axis="y" values={items} onReorder={setItems} className="flex flex-col gap-2">
        {items.map((item, idx) => (
          <Reorder.Item
            key={item}
            value={item}
            dragListener={!(disabled || done)}
            whileDrag={{ scale: 1.04, boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
            className="flex min-h-[56px] cursor-grab items-center gap-3 rounded-2xl bg-white px-4 py-2 font-bold text-[#444] shadow-sm active:cursor-grabbing"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal text-sm text-white">
              {idx + 1}
            </span>
            <span className="flex-1">{item}</span>
            <GripVertical size={20} className="text-[#bbb]" />
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <motion.button
        whileTap={{ scale: 0.96 }}
        disabled={disabled || done}
        onClick={check}
        className="mt-4 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-teal text-xl font-extrabold text-white shadow-[0_5px_0_0_#0a8584] disabled:opacity-50"
      >
        <Check size={22} /> Check / जाँच
      </motion.button>
    </div>
  )
}
