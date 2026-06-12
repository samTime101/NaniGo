import {
  Heart,
  Flame,
  Coins,
  Map,
  Swords,
  Trophy,
  User,
  LayoutDashboard,
  BookOpen,
  Upload,
  Settings,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import type { Child } from '../types'

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

const tabs = [
  { to: '/kid/home', icon: Map, label: 'Map' },
  { to: '/kid/battle', icon: Swords, label: 'Battle' },
  { to: '/kid/leaderboard', icon: Trophy, label: 'Top' },
  { to: '/kid/profile', icon: User, label: 'Me' },
]

/** Floating rounded dock — sticky to the bottom. */
export function BottomNav() {
  return (
    <div className="sticky bottom-3 z-30 mx-3 mt-2 flex items-center justify-around rounded-[26px] border border-white/60 bg-white/95 px-2 py-2 shadow-[0_8px_24px_rgba(13,168,167,0.25)] backdrop-blur">
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} className="flex-1">
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
                <t.icon size={24} />
              </div>
              <span
                className={`text-[11px] font-bold ${
                  isActive ? 'text-teal' : 'text-[#9aa0a6]'
                }`}
              >
                {t.label}
              </span>
            </motion.div>
          )}
        </NavLink>
      ))}
    </div>
  )
}

const parentTabs = [
  { to: '/parent/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/parent/packs', icon: BookOpen, label: 'Books' },
  { to: '/parent/upload', icon: Upload, label: 'Upload' },
  { to: '/parent/settings', icon: Settings, label: 'Settings' },
]

/** Floating rounded dock for the parent area — same styling as the kid dock. */
export function ParentNav() {
  return (
    <div className="sticky bottom-3 z-30 mx-3 mt-2 flex items-center justify-around rounded-[26px] border border-white/60 bg-white/95 px-2 py-2 shadow-[0_8px_24px_rgba(13,168,167,0.25)] backdrop-blur">
      {parentTabs.map((t) => (
        <NavLink key={t.to} to={t.to} className="flex-1" end>
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
                <t.icon size={22} />
              </div>
              <span
                className={`text-[11px] font-bold ${
                  isActive ? 'text-teal' : 'text-[#9aa0a6]'
                }`}
              >
                {t.label}
              </span>
            </motion.div>
          )}
        </NavLink>
      ))}
    </div>
  )
}
