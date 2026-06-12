import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Volume2, Mic, Square, Loader2, Check, X } from 'lucide-react'
import { api } from '../lib/api'

interface Props {
  packId: string
  questionId: string
  questionText: string
  disabled: boolean
  onResult: (correct: boolean, transcript: string) => void
}

type Phase = 'idle' | 'recording' | 'grading' | 'done'

function pickMime(): string {
  if (typeof MediaRecorder === 'undefined') return ''
  for (const m of ['audio/webm', 'audio/mp4', 'audio/ogg']) {
    if (MediaRecorder.isTypeSupported(m)) return m
  }
  return ''
}

/**
 * Voice-answer question. The question is read aloud (ElevenLabs TTS), the child
 * taps the mic and speaks; the recording is transcribed + graded on the server.
 */
export default function SpeakQuestion({
  packId,
  questionId,
  questionText,
  disabled,
  onResult,
}: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    correct: boolean
    transcript: string
    feedback: string
  } | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioElRef = useRef<HTMLAudioElement | null>(null)

  // Load + auto-play the question audio on mount.
  useEffect(() => {
    let url: string | null = null
    let cancelled = false
    api
      .speechTtsUrl(questionText)
      .then((u) => {
        if (cancelled) {
          URL.revokeObjectURL(u)
          return
        }
        url = u
        setAudioUrl(u)
        // Best-effort autoplay; browsers may block until a user gesture.
        const el = new Audio(u)
        audioElRef.current = el
        el.play().catch(() => {})
      })
      .catch(() => setError('Could not load the question audio.'))
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
      recorderRef.current?.stream.getTracks().forEach((t) => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId])

  const playQuestion = () => {
    if (!audioUrl) return
    const el = audioElRef.current ?? new Audio(audioUrl)
    audioElRef.current = el
    el.currentTime = 0
    el.play().catch(() => {})
  }

  const startRecording = async () => {
    if (disabled || phase !== 'idle') return
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mime = pickMime()
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      chunksRef.current = []
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, {
          type: mime || 'audio/webm',
        })
        void grade(blob)
      }
      recorderRef.current = rec
      rec.start()
      setPhase('recording')
    } catch (e) {
      setError(
        e instanceof Error && e.name === 'NotAllowedError'
          ? 'Please allow microphone access to answer by voice.'
          : 'Could not start recording.',
      )
    }
  }

  const stopRecording = () => {
    if (phase !== 'recording') return
    setPhase('grading')
    recorderRef.current?.stop()
  }

  const grade = async (blob: Blob) => {
    try {
      const r = await api.gradeSpeech(packId, questionId, blob)
      setResult({
        correct: r.correct,
        transcript: r.transcript,
        feedback: r.feedback,
      })
      setPhase('done')
      // Give the child a moment to read what they said before moving on.
      setTimeout(() => onResult(r.correct, r.transcript), 1500)
    } catch {
      setError('Could not check your answer. Try again.')
      setPhase('idle')
    }
  }

  return (
    <div className="mt-5 flex flex-col items-center gap-4">
      {/* Replay question audio */}
      <button
        onClick={playQuestion}
        disabled={!audioUrl}
        className="flex items-center gap-2 rounded-full bg-teal/10 px-5 py-2.5 font-bold text-teal disabled:opacity-50"
      >
        <Volume2 size={22} />
        Hear the question again
      </button>

      {/* Record control */}
      {phase === 'recording' ? (
        <motion.button
          onClick={stopRecording}
          whileTap={{ scale: 0.92 }}
          className="relative flex h-24 w-24 items-center justify-center rounded-full bg-heart text-white shadow-lg"
        >
          <motion.span
            className="absolute inset-0 rounded-full bg-heart/40"
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          />
          <Square size={34} className="fill-white" />
        </motion.button>
      ) : phase === 'grading' ? (
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal text-white shadow-lg">
          <Loader2 size={36} className="animate-spin" />
        </div>
      ) : phase === 'done' && result ? (
        <div
          className={`flex h-24 w-24 items-center justify-center rounded-full text-white shadow-lg ${
            result.correct ? 'bg-success' : 'bg-heart'
          }`}
        >
          {result.correct ? <Check size={42} /> : <X size={42} />}
        </div>
      ) : (
        <motion.button
          onClick={startRecording}
          disabled={disabled}
          whileTap={{ scale: 0.92 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-orange text-white shadow-lg disabled:opacity-50"
        >
          <Mic size={40} />
        </motion.button>
      )}

      <p className="h-6 text-center font-bold text-[#555]">
        {phase === 'recording'
          ? 'Listening… tap to stop'
          : phase === 'grading'
            ? 'Checking your answer…'
            : phase === 'done'
              ? result?.feedback
              : 'Tap the mic and say your answer!'}
      </p>

      {phase === 'done' && result && (
        <p className="-mt-2 text-center text-sm text-[#888]">
          You said: “{result.transcript || '…'}”
        </p>
      )}

      {error && (
        <p className="text-center text-sm font-semibold text-orange">{error}</p>
      )}
    </div>
  )
}
