import { useMemo } from 'react';

// Seeded PRNG (mulberry32)
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/*
 * Six leaf silhouettes – stylised / slightly cartoony.
 * Each has a filled body path and a center-vein stroke path.
 */
const LEAF_SHAPES = [
  // 0  Classic pointed leaf
  {
    viewBox: '0 0 40 62',
    body: 'M20 2 Q33 14 36 30 Q38 46 28 56 L20 60 L12 56 Q2 46 4 30 Q7 14 20 2Z',
    vein: 'M20 6 L20 58',
  },
  // 1  Elongated willow-ish
  {
    viewBox: '0 0 24 68',
    body: 'M12 0 Q20 16 22 34 Q23 52 16 62 L12 68 L8 62 Q1 52 2 34 Q4 16 12 0Z',
    vein: 'M12 4 L12 64',
  },
  // 2  Round aspen-ish
  {
    viewBox: '0 0 48 54',
    body: 'M24 2 Q40 10 46 26 Q48 40 36 50 L24 54 L12 50 Q0 40 2 26 Q8 10 24 2Z',
    vein: 'M24 6 L24 50',
  },
  // 3  Wide oak-ish lobed
  {
    viewBox: '0 0 52 58',
    body: 'M26 2 Q38 6 46 16 Q42 22 48 30 Q44 40 36 48 L26 56 L16 48 Q8 40 4 30 Q10 22 6 16 Q14 6 26 2Z',
    vein: 'M26 6 L26 52',
  },
  // 4  Small round filler
  {
    viewBox: '0 0 32 40',
    body: 'M16 2 Q26 10 30 20 Q30 32 22 36 L16 40 L10 36 Q2 32 2 20 Q6 10 16 2Z',
    vein: 'M16 5 L16 37',
  },
  // 5  Fat teardrop
  {
    viewBox: '0 0 44 56',
    body: 'M22 0 Q36 12 42 28 Q44 42 32 52 L22 56 L12 52 Q0 42 2 28 Q8 12 22 0Z',
    vein: 'M22 4 L22 52',
  },
];

const LEAF_COLORS = [
  '#2d5016',
  '#3a6b1e',
  '#4a8526',
  '#3d6b2e',
  '#2a4a12',
  '#466b22',
  '#3a7a28',
  '#325a1a',
  '#547a20',
  '#28400e',
];

interface LeafData {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  shapeIdx: number;
  colorIdx: number;
  zIndex: number;
  blowX: number;
  blowY: number;
  blowSpin: number;
  blowDelay: number;
}

interface Props {
  coverage: number;
  holeX: number;
  holeY: number;
  blowAway: boolean;
  seed: number;
}

export function LeafOverlay({ coverage, holeX, holeY, blowAway, seed }: Props) {
  const leaves = useMemo(() => {
    const rng = mulberry32(seed);
    const result: LeafData[] = [];

    // Hole radius scales inversely with coverage
    // coverage 0.4 → radius ~32%   coverage 0.7 → radius ~20%
    const holeRadius = 16 + (1 - coverage) * 52;

    // Number of leaves scales with coverage
    const target = Math.round(40 + coverage * 55);

    let id = 0;
    // Over-generate candidates, then keep the ones outside the hole
    for (let attempt = 0; attempt < target * 4 && result.length < target; attempt++) {
      // Extend range so leaves poke in from outside the frame
      const x = -12 + rng() * 124;
      const y = -12 + rng() * 124;

      const dx = x - holeX;
      const dy = y - holeY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Wobbly / organic hole edge
      const angle = Math.atan2(dy, dx);
      const wobble =
        0.85 +
        0.25 * Math.sin(angle * 3.7 + seed * 0.13) +
        0.1 * Math.cos(angle * 5.3 + seed * 0.07);
      const effectiveRadius = holeRadius * wobble;

      if (dist < effectiveRadius) continue;

      // Leaves near the hole edge are smaller
      const edgeFactor = Math.max(0, 1 - (dist - effectiveRadius) / 22);
      const baseScale = 0.7 + rng() * 1.0;
      const scale = baseScale * (1 - edgeFactor * 0.45);

      const rotation = rng() * 360;
      const shapeIdx = Math.floor(rng() * LEAF_SHAPES.length);
      const colorIdx = Math.floor(rng() * LEAF_COLORS.length);

      // Blow-away direction: mostly upward + random spread
      const blowAngle = -Math.PI / 2 + (rng() - 0.5) * Math.PI * 0.9;
      const blowDist = 120 + rng() * 220;
      const blowX = Math.cos(blowAngle) * blowDist;
      const blowY = Math.sin(blowAngle) * blowDist;
      const blowSpin = (rng() - 0.5) * 720;
      const blowDelay = rng() * 350;

      result.push({
        id: id++,
        x,
        y,
        rotation,
        scale,
        shapeIdx,
        colorIdx,
        zIndex: Math.floor(rng() * 10),
        blowX,
        blowY,
        blowSpin,
        blowDelay,
      });
    }

    return result;
  }, [coverage, holeX, holeY, seed]);

  return (
    <div className="leaf-overlay" aria-hidden>
      {leaves.map((leaf) => {
        const shape = LEAF_SHAPES[leaf.shapeIdx];
        const color = LEAF_COLORS[leaf.colorIdx];

        return (
          <div
            key={leaf.id}
            className={`leaf${blowAway ? ' leaf-blow' : ''}`}
            style={
              {
                left: `${leaf.x}%`,
                top: `${leaf.y}%`,
                zIndex: leaf.zIndex,
                '--lr': `${leaf.rotation}deg`,
                '--ls': leaf.scale,
                '--bx': `${leaf.blowX}px`,
                '--by': `${leaf.blowY}px`,
                '--bs': `${leaf.blowSpin}deg`,
                '--bd': `${leaf.blowDelay}ms`,
              } as React.CSSProperties
            }
          >
            <svg viewBox={shape.viewBox} className="leaf-svg">
              <path d={shape.body} fill={color} stroke="#1a3a0a" strokeWidth="0.8" />
              <path
                d={shape.vein}
                fill="none"
                stroke="rgba(0,0,0,0.18)"
                strokeWidth="0.9"
                strokeLinecap="round"
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
