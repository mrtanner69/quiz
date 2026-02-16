import { useState, useEffect, useCallback, useRef } from 'react';
import { birds } from '../data/birds.ts';
import type { BirdCard } from '../types/BirdCard.ts';
import './CropQuiz.css';

type GameState = 'start' | 'playing' | 'revealed' | 'finished';

interface QuizQuestion {
  bird: BirdCard;
  choices: BirdCard[];
  correctIndex: number;
  cropX: number;
  cropY: number;
}

const TIMER_SECONDS = 10;
const CHOICE_LABELS = ['A', 'B', 'C', 'D', 'E'];

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateQuestion(bird: BirdCard, allBirds: BirdCard[]): QuizQuestion {
  const others = allBirds.filter(b => b.id !== bird.id);

  // Mix strategy: pick up to 2 same-type distractors, fill rest randomly
  const sameType = shuffleArray(others.filter(b => b.birdType === bird.birdType));
  const diffType = shuffleArray(others.filter(b => b.birdType !== bird.birdType));

  const sameTypePicks = sameType.slice(0, 2);
  const needed = 4 - sameTypePicks.length;
  const diffTypePicks = diffType.slice(0, needed);
  const distractors = shuffleArray([...sameTypePicks, ...diffTypePicks]);

  // Insert correct answer at a random position among 5 choices
  const correctIndex = Math.floor(Math.random() * 5);
  const choices: BirdCard[] = [];
  let dIdx = 0;
  for (let i = 0; i < 5; i++) {
    if (i === correctIndex) {
      choices.push(bird);
    } else {
      choices.push(distractors[dIdx++]);
    }
  }

  return {
    bird,
    choices,
    correctIndex,
    cropX: Math.random() * 100,
    cropY: Math.random() * 100,
  };
}

export default function CropQuiz() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = questions[currentIndex];

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startGame = useCallback(() => {
    const shuffled = shuffleArray(birds);
    const qs = shuffled.map(bird => generateQuestion(bird, birds));
    setQuestions(qs);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSelectedChoice(null);
    setTimeLeft(TIMER_SECONDS);
    setGameState('playing');
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;

    setTimeLeft(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopTimer();
          setGameState('revealed');
          setStreak(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => stopTimer();
  }, [gameState, currentIndex, stopTimer]);

  // Preload next image
  useEffect(() => {
    if (questions.length > 0 && currentIndex + 1 < questions.length) {
      const next = questions[currentIndex + 1];
      const img = new Image();
      img.src = `/images/${next.bird.id}.jpg`;
    }
  }, [questions, currentIndex]);

  const handleChoice = useCallback((index: number) => {
    if (gameState !== 'playing') return;
    stopTimer();
    setSelectedChoice(index);

    if (currentQuestion && index === currentQuestion.correctIndex) {
      setScore(prev => prev + 1);
      setStreak(prev => {
        const next = prev + 1;
        setBestStreak(best => Math.max(best, next));
        return next;
      });
    } else {
      setStreak(0);
    }

    setGameState('revealed');
  }, [gameState, currentQuestion, stopTimer]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setGameState('finished');
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedChoice(null);
      setGameState('playing');
    }
  }, [currentIndex, questions.length]);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (gameState === 'playing') {
        const keyMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, e: 4 };
        const idx = keyMap[e.key.toLowerCase()];
        if (idx !== undefined) handleChoice(idx);
      } else if (gameState === 'revealed') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNext();
        }
      } else if (gameState === 'start' || gameState === 'finished') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startGame();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gameState, handleChoice, handleNext, startGame]);

  // --- Render ---

  if (gameState === 'start') {
    return (
      <div className="cq-container">
        <div className="cq-start">
          <h1 className="cq-title">Bird Crop Quiz</h1>
          <p className="cq-subtitle">
            Identify birds from a small crop of their photo.
            You get {TIMER_SECONDS} seconds per bird.
          </p>
          <div className="cq-stats-preview">
            <span>{birds.length} birds</span>
            <span>5 choices</span>
            <span>{TIMER_SECONDS}s timer</span>
          </div>
          <button className="cq-start-btn" onClick={startGame}>
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const percent = Math.round((score / questions.length) * 100);
    return (
      <div className="cq-container">
        <div className="cq-finished">
          <h1 className="cq-title">Quiz Complete!</h1>
          <div className="cq-final-score">
            <div className="cq-score-big">{score}/{questions.length}</div>
            <div className="cq-score-percent">{percent}%</div>
          </div>
          <div className="cq-final-stats">
            <div className="cq-stat">
              <span className="cq-stat-value">{bestStreak}</span>
              <span className="cq-stat-label">Best Streak</span>
            </div>
          </div>
          <button className="cq-start-btn" onClick={startGame}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const isRevealed = gameState === 'revealed';
  const isCorrect = selectedChoice === currentQuestion.correctIndex;
  const timedOut = isRevealed && selectedChoice === null;

  return (
    <div className="cq-container">
      <div className="cq-header">
        <div className="cq-progress">
          {currentIndex + 1} / {questions.length}
        </div>
        <div className="cq-score-display">
          Score: {score}
          {streak > 1 && <span className="cq-streak">{streak} streak</span>}
        </div>
      </div>

      <div className="cq-timer-bar">
        <div
          className={`cq-timer-fill ${timeLeft <= 3 ? 'cq-timer-danger' : ''}`}
          style={{ width: `${(timeLeft / TIMER_SECONDS) * 100}%` }}
        />
      </div>
      <div className="cq-timer-text">{timeLeft}s</div>

      <div className="cq-image-area">
        <div
          className={`cq-crop-frame ${isRevealed ? 'cq-revealed' : ''}`}
          style={{
            backgroundImage: `url(/images/${currentQuestion.bird.id}.jpg)`,
            backgroundSize: isRevealed ? 'contain' : '200% 200%',
            backgroundPosition: isRevealed
              ? 'center'
              : `${currentQuestion.cropX}% ${currentQuestion.cropY}%`,
            backgroundRepeat: 'no-repeat',
          }}
        />
        {isRevealed && (
          <div className={`cq-result-banner ${isCorrect ? 'cq-correct' : 'cq-wrong'}`}>
            {timedOut ? "Time's up!" : isCorrect ? 'Correct!' : 'Wrong!'}
            {!isCorrect && (
              <span className="cq-correct-answer">
                {currentQuestion.bird.commonName}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="cq-choices">
        {currentQuestion.choices.map((choice, i) => {
          let btnClass = 'cq-choice-btn';
          if (isRevealed) {
            if (i === currentQuestion.correctIndex) btnClass += ' cq-choice-correct';
            else if (i === selectedChoice) btnClass += ' cq-choice-wrong';
            else btnClass += ' cq-choice-dimmed';
          }

          return (
            <button
              key={choice.id}
              className={btnClass}
              onClick={() => handleChoice(i)}
              disabled={isRevealed}
            >
              <span className="cq-choice-label">{CHOICE_LABELS[i]}</span>
              <span className="cq-choice-name">{choice.commonName}</span>
            </button>
          );
        })}
      </div>

      {isRevealed && (
        <button className="cq-next-btn" onClick={handleNext}>
          {currentIndex + 1 >= questions.length ? 'See Results' : 'Next Bird'}
        </button>
      )}
    </div>
  );
}
