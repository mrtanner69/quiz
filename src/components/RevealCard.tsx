import type { BirdCard } from '../types/BirdCard';

interface Props {
  bird: BirdCard;
  wasCorrect: boolean;
  timedOut: boolean;
  selectedName: string | null;
  currentIndex: number;
  roundSize: number;
  onNext: () => void;
}

export function RevealCard({
  bird,
  wasCorrect,
  timedOut,
  selectedName,
  currentIndex,
  roundSize,
  onNext,
}: Props) {
  const isLast = currentIndex + 1 >= roundSize;

  return (
    <div className="reveal-card">
      <div className={`reveal-badge ${wasCorrect ? 'badge-correct' : 'badge-wrong'}`}>
        {wasCorrect ? 'Correct!' : timedOut ? "Time's Up!" : 'Wrong!'}
      </div>

      <div className="reveal-image-container">
        <img
          src={`/images/${bird.id}.jpg`}
          alt={bird.commonName}
          className="reveal-image"
        />
      </div>

      <h2 className="reveal-name">{bird.commonName}</h2>

      {!wasCorrect && selectedName && (
        <p className="reveal-you-said">
          You said: <span>{selectedName}</span>
        </p>
      )}

      <p className="reveal-attribution">
        Photo: {bird.imageAttribution}
      </p>

      <button className="next-button" onClick={onNext}>
        {isLast ? 'See Results' : 'Next Bird'}
      </button>
    </div>
  );
}
