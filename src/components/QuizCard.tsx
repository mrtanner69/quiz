import type { BirdCard } from '../types/BirdCard';

interface Props {
  bird: BirdCard;
  choices: string[];
  timeRemaining: number;
  timeLimit: number;
  selectedAnswer: string | null;
  cropPosition: { x: number; y: number };
  currentIndex: number;
  roundSize: number;
  streak: number;
  onAnswer: (name: string) => void;
}

export function QuizCard({
  bird,
  choices,
  timeRemaining,
  timeLimit,
  selectedAnswer,
  cropPosition,
  currentIndex,
  roundSize,
  streak,
  onAnswer,
}: Props) {
  const timerPercent = (timeRemaining / timeLimit) * 100;
  const isTimedOut = timeRemaining <= 0 && selectedAnswer === null;
  const isAnswered = selectedAnswer !== null || isTimedOut;

  return (
    <div className="quiz-card">
      <div className="quiz-header">
        <span className="quiz-progress">
          {currentIndex + 1} / {roundSize}
        </span>
        {streak >= 2 && (
          <span className="quiz-streak">{streak} streak!</span>
        )}
      </div>

      <div className="timer-bar">
        <div
          className={`timer-fill ${timerPercent < 30 ? 'timer-danger' : timerPercent < 60 ? 'timer-warning' : ''}`}
          style={{ width: `${timerPercent}%` }}
        />
      </div>

      <div
        className="bird-crop"
        style={{
          backgroundImage: `url(/images/${bird.id}.jpg)`,
          backgroundPosition: `${cropPosition.x}% ${cropPosition.y}%`,
        }}
      >
        {isTimedOut && (
          <div className="timeout-overlay">
            <span>Time's Up!</span>
          </div>
        )}
      </div>

      <div className="choices">
        {choices.map((name) => {
          let btnClass = 'choice-btn';
          if (isAnswered) {
            if (name === bird.commonName) {
              btnClass += ' choice-correct';
            } else if (name === selectedAnswer) {
              btnClass += ' choice-wrong';
            } else {
              btnClass += ' choice-dimmed';
            }
          }
          return (
            <button
              key={name}
              className={btnClass}
              onClick={() => onAnswer(name)}
              disabled={isAnswered}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
