import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

/** Bilingual label: English with a small Devanagari subtitle. */
export function BiLabel({
  en,
  np,
  className = '',
}: {
  en: string;
  np: string;
  className?: string;
}) {
  return (
    <span className={`flex flex-col leading-tight ${className}`}>
      <span>{en}</span>
      <span className="text-[0.7em] font-medium opacity-70">{np}</span>
    </span>
  );
}

type ButtonProps = HTMLMotionProps<'button'> & {
  variant?: 'primary' | 'accent' | 'gold' | 'white' | 'ghost';
  full?: boolean;
};

const variants: Record<string, string> = {
  primary: 'bg-teal text-white shadow-[0_6px_0_0_#0a8584]',
  accent: 'bg-orange text-white shadow-[0_6px_0_0_#e54f24]',
  gold: 'bg-gold text-[#5a4a00] shadow-[0_6px_0_0_#e6c000]',
  white: 'bg-white text-teal shadow-[0_6px_0_0_#dfe9e4]',
  ghost: 'bg-transparent text-teal',
};

/** Chunky bouncy button — scales to 0.95 on press with spring-back. */
export function Button({
  children,
  variant = 'primary',
  full = false,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95, y: 3 }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      className={`min-h-[56px] rounded-2xl px-6 font-bold text-[20px] active:translate-y-[3px] disabled:opacity-50 ${
        variants[variant]
      } ${full ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

export function Card({
  children,
  className = '',
  ...rest
}: HTMLMotionProps<'div'> & { children: ReactNode }) {
  return (
    <motion.div
      className={`rounded-3xl bg-white p-5 shadow-[0_10px_25px_-12px_rgba(13,168,167,0.3)] ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Mobile phone-style container keeping the app at a 375px-first width. */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-svh w-full max-w-[480px] bg-cream">
      {children}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-mist ${className}`} />
  );
}

export function Loading() {
  return (
    <Screen>
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-cream">
        <img src="/nanigo_logo.png" alt="NaniGO" className="w-20 opacity-90" />
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2.5 w-2.5 rounded-full bg-teal"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </Screen>
  );
}
