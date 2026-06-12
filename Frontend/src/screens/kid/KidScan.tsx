import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CameraOff } from 'lucide-react'
import { Screen } from '../../components/ui'
import QrScanner from '../../components/QrScanner'
import { useGame } from '../../store/GameStore'

/** Pull a 4–8 digit code out of a scanned value like "nanigo://child/482913". */
function parseCode(text: string): string {
  const m = text.match(/(\d{4,8})/)
  return (m ? m[1] : text).trim()
}

export default function KidScan() {
  const nav = useNavigate()
  const { loginChildByCode, children } = useGame()
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [error, setError] = useState(false)
  const [camError, setCamError] = useState(false)
  const [scanMsg, setScanMsg] = useState<string | null>(null)
  const [scanKey, setScanKey] = useState(0)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const tryLogin = async (code: string) => {
    const child = await loginChildByCode(code)
    if (child) {
      nav('/kid/home')
      return true
    }
    return false
  }

  const onScan = async (text: string) => {
    const ok = await tryLogin(parseCode(text))
    if (!ok) {
      setScanMsg('Card not recognized — try again')
      setTimeout(() => {
        setScanMsg(null)
        setScanKey((k) => k + 1) // remount scanner to read again
      }, 1500)
    }
  }

  const setDigit = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return
    const next = [...digits]
    next[i] = v
    setDigits(next)
    if (v && i < 5) inputs.current[i + 1]?.focus()
    if (next.every((d) => d) && next.join('').length === 6) {
      tryLogin(next.join('')).then((ok) => {
        if (!ok) {
          setError(true)
          setDigits(['', '', '', '', '', ''])
          inputs.current[0]?.focus()
          setTimeout(() => setError(false), 600)
        }
      })
    }
  }

  return (
    <Screen>
      <div className="flex min-h-svh flex-col bg-gradient-to-b from-teal to-teal-dark px-6 pt-6 pb-10 text-white">
        <button onClick={() => nav('/role')} className="mb-3 w-fit">
          <ArrowLeft size={28} />
        </button>

        <div className="flex flex-1 flex-col items-center">
          <h1 className="text-2xl font-extrabold">Scan your card</h1>
          <p className="mb-6 opacity-90">आफ्नो कार्ड स्क्यान गर्नुहोस्</p>

          {/* Camera scanner */}
          {camError ? (
            <div className="flex h-64 w-64 flex-col items-center justify-center gap-3 rounded-3xl border-4 border-dashed border-white/30 px-6 text-center">
              <CameraOff size={44} className="text-gold" />
              <p className="text-sm font-semibold opacity-90">
                Camera unavailable here. Type the 6-digit code below instead.
              </p>
            </div>
          ) : (
            <QrScanner
              key={scanKey}
              onScan={onScan}
              onError={() => setCamError(true)}
            />
          )}

          {scanMsg && (
            <p className="mt-3 font-bold text-gold">{scanMsg}</p>
          )}

          {/* divider */}
          <div className="my-6 flex w-full max-w-[320px] items-center gap-3 opacity-80">
            <span className="h-px flex-1 bg-white/30" />
            <span className="text-sm font-semibold">or type the code</span>
            <span className="h-px flex-1 bg-white/30" />
          </div>

          {/* Code input */}
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
                aria-label={`Code digit ${i + 1}`}
                className="h-14 w-11 rounded-2xl bg-white text-center text-2xl font-extrabold text-teal outline-none focus:ring-4 focus:ring-gold"
              />
            ))}
          </motion.div>

          {error && (
            <p className="mt-3 font-bold text-gold">Oops! Wrong code</p>
          )}

          <p className="mt-6 text-sm opacity-80">
            Demo code: {children[0]?.childCode ?? '482913'}
          </p>
        </div>
      </div>
    </Screen>
  )
}
