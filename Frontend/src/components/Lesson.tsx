import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, GraduationCap, Play, Check, X } from 'lucide-react'
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

        <div className="mt-2 flex items-center gap-2 font-bold text-teal">
          <GraduationCap size={20} />
          <span>{t('letsLearnFirst')}</span>
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
                  <div className="mt-4 grid grid-cols-1 gap-3">
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
                          className={`flex min-h-[60px] items-center justify-center gap-2 rounded-2xl p-3 text-lg font-extrabold shadow-[0_4px_0_0_rgba(0,0,0,0.08)] ${style}`}
                        >
                          {picked !== null && isAns && <Check size={20} />}
                          {isPicked && !isAns && <X size={20} />}
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
                        className={`mt-4 rounded-2xl p-4 font-semibold ${
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
                <div className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_-15px_rgba(13,168,167,0.5)]">
                  <h2 className="text-center text-2xl font-extrabold text-teal">
                    {step?.title}
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-center text-lg font-semibold leading-relaxed text-[#444]">
                    {step?.body}
                  </p>
                  <div className="mt-4 flex justify-center">
                    <Mascot mood="happy" size={84} />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* controls */}
        <div className="flex items-center gap-3">
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
