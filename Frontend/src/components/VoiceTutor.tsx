import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, X, PhoneOff, Loader2 } from 'lucide-react'
import { useConversation } from '@elevenlabs/react'
import Mascot from './Mascot'
import { api } from '../lib/api'
import { useGame } from '../store/GameStore'
import { useLang } from '../lib/lang'

/**
 * Always-on voice tutor. A floating bot button (bottom-left, on every page once
 * a child is signed in) opens a sheet where the child taps to talk to "Nani",
 * an ElevenLabs Conversational AI agent.
 *
 * The agent is grounded in ALL of the child's books at once (no topic picking).
 * If the app language is Nepali, Nani replies in Nepali using the warm Jessica
 * voice. The backend mints the signed URL + prompt/first-message/voice/language,
 * which we pass as conversation overrides.
 *
 * Renders nothing if the tutor isn't configured or no child is signed in.
 */
export default function VoiceTutor() {
  const { activeChild } = useGame()
  const { lang } = useLang()
  const [enabled, setEnabled] = useState(false)
  const [open, setOpen] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const conversation = useConversation({
    onError: (e: unknown) =>
      setError(typeof e === 'string' ? e : 'Connection lost'),
  })
  const { status, isSpeaking } = conversation
  const connected = status === 'connected'
  const nepali = lang === 'np'

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

  const start = async () => {
    setError(null)
    setConnecting(true)
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      const session = await api.tutorSession(activeChild?.id, lang)
      const agent: Record<string, unknown> = {
        prompt: { prompt: session.system_prompt },
        firstMessage: session.first_message,
      }
      if (session.language) agent.language = session.language
      const overrides: Record<string, unknown> = { agent }
      if (session.voice_id) overrides.tts = { voiceId: session.voice_id }

      await conversation.startSession({
        conversationToken: session.conversation_token,
        connectionType: 'webrtc',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        overrides: overrides as any,
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

  // Auto-start the conversation as soon as the sheet is opened (the tap that
  // opens it counts as the user gesture needed for microphone access).
  const openSheet = () => {
    setError(null)
    setOpen(true)
    void start()
  }

  if (!enabled) return null
  if (!activeChild) return null
  if (!activeChild.isPro) return null

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
              className="w-full max-w-[480px] rounded-t-3xl bg-cream px-6 pb-10 pt-5"
            >
              <div className="mb-1 flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-teal">Talk to Nani</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-white p-2 text-teal shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="mb-4 font-semibold text-orange">
                {nepali
                  ? 'नानीसँग नेपालीमा कुरा गर्नुहोस्'
                  : 'Ask about anything you are learning!'}
              </p>

              <div className="flex flex-col items-center py-2">
                <span className="mb-2 rounded-full bg-teal/10 px-3 py-1 text-sm font-bold text-teal">
                  {nepali ? 'नेपाली · Jessica' : 'English'}
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
                    : connected
                      ? isSpeaking
                        ? 'Nani is talking…'
                        : 'Listening… speak now!'
                      : 'Tap the mic to start'}
                </p>

                {error && (
                  <p className="mt-1 text-center text-sm font-semibold text-orange">
                    {error}
                  </p>
                )}

                <div className="mt-5">
                  {connected || connecting ? (
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={stop}
                      disabled={connecting}
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-orange text-white shadow-lg disabled:opacity-60"
                    >
                      {connecting ? (
                        <Loader2 size={32} className="animate-spin" />
                      ) : (
                        <PhoneOff size={32} />
                      )}
                    </motion.button>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={start}
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-teal text-white shadow-lg"
                    >
                      <Mic size={34} />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
