import { useState } from 'react'
import { motion } from 'framer-motion'
import { cue } from '../lib/confetti'

interface Props {
  word: string
  missingIndex: number
  options: string[]
  onCorrect: () => void
}

export default function MissingLetterPuzzle({ word, missingIndex, options, onCorrect }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [solved, setSolved] = useState(false)

  const selectOption = (option: string) => {
    if (solved) return
    setSelected(option)
    
    if (option.toUpperCase() === word[missingIndex].toUpperCase()) {
      setSolved(true)
      cue('correct')
      setTimeout(() => onCorrect(), 500)
    } else {
      cue('wrong')
      setTimeout(() => setSelected(null), 800)
    }
  }

  const letters = word.split('')

  return (
    <div className="space-y-6">
      {/* Word with missing letter */}
      <div className="flex justify-center gap-2">
        {letters.map((letter, i) => (
          <div
            key={i}
            className={`flex h-16 w-12 items-center justify-center rounded-xl text-3xl font-extrabold ${
              i === missingIndex
                ? selected
                  ? selected.toUpperCase() === letter.toUpperCase()
                    ? 'bg-success text-white'
                    : 'bg-heart text-white'
                  : 'border-2 border-dashed border-teal bg-white'
                : 'bg-teal/10 text-teal'
            }`}
          >
            {i === missingIndex ? (selected || '?') : letter}
          </div>
        ))}
      </div>

      {/* Options */}
      <div className="flex justify-center gap-3">
        {options.map((option, i) => {
          const isCorrect = option.toUpperCase() === word[missingIndex].toUpperCase()
          const isSelected = selected === option
          let style = 'bg-white text-teal border-2 border-gray-100'
          
          if (selected) {
            if (isCorrect) style = 'bg-success text-white'
            else if (isSelected) style = 'bg-heart text-white'
            else style = 'bg-white text-gray-300 opacity-50'
          }

          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => selectOption(option)}
              disabled={!!selected}
              className={`flex h-16 w-14 items-center justify-center rounded-xl text-2xl font-extrabold shadow-md ${style}`}
            >
              {option}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
