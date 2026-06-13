import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigate, useNavigate } from 'react-router-dom'
import { Zap, Crown, RotateCw, ArrowLeft } from 'lucide-react'
import { Screen, Button, Loading } from '../../components/ui'
import Avatar from '../../components/Avatar'
import { BottomNav } from '../../components/KidChrome'
import WordPuzzle from '../../components/WordPuzzle'
import MissingLetterPuzzle from '../../components/MissingLetterPuzzle'
import OrderPuzzle from '../../components/OrderPuzzle'
import PicturePuzzle from '../../components/PicturePuzzle'
import { useGame } from '../../store/GameStore'
import { cue } from '../../lib/confetti'
import { useT } from '../../lib/lang'
import type { AvatarId } from '../../types'

type Phase = 'match' | 'vs' | 'play' | 'result'
type PuzzleType = 'mcq' | 'word' | 'missing' | 'order' | 'picture'

interface BattleQuestion {
  type: PuzzleType
  text: string
  // MCQ fields
  options?: string[]
  correctIndex?: number
  // Puzzle fields
  word?: string
  missingIndex?: number
  letterOptions?: string[]
  sequence?: string[]
  pairs?: Array<{ id: string; image: string; label: string }>
}

const BOTS: { name: string; avatar: AvatarId }[] = [
  { name: 'Bibek', avatar: 'monkey' },
  { name: 'Priya', avatar: 'rabbit' },
  { name: 'Sushant', avatar: 'rhino' },
]

export default function Battle() {
  const nav = useNavigate()
  const t = useT()
  const { activeChild, packs, awardXp, ready } = useGame()
  const [phase, setPhase] = useState<Phase>('match')
  const [qIdx, setQIdx] = useState(0)
  const [myScore, setMyScore] = useState(0)
  const [botScore, setBotScore] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(15)

  const bot = useMemo(() => BOTS[Math.floor(Math.random() * BOTS.length)], [])
  
  const questions: BattleQuestion[] = useMemo(() => {
    const puzzles: BattleQuestion[] = [
      // MCQ questions
      {
        type: 'mcq',
        text: 'What is 5 + 3?',
        options: ['6', '8', '10', '7'],
        correctIndex: 1,
      },
      {
        type: 'mcq',
        text: 'How many sides does a triangle have?',
        options: ['2', '3', '4', '5'],
        correctIndex: 1,
      },
      // Word puzzles
      {
        type: 'word',
        text: 'Build this word:',
        word: 'HELLO',
      },
      {
        type: 'word',
        text: 'Unscramble the word:',
        word: 'APPLE',
      },
      // Missing letter puzzles
      {
        type: 'missing',
        text: 'Fill in the missing letter:',
        word: 'WORLD',
        missingIndex: 1,
        letterOptions: ['O', 'A', 'E', 'I'],
      },
      {
        type: 'missing',
        text: 'Complete the word:',
        word: 'HAPPY',
        missingIndex: 2,
        letterOptions: ['P', 'B', 'D', 'T'],
      },
      // Order puzzles
      {
        type: 'order',
        text: 'Put these in order:',
        sequence: ['1st', '2nd', '3rd'],
      },
      {
        type: 'order',
        text: 'Arrange from smallest to largest:',
        sequence: ['Small', 'Medium', 'Large'],
      },
      // Picture puzzles
      {
        type: 'picture',
        text: 'Match the pictures:',
        pairs: [
          { id: '1', image: '🐶', label: 'Dog' },
          { id: '2', image: '🐱', label: 'Cat' },
          { id: '3', image: '🐭', label: 'Mouse' },
        ],
      },
      {
        type: 'picture',
        text: 'Match the fruits:',
        pairs: [
          { id: '1', image: '🍎', label: 'Apple' },
          { id: '2', image: '🍌', label: 'Banana' },
          { id: '3', image: '🍊', label: 'Orange' },
        ],
      },
    ]
    
    // Shuffle and pick 5 random puzzles
    return puzzles.sort(() => Math.random() - 0.5).slice(0, 5)
  }, [])

  // matchmaking -> vs -> play
  useEffect(() => {
    if (phase === 'match') {
      const t = setTimeout(() => setPhase('vs'), 2400)
      return () => clearTimeout(t)
    }
    if (phase === 'vs') {
      const t = setTimeout(() => setPhase('play'), 1800)
      return () => clearTimeout(t)
    }
  }, [phase])

  // countdown per question
  useEffect(() => {
    if (phase !== 'play' || picked !== null) return
    setTimeLeft(15)
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t)
          answer(-1)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qIdx])

  if (!ready) return <Loading />
  if (!activeChild) return <Navigate to="/kid/scan" replace />

  const q = questions[qIdx]

  const handlePuzzleCorrect = () => {
    if (picked !== null) return
    setPicked(1) // Mark as answered correctly
    const speedBonus = Math.round((timeLeft / 15) * 100)
    cue('correct')
    setMyScore((s) => s + 100 + speedBonus)

    // Bot answers with random timing
    const botCorrect = Math.random() < 0.7
    if (botCorrect) {
      const botBonus = Math.round(Math.random() * 80) + 20
      setBotScore((s) => s + 100 + botBonus)
    }

    setTimeout(() => {
      if (qIdx + 1 >= questions.length) {
        setPhase('result')
      } else {
        setQIdx((n) => n + 1)
        setPicked(null)
      }
    }, 1200)
  }

  const answer = (i: number) => {
    if (picked !== null || q.type !== 'mcq') return
    setPicked(i)
    const correct = i === q?.correctIndex
    const speedBonus = Math.round((timeLeft / 15) * 100)
    if (correct) {
      cue('correct')
      setMyScore((s) => s + 100 + speedBonus)
    } else {
      cue('wrong')
    }
    // bot answers ~70% correct with random speed
    const botCorrect = Math.random() < 0.7
    if (botCorrect) {
      const botBonus = Math.round(Math.random() * 80) + 20
      setBotScore((s) => s + 100 + botBonus)
    }
    setTimeout(() => {
      if (qIdx + 1 >= questions.length) {
        setPhase('result')
      } else {
        setQIdx((n) => n + 1)
        setPicked(null)
      }
    }, 1200)
  }

  // ---------- render phases ----------
  if (phase === 'match') {
    return (
      <Screen>
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-b from-orange to-orange-dark text-white">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}>
            <Zap size={70} className="fill-gold text-gold" />
          </motion.div>
          <h1 className="text-2xl font-extrabold">{t('findOpponent')}</h1>
        </div>
      </Screen>
    )
  }

  if (phase === 'vs') {
    return (
      <Screen>
        <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-gradient-to-b from-teal to-teal-dark text-white">
          <motion.div initial={{ x: -200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col items-center gap-2">
            <Avatar id={activeChild.avatar} size={96} ring />
            <span className="font-extrabold">{activeChild.name}</span>
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.4, 1] }}
            className="mx-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold text-2xl font-extrabold text-orange-dark"
          >
            VS
          </motion.div>
          <motion.div initial={{ x: 200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col items-center gap-2">
            <Avatar id={bot.avatar} size={96} ring />
            <span className="font-extrabold">{bot.name}</span>
          </motion.div>
        </div>
      </Screen>
    )
  }

  if (phase === 'result') {
    const won = myScore >= botScore
    return (
      <Screen>
        <div className="flex min-h-svh flex-col items-center justify-center gap-5 bg-gradient-to-b from-gold/30 to-cream px-8 text-center">
          <h1 className="text-3xl font-extrabold text-teal">
            {won ? t('youWon') : t('goodTry')}
          </h1>

          <div className="flex items-end gap-4">
            <Podium name={bot.name} avatar={bot.avatar} score={botScore} place={won ? 2 : 1} />
            <Podium name={activeChild.name} avatar={activeChild.avatar} score={myScore} place={won ? 1 : 2} me />
          </div>

          <div className="rounded-2xl bg-white px-8 py-3 font-extrabold text-gold shadow">
            +{won ? 50 : 20} {t('xp')}
          </div>

          <div className="flex w-full max-w-[320px] gap-3">
            <Button variant="white" full onClick={() => nav('/kid/home')}>
              <span className="flex items-center justify-center gap-2"><ArrowLeft size={18} /> {t('home')}</span>
            </Button>
            <Button
              variant="accent"
              full
              onClick={() => {
                awardXp(activeChild.id, won ? 50 : 20)
                setPhase('match')
                setQIdx(0)
                setMyScore(0)
                setBotScore(0)
                setPicked(null)
              }}
            >
              <span className="flex items-center justify-center gap-2"><RotateCw size={18} /> {t('rematch')}</span>
            </Button>
          </div>
        </div>
      </Screen>
    )
  }

  // play
  const total = myScore + botScore || 1
  return (
    <Screen>
      <div className="flex min-h-svh flex-col bg-cream">
        {/* split score bar */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <Avatar id={activeChild.avatar} size={40} />
            <span className="font-extrabold text-teal">{myScore}</span>
          </div>
          <div className="flex h-3 flex-1 overflow-hidden rounded-full bg-mist">
            <div className="bg-teal transition-all" style={{ width: `${(myScore / total) * 100}%` }} />
            <div className="bg-orange transition-all" style={{ width: `${(botScore / total) * 100}%` }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-orange">{botScore}</span>
            <Avatar id={bot.avatar} size={40} />
          </div>
        </div>

        {/* timer ring */}
        <div className="flex justify-center py-2">
          <div className="relative h-16 w-16">
            <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#dfe9e4" strokeWidth="4" />
              <circle
                cx="18" cy="18" r="16" fill="none" stroke="#FE6538" strokeWidth="4"
                strokeDasharray={100}
                strokeDashoffset={100 - (timeLeft / 15) * 100}
                pathLength={100}
                strokeLinecap="round"
                className="transition-all"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xl font-extrabold text-orange">
              {timeLeft}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col px-5">
          <AnimatePresence mode="wait">
            <motion.div key={qIdx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
                <div className="text-xl font-extrabold text-[#333]">{q?.text}</div>
              </div>

              {/* MCQ Questions */}
              {q?.type === 'mcq' && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {q.options?.map((opt, i) => {
                    let style = 'bg-white text-teal'
                    if (picked !== null) {
                      if (i === q.correctIndex) style = 'bg-success text-white'
                      else if (i === picked) style = 'bg-heart text-white'
                      else style = 'bg-white opacity-50'
                    }
                    return (
                      <motion.button
                        key={i}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => answer(i)}
                        className={`min-h-[80px] rounded-3xl text-xl font-extrabold shadow-[0_5px_0_0_rgba(0,0,0,0.08)] ${style}`}
                      >
                        {opt}
                      </motion.button>
                    )
                  })}
                </div>
              )}

              {/* Word Puzzle */}
              {q?.type === 'word' && q.word && picked === null && (
                <div className="mt-6">
                  <WordPuzzle word={q.word} onCorrect={handlePuzzleCorrect} />
                </div>
              )}

              {/* Missing Letter Puzzle */}
              {q?.type === 'missing' && q.word && q.missingIndex !== undefined && q.letterOptions && picked === null && (
                <div className="mt-6">
                  <MissingLetterPuzzle
                    word={q.word}
                    missingIndex={q.missingIndex}
                    options={q.letterOptions}
                    onCorrect={handlePuzzleCorrect}
                  />
                </div>
              )}

              {/* Order Puzzle */}
              {q?.type === 'order' && q.sequence && picked === null && (
                <div className="mt-6">
                  <OrderPuzzle sequence={q.sequence} onCorrect={handlePuzzleCorrect} />
                </div>
              )}

              {/* Picture Puzzle */}
              {q?.type === 'picture' && q.pairs && picked === null && (
                <div className="mt-6">
                  <PicturePuzzle pairs={q.pairs} onCorrect={handlePuzzleCorrect} />
                </div>
              )}

              {/* Solved indicator for puzzles */}
              {picked !== null && q?.type !== 'mcq' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 rounded-3xl bg-success p-6 text-center text-2xl font-extrabold text-white"
                >
                  ✓ Solved!
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <BottomNav />
      </div>
    </Screen>
  )
}

function Podium({
  name,
  avatar,
  score,
  place,
  me,
}: {
  name: string
  avatar: AvatarId
  score: number
  place: number
  me?: boolean
}) {
  const h = place === 1 ? 120 : 80
  const color = place === 1 ? '#FFD600' : '#dfe9e4'
  return (
    <div className="flex flex-col items-center gap-2">
      {place === 1 && <Crown className="text-gold" />}
      <Avatar id={avatar} size={64} ring={me} />
      <span className="font-bold text-[#444]">{name}</span>
      <span className="font-extrabold text-teal">{score}</span>
      <div className="w-20 rounded-t-xl" style={{ height: h, background: color }} />
    </div>
  )
}
