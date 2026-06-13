import { useState, useEffect } from 'react'
import { motion, Reorder } from 'framer-motion'
import { GripVertical } from 'lucide-react'
import { cue } from '../lib/confetti'

interface Props {
  sequence: string[]
  onCorrect: () => void
}

export default function OrderPuzzle({ sequence, onCorrect }: Props) {
  const [items, setItems] = useState<string[]>([])
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // Scramble the sequence
    setItems([...sequence].sort(() => Math.random() - 0.5))
    setChecked(false)
  }, [sequence])

  const checkOrder = () => {
    if (checked) return
    setChecked(true)
    
    const isCorrect = items.every((item, i) => item === sequence[i])
    
    if (isCorrect) {
      cue('correct')
      setTimeout(() => onCorrect(), 500)
    } else {
      cue('wrong')
      setTimeout(() => {
        setItems([...sequence].sort(() => Math.random() - 0.5))
        setChecked(false)
      }, 1200)
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-center text-sm font-semibold text-gray-600">
        Drag to reorder these items
      </p>

      <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-3">
        {items.map((item, i) => {
          const isCorrect = checked && item === sequence[i]
          const isWrong = checked && item !== sequence[i]
          
          return (
            <Reorder.Item
              key={item}
              value={item}
              className={`flex items-center gap-3 rounded-xl p-4 shadow-md cursor-grab active:cursor-grabbing ${
                isCorrect
                  ? 'bg-success text-white'
                  : isWrong
                  ? 'bg-heart text-white'
                  : 'bg-white text-gray-900'
              }`}
            >
              <GripVertical size={20} className="text-gray-400" />
              <span className="flex-1 text-lg font-bold">{item}</span>
              {checked && (
                <span className="text-2xl">
                  {isCorrect ? '✓' : '✗'}
                </span>
              )}
            </Reorder.Item>
          )
        })}
      </Reorder.Group>

      {!checked && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={checkOrder}
          className="w-full rounded-xl bg-teal py-4 text-lg font-extrabold text-white shadow-md"
        >
          Check Order
        </motion.button>
      )}
    </div>
  )
}
