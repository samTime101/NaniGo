import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Play, Volume2 } from 'lucide-react'
import { Screen } from './ui'
import Mascot from './Mascot'
import { cue } from '../lib/confetti'
import { useT } from '../lib/lang'
import type { LessonStep } from '../types'

interface Props {
  cards: LessonStep[]
  onStart: () => void
  onExit: () => void
}

const PASTELS = ['#FFE3D6', '#D8F3F2', '#FFF3C4', '#E2F5E4']
const PASTEL_TEXT = ['#c2410c', '#0a8584', '#a07c00', '#15803d']

/**
 * Duolingo/SoloLearn-style interactive "teach first" screen. Walks the child
 * through teach steps and quick tap-to-check exercises before the questions.
 */
export default function Lesson({ cards, onStart, onExit }: Props) {
  const t = useT()
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const step = cards[i]
  const last = i === cards.length - 1
  const isTap = step?.kind === 'tap'
  
  const answeredCorrect =
    isTap && picked !== null && picked === step.correctIndex

  const goNext = () => {
    if (last) {
      onStart()
      return
    }
    setI((v) => v + 1)
    setPicked(null)
  }

  const goPrev = () => {
    if (i === 0) return
    setI((v) => v - 1)
    setPicked(null)
  }

  const pick = (idx: number) => {
    if (!isTap || answeredCorrect) return
    setPicked(idx)
    cue(idx === step.correctIndex ? 'correct' : 'wrong')
  }

  // A tap step must be answered correctly before continuing.
  const canContinue = !isTap || answeredCorrect

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <Screen>
      <div className="flex min-h-svh flex-col bg-gradient-to-b from-[#e7f6e9] via-cream to-cream px-5 pb-8 pt-5">
        {/* header */}
        <div className="flex items-center gap-3">
          <button onClick={onExit} className="text-[#999]">
            <ArrowLeft size={26} />
          </button>
          <div className="flex flex-1 gap-1.5">
            {cards.map((_, k) => (
              <div
                key={k}
                className={`h-2.5 flex-1 rounded-full ${
                  k < i ? 'bg-success' : k === i ? 'bg-teal' : 'bg-mist'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 mb-4">
          <h2 className="text-center text-base font-extrabold text-teal">
            {t('letsLearnFirst')}
          </h2>
        </div>

        {/* step */}
        <div className="flex flex-1 flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="w-full"
            >
              {isTap ? (
                <div>
                  <div className="rounded-3xl bg-white p-6 text-center shadow-[0_12px_30px_-15px_rgba(13,168,167,0.5)]">
                    <span className="text-xs font-bold uppercase tracking-wide text-orange">
                      {step.title || t('quickCheck')}
                    </span>
                    <p className="mt-2 text-2xl font-extrabold text-[#333]">
                      {step.question}
                    </p>
                  </div>
                  <div className="mt-5 grid grid-cols-1 gap-4">
                    {step.options?.map((opt, k) => {
                      const isAns = k === step.correctIndex
                      const isPicked = picked === k
                      let style = ''
                      if (picked !== null) {
                        if (isAns) style = 'bg-success text-white'
                        else if (isPicked) style = 'bg-heart text-white'
                        else style = 'opacity-50'
                      }
                      return (
                        <motion.button
                          key={k}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => pick(k)}
                          style={
                            picked === null
                              ? { background: PASTELS[k % 4], color: PASTEL_TEXT[k % 4] }
                              : undefined
                          }
                          className={`flex min-h-[68px] items-center justify-center rounded-3xl px-4 py-4 text-lg font-extrabold shadow-[0_6px_0_0_rgba(0,0,0,0.08)] ${style}`}
                        >
                          {opt}
                        </motion.button>
                      )
                    })}
                  </div>
                  <AnimatePresence>
                    {picked !== null && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-5 rounded-3xl px-5 py-4 text-sm font-semibold leading-relaxed ${
                          answeredCorrect
                            ? 'bg-success/10 text-success'
                            : 'bg-orange/10 text-[#a05a2c]'
                        }`}
                      >
                        {answeredCorrect
                          ? `${t('correct')} ${step.explanation ?? ''}`
                          : `${t('notQuiteAgain')} ${step.explanation ?? ''}`}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div 
                  className="rounded-3xl bg-white px-6 py-8 shadow-[0_12px_30px_-15px_rgba(13,168,167,0.5)]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Mascot at top */}
                  <div className="mb-5 flex justify-center">
                    <Mascot mood="happy" size={96} />
                  </div>

                  {/* Title */}
                  <h3 className="text-center text-2xl font-extrabold text-teal">
                    {step?.title}
                  </h3>
                  
                  {/* Content in a highlighted box */}
                  <div className="mt-5 rounded-2xl bg-orange/5 px-5 py-6 border-2 border-dashed border-orange/30">
                    <p className="whitespace-pre-line text-center text-lg font-bold leading-loose text-[#333]">
                      {step?.body}
                    </p>
                  </div>
                  
                  {/* Big colorful audio button */}
                  <div className="mt-6 flex justify-center">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => playAudio(step?.body || '')}
                      className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-orange to-[#ff7849] px-8 py-4 text-lg font-extrabold text-white shadow-[0_6px_0_0_#e54f24] active:translate-y-1 active:shadow-[0_2px_0_0_#e54f24]"
                    >
                      <Volume2 size={24} />
                      <span>{t('readAloud')}</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* controls */}
        <div className="flex items-center gap-3 pt-4">
          {i > 0 && (
            <button
              onClick={goPrev}
              className="flex h-14 items-center justify-center rounded-2xl bg-white px-5 font-bold text-teal shadow-sm"
            >
              <ArrowLeft size={22} />
            </button>
          )}
          <motion.button
            whileTap={{ scale: 0.96 }}
            disabled={!canContinue}
            onClick={goNext}
            className={`flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl text-xl font-extrabold text-white active:translate-y-[3px] disabled:opacity-40 ${
              last
                ? 'bg-orange shadow-[0_6px_0_0_#e54f24]'
                : 'bg-teal shadow-[0_6px_0_0_#0a8584]'
            }`}
          >
            {last ? (
              <>
                <Play size={22} /> {t('startQuestions')}
              </>
            ) : (
              <>
                {t('continue')} <ArrowRight size={22} />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </Screen>
  )
}
