import type { Question } from '../types'

export default function Figure({ kind }: { kind: NonNullable<Question['figure']> }) {
  const c = '#0DA8A7'
  return (
    <svg viewBox="0 0 120 120" width={120} height={120}>
      {kind === 'rectangle' && <rect x="15" y="35" width="90" height="50" rx="6" fill={c} />}
      {kind === 'square' && <rect x="25" y="25" width="70" height="70" rx="6" fill={c} />}
      {kind === 'circle' && <circle cx="60" cy="60" r="42" fill={c} />}
      {kind === 'triangle' && <polygon points="60,18 102,98 18,98" fill={c} />}
      {kind === 'star' && (
        <polygon
          points="60,12 73,46 110,46 80,68 92,104 60,82 28,104 40,68 10,46 47,46"
          fill={c}
        />
      )}
    </svg>
  )
}
