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

// Base canopy fill colours (darker greens)
const CANOPY_COLORS = ['#1e3a0e', '#243f12', '#1a3510', '#203d14'];

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

/**
 * Compute the wobbly radius at a given angle.
 * Shared between the SVG cutout and the edge-leaf placement so they match.
 */
function wobbleRadius(angle: number, baseRadius: number, seed: number): number {
  const w =
    1.0 +
    0.14 * Math.sin(angle * 3.7 + seed * 0.13) +
    0.09 * Math.cos(angle * 5.3 + seed * 0.07) +
    0.06 * Math.sin(angle * 7.1 + seed * 0.19) +
    0.04 * Math.cos(angle * 11.3 + seed * 0.31);
  return baseRadius * w;
}

/**
 * Generate a smooth, wobbly closed SVG path for the canopy hole.
 * Uses quadratic Bézier curves through midpoints of successive edge samples.
 */
function generateHolePath(
  holeX: number,
  holeY: number,
  baseRadius: number,
  seed: number,
): string {
  const N = 48;
  const pts: [number, number][] = [];

  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2;
    const r = wobbleRadius(angle, baseRadius, seed);
    pts.push([holeX + r * Math.cos(angle), holeY + r * Math.sin(angle)]);
  }

  // Smooth closed curve via midpoints
  const mid = (a: number, b: number) => (a + b) / 2;
  let d = `M ${mid(pts[N - 1][0], pts[0][0])} ${mid(pts[N - 1][1], pts[0][1])}`;
  for (let i = 0; i < N; i++) {
    const next = pts[(i + 1) % N];
    d += ` Q ${pts[i][0]} ${pts[i][1]} ${mid(pts[i][0], next[0])} ${mid(pts[i][1], next[1])}`;
  }
  d += ' Z';
  return d;
}

export function LeafOverlay({ coverage, holeX, holeY, blowAway, seed }: Props) {
  const { holePath, canopyColor, leaves } = useMemo(() => {
    const rng = mulberry32(seed);

    // Hole radius (% of image).  Smaller hole = harder.
    // coverage 0.50 → radius ≈ 36    coverage 0.85 → radius ≈ 29
    // Gives roughly 40-50% of the image visible through the hole.
    const holeRadius = 26 + (1 - coverage) * 20;

    const mainHolePath = generateHolePath(holeX, holeY, holeRadius, seed);
    const canopyColor = CANOPY_COLORS[Math.floor(rng() * CANOPY_COLORS.length)];

    // --- Small "glimpse" holes scattered across the canopy ---
    // These give dappled light / peek-through gaps like a real canopy.
    const glimpseCount = Math.round(30 + (1 - coverage) * 36); // 30-48 glimpses
    let glimpsePaths = '';
    for (let attempt = 0, placed = 0; attempt < glimpseCount * 4 && placed < glimpseCount; attempt++) {
      const gx = 5 + rng() * 90;
      const gy = 5 + rng() * 90;
      // Must be outside the main hole (with margin) and inside the image
      const dx = gx - holeX;
      const dy = gy - holeY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < holeRadius * 1.4) continue;
      // Small wobbly radius (2–5% of image)
      const gr = 2 + rng() * 3;
      glimpsePaths += ' ' + generateHolePath(gx, gy, gr, seed + placed * 777);
      placed++;
    }

    const holePath = mainHolePath + glimpsePaths;

    const leaves: LeafData[] = [];
    let id = 0;

    // Helper to push a leaf with blow-away data
    function pushLeaf(
      x: number,
      y: number,
      rotation: number,
      scale: number,
      zIdx: number,
    ) {
      const shapeIdx = Math.floor(rng() * LEAF_SHAPES.length);
      const colorIdx = Math.floor(rng() * LEAF_COLORS.length);
      const blowAngle = -Math.PI / 2 + (rng() - 0.5) * Math.PI * 0.9;
      const blowDist = 120 + rng() * 220;

      leaves.push({
        id: id++,
        x,
        y,
        rotation,
        scale,
        shapeIdx,
        colorIdx,
        zIndex: zIdx,
        blowX: Math.cos(blowAngle) * blowDist,
        blowY: Math.sin(blowAngle) * blowDist,
        blowSpin: (rng() - 0.5) * 720,
        blowDelay: rng() * 350,
      });
    }

    // --- 1. Edge leaves: ring around the hole for organic framing ---
    // Two rings – inner ring overlaps into the hole slightly, outer ring
    // sits just outside to break up the straight SVG cutout edge.
    const ringCount = Math.round(22 + coverage * 14); // 22-34 per ring

    for (let ring = 0; ring < 2; ring++) {
      const count = ring === 0 ? ringCount : Math.round(ringCount * 0.7);
      for (let i = 0; i < count; i++) {
        const baseAngle = (i / count) * Math.PI * 2;
        const angle = baseAngle + (rng() - 0.5) * ((Math.PI * 2) / count) * 0.6;
        const edgeR = wobbleRadius(angle, holeRadius, seed);

        // Inner ring: overlaps inward; outer ring: sits outside
        const offset =
          ring === 0
            ? edgeR * (0.88 + rng() * 0.25) // straddles edge inward
            : edgeR * (1.05 + rng() * 0.35); // just outside edge

        const x = holeX + offset * Math.cos(angle);
        const y = holeY + offset * Math.sin(angle);
        // Point leaves roughly inward (toward hole centre)
        const rot = (angle * 180) / Math.PI + 90 + (rng() - 0.5) * 70;
        const scale = ring === 0 ? 0.55 + rng() * 0.7 : 0.7 + rng() * 0.9;

        pushLeaf(x, y, rot, scale, 2 + ring);
      }
    }

    // --- 2. Surface texture leaves on the canopy body ---
    // These sit on top of the solid canopy and give it a layered, leafy look.
    const surfaceCount = Math.round(18 + coverage * 14);
    for (let attempt = 0, placed = 0; attempt < surfaceCount * 3 && placed < surfaceCount; attempt++) {
      const x = -8 + rng() * 116;
      const y = -8 + rng() * 116;
      const dx = x - holeX;
      const dy = y - holeY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // Keep well away from the hole so they don't look random
      if (dist < holeRadius * 1.5) continue;

      const rot = rng() * 360;
      const scale = 0.7 + rng() * 1.1;
      pushLeaf(x, y, rot, scale, 4 + Math.floor(rng() * 3));
      placed++;
    }

    return { holePath, canopyColor, leaves };
  }, [coverage, holeX, holeY, seed]);

  return (
    <div className="leaf-overlay" aria-hidden>
      {/* Solid canopy with a wobbly hole punched out (telescope view) */}
      <svg
        className={`canopy-solid${blowAway ? ' canopy-blow' : ''}`}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Outer rect + inner hole, fill-rule evenodd = punched-out hole */}
        <path
          d={`M-2 -2 H102 V102 H-2 Z ${holePath}`}
          fillRule="evenodd"
          fill={canopyColor}
        />
        {/* Subtle darker vignette at hole edge for depth */}
        <circle
          cx={holeX}
          cy={holeY}
          r={28 + (1 - coverage) * 22}
          fill="none"
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="4"
        />
      </svg>

      {/* Decorative leaves: framing the hole + surface texture */}
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
