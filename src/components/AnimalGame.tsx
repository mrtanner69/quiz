import { useState, useCallback } from 'react';
import type { MeadowAnimal } from '../data/animals';

interface Props {
  animal: MeadowAnimal;
  onComplete: (animalId: string) => void;
  onBack: () => void;
}

export function AnimalGame({ animal, onComplete, onBack }: Props) {
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [treeStates, setTreeStates] = useState([false, false, false]); // for beaver
  const [snakeHeight, setSnakeHeight] = useState(0); // for snake charm
  const [digDepth, setDigDepth] = useState(0); // for owl
  const [notes, setNotes] = useState<{ id: number; x: number; y: number }[]>([]);
  const [noteId, setNoteId] = useState(0);

  const handleAction = useCallback((index?: number) => {
    if (completed) return;

    const next = progress + 1;
    setProgress(next);

    // Game-specific updates
    if (animal.gameType === 'chop' && typeof index === 'number') {
      setTreeStates(prev => {
        const copy = [...prev];
        copy[index] = true;
        return copy;
      });
    }

    if (animal.gameType === 'charm') {
      setSnakeHeight(Math.min(100, (next / animal.actionsNeeded) * 100));
      // Add floating music note
      setNoteId(prev => prev + 1);
      setNotes(prev => [
        ...prev,
        { id: noteId + 1, x: 30 + Math.random() * 40, y: 50 + Math.random() * 20 },
      ]);
      // Remove note after animation
      setTimeout(() => {
        setNotes(prev => prev.slice(1));
      }, 1000);
    }

    if (animal.gameType === 'dig') {
      setDigDepth(Math.min(100, (next / animal.actionsNeeded) * 100));
    }

    if (next >= animal.actionsNeeded) {
      setCompleted(true);
      setTimeout(() => onComplete(animal.id), 1500);
    }
  }, [progress, completed, animal, onComplete, noteId]);

  return (
    <div className="animal-game">
      <button className="animal-game-back" onClick={onBack}>
        &larr; Back
      </button>

      <h2 className="animal-game-title">{animal.emoji} {animal.name}</h2>
      <p className="animal-game-task">{animal.rescueTask}</p>
      <p className="animal-game-instructions">{animal.gameInstructions}</p>

      {/* Progress bar */}
      <div className="animal-game-progress-bar">
        <div
          className="animal-game-progress-fill"
          style={{ width: `${(progress / animal.actionsNeeded) * 100}%` }}
        />
      </div>
      <div className="animal-game-progress-text">
        {progress} / {animal.actionsNeeded}
      </div>

      {/* Game area */}
      <div className="animal-game-area">
        {animal.gameType === 'chop' && (
          <BeaverGame treeStates={treeStates} onChop={handleAction} completed={completed} />
        )}
        {animal.gameType === 'charm' && (
          <SnakeGame
            snakeHeight={snakeHeight}
            notes={notes}
            onPlay={() => handleAction()}
            completed={completed}
          />
        )}
        {animal.gameType === 'dig' && (
          <OwlGame digDepth={digDepth} onDig={() => handleAction()} completed={completed} />
        )}
      </div>

      {completed && (
        <div className="animal-game-complete">
          <span className="animal-game-complete-text">
            {animal.name} rescued!
          </span>
        </div>
      )}
    </div>
  );
}

/* ===== Beaver: Chop 3 Trees ===== */

function BeaverGame({
  treeStates,
  onChop,
  completed,
}: {
  treeStates: boolean[];
  onChop: (i: number) => void;
  completed: boolean;
}) {
  return (
    <div className="beaver-game">
      <div className="beaver-game-scene">
        {/* Ground */}
        <div className="beaver-ground" />

        {/* 3 Trees */}
        <div className="beaver-trees">
          {treeStates.map((chopped, i) => (
            <button
              key={i}
              className={`beaver-tree ${chopped ? 'beaver-tree-chopped' : ''}`}
              onClick={() => !chopped && !completed && onChop(i)}
              disabled={chopped || completed}
            >
              {chopped ? (
                <svg viewBox="0 0 60 80" className="beaver-tree-svg">
                  {/* Stump */}
                  <rect x="22" y="55" width="16" height="20" rx="2" fill="#8B6914" />
                  <ellipse cx="30" cy="55" rx="10" ry="3" fill="#6B4F14" />
                  {/* Fallen log */}
                  <rect x="5" y="48" width="40" height="8" rx="4" fill="#A0784C" transform="rotate(-15 25 52)" />
                </svg>
              ) : (
                <svg viewBox="0 0 60 80" className="beaver-tree-svg">
                  {/* Trunk */}
                  <rect x="25" y="35" width="10" height="40" rx="2" fill="#8B6914" />
                  {/* Canopy - small tree */}
                  <ellipse cx="30" cy="25" rx="22" ry="24" fill="#2E7D32" />
                  <ellipse cx="24" cy="20" rx="14" ry="16" fill="#388E3C" />
                  <ellipse cx="36" cy="22" rx="12" ry="14" fill="#43A047" />
                  {/* Chop indicator */}
                  <text x="30" y="78" textAnchor="middle" fontSize="10" fill="#fff" opacity="0.7">TAP</text>
                </svg>
              )}
            </button>
          ))}
        </div>

        {/* Beaver waiting */}
        <div className={`beaver-character ${completed ? 'beaver-happy' : ''}`}>
          <svg viewBox="0 0 60 50" className="beaver-svg">
            {/* Body */}
            <ellipse cx="30" cy="35" rx="18" ry="14" fill="#8B6914" />
            {/* Head */}
            <circle cx="30" cy="18" r="12" fill="#A0784C" />
            {/* Eyes */}
            <circle cx="25" cy="15" r="2.5" fill="#1a1a1a" />
            <circle cx="35" cy="15" r="2.5" fill="#1a1a1a" />
            <circle cx="26" cy="14" r="1" fill="#fff" />
            <circle cx="36" cy="14" r="1" fill="#fff" />
            {/* Nose */}
            <ellipse cx="30" cy="20" rx="3" ry="2" fill="#5D4037" />
            {/* Teeth */}
            <rect x="27" y="23" width="3" height="4" rx="1" fill="#fff" />
            <rect x="31" y="23" width="3" height="4" rx="1" fill="#fff" />
            {/* Tail */}
            <ellipse cx="10" cy="40" rx="10" ry="5" fill="#6B4F14" transform="rotate(-20 10 40)" />
            {/* Ears */}
            <circle cx="20" cy="9" r="3" fill="#A0784C" />
            <circle cx="40" cy="9" r="3" fill="#A0784C" />
          </svg>
        </div>

        {/* Dam appears when complete */}
        {completed && (
          <div className="beaver-dam">
            <svg viewBox="0 0 120 40" className="beaver-dam-svg">
              <rect x="0" y="10" width="120" height="25" rx="3" fill="#8B6914" opacity="0.9" />
              {[0, 15, 30, 45, 60, 75, 90, 105].map(x => (
                <rect key={x} x={x + 2} y="8" width="12" height="30" rx="2" fill="#A0784C"
                  transform={`rotate(${(x % 30) - 15} ${x + 8} 23)`} />
              ))}
              <rect x="0" y="32" width="120" height="6" rx="2" fill="#6B4F14" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== Snake: Pipe Charming ===== */

function SnakeGame({
  snakeHeight,
  notes,
  onPlay,
  completed,
}: {
  snakeHeight: number;
  notes: { id: number; x: number; y: number }[];
  onPlay: () => void;
  completed: boolean;
}) {
  return (
    <div className="snake-game">
      <div className="snake-game-scene">
        {/* Basket */}
        <div className="snake-basket">
          <svg viewBox="0 0 80 60" className="snake-basket-svg">
            {/* Basket body */}
            <path d="M10 20 Q10 55 40 55 Q70 55 70 20 Z" fill="#D4A056" />
            {/* Weave pattern */}
            {[25, 32, 39, 46].map(y => (
              <path key={y} d={`M12 ${y} Q40 ${y - 5} 68 ${y}`} stroke="#B8860B" strokeWidth="1.5" fill="none" />
            ))}
            {/* Basket rim */}
            <ellipse cx="40" cy="20" rx="30" ry="6" fill="#C49344" />
            <ellipse cx="40" cy="20" rx="28" ry="5" fill="#D4A056" />
          </svg>

          {/* Snake rising from basket */}
          <div
            className="snake-rising"
            style={{ height: `${snakeHeight}%` }}
          >
            <svg viewBox="0 0 40 100" preserveAspectRatio="xMidYMin meet" className="snake-svg">
              {/* Snake body - wavy */}
              <path
                d="M20 100 Q5 85 20 70 Q35 55 20 40 Q5 25 20 10"
                stroke="#4CAF50"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />
              {/* Snake belly pattern */}
              <path
                d="M20 100 Q5 85 20 70 Q35 55 20 40 Q5 25 20 10"
                stroke="#81C784"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              {/* Head */}
              <circle cx="20" cy="8" r="7" fill="#4CAF50" />
              <circle cx="20" cy="6" r="6" fill="#43A047" />
              {/* Eyes */}
              <circle cx="16" cy="5" r="2" fill="#FFEB3B" />
              <circle cx="24" cy="5" r="2" fill="#FFEB3B" />
              <circle cx="16" cy="5" r="1" fill="#1a1a1a" />
              <circle cx="24" cy="5" r="1" fill="#1a1a1a" />
              {/* Tongue */}
              <path d="M20 12 L20 17 L17 20 M20 17 L23 20" stroke="#f44336" strokeWidth="1.2" fill="none" />
            </svg>
          </div>
        </div>

        {/* Floating music notes */}
        {notes.map(n => (
          <div
            key={n.id}
            className="snake-note"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            {['\u{266A}', '\u{266B}', '\u{2669}'][n.id % 3]}
          </div>
        ))}

        {/* Pipe / flute */}
        <button
          className={`snake-pipe ${completed ? 'snake-pipe-done' : ''}`}
          onClick={onPlay}
          disabled={completed}
        >
          <svg viewBox="0 0 100 40" className="snake-pipe-svg">
            {/* Pipe body */}
            <rect x="5" y="12" width="80" height="16" rx="8" fill="#795548" />
            <rect x="5" y="14" width="80" height="6" rx="3" fill="#8D6E63" />
            {/* Holes */}
            {[20, 35, 50, 65].map(x => (
              <circle key={x} cx={x} cy="20" r="3" fill="#4E342E" />
            ))}
            {/* Mouthpiece */}
            <ellipse cx="88" cy="20" rx="8" ry="10" fill="#6D4C41" />
            <ellipse cx="88" cy="20" rx="5" ry="7" fill="#795548" />
          </svg>
          {!completed && <span className="snake-pipe-label">TAP!</span>}
        </button>

        {completed && (
          <div className="snake-charmed-text">
            Snake is charmed!
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== Burrowing Owl: Dig a Burrow ===== */

function OwlGame({
  digDepth,
  onDig,
  completed,
}: {
  digDepth: number;
  onDig: () => void;
  completed: boolean;
}) {
  return (
    <div className="owl-game">
      <div className="owl-game-scene">
        {/* Sky / grass */}
        <div className="owl-sky" />

        {/* Ground with hole */}
        <div className="owl-ground">
          {/* Burrow hole growing */}
          <div
            className="owl-burrow-hole"
            style={{
              width: `${30 + digDepth * 0.4}%`,
              height: `${20 + digDepth * 0.6}%`,
              opacity: digDepth > 0 ? 1 : 0,
            }}
          >
            {digDepth > 50 && (
              <div className="owl-burrow-tunnel" />
            )}
          </div>

          {/* Dirt pile */}
          {digDepth > 0 && (
            <div className="owl-dirt-pile" style={{ transform: `scale(${digDepth / 100})` }}>
              <svg viewBox="0 0 60 30" className="owl-dirt-svg">
                <ellipse cx="30" cy="25" rx="28" ry="12" fill="#8D6E63" />
                <ellipse cx="30" cy="20" rx="22" ry="10" fill="#A1887F" />
                <ellipse cx="25" cy="18" rx="8" ry="5" fill="#8D6E63" />
              </svg>
            </div>
          )}
        </div>

        {/* Spade button */}
        <button
          className={`owl-spade ${completed ? 'owl-spade-done' : ''}`}
          onClick={onDig}
          disabled={completed}
        >
          <svg viewBox="0 0 40 80" className="owl-spade-svg">
            {/* Handle */}
            <rect x="17" y="30" width="6" height="40" rx="2" fill="#795548" />
            <rect x="12" y="66" width="16" height="6" rx="3" fill="#6D4C41" />
            {/* Blade */}
            <path d="M20 0 Q5 10 8 30 L32 30 Q35 10 20 0 Z" fill="#78909C" />
            <path d="M20 2 Q8 11 10 28 L19 28 L19 5 Z" fill="#90A4AE" opacity="0.5" />
          </svg>
          {!completed && <span className="owl-spade-label">DIG!</span>}
        </button>

        {/* Owl */}
        <div className={`owl-character ${completed ? 'owl-in-burrow' : 'owl-waiting'}`}>
          <svg viewBox="0 0 50 60" className="owl-svg">
            {/* Body */}
            <ellipse cx="25" cy="40" rx="16" ry="18" fill="#8D6E63" />
            {/* Belly */}
            <ellipse cx="25" cy="43" rx="10" ry="12" fill="#D7CCC8" />
            {/* Belly spots */}
            {[
              [22, 36], [28, 37], [25, 41], [22, 45], [28, 44],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="1.5" fill="#A1887F" />
            ))}
            {/* Head */}
            <circle cx="25" cy="22" r="13" fill="#A1887F" />
            {/* Eye discs */}
            <circle cx="19" cy="20" r="7" fill="#EFEBE9" />
            <circle cx="31" cy="20" r="7" fill="#EFEBE9" />
            {/* Eyes */}
            <circle cx="19" cy="20" r="4" fill="#FFC107" />
            <circle cx="31" cy="20" r="4" fill="#FFC107" />
            <circle cx="19" cy="20" r="2.5" fill="#1a1a1a" />
            <circle cx="31" cy="20" r="2.5" fill="#1a1a1a" />
            <circle cx="18" cy="19" r="1" fill="#fff" />
            <circle cx="30" cy="19" r="1" fill="#fff" />
            {/* Beak */}
            <path d="M23 24 L25 28 L27 24 Z" fill="#F9A825" />
            {/* Ear tufts (burrowing owls are small, flat-headed) */}
            <line x1="15" y1="12" x2="13" y2="8" stroke="#8D6E63" strokeWidth="2" strokeLinecap="round" />
            <line x1="35" y1="12" x2="37" y2="8" stroke="#8D6E63" strokeWidth="2" strokeLinecap="round" />
            {/* Legs */}
            <line x1="20" y1="55" x2="20" y2="58" stroke="#F9A825" strokeWidth="2" />
            <line x1="30" y1="55" x2="30" y2="58" stroke="#F9A825" strokeWidth="2" />
            <line x1="17" y1="58" x2="23" y2="58" stroke="#F9A825" strokeWidth="2" strokeLinecap="round" />
            <line x1="27" y1="58" x2="33" y2="58" stroke="#F9A825" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
