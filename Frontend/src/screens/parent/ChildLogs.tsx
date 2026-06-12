import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  ListChecks,
} from 'lucide-react'
import { Screen, Loading } from '../../components/ui'
import Avatar from '../../components/Avatar'
import { useGame } from '../../store/GameStore'
import { api } from '../../lib/api'
import type { Attempt } from '../../types'

const SUBJECT_COLOR: Record<string, string> = {
  math: '#FE6538',
  nepali: '#0DA8A7',
  science: '#22C55E',
  english: '#FBBF24',
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function ChildLogs() {
  const { id } = useParams()
  const nav = useNavigate()
  const { children, ready } = useGame()
  const child = children.find((c) => c.id === id)
  const [attempts, setAttempts] = useState<Attempt[] | null>(null)

  useEffect(() => {
    if (!id) return
    api.getAttempts(id).then(setAttempts).catch(() => setAttempts([]))
  }, [id])

  const stats = useMemo(() => {
    const a = attempts ?? []
    const total = a.length
    const correct = a.filter((x) => x.correct).length
    const avgMs = total ? a.reduce((s, x) => s + x.timeMs, 0) / total : 0
    const bySubject: Record<string, { c: number; t: number; ms: number }> = {}
    for (const x of a) {
      const b = (bySubject[x.subject] ??= { c: 0, t: 0, ms: 0 })
      b.t++
      b.ms += x.timeMs
      if (x.correct) b.c++
    }
    return { total, correct, avgMs, bySubject }
  }, [attempts])

  if (!ready) return <Loading />
  if (!child) {
    return (
      <Screen>
        <div className="p-10 text-center text-[#666]">Child not found.</div>
      </Screen>
    )
  }

  const acc = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0

  return (
    <Screen>
      <div className="min-h-svh px-5 pb-12 pt-5">
        <div className="mb-4 flex items-center gap-3">
          <button onClick={() => nav('/parent/dashboard')} className="text-teal">
            <ArrowLeft size={26} />
          </button>
          <Avatar id={child.avatar} size={40} />
          <div>
            <div className="text-xl font-extrabold text-teal leading-tight">
              {child.name}'s Logs
            </div>
            <div className="text-sm text-[#999]">प्रगति विवरण</div>
          </div>
        </div>

        {attempts === null ? (
          <Loading />
        ) : attempts.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center text-[#999] shadow-sm">
            No question attempts yet. Once {child.name} starts playing, every
            answer shows up here with timing and accuracy.
          </div>
        ) : (
          <>
            {/* summary cards */}
            <div className="mb-5 grid grid-cols-3 gap-3">
              <Mini icon={<ListChecks className="text-teal" />} label="Answered" value={stats.total} />
              <Mini icon={<Target className="text-orange" />} label="Accuracy" value={`${acc}%`} />
              <Mini icon={<Clock className="text-success" />} label="Avg time" value={`${(stats.avgMs / 1000).toFixed(1)}s`} />
            </div>

            {/* accuracy by subject */}
            <div className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
              <div className="mb-3 font-extrabold text-[#444]">Accuracy by Subject</div>
              <div className="flex flex-col gap-3">
                {Object.entries(stats.bySubject).map(([subj, v]) => {
                  const pct = Math.round((v.c / v.t) * 100)
                  return (
                    <div key={subj}>
                      <div className="mb-1 flex justify-between text-sm font-bold">
                        <span className="capitalize text-[#555]">{subj}</span>
                        <span className="text-[#999]">
                          {v.c}/{v.t} · {pct}%
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-mist">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ type: 'spring', stiffness: 120 }}
                          className="h-full rounded-full"
                          style={{ background: SUBJECT_COLOR[subj] ?? '#0DA8A7' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* recent answer streak */}
            <div className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
              <div className="mb-3 font-extrabold text-[#444]">
                Recent Answers (newest first)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {attempts.slice(0, 30).map((a) => (
                  <span
                    key={a.id}
                    title={`${a.correct ? 'Correct' : 'Wrong'} · ${(a.timeMs / 1000).toFixed(1)}s`}
                    className={`h-6 w-6 rounded-md ${a.correct ? 'bg-success' : 'bg-heart'}`}
                  />
                ))}
              </div>
            </div>

            {/* per-question log */}
            <div className="mb-2 font-extrabold text-[#444]">Per-Question Log</div>
            <div className="flex flex-col gap-2">
              {attempts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm"
                >
                  {a.correct ? (
                    <CheckCircle2 className="shrink-0 text-success" />
                  ) : (
                    <XCircle className="shrink-0 text-heart" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-[#444]">
                      {a.questionText || `(${a.kind} question)`}
                    </div>
                    <div className="text-xs text-[#999]">
                      <span className="capitalize">{a.subject}</span> ·{' '}
                      <span className="capitalize">{a.kind}</span> · {timeAgo(a.at)}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-bold text-teal">
                      {(a.timeMs / 1000).toFixed(1)}s
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Screen>
  )
}

function Mini({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-white p-3 shadow-sm">
      {icon}
      <span className="text-lg font-extrabold text-[#333]">{value}</span>
      <span className="text-[11px] font-semibold text-[#999]">{label}</span>
    </div>
  )
}
