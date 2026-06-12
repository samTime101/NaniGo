import confetti from 'canvas-confetti';

const COLORS = ['#0DA8A7', '#FE6538', '#FFD600', '#22C55E', '#FFDFCC'];

export function burst() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: COLORS,
  });
}

export function rain() {
  const end = Date.now() + 1500;
  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: COLORS,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: COLORS,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

/** Tiny audio + haptic cue hook for correct/wrong. */
export function cue(type: 'correct' | 'wrong' | 'win') {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(type === 'wrong' ? 120 : type === 'win' ? [60, 40, 60] : 40);
    }
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    const now = ctx.currentTime;
    if (type === 'correct') osc.frequency.setValueAtTime(880, now);
    else if (type === 'win') osc.frequency.setValueAtTime(1046, now);
    else osc.frequency.setValueAtTime(220, now);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } catch {
    /* audio not available */
  }
}
