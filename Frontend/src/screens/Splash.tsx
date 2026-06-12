import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../components/ui';

export default function Splash() {
  const nav = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => nav('/role'), 2200);
    return () => clearTimeout(t);
  }, [nav]);

  return (
    <Screen>
      <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-b from-peach via-cream to-mist">
        <motion.img
          src="/nanigo_logo.png"
          alt="NaniGO"
          className="w-44 drop-shadow-xl"
          initial={{ scale: 0, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        />
        <motion.p
          className="mt-6 text-lg font-semibold text-teal"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          Learn • Play • Win
        </motion.p>
        <motion.div
          className="mt-8 flex gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-3 w-3 rounded-full bg-orange"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </motion.div>
      </div>
    </Screen>
  );
}
