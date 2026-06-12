import { Heart, Flame, Coins, Map, Swords, Trophy, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import type { Child } from '../types';

export function KidTopBar({ child }: { child: Child }) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <Heart
            key={i}
            size={26}
            className={
              i < child.hearts
                ? 'fill-heart text-heart'
                : 'fill-mist text-mist'
            }
          />
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 font-bold text-orange shadow-sm">
          <Flame size={20} className="fill-orange text-orange" />
          {child.streakDays}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 font-bold text-[#a07c00] shadow-sm">
          <Coins size={20} className="fill-gold text-gold" />
          {child.totalXp}
        </span>
      </div>
    </div>
  );
}

const tabs = [
  { to: '/kid/home', icon: Map, label: 'Map', np: 'नक्सा' },
  { to: '/kid/battle', icon: Swords, label: 'Battle', np: 'युद्ध' },
  { to: '/kid/leaderboard', icon: Trophy, label: 'Top', np: 'शीर्ष' },
  { to: '/kid/profile', icon: User, label: 'Me', np: 'म' },
];

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-20 mx-auto flex max-w-[480px] items-center justify-around border-t border-mist bg-white/95 px-2 py-2 backdrop-blur">
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} className="flex-1">
          {({ isActive }) => (
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center gap-0.5 py-1"
            >
              <div
                className={`rounded-2xl px-4 py-1.5 transition-colors ${
                  isActive ? 'bg-teal text-white' : 'text-[#9aa0a6]'
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
    </nav>
  );
}
