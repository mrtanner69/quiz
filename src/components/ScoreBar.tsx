import type { HighScores } from '../hooks/useQuizGame';

interface Props {
  score: number;
  roundSize: number;
  streak: number;
  highScores: HighScores;
}

export function ScoreBar({ score, roundSize, streak, highScores }: Props) {
  return (
    <div className="score-bar">
      <div className="score-bar-item">
        <span className="score-bar-label">Score</span>
        <span className="score-bar-value">{score}/{roundSize}</span>
      </div>
      <div className="score-bar-item">
        <span className="score-bar-label">Best</span>
        <span className="score-bar-value score-bar-best">{highScores.bestScore}/{roundSize}</span>
      </div>
      <div className="score-bar-item">
        <span className="score-bar-label">Streak</span>
        <span className={`score-bar-value ${streak >= 2 ? 'score-bar-streak-hot' : ''}`}>
          {streak}
        </span>
      </div>
    </div>
  );
}
