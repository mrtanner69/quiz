import type { QuizAnswer, HighScores } from '../hooks/useQuizGame';
import { quizBirds } from '../hooks/useQuizGame';

interface Props {
  answers: QuizAnswer[];
  bestStreakThisRound: number;
  highScores: HighScores;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export function ScoreBoard({
  answers,
  bestStreakThisRound,
  highScores,
  onPlayAgain,
  onGoHome,
}: Props) {
  const correct = answers.filter(a => a.correct).length;
  const total = answers.length;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  const wrong = answers.filter(a => !a.correct);

  let message = '';
  if (percent === 100) message = 'Perfect Score!';
  else if (percent >= 80) message = 'Excellent!';
  else if (percent >= 60) message = 'Good Job!';
  else if (percent >= 40) message = 'Keep Practicing!';
  else message = 'Better Luck Next Time!';

  return (
    <div className="scoreboard">
      <h1 className="sb-message">{message}</h1>

      <div className="sb-score-ring">
        <div className="sb-score-number">{correct}</div>
        <div className="sb-score-total">out of {total}</div>
        <div className="sb-percent">{percent}%</div>
      </div>

      {bestStreakThisRound > 0 && (
        <div className="sb-streak">
          Best Streak: <strong>{bestStreakThisRound}</strong> in a row
        </div>
      )}

      <div className="sb-high-scores">
        <h3>All-Time Best</h3>
        <div className="sb-hs-row">
          <span>High Score</span>
          <span className="sb-hs-value">
            {highScores.bestScore}/20
            {correct === highScores.bestScore && correct > 0 && (
              <span className="sb-new-badge">NEW!</span>
            )}
          </span>
        </div>
        <div className="sb-hs-row">
          <span>Best Streak</span>
          <span className="sb-hs-value">
            {highScores.bestStreak}
            {bestStreakThisRound === highScores.bestStreak && bestStreakThisRound > 0 && (
              <span className="sb-new-badge">NEW!</span>
            )}
          </span>
        </div>
        <div className="sb-hs-row">
          <span>Games Played</span>
          <span className="sb-hs-value">{highScores.gamesPlayed}</span>
        </div>
      </div>

      {wrong.length > 0 && (
        <div className="sb-missed">
          <h3>Missed Birds</h3>
          <div className="sb-missed-grid">
            {wrong.map((a) => {
              const bird = quizBirds.find(b => b.id === a.birdId);
              if (!bird) return null;
              return (
                <div key={a.birdId} className="sb-missed-bird">
                  <img src={`/images/${bird.id}.jpg`} alt={bird.commonName} />
                  <span>{bird.commonName}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="sb-actions">
        <button className="play-again-button" onClick={onPlayAgain}>
          Play Again
        </button>
        <button className="home-button" onClick={onGoHome}>
          Home
        </button>
      </div>
    </div>
  );
}
