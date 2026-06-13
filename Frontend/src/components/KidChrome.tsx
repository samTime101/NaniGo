import {
  Heart,
  Flame,
  Coins,
  LayoutDashboard,
  BookOpen,
  Upload,
  Settings,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import type { Child } from '../types'
import { useT } from '../lib/lang'
import { useGame } from '../store/GameStore'

const iconHome = new URL('../assets/Icons_Illustration/Icon_Home.png', import.meta.url).href
const iconBattle = new URL('../assets/Icons_Illustration/Icon_Battle.png', import.meta.url).href
const iconTop = new URL('../assets/Icons_Illustration/Icon_Top.png', import.meta.url).href
const iconMe = new URL('../assets/Icons_Illustration/Icon_Me.png', import.meta.url).href

/** Sticky full-width top bar — flush to top, rounded only at the bottom. */
export function KidTopBar({ child }: { child: Child }) {
  return (
    <div className="sticky top-0 z-30 mb-1 flex items-center justify-between gap-2 rounded-b-3xl border-b border-white/60 bg-white/90 px-5 py-3 shadow-[0_6px_18px_rgba(13,168,167,0.15)] backdrop-blur">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <Heart
            key={i}
            size={24}
            className={
              i < child.hearts ? 'fill-heart text-heart' : 'fill-mist text-mist'
            }
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 rounded-full bg-orange/10 px-3 py-1 font-bold text-orange">
          <Flame size={18} className="fill-orange text-orange" />
          {child.streakDays}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 font-bold text-[#a07c00]">
          <Coins size={18} className="fill-gold text-gold" />
          {child.totalXp}
        </span>
      </div>
    </div>
  )
}

/** Floating rounded dock — sticky to the bottom. */
export function BottomNav() {
  const t = useT()
  
  const tabs = [
    { to: '/kid/home', img: iconHome, label: t('home') },
    { to: '/kid/battle', img: iconBattle, label: t('battle') },
    { to: '/kid/leaderboard', img: iconTop, label: t('top') },
    { to: '/kid/profile', img: iconMe, label: t('me') },
  ]
  
  return (
    <div className="sticky bottom-3 z-30 mx-3 mt-2 flex items-center justify-around rounded-[26px] border border-white/60 bg-white/95 px-2 py-2 shadow-[0_8px_24px_rgba(13,168,167,0.25)] backdrop-blur">
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={tab.to} className="flex-1">
          {({ isActive }) => (
            <motion.div
              whileTap={{ scale: 0.88 }}
              className="flex flex-col items-center py-0.5"
            >
              <div
                className={`rounded-2xl px-4 py-2 transition-colors ${
                  isActive
                    ? 'bg-teal/10 shadow-[0_4px_10px_rgba(13,168,167,0.2)]'
                    : ''
                }`}
              >
                <img
                  src={tab.img}
                  alt={tab.label}
                  className={`h-10 w-10 object-contain transition-all ${
                    isActive ? '' : 'opacity-50 grayscale'
                  }`}
                />
              </div>
            </motion.div>
          )}
        </NavLink>
      ))}
    </div>
  )
}

/** Floating rounded dock for the parent area — same styling as the kid dock. */
export function ParentNav() {
  const t = useT()
  const { parent } = useGame()
  
  const parentTabs = [
    { to: '/parent/dashboard', icon: LayoutDashboard, label: t('home') },
    { to: '/parent/packs', icon: BookOpen, label: t('books') },
    { to: parent?.subscription_tier === 'pro' ? '/parent/upload' : '/parent/pricing', icon: Upload, label: t('upload') },
    { to: '/parent/settings', icon: Settings, label: t('settings') },
  ]
  
  return (
    <div className="sticky bottom-3 z-30 mx-3 mt-2 flex items-center justify-around rounded-[26px] border border-white/60 bg-white/95 px-2 py-2 shadow-[0_8px_24px_rgba(13,168,167,0.25)] backdrop-blur">
      {parentTabs.map((tab) => (
        <NavLink key={tab.to} to={tab.to} className="flex-1" end>
          {({ isActive }) => (
            <motion.div
              whileTap={{ scale: 0.88 }}
              className="flex flex-col items-center gap-0.5 py-0.5"
            >
              <div
                className={`rounded-2xl px-4 py-1.5 transition-colors ${
                  isActive
                    ? 'bg-teal text-white shadow-[0_4px_10px_rgba(13,168,167,0.4)]'
                    : 'text-[#9aa0a6]'
                }`}
              >
                <tab.icon size={22} />
              </div>
              <span
                className={`text-[11px] font-bold ${
                  isActive ? 'text-teal' : 'text-[#9aa0a6]'
                }`}
              >
                {tab.label}
              </span>
            </motion.div>
          )}
        </NavLink>
      ))}
    </div>
  )
}
