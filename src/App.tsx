import { useEffect, useRef } from 'react';
import { useQuizGame } from './hooks/useQuizGame';
import { useCountdownAudio } from './hooks/useCountdownAudio';
import { useArcadeSounds } from './hooks/useArcadeSounds';
import { StartScreen } from './components/StartScreen';
import { QuizCard } from './components/QuizCard';
import { RevealCard } from './components/RevealCard';
import { ScoreBoard } from './components/ScoreBoard';
import { ScoreBar } from './components/ScoreBar';
import './App.css';

function App() {
  const game = useQuizGame();
  const sounds = useArcadeSounds();
  const lastAnswer = game.answers[game.answers.length - 1] ?? null;
  const prevPhaseRef = useRef(game.phase);
  const prevAnswersLenRef = useRef(game.answers.length);

  const isPlaying = game.phase === 'playing' && game.selectedAnswer === null && game.timeRemaining > 0;
  useCountdownAudio(isPlaying, game.timeRemaining, game.timeLimit);

  // Play sounds on phase/answer transitions
  useEffect(() => {
    const prevPhase = prevPhaseRef.current;
    const prevLen = prevAnswersLenRef.current;
    prevPhaseRef.current = game.phase;
    prevAnswersLenRef.current = game.answers.length;

    // Game started
    if (prevPhase === 'start' && game.phase === 'playing') {
      sounds.playStart();
      return;
    }

    // New answer recorded
    if (game.answers.length > prevLen && game.answers.length > 0) {
      const latest = game.answers[game.answers.length - 1];
      if (latest.timedOut) {
        sounds.playTimeout();
      } else if (latest.correct) {
        sounds.playCorrect();
      } else {
        sounds.playWrong();
      }
      return;
    }

    // Moving to next bird (playing phase re-entered)
    if (prevPhase === 'reveal' && game.phase === 'playing') {
      sounds.playNext();
      return;
    }

    // Results screen (skip regular sound for perfect 20/20 — celebration handles it)
    if (prevPhase !== 'results' && game.phase === 'results') {
      const correct = game.answers.filter(a => a.correct).length;
      const isPerfect = correct === game.answers.length && game.answers.length === 20;
      if (!isPerfect) {
        const pct = game.answers.length > 0 ? Math.round((correct / game.answers.length) * 100) : 0;
        sounds.playResults(pct);
      }
    }
  }, [game.phase, game.answers, sounds]);

  const showScoreBar = game.phase !== 'start';

  return (
    <div className="app">
      {showScoreBar && (
        <ScoreBar
          score={game.score}
          roundSize={game.roundSize}
          streak={game.streak}
          highScores={game.highScores}
        />
      )}

      {game.phase === 'start' && (
        <StartScreen
          highScores={game.highScores}
          totalBirds={game.totalBirds}
          onStart={game.startGame}
        />
      )}

      {game.phase === 'playing' && game.currentBird && (
        <QuizCard
          bird={game.currentBird}
          choices={game.choices}
          timeRemaining={game.timeRemaining}
          selectedAnswer={game.selectedAnswer}
          leafConfig={game.leafConfig}
          currentIndex={game.currentIndex}
          roundSize={game.roundSize}
          streak={game.streak}
          onAnswer={(name) => {
            sounds.playClick();
            game.selectAnswer(name);
          }}
        />
      )}

      {game.phase === 'reveal' && game.currentBird && lastAnswer && (
        <RevealCard
          bird={game.currentBird}
          wasCorrect={lastAnswer.correct}
          timedOut={lastAnswer.timedOut}
          selectedName={lastAnswer.selectedName}
          currentIndex={game.currentIndex}
          roundSize={game.roundSize}
          onNext={game.nextBird}
        />
      )}

      {game.phase === 'results' && (
        <ScoreBoard
          answers={game.answers}
          bestStreakThisRound={game.bestStreakThisRound}
          highScores={game.highScores}
          onPlayAgain={game.startGame}
          onGoHome={game.goToStart}
        />
      )}
    </div>
  );
}

export default App;
