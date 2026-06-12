import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Flame,
  Coins,
  Target,
  Clock,
  Plus,
  Settings as SettingsIcon,
  Upload,
  Star,
  BookOpen,
} from 'lucide-react'
import { Screen, Card, Loading } from '../../components/ui'
import Avatar from '../../components/Avatar'
import { useGame } from '../../store/GameStore'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Dashboard() {
  const nav = useNavigate()
  const { children, parent, packs, ready } = useGame()
  const personalizedPacks = packs.filter((p) => p.type === 'personalized')
  const [activeId, setActiveId] = useState(children[0]?.id)
  const child = children.find((c) => c.id === activeId) ?? children[0]

  useEffect(() => {
    if (!child && children[0]) setActiveId(children[0].id)
  }, [child, children])

  if (!ready) {
    return <Loading />
  }

  if (!child) {
    return (
      <Screen>
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-8 text-center">
          <BookOpen size={48} className="text-teal" />
          <p className="text-lg font-bold text-[#666]">No children yet.</p>
          <button
            onClick={() => nav('/parent/add-child')}
            className="rounded-2xl bg-teal px-6 py-3 font-bold text-white"
          >
            Add your first child
          </button>
        </div>
      </Screen>
    )
  }

  const maxXp = Math.max(...child.weeklyXp, 1)

  return (
    <Screen>
      <div className="min-h-svh px-5 pb-10 pt-5">
        {/* header */}
        <div className="mb-4 flex items-center justify-between">
          <img src="/nanigo_logo.png" alt="NaniGO" className="h-9" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-teal">{parent?.name ?? 'Parent'}</span>
            <button
              onClick={() => nav('/parent/settings')}
              className="rounded-full bg-white p-2 text-teal shadow-sm"
            >
              <SettingsIcon size={22} />
            </button>
          </div>
        </div>

        {/* child switcher */}
        <div className="no-scrollbar mb-5 flex gap-3 overflow-x-auto pb-1">
          {children.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 transition-colors ${
                c.id === child.id ? 'bg-teal text-white' : 'bg-white text-[#555] shadow-sm'
              }`}
            >
              <Avatar id={c.avatar} size={36} />
              <span className="font-bold">{c.name}</span>
            </button>
          ))}
          <button
            onClick={() => nav('/parent/add-child')}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-teal shadow-sm"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* stat cards */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <Stat icon={<Flame className="text-orange" />} label="Streak" value={`${child.streakDays} days`} tint="bg-orange/10" />
          <Stat icon={<Coins className="text-gold" />} label="Total XP" value={child.totalXp} tint="bg-gold/15" />
          <Stat icon={<Target className="text-teal" />} label="Accuracy" value={`${child.accuracy}%`} tint="bg-teal/10" />
          <Stat icon={<Clock className="text-success" />} label="Today" value={`${child.timeTodayMin} min`} tint="bg-success/10" />
        </div>

        {/* weekly chart */}
        <Card className="mb-5">
          <div className="mb-3 font-extrabold text-[#444]">This Week's XP</div>
          <div className="flex h-36 items-end justify-between gap-2">
            {child.weeklyXp.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(v / maxXp) * 100}%` }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 120 }}
                  className="w-full rounded-t-xl"
                  style={{
                    background:
                      i === 6
                        ? 'linear-gradient(#FE6538,#FFD600)'
                        : 'linear-gradient(#0DA8A7,#5fc9c8)',
                    minHeight: 6,
                  }}
                />
                <span className="text-[11px] font-bold text-[#aaa]">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* upload CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => nav('/parent/upload')}
          className="mb-5 flex w-full items-center gap-4 rounded-3xl bg-gradient-to-r from-teal to-teal-light p-5 text-left text-white shadow-[0_8px_0_0_#0a8584]"
        >
          <div className="rounded-2xl bg-white/20 p-3">
            <Upload size={30} />
          </div>
          <div>
            <div className="text-xl font-extrabold">Upload Book Pages</div>
            <div className="text-sm opacity-90">Turn the textbook into a game · किताब अपलोड</div>
          </div>
        </motion.button>

        {/* packs */}
        {personalizedPacks.length > 0 && (
          <div className="mb-5">
            <div className="mb-2 font-extrabold text-[#444]">Question Packs</div>
            <div className="flex flex-col gap-2">
              {personalizedPacks.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
                  <div>
                    <div className="font-bold text-[#333]">{p.title}</div>
                    <div className="text-sm text-[#999]">{p.questions.length} questions</div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* activity */}
        <div className="mb-2 font-extrabold text-[#444]">Recent Activity</div>
        <div className="flex flex-col gap-2">
          {child.activity.length === 0 && (
            <div className="rounded-2xl bg-white p-4 text-center text-[#999]">
              No activity yet — let's start playing!
            </div>
          )}
          {child.activity.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
              <span className="font-semibold text-[#444]">{a.text}</span>
              <span className="flex">
                {Array.from({ length: a.stars }).map((_, i) => (
                  <Star key={i} size={16} className="fill-gold text-gold" />
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  )
}

function Stat({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: React.ReactNode; tint: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className={`rounded-xl p-2 ${tint}`}>{icon}</div>
      <div>
        <div className="text-sm font-semibold text-[#999]">{label}</div>
        <div className="text-xl font-extrabold text-[#333]">{value}</div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: 'generating' | 'ready' | 'failed' }) {
  const map = {
    generating: { t: 'Generating', c: 'bg-gold/20 text-[#a07c00]' },
    ready: { t: 'Ready', c: 'bg-success/15 text-success' },
    failed: { t: 'Failed', c: 'bg-heart/15 text-heart' },
  }
  const s = map[status]
  return <span className={`rounded-full px-3 py-1 text-sm font-bold ${s.c}`}>{s.t}</span>
}
