import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { Mic, X, PhoneOff, Loader2, BookOpen, Sparkles, Check } from 'lucide-react'
import { useConversation } from '@elevenlabs/react'
import Mascot from './Mascot'
import { api } from '../lib/api'
import { useGame } from '../store/GameStore'

const SUBJECT_EMOJI: Record<string, string> = {
  math: '🔢',
  nepali: '🇳🇵',
  science: '🔬',
  english: '🔤',
}

/**
 * Always-on voice tutor. A floating bot button (bottom-left, every page) opens
 * a sheet where the user first picks a context — "General help" or a specific
 * book — then taps the mic to talk to "Nani", an ElevenLabs Conversational AI
 * agent.
 *
 * Picking a book grounds the agent in that book's content (RAG); "General help"
 * starts a grade-aware study-buddy session. The backend mints a short-lived
 * signed URL plus the system prompt + first message, passed as conversation
 * overrides (the agent must have overrides enabled for System prompt + First
 * message).
 *
 * Renders nothing if the voice tutor isn't configured on the backend.
 */
export default function VoiceTutor() {
  const { activeChild, packs } = useGame()
  const location = useLocation()
  const [enabled, setEnabled] = useState(false)
  const [open, setOpen] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // The chosen context: 'general' or a pack id.
  const [context, setContext] = useState<string>('general')

  const conversation = useConversation({
    onError: (e: unknown) =>
      setError(typeof e === 'string' ? e : 'Connection lost'),
  })
  const { status, isSpeaking } = conversation
  const connected = status === 'connected'

  // Books the user can pick as context (ready packs only).
  const readyPacks = packs.filter((p) => p.status === 'ready')

  // Detect the book from the current route so it's pre-selected when opening.
  const routePackId =
    location.pathname.match(/\/kid\/(?:map|play)\/([^/]+)/)?.[1]

  useEffect(() => {
    api
      .tutorConfig()
      .then((c) => setEnabled(c.enabled))
      .catch(() => setEnabled(false))
  }, [])

  // End the session when the sheet closes.
  useEffect(() => {
    if (!open && connected) conversation.endSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const openSheet = () => {
    // Pre-select the current book if we're inside one, else general help.
    setContext(
      routePackId && readyPacks.some((p) => p.id === routePackId)
        ? routePackId
        : 'general',
    )
    setError(null)
    setOpen(true)
  }

  const start = async () => {
    setError(null)
    setConnecting(true)
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      const session =
        context === 'general'
          ? await api.tutorGeneralSession(activeChild?.id)
          : await api.tutorSession(context, activeChild?.id)
      await conversation.startSession({
        signedUrl: session.signed_url,
        overrides: {
          agent: {
            prompt: { prompt: session.system_prompt },
            firstMessage: session.first_message,
            language: 'en',
          },
        },
      })
    } catch (e) {
      setError(
        e instanceof Error && e.name === 'NotAllowedError'
          ? 'Please allow microphone access to talk to Nani.'
          : 'Could not start the tutor. Try again.',
      )
    } finally {
      setConnecting(false)
    }
  }

  const stop = () => conversation.endSession()

  if (!enabled) return null

  const activePack = readyPacks.find((p) => p.id === context)
  const contextLabel =
    context === 'general' ? 'General study help' : activePack?.title ?? 'Book'

  return (
    <>
      {/* Floating launcher — bottom-left, on every page */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
        onClick={openSheet}
        aria-label="Ask Nani"
        className="fixed bottom-24 left-4 z-40 flex items-center gap-2 rounded-full bg-orange py-2 pl-2 pr-4 font-extrabold text-white shadow-[0_8px_20px_-6px_rgba(254,101,56,0.7)]"
      >
        <span className="rounded-full bg-white/20 p-1">
          <Mascot mood="happy" size={34} />
        </span>
        <span className="text-sm">Ask Nani</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 500 }}
              animate={{ y: 0 }}
              exit={{ y: 500 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[88svh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl bg-cream px-6 pb-10 pt-5"
            >
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-teal">Talk to Nani</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-white p-2 text-teal shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              {connected || connecting ? (
                /* ---------- Live call view ---------- */
                <div className="flex flex-col items-center py-2">
                  <span className="mb-2 rounded-full bg-teal/10 px-3 py-1 text-sm font-bold text-teal">
                    {contextLabel}
                  </span>
                  <motion.div
                    animate={connected && isSpeaking ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="relative"
                  >
                    {connected && (
                      <motion.span
                        className="absolute inset-0 -z-10 rounded-full bg-teal/20"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ repeat: Infinity, duration: 1.6 }}
                      />
                    )}
                    <Mascot mood={isSpeaking ? 'wave' : 'happy'} size={150} />
                  </motion.div>

                  <p className="mt-3 h-6 font-bold text-[#555]">
                    {connecting
                      ? 'Waking up Nani…'
                      : isSpeaking
                        ? 'Nani is talking…'
                        : 'Listening… speak now!'}
                  </p>

                  {error && (
                    <p className="mt-1 text-center text-sm font-semibold text-orange">
                      {error}
                    </p>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={stop}
                    disabled={connecting}
                    className="mt-5 flex h-20 w-20 items-center justify-center rounded-full bg-orange text-white shadow-lg disabled:opacity-60"
                  >
                    {connecting ? (
                      <Loader2 size={32} className="animate-spin" />
                    ) : (
                      <PhoneOff size={32} />
                    )}
                  </motion.button>
                </div>
              ) : (
                /* ---------- Context picker ---------- */
                <>
                  <p className="mb-3 font-semibold text-orange">
                    What should Nani help with? / नानीले केमा मद्दत गरोस्?
                  </p>

                  <div className="mb-5 flex flex-col gap-2.5">
                    <ContextOption
                      selected={context === 'general'}
                      onClick={() => setContext('general')}
                      icon={<Sparkles size={22} />}
                      title="General study help"
                      subtitle="Ask anything about your subjects"
                    />
                    {readyPacks.map((p) => (
                      <ContextOption
                        key={p.id}
                        selected={context === p.id}
                        onClick={() => setContext(p.id)}
                        icon={
                          <span className="text-xl leading-none">
                            {SUBJECT_EMOJI[p.subject] ?? <BookOpen size={22} />}
                          </span>
                        }
                        title={p.title}
                        subtitle={
                          p.type === 'personalized'
                            ? 'Your uploaded book'
                            : p.titleNp
                        }
                      />
                    ))}
                  </div>

                  {error && (
                    <p className="mb-3 text-center text-sm font-semibold text-orange">
                      {error}
                    </p>
                  )}

                  <button
                    onClick={start}
                    disabled={connecting}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-teal py-4 text-lg font-extrabold text-white shadow-[0_6px_0_0_#0a8584] active:translate-y-[3px] disabled:opacity-60"
                  >
                    <Mic size={24} />
                    Start talking
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function ContextOption({
  selected,
  onClick,
  icon,
  title,
  subtitle,
}: {
  selected: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  subtitle?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-colors ${
        selected
          ? 'border-teal bg-teal/10'
          : 'border-transparent bg-white shadow-sm'
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          selected ? 'bg-teal text-white' : 'bg-teal/10 text-teal'
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold text-[#333]">{title}</span>
        {subtitle && (
          <span className="block truncate text-sm text-[#888]">{subtitle}</span>
        )}
      </span>
      {selected && <Check size={20} className="shrink-0 text-teal" />}
    </button>
  )
}
