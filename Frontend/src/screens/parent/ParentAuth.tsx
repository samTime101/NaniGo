import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react'
import { Screen, Button } from '../../components/ui'
import { useGame } from '../../store/GameStore'

export default function ParentAuth() {
  const nav = useNavigate()
  const { login, signup } = useGame()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('demo@nanigo.app')
  const [password, setPassword] = useState('demo1234')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

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

  return (
    <Screen>
      <div className="flex min-h-svh flex-col px-6 pt-6 pb-10">
        <button onClick={() => nav('/role')} className="mb-4 w-fit text-teal">
          <ArrowLeft size={28} />
        </button>
        <img src="/nanigo_logo.png" alt="NaniGO" className="mx-auto w-24" />
        <h1 className="mt-3 text-center text-3xl font-extrabold text-teal">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="mb-6 text-center font-semibold text-orange">
          {mode === 'login' ? 'फेरि स्वागत छ' : 'खाता बनाउनुहोस्'}
        </p>

        <div className="mb-4 flex rounded-2xl bg-mist p-1">
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

        <motion.div layout className="flex flex-col gap-3">
          {mode === 'signup' && (
            <Field icon={<User size={22} />} placeholder="Your name" value={name} onChange={setName} />
          )}
          <Field icon={<Mail size={22} />} placeholder="Email or phone" value={email} onChange={setEmail} />
          <Field icon={<Lock size={22} />} placeholder="Password" value={password} onChange={setPassword} type="password" />
        </motion.div>

        <div className="mt-6">
          <Button full variant="primary" onClick={submit} disabled={busy}>
            {busy ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={22} /> Please wait…
              </span>
            ) : mode === 'login' ? (
              'Log In / लग इन'
            ) : (
              'Sign Up / दर्ता'
            )}
          </Button>
        </div>

        {error && (
          <p className="mt-3 text-center font-semibold text-heart">{error}</p>
        )}

        {mode === 'login' && (
          <p className="mt-4 text-center text-sm text-[#8a8a96]">
            Demo: demo@nanigo.app / demo1234
          </p>
        )}
      </div>
    </Screen>
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
