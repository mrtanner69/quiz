import type { HighScores } from '../hooks/useQuizGame';
import { LeafOverlay } from './LeafOverlay';

interface Props {
  highScores: HighScores;
  totalBirds: number;
  onStart: () => void;
}

// Fixed config so the start screen dove always looks the same
const HERO_LEAF_CONFIG = {
  coverage: 0.6,
  holeX: 55,
  holeY: 40,
  seed: 42,
};

export function StartScreen({ highScores, totalBirds, onStart }: Props) {
  return (
    <div className="start-screen">
      <div className="start-content">
        <h1 className="start-title">Unfair Frustrating Bird Quiz</h1>

        <div className="hero-crop-container">
          <div className="hero-crop-frame">
            <img
              src="/images/mourdo.jpg"
              alt="Mourning Dove"
              className="bird-crop-img"
              draggable={false}
            />
            <LeafOverlay
              coverage={HERO_LEAF_CONFIG.coverage}
              holeX={HERO_LEAF_CONFIG.holeX}
              holeY={HERO_LEAF_CONFIG.holeY}
              seed={HERO_LEAF_CONFIG.seed}
              blowAway={false}
            />
          </div>
          <div className="hero-crop-label">peep through the canopy</div>
        </div>

        <p className="start-subtitle">
          Can you identify the bird from a random (and possibly unfair) close-up crop?
        </p>

        <div className="start-rules">
          <div className="rule">20 birds per round</div>
          <div className="rule">5 seconds each</div>
          <div className="rule">5 choices per bird</div>
          <div className="rule">{totalBirds} species to learn</div>
        </div>

        {highScores.gamesPlayed > 0 && (
          <div className="start-high-scores">
            <h3>Your Best</h3>
            <div className="hs-row">
              <span>Best Score</span>
              <span className="hs-value">{highScores.bestScore}/20</span>
            </div>
            <div className="hs-row">
              <span>Best Streak</span>
              <span className="hs-value">{highScores.bestStreak}</span>
            </div>
            <div className="hs-row">
              <span>Games Played</span>
              <span className="hs-value">{highScores.gamesPlayed}</span>
            </div>
          </div>
        )}

        <button className="start-button" onClick={onStart}>
          Start Quiz
        </button>
      </div>
    </div>
  );
}
