import { useEffect, useRef, useCallback } from 'react';

/**
 * OTT 80s arcade celebration for a perfect 20/20 score.
 * Canvas fireworks + flashing background + chiptune victory melody.
 */
export function PerfectScoreCelebration() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // ──────────────────────────────────────────────
  //  80s ARCADE CELEBRATION TUNE (Web Audio synth)
  // ──────────────────────────────────────────────
  const playCelebrationTune = useCallback(() => {
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const now = ctx.currentTime;

    // Master gain
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.18, now);
    master.connect(ctx.destination);

    // Helper: play a note
    const note = (
      freq: number,
      start: number,
      dur: number,
      type: OscillatorType = 'square',
      vol = 0.15,
      dest: AudioNode = master
    ) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + start);
      const g = ctx.createGain();
      g.gain.setValueAtTime(vol, now + start);
      g.gain.setValueAtTime(vol, now + start + dur * 0.75);
      g.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
      osc.connect(g);
      g.connect(dest);
      osc.start(now + start);
      osc.stop(now + start + dur);
    };

    // ── Melody (square wave lead) ──
    // Triumphant fanfare melody — think Galaga / 1942 victory
    const melody: [number, number, number][] = [
      // Intro fanfare burst
      [523, 0.0, 0.12],   // C5
      [659, 0.12, 0.12],  // E5
      [784, 0.24, 0.12],  // G5
      [1047, 0.36, 0.25], // C6 (hold)
      // Descending triplet
      [988, 0.65, 0.1],   // B5
      [880, 0.75, 0.1],   // A5
      [784, 0.85, 0.15],  // G5
      // Rising run
      [880, 1.05, 0.12],  // A5
      [988, 1.17, 0.12],  // B5
      [1047, 1.29, 0.2],  // C6
      [1175, 1.49, 0.12], // D6
      [1319, 1.61, 0.3],  // E6 (hold)
      // Repeat fanfare higher
      [1047, 2.0, 0.1],   // C6
      [1319, 2.1, 0.1],   // E6
      [1568, 2.2, 0.1],   // G6
      [2093, 2.3, 0.35],  // C7 (big hold)
      // Victory descending cascade
      [1568, 2.75, 0.1],  // G6
      [1319, 2.85, 0.1],  // E6
      [1047, 2.95, 0.15], // C6
      [784, 3.15, 0.1],   // G5
      [1047, 3.25, 0.1],  // C6
      [1319, 3.35, 0.15], // E6
      [1568, 3.55, 0.12], // G6
      [2093, 3.67, 0.5],  // C7 (final hold!)
      // Final staccato hits
      [2093, 4.3, 0.08],  // C7
      [2093, 4.45, 0.08], // C7
      [2093, 4.6, 0.4],   // C7 (long final)
    ];

    melody.forEach(([freq, start, dur]) => {
      note(freq, start, dur, 'square', 0.13);
    });

    // ── Bass line (triangle wave) ──
    const bass: [number, number, number][] = [
      [131, 0.0, 0.3],   // C3
      [165, 0.36, 0.25],  // E3
      [196, 0.65, 0.35],  // G3
      [131, 1.05, 0.2],   // C3
      [165, 1.29, 0.2],   // E3
      [196, 1.49, 0.4],   // G3
      [262, 2.0, 0.25],   // C4
      [330, 2.3, 0.35],   // E4
      [196, 2.75, 0.35],  // G3
      [262, 3.15, 0.15],  // C4
      [330, 3.35, 0.15],  // E4
      [392, 3.55, 0.12],  // G4
      [523, 3.67, 0.5],   // C5
      [523, 4.3, 0.08],
      [523, 4.45, 0.08],
      [523, 4.6, 0.4],
    ];

    bass.forEach(([freq, start, dur]) => {
      note(freq, start, dur, 'triangle', 0.12);
    });

    // ── Arpeggiated sparkle (sawtooth, quiet) ──
    const sparkle: [number, number, number][] = [
      [1047, 0.0, 0.06], [1319, 0.06, 0.06], [1568, 0.12, 0.06],
      [2093, 0.18, 0.06], [1568, 0.24, 0.06], [1319, 0.3, 0.06],
      [1047, 2.0, 0.06], [1319, 2.06, 0.06], [1568, 2.12, 0.06],
      [2093, 2.18, 0.06], [2637, 2.24, 0.06], [2093, 2.3, 0.06],
    ];

    sparkle.forEach(([freq, start, dur]) => {
      note(freq, start, dur, 'sawtooth', 0.04);
    });

    // ── Drum hits (noise bursts) ──
    const drumHits = [0.0, 0.36, 0.65, 1.05, 1.49, 2.0, 2.3, 2.75, 3.15, 3.55, 3.67, 4.3, 4.45, 4.6];
    drumHits.forEach((t) => {
      // White noise burst for snare-ish hit
      const bufferSize = ctx.sampleRate * 0.05;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.08, now + t);
      g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.05);
      // Bandpass to shape the drum
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(3000, now + t);
      bp.Q.setValueAtTime(1, now + t);
      noise.connect(bp);
      bp.connect(g);
      g.connect(master);
      noise.start(now + t);
      noise.stop(now + t + 0.05);
    });
  }, []);

  // ──────────────────────────────────────────────
  //  CANVAS FIREWORKS
  // ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d')!;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const handleResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener('resize', handleResize);

    // Particle system
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
      size: number;
      trail: boolean;
    }

    interface Rocket {
      x: number;
      y: number;
      vy: number;
      targetY: number;
      color: string;
      exploded: boolean;
    }

    const particles: Particle[] = [];
    const rockets: Rocket[] = [];

    const colors = [
      '#ff1744', '#ff9100', '#ffd700', '#00e676',
      '#00b0ff', '#d500f9', '#f50057', '#76ff03',
      '#ffea00', '#18ffff', '#e040fb', '#ff6d00',
      '#ff4081', '#69f0ae', '#40c4ff', '#ea80fc',
    ];

    const randomColor = () => colors[Math.floor(Math.random() * colors.length)];

    const explode = (x: number, y: number, color: string) => {
      const count = 60 + Math.floor(Math.random() * 40);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
        const speed = 2 + Math.random() * 5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 0.7 + Math.random() * 0.5,
          color: Math.random() > 0.3 ? color : randomColor(),
          size: 2 + Math.random() * 3,
          trail: Math.random() > 0.4,
        });
      }
      // Inner ring
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        const speed = 1 + Math.random() * 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 0.4 + Math.random() * 0.3,
          color: '#ffffff',
          size: 1.5 + Math.random() * 1.5,
          trail: false,
        });
      }
    };

    const spawnRocket = () => {
      rockets.push({
        x: W * 0.15 + Math.random() * W * 0.7,
        y: H,
        vy: -(8 + Math.random() * 5),
        targetY: H * 0.15 + Math.random() * H * 0.35,
        color: randomColor(),
        exploded: false,
      });
    };

    let elapsed = 0;
    let lastSpawn = 0;
    let lastTime = performance.now();

    // Initial volley
    for (let i = 0; i < 5; i++) {
      setTimeout(() => spawnRocket(), i * 120);
    }

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      elapsed += dt;

      ctx2d.globalCompositeOperation = 'source-over';
      ctx2d.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx2d.fillRect(0, 0, W, H);

      // Spawn rockets periodically
      if (elapsed - lastSpawn > 0.25 + Math.random() * 0.3) {
        spawnRocket();
        if (Math.random() > 0.5) spawnRocket(); // double burst sometimes
        lastSpawn = elapsed;
      }

      // Update rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;
        // Trail particle
        particles.push({
          x: r.x + (Math.random() - 0.5) * 2,
          y: r.y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: 1 + Math.random(),
          life: 1,
          maxLife: 0.3,
          color: '#ffd700',
          size: 2,
          trail: false,
        });

        if (r.y <= r.targetY && !r.exploded) {
          r.exploded = true;
          explode(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      // Update & draw particles
      ctx2d.globalCompositeOperation = 'lighter';
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.vx *= 0.99;
        p.life -= dt / p.maxLife;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = Math.max(0, p.life);
        ctx2d.globalAlpha = alpha;
        ctx2d.fillStyle = p.color;

        // Glow
        ctx2d.shadowBlur = p.size * 4;
        ctx2d.shadowColor = p.color;

        ctx2d.beginPath();
        ctx2d.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx2d.fill();

        // Trail
        if (p.trail && alpha > 0.3) {
          ctx2d.globalAlpha = alpha * 0.3;
          ctx2d.beginPath();
          ctx2d.arc(p.x - p.vx * 2, p.y - p.vy * 2, p.size * 0.6, 0, Math.PI * 2);
          ctx2d.fill();
        }
      }

      ctx2d.shadowBlur = 0;
      ctx2d.globalAlpha = 1;

      // Stop after ~6 seconds
      if (elapsed < 6) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // ──────────────────────────────────────────────
  //  FLASHING OVERLAY
  // ──────────────────────────────────────────────
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const flashColors = [
      'rgba(255, 215, 0, 0.25)',
      'rgba(255, 23, 68, 0.2)',
      'rgba(0, 230, 118, 0.2)',
      'rgba(213, 0, 249, 0.2)',
      'rgba(0, 176, 255, 0.2)',
      'rgba(255, 145, 0, 0.2)',
      'rgba(118, 255, 3, 0.2)',
      'transparent',
    ];

    let i = 0;
    const interval = setInterval(() => {
      overlay.style.backgroundColor = flashColors[i % flashColors.length];
      i++;
      if (i > 50) clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Play the tune on mount
  useEffect(() => {
    playCelebrationTune();
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, [playCelebrationTune]);

  return (
    <div className="perfect-celebration">
      <canvas ref={canvasRef} className="celebration-canvas" />
      <div ref={overlayRef} className="celebration-flash-overlay" />
      <div className="celebration-text-container">
        <div className="celebration-stars">&#9733; &#9733; &#9733;</div>
        <div className="celebration-title">PERFECT</div>
        <div className="celebration-score">20 / 20</div>
        <div className="celebration-subtitle">FLAWLESS VICTORY</div>
        <div className="celebration-stars">&#9733; &#9733; &#9733;</div>
      </div>
    </div>
  );
}
