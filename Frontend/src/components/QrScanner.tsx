import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode'

interface Props {
  onScan: (text: string) => void
  onError?: (message: string) => void
}

const REGION_ID = 'nanigo-qr-region'

/** Live camera QR scanner. Requires a secure context (https / localhost). */
export default function QrScanner({ onScan, onError }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const handledRef = useRef(false)
  const onScanRef = useRef(onScan)
  const onErrorRef = useRef(onError)
  const [phase, setPhase] = useState<'starting' | 'running' | 'error'>(
    'starting',
  )

  onScanRef.current = onScan
  onErrorRef.current = onError

  useEffect(() => {
    // Camera needs a secure context. http:// on a LAN IP is blocked.
    if (
      !window.isSecureContext ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setPhase('error')
      onErrorRef.current?.('insecure-context')
      return
    }

    let active = true
    let instance: Html5Qrcode
    try {
      instance = new Html5Qrcode(REGION_ID)
    } catch (e) {
      setPhase('error')
      onErrorRef.current?.(String(e))
      return
    }
    scannerRef.current = instance

    instance
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 230, height: 230 } },
        (decodedText) => {
          if (handledRef.current) return
          handledRef.current = true
          onScanRef.current(decodedText)
        },
        () => {
          /* per-frame decode miss — ignore */
        },
      )
      .then(() => {
        if (active) setPhase('running')
      })
      .catch((err) => {
        if (!active) return
        setPhase('error')
        onErrorRef.current?.(
          err instanceof Error ? err.message : 'camera-failed',
        )
      })

    return () => {
      active = false
      const inst = scannerRef.current
      scannerRef.current = null
      if (!inst) return
      try {
        if (inst.getState() === Html5QrcodeScannerState.SCANNING) {
          inst
            .stop()
            .then(() => inst.clear())
            .catch(() => {})
        } else {
          inst.clear()
        }
      } catch {
        /* already torn down */
      }
    }
  }, [])

  return (
    <div className="relative mx-auto h-64 w-64 overflow-hidden rounded-3xl border-4 border-white/30 bg-black/40">
      <div
        id={REGION_ID}
        className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover [&_img]:hidden"
      />

      {/* scanner overlay: corners + laser */}
      {[
        'left-2 top-2 border-l-4 border-t-4 rounded-tl-xl',
        'right-2 top-2 border-r-4 border-t-4 rounded-tr-xl',
        'left-2 bottom-2 border-l-4 border-b-4 rounded-bl-xl',
        'right-2 bottom-2 border-r-4 border-b-4 rounded-br-xl',
      ].map((c) => (
        <span
          key={c}
          className={`pointer-events-none absolute h-10 w-10 border-gold ${c}`}
        />
      ))}
      {phase === 'running' && (
        <div className="pointer-events-none absolute inset-x-3 top-3 bottom-3 overflow-hidden">
          <div className="animate-[scanline_2.4s_ease-in-out_infinite] h-1 w-full rounded-full bg-gold shadow-[0_0_16px_4px_rgba(255,214,0,0.7)]" />
        </div>
      )}
      {phase === 'starting' && (
        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
          Starting camera…
        </div>
      )}
    </div>
  )
}
