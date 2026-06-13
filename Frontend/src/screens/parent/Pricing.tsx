import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Star, ArrowLeft, Sparkles, BookOpen, Mic } from 'lucide-react'
import { motion } from 'framer-motion'
import { api } from '../../lib/api'
import { Screen } from '../../components/ui'

export default function Pricing() {
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const returnUrl = `${window.location.origin}/parent/payment/verify`
      const res = await api.initiatePayment(returnUrl)
      window.location.href = res.payment_url
    } catch (e) {
      alert('Failed to initiate payment. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Screen>
      <div className="min-h-svh px-5 pb-10 pt-5">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => nav('/parent')}
          className="mb-8 flex items-center gap-2 text-teal"
        >
          <ArrowLeft size={20} /> Back
        </motion.button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 text-3xl font-extrabold text-[#2b2b3a]">
            Upgrade to <span className="text-teal">NaniGO Pro</span>
          </h1>
          <p className="text-md text-[#666]">
            Turn any textbook into an interactive game!
          </p>
        </motion.div>

        <div className="flex flex-col gap-6">
          {/* Free Tier */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-[2rem] border-4 border-mist bg-white p-6"
          >
            <div className="mb-4">
              <h2 className="mb-1 text-xl font-bold text-[#666]">Free Plan</h2>
              <div className="text-4xl font-extrabold text-[#2b2b3a]">Rs. 0</div>
            </div>
            
            <ul className="mb-6 space-y-4">
              <li className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-mist text-[#666]">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span className="text-base font-semibold text-[#444]">Access to default courses</span>
              </li>
              <li className="flex items-center gap-3 opacity-50">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-mist text-[#999]">
                  <BookOpen size={12} />
                </div>
                <span className="text-base font-semibold text-[#888] line-through decoration-2">Upload custom books</span>
              </li>
              <li className="flex items-center gap-3 opacity-50">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-mist text-[#999]">
                  <Mic size={12} />
                </div>
                <span className="text-base font-semibold text-[#888] line-through decoration-2">Interactive Voice Tutor</span>
              </li>
            </ul>
            
            <button
              disabled
              className="w-full rounded-2xl bg-mist py-3 text-lg font-extrabold text-[#888]"
            >
              Current Plan
            </button>
          </motion.div>

          {/* Pro Tier */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative rounded-[2rem] border-[5px] border-orange bg-white p-6 shadow-[0_12px_30px_-10px_rgba(254,101,56,0.3)]"
          >
            <div className="absolute -top-4 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-gradient-to-r from-orange to-gold px-4 py-1.5 text-xs font-black tracking-widest text-white shadow-lg">
              <Star size={12} className="fill-white" /> RECOMMENDED
            </div>
            
            <div className="mb-4 mt-2">
              <h2 className="mb-1 text-xl font-bold text-orange">
                 Pro Plan
              </h2>
              <div className="flex items-baseline gap-1">
                <div className="text-4xl font-extrabold text-orange">Rs. 500</div>
                <div className="text-sm font-bold text-[#888]">/ lifetime</div>
              </div>
            </div>
            
            <ul className="mb-6 space-y-4">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange/20 text-orange">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span className="text-base font-bold text-[#444]">Everything in Free</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange/20 text-orange">
                  <BookOpen size={12} strokeWidth={2.5} />
                </div>
                <div>
                  <span className="block text-base font-bold leading-tight text-[#444]">Upload custom books</span>
                  <span className="text-xs font-semibold text-[#888]">Turn homework into play</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange/20 text-orange">
                  <Mic size={12} strokeWidth={2.5} />
                </div>
                <div>
                  <span className="block text-base font-bold leading-tight text-[#444]">AI Voice Tutor</span>
                  <span className="text-xs font-semibold text-[#888]">"Nani" speaks & teaches in Nepali</span>
                </div>
              </li>
            </ul>
            
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleUpgrade}
              disabled={loading}
              className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-orange to-gold py-4 text-lg font-extrabold text-white shadow-[0_6px_0_0_#e54f24] active:translate-y-[6px] active:shadow-none disabled:opacity-50"
            >
              {loading ? (
                'Processing...'
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Upgrade via Khalti <Sparkles size={18} className="fill-white" />
                </span>
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </Screen>
  )
}
