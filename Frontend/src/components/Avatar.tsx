import type { AvatarId } from '../types';

interface Props {
  id: AvatarId;
  size?: number;
  ring?: boolean;
}

const config: Record<
  AvatarId,
  { bg: string; ear: string; face: string; emojiFree: 'round' | 'pointy' | 'big' }
> = {
  panda: { bg: '#fee2c6', ear: '#3a3a3a', face: '#ffffff', emojiFree: 'round' },
  tiger: { bg: '#ffd600', ear: '#fe6538', face: '#ffedcf', emojiFree: 'pointy' },
  elephant: { bg: '#c7d2fe', ear: '#a5b4fc', face: '#e0e7ff', emojiFree: 'big' },
  monkey: { bg: '#e7c9a9', ear: '#b98a5e', face: '#f5e6d3', emojiFree: 'round' },
  rhino: { bg: '#cbd5e1', ear: '#94a3b8', face: '#e2e8f0', emojiFree: 'pointy' },
  peacock: { bg: '#0da8a7', ear: '#0a8584', face: '#a7f3eb', emojiFree: 'pointy' },
  yak: { bg: '#8b7355', ear: '#5c4a37', face: '#d6c4a8', emojiFree: 'big' },
  rabbit: { bg: '#fbcfe8', ear: '#f9a8d4', face: '#fdf2f8', emojiFree: 'pointy' },
};

/** Compact, emoji-free animal avatar built from SVG shapes. */
export default function Avatar({ id, size = 56, ring = false }: Props) {
  const c = config[id];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: c.bg,
        boxShadow: ring ? '0 0 0 3px #fff, 0 0 0 6px #0da8a7' : undefined,
      }}
      className="flex items-center justify-center overflow-hidden shrink-0"
    >
      <svg viewBox="0 0 100 100" width={size * 0.86} height={size * 0.86}>
        {/* ears */}
        {c.emojiFree === 'pointy' ? (
          <>
            <polygon points="22,12 38,40 14,42" fill={c.ear} />
            <polygon points="78,12 62,40 86,42" fill={c.ear} />
          </>
        ) : (
          <>
            <circle cx="28" cy="28" r="14" fill={c.ear} />
            <circle cx="72" cy="28" r="14" fill={c.ear} />
          </>
        )}
        {/* head */}
        <circle cx="50" cy="56" r="34" fill={c.face} />
        {/* eyes */}
        <circle cx="40" cy="52" r="5" fill="#241208" />
        <circle cx="60" cy="52" r="5" fill="#241208" />
        <circle cx="41.5" cy="50" r="1.6" fill="#fff" />
        <circle cx="61.5" cy="50" r="1.6" fill="#fff" />
        {/* nose + smile */}
        <ellipse cx="50" cy="64" rx="5" ry="3.5" fill="#7a2e16" />
        <path
          d="M42 70 q8 8 16 0"
          stroke="#7a2e16"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export const AVATAR_IDS: AvatarId[] = [
  'panda',
  'tiger',
  'elephant',
  'monkey',
  'rhino',
  'peacock',
  'yak',
  'rabbit',
];
