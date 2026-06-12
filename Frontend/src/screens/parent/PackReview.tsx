import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronDown,
  CheckCircle2,
  Shuffle,
  ListOrdered,
  HelpCircle,
} from 'lucide-react'
import { Screen, Loading } from '../../components/ui'
import { useGame } from '../../store/GameStore'
import type { Question, QuestionPack } from '../../types'

export default function PackReview() {
  const nav = useNavigate()
  const { packs, ready } = useGame()
  const [openPack, setOpenPack] = useState<string | null>(null)

  if (!ready) return <Loading />

  const sorted = [...packs].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'personalized' ? -1 : 1
    return (b.createdAt ?? 0) - (a.createdAt ?? 0)
  })

  return (
    <Screen>
      <div className="min-h-svh px-5 pb-12 pt-5">
        <div className="mb-4 flex items-center gap-3">
          <button onClick={() => nav('/parent/dashboard')} className="text-teal">
            <ArrowLeft size={26} />
          </button>
          <div>
            <div className="text-xl font-extrabold text-teal leading-tight">
              Question Bank
            </div>
            <div className="text-sm text-[#999]">प्रश्न र उत्तर हेर्नुहोस्</div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {sorted.map((pack) => (
            <PackCard
              key={pack.id}
              pack={pack}
              open={openPack === pack.id}
              onToggle={() =>
                setOpenPack((o) => (o === pack.id ? null : pack.id))
              }
            />
          ))}
        </div>
      </div>
    </Screen>
  )
}

function PackCard({
  pack,
  open,
  onToggle,
}: {
  pack: QuestionPack
  open: boolean
  onToggle: () => void
}) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#333]">{pack.title}</span>
            {pack.type === 'personalized' && (
              <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs font-bold text-[#a07c00]">
                From Book
              </span>
            )}
          </div>
          <div className="text-sm text-[#999]">
            {pack.questions.length} questions · {pack.titleNp}
          </div>
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-teal">
          <ChevronDown size={24} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4"
          >
            <div className="flex flex-col gap-3 pb-4">
              {pack.questions.length === 0 && (
                <div className="rounded-2xl bg-cream p-4 text-center text-sm text-[#999]">
                  Questions are still being generated…
                </div>
              )}
              {pack.questions.map((q, i) => (
                <QuestionView key={q.id} q={q} n={i + 1} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function KindBadge({ kind }: { kind: Question['kind'] }) {
  const map = {
    mcq: { icon: HelpCircle, label: 'Choice', c: 'text-teal bg-teal/10' },
    match: { icon: Shuffle, label: 'Match', c: 'text-orange bg-orange/10' },
    order: { icon: ListOrdered, label: 'Order', c: 'text-success bg-success/10' },
  }
  const m = map[kind ?? 'mcq']
  const Icon = m.icon
  return (
    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${m.c}`}>
      <Icon size={13} /> {m.label}
    </span>
  )
}

function QuestionView({ q, n }: { q: Question; n: number }) {
  const kind = q.kind ?? 'mcq'
  return (
    <div className="rounded-2xl border border-mist bg-cream/50 p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="font-bold text-[#333]">
          {n}. {q.text}
        </div>
        <KindBadge kind={kind} />
      </div>

      {kind === 'mcq' && (
        <div className="flex flex-col gap-1.5">
          {q.options.map((opt, i) => {
            const correct = i === q.correctIndex
            return (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
                  correct ? 'bg-success/15 text-success' : 'bg-white text-[#666]'
                }`}
              >
                {correct ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <span className="h-4 w-4 rounded-full border-2 border-mist" />
                )}
                {opt}
              </div>
            )
          })}
        </div>
      )}

      {kind === 'match' && q.pairs && (
        <div className="flex flex-col gap-1.5">
          {q.pairs.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-[#444]"
            >
              <span className="text-orange">{p.left}</span>
              <span className="text-[#bbb]">→</span>
              <span className="text-teal">{p.right}</span>
            </div>
          ))}
        </div>
      )}

      {kind === 'order' && q.sequence && (
        <div className="flex flex-wrap items-center gap-1.5">
          {q.sequence.map((s, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="rounded-xl bg-white px-3 py-1.5 text-sm font-semibold text-[#444]">
                {s}
              </span>
              {i < q.sequence!.length - 1 && <span className="text-[#bbb]">›</span>}
            </span>
          ))}
        </div>
      )}

      <div className="mt-2 text-sm text-[#888]">💡 {q.explanation}</div>
    </div>
  )
}
