import { useQuizGame } from './hooks/useQuizGame';
import { StartScreen } from './components/StartScreen';
import { QuizCard } from './components/QuizCard';
import { RevealCard } from './components/RevealCard';
import { ScoreBoard } from './components/ScoreBoard';
import './App.css';

function App() {
  const game = useQuizGame();
  const lastAnswer = game.answers[game.answers.length - 1] ?? null;

  return (
    <div className="app">
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
          timeLimit={game.timeLimit}
          selectedAnswer={game.selectedAnswer}
          cropPosition={game.cropPosition}
          currentIndex={game.currentIndex}
          roundSize={game.roundSize}
          streak={game.streak}
          onAnswer={game.selectAnswer}
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
