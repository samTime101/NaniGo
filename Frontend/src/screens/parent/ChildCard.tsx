import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Share2, Printer, ArrowRight } from 'lucide-react'
import { Screen, Button, Loading } from '../../components/ui'
import Avatar from '../../components/Avatar'
import { useGame } from '../../store/GameStore'

export default function ChildCard() {
  const { id } = useParams()
  const nav = useNavigate()
  const { children, ready } = useGame()
  const child = children.find((c) => c.id === id)

  if (!ready) return <Loading />

  if (!child) {
    return (
      <Screen>
        <div className="p-10 text-center">Child not found.</div>
      </Screen>
    )
  }

  const share = async () => {
    const text = `${child.name}'s NaniGO code: ${child.childCode}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'NaniGO ID', text })
      } catch {
        /* cancelled */
      }
    } else {
      navigator.clipboard?.writeText(text)
      alert('Code copied!')
    }
  }

  return (
    <Screen>
      <div className="flex min-h-svh flex-col items-center px-6 pt-8 pb-10 bg-gradient-to-b from-peach/60 to-cream">
        <h1 className="text-2xl font-extrabold text-teal">All set!</h1>
        <p className="mb-6 font-semibold text-orange">तयार भयो — share this card</p>

        <motion.div
          initial={{ scale: 0.7, rotate: -6, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="w-full max-w-[340px] rounded-3xl bg-white p-6 shadow-[0_18px_40px_-15px_rgba(13,168,167,0.5)]"
        >
          <div className="flex items-center justify-between">
            <img src="/nanigo_logo.png" alt="NaniGO" className="h-9" />
            <span className="rounded-full bg-teal/10 px-3 py-1 text-sm font-bold text-teal">
              ID CARD
            </span>
          </div>

          <div className="my-5 flex flex-col items-center">
            <Avatar id={child.avatar} size={88} ring />
            <div className="mt-3 text-2xl font-extrabold text-[#333]">
              {child.name}
            </div>
            <div className="font-semibold text-[#888]">
              Class {child.grade} · Age {child.age}
            </div>
          </div>

          <div className="flex justify-center rounded-2xl bg-cream p-4">
            <QRCodeSVG
              value={`nanigo://child/${child.childCode}`}
              size={150}
              fgColor="#0DA8A7"
              bgColor="#FFF8F0"
            />
          </div>

          <div className="mt-4 text-center">
            <div className="text-sm font-semibold text-[#999]">Login Code</div>
            <div className="flex justify-center gap-1.5 pt-1">
              {child.childCode.split('').map((d, i) => (
                <span
                  key={i}
                  className="flex h-11 w-9 items-center justify-center rounded-xl bg-teal text-2xl font-extrabold text-white"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="mt-6 flex w-full max-w-[340px] gap-3">
          <Button variant="white" full onClick={share}>
            <span className="flex items-center justify-center gap-2">
              <Share2 size={20} /> Share
            </span>
          </Button>
          <Button variant="white" full onClick={() => window.print()}>
            <span className="flex items-center justify-center gap-2">
              <Printer size={20} /> Print
            </span>
          </Button>
        </div>

        <div className="mt-3 w-full max-w-[340px]">
          <Button variant="primary" full onClick={() => nav('/parent/dashboard')}>
            <span className="flex items-center justify-center gap-2">
              Go to Dashboard <ArrowRight size={20} />
            </span>
          </Button>
        </div>
      </div>
    </Screen>
  )
}
