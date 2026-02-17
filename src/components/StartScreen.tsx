import type { HighScores } from '../hooks/useQuizGame';

interface Props {
  highScores: HighScores;
  totalBirds: number;
  onStart: () => void;
}

export function StartScreen({ highScores, totalBirds, onStart }: Props) {
  return (
    <div className="start-screen">
      <div className="start-content">
        <h1 className="start-title">Bird Quiz</h1>
        <p className="start-subtitle">
          Can you identify the bird from a close-up crop?
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
