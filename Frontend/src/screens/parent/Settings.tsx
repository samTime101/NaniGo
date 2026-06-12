import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Clock, LogOut, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Screen } from '../../components/ui'
import Avatar from '../../components/Avatar'
import { useGame } from '../../store/GameStore'

export default function Settings() {
  const nav = useNavigate()
  const { children, regenerateCode } = useGame()
  const [limit, setLimit] = useState(30)
  const [openQr, setOpenQr] = useState<string | null>(null)

  return (
    <Screen>
      <div className="min-h-svh px-6 pb-10 pt-6">
        <button onClick={() => nav('/parent/dashboard')} className="mb-2 text-teal">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-3xl font-extrabold text-teal">Settings</h1>
        <p className="mb-6 font-semibold text-orange">सेटिङ</p>

        <div className="mb-2 font-bold text-[#555]">Children</div>
        <div className="mb-6 flex flex-col gap-2">
          {children.map((c) => {
            const open = openQr === c.id
            return (
              <div key={c.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="flex items-center gap-3 p-4">
                  <Avatar id={c.avatar} size={44} />
                  <div className="flex-1">
                    <div className="font-bold text-[#333]">{c.name}</div>
                    <div className="font-mono text-sm tracking-widest text-teal">
                      {c.childCode}
                    </div>
                  </div>
                  <button
                    onClick={() => setOpenQr((o) => (o === c.id ? null : c.id))}
                    className={`flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-bold ${
                      open ? 'bg-teal text-white' : 'bg-teal/10 text-teal'
                    }`}
                  >
                    <QrCode size={16} /> QR
                  </button>
                  <button
                    onClick={() => regenerateCode(c.id)}
                    className="flex items-center gap-1 rounded-xl bg-orange/10 px-3 py-2 text-sm font-bold text-orange"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="flex flex-col items-center gap-3 px-4 pb-5"
                    >
                      <div className="rounded-2xl bg-cream p-4">
                        <QRCodeSVG
                          value={`nanigo://child/${c.childCode}`}
                          size={170}
                          fgColor="#0DA8A7"
                          bgColor="#FFF8F0"
                        />
                      </div>
                      <div className="flex gap-1.5">
                        {c.childCode.split('').map((d, i) => (
                          <span
                            key={i}
                            className="flex h-10 w-8 items-center justify-center rounded-lg bg-teal text-xl font-extrabold text-white"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                      <p className="text-center text-sm text-[#999]">
                        Let {c.name} scan this on the "I'm a Kid" screen
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        <div className="mb-2 font-bold text-[#555]">Daily Time Limit</div>
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <Clock className="text-orange" />
          <input
            type="range"
            min={10}
            max={120}
            step={10}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="flex-1 accent-teal"
          />
          <span className="w-16 text-right font-extrabold text-teal">{limit} min</span>
        </div>

        <button
          onClick={() => nav('/role')}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-heart/10 py-4 font-bold text-heart"
        >
          <LogOut size={20} /> Log out
        </button>
      </div>
    </Screen>
  )
}
