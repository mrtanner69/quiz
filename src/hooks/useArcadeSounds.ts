import { useRef, useCallback } from 'react';

/**
 * 1980s arcade-style sound effects using Web Audio API.
 * All sounds are synthesized — no external files needed.
 */
export function useArcadeSounds() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  /** Short 8-bit blip when clicking a choice button */
  const playClick = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }, [getCtx]);

  /** Ascending arpeggio — Pac-Man power-up style */
  const playCorrect = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const t = now + i * 0.08;

      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.setValueAtTime(0.15, t + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    });
  }, [getCtx]);

  /** Descending buzz — classic wrong-answer wah */
  const playWrong = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;

    // Two-tone descending buzz
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(440, now);
    osc1.frequency.exponentialRampToValueAtTime(220, now + 0.15);
    osc1.frequency.exponentialRampToValueAtTime(110, now + 0.35);

    const osc2 = ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(415, now);
    osc2.frequency.exponentialRampToValueAtTime(207, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(104, now + 0.35);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.setValueAtTime(0.12, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  }, [getCtx]);

  /** Time's up — descending wobble */
  const playTimeout = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.4);
    osc.frequency.setValueAtTime(220, now + 0.45);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.7);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.setValueAtTime(0.08, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.75);
  }, [getCtx]);

  /** Game start — retro boot-up jingle */
  const playStart = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;
    const notes = [262, 330, 392, 523, 659, 784]; // C4 E4 G4 C5 E5 G5

    notes.forEach((freq, i) => {
      const t = now + i * 0.07;
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.13, t);
      gain.gain.setValueAtTime(0.13, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    });
  }, [getCtx]);

  /** Next bird — quick chirp transition */
  const playNext = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }, [getCtx]);

  /** Results screen — short victory fanfare or defeat tune */
  const playResults = useCallback((percent: number) => {
    const ctx = getCtx();
    const now = ctx.currentTime;

    if (percent >= 60) {
      // Victory fanfare: C E G C' G' C''
      const notes = [523, 659, 784, 1047, 784, 1047];
      const durations = [0.1, 0.1, 0.1, 0.15, 0.1, 0.25];
      let t = now;
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.13, t);
        gain.gain.setValueAtTime(0.13, t + durations[i] * 0.7);
        gain.gain.exponentialRampToValueAtTime(0.001, t + durations[i]);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + durations[i]);
        t += durations[i] * 0.85;
      });
    } else {
      // Sad trombone descending
      const notes = [392, 370, 349, 262];
      let t = now;
      notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.setValueAtTime(0.1, t + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
        t += 0.25;
      });
    }
  }, [getCtx]);

  return { playClick, playCorrect, playWrong, playTimeout, playStart, playNext, playResults };
}
