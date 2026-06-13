import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cue } from '../lib/confetti'

interface Props {
  word: string
  onCorrect: () => void
}

export default function WordPuzzle({ word, onCorrect }: Props) {
  const [letters, setLetters] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [solved, setSolved] = useState(false)

  useEffect(() => {
    // Scramble letters
    const scrambled = word.split('').sort(() => Math.random() - 0.5)
    setLetters(scrambled)
    setSelected([])
    setSolved(false)
  }, [word])

  const selectLetter = (index: number) => {
    if (solved) return
    const letter = letters[index]
    setSelected([...selected, letter])
    setLetters(letters.filter((_, i) => i !== index))

    // Check if complete
    if (selected.length + 1 === word.length) {
      const attempt = [...selected, letter].join('')
      if (attempt.toUpperCase() === word.toUpperCase()) {
        setSolved(true)
        cue('correct')
        setTimeout(() => onCorrect(), 500)
      } else {
        cue('wrong')
        setTimeout(() => {
          setLetters(word.split('').sort(() => Math.random() - 0.5))
          setSelected([])
        }, 800)
      }
    }
  }

  const unselectLetter = (index: number) => {
    if (solved) return
    const letter = selected[index]
    setLetters([...letters, letter])
    setSelected(selected.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Selected letters area */}
      <div className="flex min-h-[80px] items-center justify-center gap-2 rounded-2xl bg-teal/5 p-4 border-2 border-dashed border-teal/30">
        {selected.length === 0 ? (
          <span className="text-sm font-semibold text-gray-400">Tap letters to build the word</span>
        ) : (
          selected.map((letter, i) => (
            <motion.button
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => unselectLetter(i)}
              className="flex h-14 w-12 items-center justify-center rounded-xl bg-teal text-2xl font-extrabold text-white shadow-md"
            >
              {letter}
            </motion.button>
          ))
        )}
      </div>

      {/* Available letters */}
      <div className="flex flex-wrap justify-center gap-3">
        {letters.map((letter, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.9 }}
            onClick={() => selectLetter(i)}
            className="flex h-14 w-12 items-center justify-center rounded-xl bg-white text-2xl font-extrabold text-teal shadow-md border-2 border-gray-100 hover:border-teal/30"
          >
            {letter}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
