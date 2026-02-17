import type { BirdCard } from '../types/BirdCard';
import type { LeafConfig } from '../hooks/useQuizGame';
import { LeafOverlay } from './LeafOverlay';

interface Props {
  bird: BirdCard;
  choices: string[];
  timeRemaining: number;
  selectedAnswer: string | null;
  leafConfig: LeafConfig;
  currentIndex: number;
  roundSize: number;
  streak: number;
  onAnswer: (name: string) => void;
  onRestart: () => void;
}

export function QuizCard({
  bird,
  choices,
  timeRemaining,
  selectedAnswer,
  leafConfig,
  currentIndex,
  roundSize,
  streak,
  onAnswer,
  onRestart,
}: Props) {
  const secondsLeft = Math.ceil(timeRemaining / 1000);
  const isTimedOut = timeRemaining <= 0 && selectedAnswer === null;
  const isAnswered = selectedAnswer !== null || isTimedOut;

  const segmentColor =
    secondsLeft <= 2 ? 'timer-segment-danger' :
    secondsLeft <= 3 ? 'timer-segment-warning' : '';

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

      <div className="timer-row">
        <div className="timer-bar">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className={`timer-segment ${secondsLeft >= i ? `timer-segment-active ${segmentColor}` : ''}`}
            />
          ))}
        </div>
        <span className={`timer-seconds ${secondsLeft <= 2 ? 'timer-seconds-danger' : ''}`}>
          {isAnswered ? '' : `${secondsLeft}s`}
        </span>
      </div>

      <div className="bird-crop">
        <img
          src={`/images/${bird.id}.jpg`}
          alt=""
          className="bird-crop-img"
          draggable={false}
        />
        <LeafOverlay
          coverage={leafConfig.coverage}
          holeX={leafConfig.holeX}
          holeY={leafConfig.holeY}
          hole2X={leafConfig.hole2X}
          hole2Y={leafConfig.hole2Y}
          hole2Seed={leafConfig.hole2Seed}
          seed={leafConfig.seed}
          blowAway={isAnswered}
        />
        {isTimedOut && (
          <div className="timeout-overlay">
            <span>Time's Up!</span>
          </div>
        )}
      </div>

      <button className="restart-button" onClick={onRestart}>
        Restart
      </button>

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
