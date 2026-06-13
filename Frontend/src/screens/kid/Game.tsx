import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { X, Heart, HeartCrack } from 'lucide-react'
import { Screen, Button, Loading } from '../../components/ui'
import Mascot from '../../components/Mascot'
import Figure from '../../components/Figure'
import MatchQuestion from '../../components/MatchQuestion'
import OrderQuestion from '../../components/OrderQuestion'
import SpeakQuestion from '../../components/SpeakQuestion'
import Lesson from '../../components/Lesson'
import { useGame } from '../../store/GameStore'
import { api } from '../../lib/api'
import { burst, cue } from '../../lib/confetti'
import { deriveLesson } from '../../lib/lesson'
import { useT, useLang } from '../../lib/lang'

const PASTELS = ['#FFE3D6', '#D8F3F2', '#FFF3C4', '#E2F5E4']
const PASTEL_TEXT = ['#c2410c', '#0a8584', '#a07c00', '#15803d']

export default function Game() {
  const { packId, seq } = useParams()
  const nav = useNavigate()
  const t = useT()
  const { lang } = useLang()
  const { activeChild, packs, loseHeart, completeLevel, ready } = useGame()
  const pack = packs.find((p) => p.id === packId)

  const questions = useMemo(() => {
    if (!pack) return []
    const lvl = pack.levels.find((l) => l.sequenceNo === Number(seq))
    if (!lvl) return []
    return lvl.questionIds
      .map((id) => pack.questions.find((q) => q.id === id))
      .filter(Boolean) as NonNullable<(typeof pack.questions)[number]>[]
  }, [pack, seq])

  const lessonCards = useMemo(() => {
    if (!pack) return []
    const lvl = pack.levels.find((l) => l.sequenceNo === Number(seq))
    if (lvl?.teach && lvl.teach.length) return lvl.teach
    return deriveLesson(questions)
  }, [pack, seq, questions])

  const [phase, setPhase] = useState<'learn' | 'quiz'>('learn')
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [answered, setAnswered] = useState<{ correct: boolean } | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [showXp, setShowXp] = useState(false)
  const [shake, setShake] = useState(false)
  const [broke, setBroke] = useState(false)
  const [breakTime, setBreakTime] = useState(false)
  const startRef = useRef<number>(Date.now())

  useEffect(() => {
    startRef.current = Date.now()
  }, [idx])

  if (!ready) return <Loading />
  if (!activeChild) return <Navigate to="/kid/scan" replace />
  if (!pack || questions.length === 0) return <Navigate to="/kid/home" replace />

  // Teach first (Duolingo/SoloLearn style), then the questions.
  if (phase === 'learn' && lessonCards.length > 0) {
    return (
      <Lesson
        cards={lessonCards}
        onStart={() => setPhase('quiz')}
        onExit={() => nav('/kid/home')}
      />
    )
  }

  const q = questions[idx]
  const kind = q.kind ?? 'mcq'

  const resolve = (correct: boolean, selected: string) => {
    if (answered) return
    setAnswered({ correct })
    const newCorrect = correctCount + (correct ? 1 : 0)

    // log this attempt (timing + correctness) for the parent dashboard
    api
      .logAttempt(activeChild.id, {
        packId: pack.id,
        questionId: q.id,
        sequenceNo: Number(seq),
        correct,
        timeMs: Date.now() - startRef.current,
        selected,
      })
      .catch(() => {})

    if (correct) {
      cue('correct')
      burst()
      setShowXp(true)
      setCorrectCount(newCorrect)
      setTimeout(() => setShowXp(false), 1000)
      setTimeout(() => next(newCorrect), 1100)
    } else {
      cue('wrong')
      setShake(true)
      setBroke(true)
      loseHeart(activeChild.id)
      setTimeout(() => setShake(false), 450)
      setTimeout(() => setBroke(false), 900)
      if (activeChild.hearts - 1 <= 0) {
        setTimeout(() => setBreakTime(true), 1500)
      } else {
        setTimeout(() => next(newCorrect), 2400)
      }
    }
  }

  const chooseMcq = (i: number) => {
    if (answered) return
    setPicked(i)
    resolve(i === q.correctIndex, q.options[i])
  }

  const next = async (finalCorrect: number) => {
    if (idx + 1 >= questions.length) {
      const result = await completeLevel(
        activeChild.id,
        pack.id,
        Number(seq),
        finalCorrect,
        questions.length,
      )
      nav('/kid/complete', {
        state: {
          ...result,
          correct: finalCorrect,
          total: questions.length,
          packId: pack.id,
          seq: Number(seq),
        },
      })
    } else {
      setIdx((i) => i + 1)
      setPicked(null)
      setAnswered(null)
    }
  }

  if (breakTime) {
    return <BreakScreen onHome={() => nav('/kid/home')} />
  }

  const kindLabel =
    kind === 'match'
      ? t('matchThePairs')
      : kind === 'order'
        ? t('dragIntoOrder')
        : kind === 'speak'
          ? t('sayItOutLoud')
          : null

  // For Nepali subject, always show both languages. For other subjects, respect language setting
  const isNepaliSubject = pack.subject === 'nepali'
  const questionText = isNepaliSubject || lang === 'en' ? q.text : (q.textNp || q.text)
  const showNepaliSubtitle = (isNepaliSubject || lang === 'both') && q.textNp

  return (
    <Screen>
      <div className="flex min-h-svh flex-col bg-cream">
        {/* top bar */}
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => nav('/kid/home')} className="text-[#999]">
            <X size={26} />
          </button>
          <div className="flex flex-1 gap-1.5">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-2.5 flex-1 rounded-full ${
                  i < idx ? 'bg-success' : i === idx ? 'bg-teal' : 'bg-mist'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-0.5">
            {[0, 1, 2].map((i) => {
              const filled = i < activeChild.hearts
              const breaking = broke && i === activeChild.hearts
              return breaking ? (
                <motion.span key={i} animate={{ scale: [1, 1.4, 0], rotate: [0, -20, 20] }}>
                  <HeartCrack size={24} className="fill-heart text-heart" />
                </motion.span>
              ) : (
                <Heart
                  key={i}
                  size={24}
                  className={filled ? 'fill-heart text-heart' : 'fill-mist text-mist'}
                />
              )
            })}
          </div>
        </div>

        {/* question */}
        <div className="flex flex-1 flex-col px-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="flex flex-1 flex-col"
            >
              <div className="relative mt-2 rounded-3xl bg-white p-6 text-center shadow-sm">
                {kindLabel && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-orange px-3 py-0.5 text-xs font-bold text-white">
                    {kindLabel}
                  </span>
                )}
                {q.figure && (
                  <div className="mb-3 flex justify-center">
                    <Figure kind={q.figure} />
                  </div>
                )}
                <div className="text-2xl font-extrabold text-[#333]">{questionText}</div>
                {showNepaliSubtitle && (
                  <div className="mt-1 text-lg font-semibold text-orange">{q.textNp}</div>
                )}
              </div>

              {/* floating XP */}
              <div className="relative">
                <AnimatePresence>
                  {showXp && (
                    <motion.div
                      initial={{ opacity: 0, y: 0 }}
                      animate={{ opacity: 1, y: -50 }}
                      exit={{ opacity: 0 }}
                      className="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2 text-3xl font-extrabold text-gold drop-shadow"
                    >
                      +10 XP
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* answer area by kind */}
              {kind === 'mcq' && (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {q.options.map((opt, i) => {
                    const isCorrect = i === q.correctIndex
                    const isPicked = picked === i
                    let style = ''
                    if (answered) {
                      if (isCorrect) style = 'bg-success text-white'
                      else if (isPicked) style = 'bg-heart text-white'
                      else style = 'opacity-50'
                    }
                    return (
                      <motion.button
                        key={i}
                        whileTap={{ scale: 0.95 }}
                        animate={isPicked && shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                        onClick={() => chooseMcq(i)}
                        style={
                          !answered
                            ? { background: PASTELS[i], color: PASTEL_TEXT[i] }
                            : undefined
                        }
                        className={`flex min-h-[88px] items-center justify-center rounded-3xl p-3 text-center text-xl font-extrabold shadow-[0_5px_0_0_rgba(0,0,0,0.08)] ${style}`}
                      >
                        {opt}
                      </motion.button>
                    )
                  })}
                </div>
              )}

              {kind === 'match' && q.pairs && (
                <MatchQuestion
                  pairs={q.pairs}
                  disabled={!!answered}
                  onResult={(correct) => resolve(correct, 'match')}
                />
              )}

              {kind === 'order' && q.sequence && (
                <OrderQuestion
                  sequence={q.sequence}
                  disabled={!!answered}
                  onResult={(correct) => resolve(correct, 'order')}
                />
              )}

              {kind === 'speak' && (
                <SpeakQuestion
                  key={q.id}
                  packId={pack.id}
                  questionId={q.id}
                  questionText={q.text}
                  disabled={!!answered}
                  onResult={(correct, transcript) =>
                    resolve(correct, transcript || 'speak')
                  }
                />
              )}

              {/* explanation on wrong */}
              <AnimatePresence>
                {answered && !answered.correct && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center gap-3 rounded-2xl bg-orange/10 p-4"
                  >
                    <Mascot mood="sad" size={56} />
                    <p className="font-semibold text-[#a05a2c]">{q.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
          <div className="h-6" />
        </div>
      </div>
    </Screen>
  )
}

function BreakScreen({ onHome }: { onHome: () => void }) {
  const t = useT()
  const [left, setLeft] = useState(300)
  useEffect(() => {
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000)
    return () => clearInterval(t)
  }, [])
  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')
  return (
    <Screen>
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-gradient-to-b from-teal/15 to-cream px-8 text-center">
        <Mascot mood="sleep" size={160} />
        <h1 className="text-3xl font-extrabold text-teal">{t('takeABreak')}</h1>
        <p className="font-semibold text-orange">{t('heartRefill')}</p>
        <div className="my-2 rounded-2xl bg-white px-8 py-4 text-4xl font-extrabold text-teal shadow">
          {mm}:{ss}
        </div>
        <Button variant="primary" onClick={onHome}>
          {t('backHome')}
        </Button>
      </div>
    </Screen>
  )
}
