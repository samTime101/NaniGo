import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Loader2, Check, Globe } from 'lucide-react'
import { Button } from '../../components/ui'
import { WizardShell, MascotSay } from '../../components/Wizard'
import { useGame } from '../../store/GameStore'
import { useLang, Bi, type Lang } from '../../lib/lang'

type Step = 'welcome' | 'language' | 'account'
const ORDER: Step[] = ['welcome', 'language', 'account']

const LANGS: { id: Lang; label: string; sub: string }[] = [
  { id: 'en', label: 'English', sub: 'English only' },
  { id: 'np', label: 'नेपाली', sub: 'Nepali only' },
  { id: 'both', label: 'Both', sub: 'English + नेपाली' },
]

export default function ParentAuth() {
  const nav = useNavigate()
  const { login, signup } = useGame()
  const { lang, setLang } = useLang()
  const [step, setStep] = useState<Step>('welcome')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('demo@nanigo.app')
  const [password, setPassword] = useState('demo1234')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const idx = ORDER.indexOf(step)
  const progress = (idx + 1) / ORDER.length

  const back = () => {
    if (idx === 0) nav('/role')
    else setStep(ORDER[idx - 1])
  }

  const submit = async () => {
    setBusy(true)
    setError('')
    try {
      if (mode === 'signup') {
        await signup(name || 'Parent', email, password)
        nav('/parent/add-child')
      } else {
        await login(email, password)
        nav('/parent/dashboard')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  const footer =
    step === 'welcome' ? (
      <Button full variant="primary" onClick={() => setStep('language')}>
        <Bi en="Continue" np="अगाडि बढ्नुहोस्" />
      </Button>
    ) : step === 'language' ? (
      <Button full variant="primary" onClick={() => setStep('account')}>
        <Bi en="Continue" np="अगाडि बढ्नुहोस्" />
      </Button>
    ) : (
      <Button full variant="primary" onClick={submit} disabled={busy}>
        {busy ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={22} /> Please wait…
          </span>
        ) : mode === 'login' ? (
          <Bi en="Log In" np="लग इन" />
        ) : (
          <Bi en="Sign Up" np="दर्ता गर्नुहोस्" />
        )}
      </Button>
    )

  return (
    <WizardShell progress={progress} onBack={back} footer={footer}>
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex flex-1 flex-col justify-center gap-6"
          >
            <img src="/nanigo_logo.png" alt="NaniGO" className="mx-auto w-24" />
            <MascotSay mood="wave">
              <Bi
                en="Namaste! I'm Nani, your child's learning buddy. Let's set things up!"
                np="नमस्ते! म नानी हुँ, तपाईंको बच्चाको साथी। सुरु गरौं!"
              />
            </MascotSay>
          </motion.div>
        )}

        {step === 'language' && (
          <motion.div
            key="language"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex flex-1 flex-col gap-4"
          >
            <div className="flex items-center gap-2 text-teal">
              <Globe size={26} />
              <h1 className="text-2xl font-extrabold">
                <Bi en="Choose your language" np="भाषा छान्नुहोस्" />
              </h1>
            </div>
            <p className="-mt-2 text-[#888]">You can change this later in Settings.</p>
            <div className="mt-2 flex flex-col gap-3">
              {LANGS.map((l) => (
                <motion.button
                  key={l.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setLang(l.id)}
                  className={`flex items-center justify-between rounded-3xl border-2 p-5 text-left transition-colors ${
                    lang === l.id
                      ? 'border-teal bg-teal/10'
                      : 'border-mist bg-white'
                  }`}
                >
                  <div>
                    <div className="text-xl font-extrabold text-[#333]">{l.label}</div>
                    <div className="text-sm text-[#999]">{l.sub}</div>
                  </div>
                  {lang === l.id && (
                    <span className="rounded-full bg-teal p-1.5 text-white">
                      <Check size={18} />
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'account' && (
          <motion.div
            key="account"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex flex-1 flex-col"
          >
            <h1 className="text-2xl font-extrabold text-teal">
              <Bi
                en={mode === 'login' ? 'Welcome back' : 'Create your account'}
                np={mode === 'login' ? 'फेरि स्वागत छ' : 'खाता बनाउनुहोस्'}
              />
            </h1>

            <div className="mb-4 mt-4 flex rounded-2xl bg-mist p-1">
              {(['login', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-xl py-2.5 font-bold capitalize transition-colors ${
                    mode === m ? 'bg-white text-teal shadow' : 'text-[#7a8a86]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {mode === 'signup' && (
                <Field icon={<User size={22} />} placeholder="Your name" value={name} onChange={setName} />
              )}
              <Field icon={<Mail size={22} />} placeholder="Email or phone" value={email} onChange={setEmail} />
              <Field icon={<Lock size={22} />} placeholder="Password" value={password} onChange={setPassword} type="password" />
            </div>

            {error && <p className="mt-3 font-semibold text-heart">{error}</p>}
            {mode === 'login' && (
              <p className="mt-4 text-center text-sm text-[#8a8a96]">
                Demo: demo@nanigo.app / demo1234
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </WizardShell>
  )
}

function Field({
  icon,
  placeholder,
  value,
  onChange,
  type = 'text',
}: {
  icon: React.ReactNode
  placeholder: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border-2 border-mist bg-white px-4 focus-within:border-teal">
      <span className="text-teal">{icon}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[56px] flex-1 bg-transparent text-lg outline-none"
      />
    </div>
  )
}
