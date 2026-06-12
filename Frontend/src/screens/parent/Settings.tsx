import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Clock, LogOut } from 'lucide-react'
import { Screen } from '../../components/ui'
import Avatar from '../../components/Avatar'
import { useGame } from '../../store/GameStore'

export default function Settings() {
  const nav = useNavigate()
  const { children, regenerateCode } = useGame()
  const [limit, setLimit] = useState(30)

  return (
    <Screen>
      <div className="min-h-svh px-6 pb-10 pt-6">
        <button onClick={() => nav('/parent/dashboard')} className="mb-2 text-teal">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-3xl font-extrabold text-teal">Settings</h1>
        <p className="mb-6 font-semibold text-orange">सेटिङ</p>

        <div className="mb-2 font-bold text-[#555]">Children</div>
        <div className="mb-6 flex flex-col gap-2">
          {children.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <Avatar id={c.avatar} size={44} />
              <div className="flex-1">
                <div className="font-bold text-[#333]">{c.name}</div>
                <div className="font-mono text-sm tracking-widest text-teal">
                  {c.childCode}
                </div>
              </div>
              <button
                onClick={() => regenerateCode(c.id)}
                className="flex items-center gap-1 rounded-xl bg-teal/10 px-3 py-2 text-sm font-bold text-teal"
              >
                <RefreshCw size={16} /> New code
              </button>
            </div>
          ))}
        </div>

        <div className="mb-2 font-bold text-[#555]">Daily Time Limit</div>
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <Clock className="text-orange" />
          <input
            type="range"
            min={10}
            max={120}
            step={10}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="flex-1 accent-teal"
          />
          <span className="w-16 text-right font-extrabold text-teal">{limit} min</span>
        </div>

        <button
          onClick={() => nav('/role')}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-heart/10 py-4 font-bold text-heart"
        >
          <LogOut size={20} /> Log out
        </button>
      </div>
    </Screen>
  )
}
