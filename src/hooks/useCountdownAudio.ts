import { useRef, useEffect, useCallback } from 'react';

/**
 * Generates tense ticking audio that speeds up as time runs out.
 * Uses Web Audio API — no external sound files needed.
 */
export function useCountdownAudio(
  active: boolean,
  timeRemaining: number,
  timeLimit: number,
) {
  const ctxRef = useRef<AudioContext | null>(null);
  const nextTickRef = useRef(0);
  const rafRef = useRef(0);
  const activeRef = useRef(active);
  activeRef.current = active;

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playTick = useCallback((urgency: number) => {
    // urgency: 0 (full time) to 1 (no time left)
    const ctx = getContext();
    const now = ctx.currentTime;

    // Base frequency rises with urgency: 220Hz -> 440Hz
    const freq = 220 + urgency * 220;

    // Short percussive tick
    const duration = 0.06;

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + duration);

    const gain = ctx.createGain();
    // Volume increases with urgency: 0.08 -> 0.25
    const volume = 0.08 + urgency * 0.17;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }, [getContext]);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current);
      nextTickRef.current = 0;
      return;
    }

    // Tick interval decreases with urgency: 600ms -> 150ms
    function schedule() {
      if (!activeRef.current) return;

      const now = performance.now();
      const fraction = timeRemaining / timeLimit; // 1 = full, 0 = empty
      const urgency = 1 - fraction;

      if (now >= nextTickRef.current) {
        playTick(urgency);
        // Interval: 600ms at start -> 150ms at end
        const interval = 600 - urgency * 450;
        nextTickRef.current = now + interval;
      }

      rafRef.current = requestAnimationFrame(schedule);
    }

    // Start first tick immediately
    if (nextTickRef.current === 0) {
      nextTickRef.current = performance.now();
    }
    rafRef.current = requestAnimationFrame(schedule);

    return () => cancelAnimationFrame(rafRef.current);
  }, [active, timeRemaining, timeLimit, playTick]);

  // Cleanup AudioContext on unmount
  useEffect(() => {
    return () => {
      ctxRef.current?.close();
      ctxRef.current = null;
    };
  }, []);
}
