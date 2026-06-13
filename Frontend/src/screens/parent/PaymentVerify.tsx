import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { CheckCircle, XCircle } from 'lucide-react'
import { useGame } from '../../store/GameStore'
import { Screen } from '../../components/ui'

export default function PaymentVerify() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const { refreshParent } = useGame()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const pidx = params.get('pidx')
    if (!pidx) {
      setStatus('error')
      setMessage('Invalid payment parameters')
      return
    }

    api.verifyPayment(pidx)
      .then(async () => {
        await refreshParent()
        setStatus('success')
        setMessage('Your subscription has been upgraded to Pro!')
      })
      .catch((e) => {
        setStatus('error')
        setMessage(e.message || 'Payment verification failed.')
      })
  }, [params])

  return (
    <Screen>
      <div className="flex min-h-svh flex-col items-center justify-center px-5 py-10">
        <div className="w-full rounded-[2rem] bg-white p-8 text-center shadow-lg">
          {status === 'verifying' && (
            <div className="animate-pulse">
              <div className="mb-4 text-2xl font-bold text-teal">Verifying Payment...</div>
              <p className="text-[#666]">Please wait while we confirm your payment.</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <CheckCircle className="mx-auto mb-4 text-success" size={64} />
              <div className="mb-2 text-2xl font-bold text-teal">Payment Successful!</div>
              <p className="mb-8 text-[#666]">{message}</p>
              <button
                onClick={() => nav('/parent')}
                className="w-full rounded-2xl bg-teal py-4 text-lg font-extrabold text-white shadow-[0_6px_0_0_#0a8584] transition-transform active:translate-y-[6px] active:shadow-none"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {status === 'error' && (
            <div>
              <XCircle className="mx-auto mb-4 text-heart" size={64} />
              <div className="mb-2 text-2xl font-bold text-heart">Payment Failed</div>
              <p className="mb-8 text-[#666]">{message}</p>
              <button
                onClick={() => nav('/parent/pricing')}
                className="w-full rounded-2xl bg-mist py-4 text-lg font-extrabold text-[#666] shadow-[0_6px_0_0_#c3d2cc] transition-transform active:translate-y-[6px] active:shadow-none"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </Screen>
  )
}
