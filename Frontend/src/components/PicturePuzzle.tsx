import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cue } from '../lib/confetti'

interface PicturePair {
  id: string
  image: string
  label: string
}

interface Props {
  pairs: PicturePair[]
  onCorrect: () => void
}

export default function PicturePuzzle({ pairs, onCorrect }: Props) {
  const [images, setImages] = useState<PicturePair[]>([])
  const [labels, setLabels] = useState<PicturePair[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrong, setWrong] = useState<{ image: string; label: string } | null>(null)

  useEffect(() => {
    setImages([...pairs])
    setLabels([...pairs].sort(() => Math.random() - 0.5))
    setMatched(new Set())
    setSelectedImage(null)
    setSelectedLabel(null)
  }, [pairs])

  const selectImage = (id: string) => {
    if (matched.has(id) || wrong) return
    setSelectedImage(id)
    
    if (selectedLabel) {
      checkMatch(id, selectedLabel)
    }
  }

  const selectLabel = (id: string) => {
    if (matched.has(id) || wrong) return
    setSelectedLabel(id)
    
    if (selectedImage) {
      checkMatch(selectedImage, id)
    }
  }

  const checkMatch = (imageId: string, labelId: string) => {
    if (imageId === labelId) {
      cue('correct')
      const newMatched = new Set(matched).add(imageId)
      setMatched(newMatched)
      setSelectedImage(null)
      setSelectedLabel(null)
      
      if (newMatched.size === pairs.length) {
        setTimeout(() => onCorrect(), 500)
      }
    } else {
      cue('wrong')
      setWrong({ image: imageId, label: labelId })
      setTimeout(() => {
        setWrong(null)
        setSelectedImage(null)
        setSelectedLabel(null)
      }, 800)
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-center text-sm font-semibold text-gray-600">
        Tap an image, then tap its matching label
      </p>

      {/* Images */}
      <div className="grid grid-cols-3 gap-3">
        {images.map((pair) => {
          const isMatched = matched.has(pair.id)
          const isSelected = selectedImage === pair.id
          const isWrong = wrong?.image === pair.id

          return (
            <motion.button
              key={pair.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => selectImage(pair.id)}
              disabled={isMatched}
              className={`aspect-square rounded-xl overflow-hidden border-4 ${
                isMatched
                  ? 'border-success opacity-60'
                  : isSelected
                  ? 'border-teal'
                  : isWrong
                  ? 'border-heart'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex h-full w-full items-center justify-center bg-white text-4xl">
                {pair.image}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Labels */}
      <div className="flex flex-col gap-2">
        {labels.map((pair) => {
          const isMatched = matched.has(pair.id)
          const isSelected = selectedLabel === pair.id
          const isWrong = wrong?.label === pair.id

          return (
            <motion.button
              key={pair.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectLabel(pair.id)}
              disabled={isMatched}
              className={`rounded-xl p-4 text-lg font-bold ${
                isMatched
                  ? 'bg-success text-white opacity-60'
                  : isSelected
                  ? 'bg-teal text-white'
                  : isWrong
                  ? 'bg-heart text-white'
                  : 'bg-white text-gray-900 border-2 border-gray-200'
              }`}
            >
              {pair.label}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
