import { motion } from 'framer-motion';

export type MascotMood = 'happy' | 'wave' | 'jump' | 'sad' | 'sleep';

interface Props {
  mood?: MascotMood;
  size?: number;
}

/** Friendly red panda mascot — native to Nepal. Pure SVG, mood-driven. */
export default function Mascot({ mood = 'happy', size = 140 }: Props) {
  const anim =
    mood === 'jump'
      ? { y: [0, -18, 0], transition: { duration: 0.6, repeat: Infinity } }
      : mood === 'wave'
        ? { rotate: [0, -3, 3, 0], transition: { duration: 1.6, repeat: Infinity } }
        : mood === 'sad'
          ? { y: [0, 3, 0], transition: { duration: 2, repeat: Infinity } }
          : mood === 'sleep'
            ? { y: [0, 2, 0], transition: { duration: 3, repeat: Infinity } }
            : { y: [0, -4, 0], transition: { duration: 2.4, repeat: Infinity } };

  const sleeping = mood === 'sleep';
  const sad = mood === 'sad';

  return (
    <motion.div animate={anim} style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" width={size} height={size}>
        {/* ears */}
        <circle cx="48" cy="58" r="26" fill="#9b3b1f" />
        <circle cx="152" cy="58" r="26" fill="#9b3b1f" />
        <circle cx="48" cy="58" r="14" fill="#f6e7d6" />
        <circle cx="152" cy="58" r="14" fill="#f6e7d6" />
        {/* face base */}
        <circle cx="100" cy="110" r="68" fill="#d96a3a" />
        {/* cheeks / face mask */}
        <ellipse cx="70" cy="120" rx="34" ry="40" fill="#f6e7d6" />
        <ellipse cx="130" cy="120" rx="34" ry="40" fill="#f6e7d6" />
        <ellipse cx="100" cy="130" rx="30" ry="34" fill="#fff8f0" />
        {/* eye patches */}
        <path d="M58 96 q14 -22 30 -6 q-8 20 -30 14 z" fill="#7a2e16" />
        <path d="M142 96 q-14 -22 -30 -6 q8 20 30 14 z" fill="#7a2e16" />
        {/* eyes */}
        {sleeping ? (
          <>
            <path d="M64 104 q10 8 20 0" stroke="#3a1c10" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M116 104 q10 8 20 0" stroke="#3a1c10" strokeWidth="4" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="76" cy="108" r="8" fill="#241208" />
            <circle cx="124" cy="108" r="8" fill="#241208" />
            <circle cx="78" cy="105" r="2.5" fill="#fff" />
            <circle cx="126" cy="105" r="2.5" fill="#fff" />
          </>
        )}
        {/* nose */}
        <ellipse cx="100" cy="132" rx="9" ry="6" fill="#3a1c10" />
        {/* mouth */}
        {sad ? (
          <path d="M86 152 q14 -12 28 0" stroke="#3a1c10" strokeWidth="4" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M86 146 q14 14 28 0" stroke="#3a1c10" strokeWidth="4" fill="none" strokeLinecap="round" />
        )}
        {/* blush */}
        <circle cx="58" cy="138" r="7" fill="#ff9a76" opacity="0.6" />
        <circle cx="142" cy="138" r="7" fill="#ff9a76" opacity="0.6" />
        {/* zzz when sleeping */}
        {sleeping && (
          <g fill="#0da8a7" fontFamily="Baloo 2, sans-serif" fontWeight="700">
            <text x="150" y="60" fontSize="18">z</text>
            <text x="166" y="44" fontSize="24">Z</text>
          </g>
        )}
      </svg>
    </motion.div>
  );
}
