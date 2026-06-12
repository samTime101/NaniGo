import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ScanLine, Keyboard } from 'lucide-react'
import { Screen, Button } from '../../components/ui'
import { useGame } from '../../store/GameStore'

export default function KidScan() {
  const nav = useNavigate()
  const { loginChildByCode, children } = useGame()
  const [mode, setMode] = useState<'scan' | 'code'>('scan')
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [error, setError] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const tryLogin = async (code: string) => {
    const child = await loginChildByCode(code)
    if (child) nav('/kid/home')
    else {
      setError(true)
      setTimeout(() => setError(false), 600)
    }
  }

  const setDigit = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return
    const next = [...digits]
    next[i] = v
    setDigits(next)
    if (v && i < 5) inputs.current[i + 1]?.focus()
    if (next.every((d) => d) && next.join('').length === 6) tryLogin(next.join(''))
  }

  return (
    <Screen>
      <div className="flex min-h-svh flex-col bg-gradient-to-b from-teal to-teal-dark px-6 pt-6 pb-10 text-white">
        <button onClick={() => nav('/role')} className="mb-2 w-fit">
          <ArrowLeft size={28} />
        </button>

        {mode === 'scan' ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <h1 className="mb-1 text-2xl font-extrabold">Scan your card</h1>
            <p className="mb-8 opacity-90">आफ्नो कार्ड स्क्यान गर्नुहोस्</p>

            <div className="relative h-64 w-64 rounded-3xl border-4 border-white/40">
              {[
                'left-0 top-0 border-l-4 border-t-4 rounded-tl-2xl',
                'right-0 top-0 border-r-4 border-t-4 rounded-tr-2xl',
                'left-0 bottom-0 border-l-4 border-b-4 rounded-bl-2xl',
                'right-0 bottom-0 border-r-4 border-b-4 rounded-br-2xl',
              ].map((c) => (
                <span key={c} className={`absolute h-10 w-10 border-gold ${c}`} />
              ))}
              <motion.div
                animate={{ top: ['10%', '85%', '10%'] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-4 right-4 h-1 rounded-full bg-gold shadow-[0_0_16px_4px_rgba(255,214,0,0.7)]"
              />
              <ScanLine className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" size={120} />
            </div>

            <button
              onClick={() => setMode('code')}
              className="mt-10 flex items-center gap-2 rounded-2xl bg-white/15 px-6 py-3 font-bold"
            >
              <Keyboard size={20} /> Enter code instead
            </button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center">
            <h1 className="mb-1 text-2xl font-extrabold">Enter your code</h1>
            <p className="mb-8 opacity-90">आफ्नो कोड हाल्नुहोस्</p>

            <motion.div
              animate={error ? { x: [0, -10, 10, -8, 8, 0] } : {}}
              className="flex gap-2"
            >
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputs.current[i] = el
                  }}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !d && i > 0)
                      inputs.current[i - 1]?.focus()
                  }}
                  inputMode="numeric"
                  maxLength={1}
                  className="h-16 w-12 rounded-2xl bg-white text-center text-3xl font-extrabold text-teal outline-none focus:ring-4 focus:ring-gold"
                />
              ))}
            </motion.div>

            {error && <p className="mt-4 font-bold text-gold">Oops! Wrong code 🐾</p>}

            <div className="mt-8 w-full max-w-[300px]">
              <Button variant="gold" full onClick={() => setMode('scan')}>
                Back to scanner
              </Button>
            </div>
            <p className="mt-6 text-sm opacity-80">
              Try {children[0]?.childCode ?? '482913'}
            </p>
          </div>
        )}
      </div>
    </Screen>
  )
}
