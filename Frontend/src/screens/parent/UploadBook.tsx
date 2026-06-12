import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ImagePlus, X, Wand2, Sparkles, Map } from 'lucide-react'
import { Screen, Button } from '../../components/ui'
import { useGame } from '../../store/GameStore'
import type { SubjectId } from '../../types'

const SUBJECTS: { id: SubjectId; label: string; np: string }[] = [
  { id: 'math', label: 'Math', np: 'गणित' },
  { id: 'nepali', label: 'Nepali', np: 'नेपाली' },
  { id: 'science', label: 'Science', np: 'विज्ञान' },
  { id: 'english', label: 'English', np: 'अंग्रेजी' },
]

const STEPS = [
  { icon: Wand2, label: 'Reading your book…', np: 'किताब पढ्दै…' },
  { icon: Sparkles, label: 'Making questions…', np: 'प्रश्न बनाउँदै…' },
  { icon: Map, label: 'Building the game map…', np: 'नक्सा बनाउँदै…' },
]

export default function UploadBook() {
  const nav = useNavigate()
  const { children, uploadBook } = useGame()
  const fileRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [subject, setSubject] = useState<SubjectId>('math')
  const [phase, setPhase] = useState<'pick' | 'processing'>('pick')
  const [step, setStep] = useState(0)

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    setFiles((f) => [...f, ...picked])
    setPhotos((p) => [...p, ...picked.map((f) => URL.createObjectURL(f))])
  }

  const removeAt = (i: number) => {
    setPhotos((p) => p.filter((_, j) => j !== i))
    setFiles((f) => f.filter((_, j) => j !== i))
  }

  const generate = () => {
    const child = children[0]
    if (!child) return
    uploadBook(child.id, subject, files)
    setPhase('processing')
    setStep(0)
    setTimeout(() => setStep(1), 1400)
    setTimeout(() => setStep(2), 2800)
    setTimeout(() => nav('/parent/dashboard'), 4600)
  }

  return (
    <Screen>
      <div className="flex min-h-svh flex-col px-6 pt-6 pb-10">
        <AnimatePresence mode="wait">
          {phase === 'pick' ? (
            <motion.div key="pick" exit={{ opacity: 0 }}>
              <button onClick={() => nav(-1)} className="mb-2 w-fit text-teal">
                <ArrowLeft size={28} />
              </button>
              <h1 className="text-3xl font-extrabold text-teal">Upload Book Pages</h1>
              <p className="mb-5 font-semibold text-orange">किताबका पानाहरू अपलोड गर्नुहोस्</p>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={onPick}
              />

              <div className="mb-5 grid grid-cols-3 gap-3">
                {photos.map((src, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative aspect-square overflow-hidden rounded-2xl"
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => removeAt(i)}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-teal/40 bg-teal/5 text-teal"
                >
                  <ImagePlus size={28} />
                  <span className="text-xs font-bold">Add</span>
                </button>
              </div>

              <label className="mb-2 block font-bold text-[#555]">Subject / विषय</label>
              <div className="mb-8 grid grid-cols-2 gap-3">
                {SUBJECTS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSubject(s.id)}
                    className={`min-h-[56px] rounded-2xl font-bold transition-colors ${
                      subject === s.id ? 'bg-teal text-white' : 'bg-white text-teal shadow-sm'
                    }`}
                  >
                    {s.label} · {s.np}
                  </button>
                ))}
              </div>

              <Button full variant="accent" disabled={photos.length === 0} onClick={generate}>
                Generate Questions / प्रश्न बनाउनुहोस्
              </Button>
              {photos.length === 0 && (
                <p className="mt-3 text-center text-sm text-[#999]">
                  Add at least one photo to continue
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="proc"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-1 flex-col items-center justify-center"
            >
              <div className="flex w-full max-w-[300px] flex-col gap-4">
                {STEPS.map((s, i) => {
                  const active = i === step
                  const done = i < step
                  return (
                    <motion.div
                      key={i}
                      animate={{
                        scale: active ? 1.04 : 1,
                        opacity: i <= step ? 1 : 0.4,
                      }}
                      className={`flex items-center gap-4 rounded-2xl p-4 ${
                        active ? 'bg-teal text-white shadow-lg' : 'bg-white text-teal'
                      }`}
                    >
                      <motion.span
                        animate={active ? { rotate: [0, 12, -12, 0] } : {}}
                        transition={{ repeat: Infinity, duration: 1.2 }}
                      >
                        <s.icon size={28} />
                      </motion.span>
                      <div>
                        <div className="font-extrabold">{s.label}</div>
                        <div className="text-sm opacity-80">{s.np}</div>
                      </div>
                      {done && <span className="ml-auto text-success">✓</span>}
                    </motion.div>
                  )
                })}
              </div>
              <p className="mt-8 font-semibold text-orange">Hang tight! · पर्खनुहोस्</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Screen>
  )
}
