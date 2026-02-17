import { useState, useEffect, useCallback, useRef } from 'react';
import { birds } from '../data/birds';
import type { BirdCard } from '../types/BirdCard';

const ROUND_SIZE = 20;
const TIME_LIMIT = 5000;

const IMAGE_IDS = new Set([
  'amekes','amewig','annhum','belkin','bewwre','blapho','canbac','caskin',
  'cedwax','cintea','comrav','coohaw','coshum','grbher','greger','grerod',
  'grhowl','hoomer','houfin','labwoo','larspa','mallar','merlin','mourdo',
  'norfli','normoc','phaino','pibgre','redhea','reshaw','rethaw','rinduc',
  'ruckin','rudduc','savspa','saysph','shshaw','snoegr','verdin','verfly',
  'webblu','wesmea','whcspa','yerwar',
]);

export const quizBirds = birds.filter(b => IMAGE_IDS.has(b.id));

export type GamePhase = 'start' | 'playing' | 'reveal' | 'results';

export interface QuizAnswer {
  birdId: string;
  correctName: string;
  selectedName: string | null;
  correct: boolean;
  timedOut: boolean;
}

export interface HighScores {
  bestScore: number;
  bestStreak: number;
  gamesPlayed: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateChoices(bird: BirdCard, all: BirdCard[]): string[] {
  const others = all.filter(b => b.id !== bird.id);
  const sameType = others.filter(b => b.birdType === bird.birdType);
  const diffType = others.filter(b => b.birdType !== bird.birdType);
  const sameCount = Math.min(sameType.length, Math.random() < 0.5 ? 1 : 2);
  const samePicks = shuffle(sameType).slice(0, sameCount);
  const diffPicks = shuffle(diffType).slice(0, 4 - samePicks.length);
  return shuffle([
    bird.commonName,
    ...samePicks.map(b => b.commonName),
    ...diffPicks.map(b => b.commonName),
  ]);
}

// Birds whose subject is near the top of the photo — use a lower y% to show them
const TOP_CROP_BIRDS = new Set(['merlin']);

function randomCrop(birdId?: string): { x: number; y: number } {
  if (birdId && TOP_CROP_BIRDS.has(birdId)) {
    return { x: 40 + Math.random() * 20, y: 10 + Math.random() * 15 };
  }
  return { x: 40 + Math.random() * 20, y: 35 + Math.random() * 20 };
}

function loadHighScores(): HighScores {
  try {
    const raw = localStorage.getItem('birdQuizHighScores');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore corrupt data */ }
  return { bestScore: 0, bestStreak: 0, gamesPlayed: 0 };
}

function saveHighScores(hs: HighScores) {
  localStorage.setItem('birdQuizHighScores', JSON.stringify(hs));
}

export function useQuizGame() {
  const [phase, setPhase] = useState<GamePhase>('start');
  const [roundBirds, setRoundBirds] = useState<BirdCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT);
  const [streak, setStreak] = useState(0);
  const [bestStreakThisRound, setBestStreakThisRound] = useState(0);
  const [cropPosition, setCropPosition] = useState({ x: 50, y: 50 });
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [highScores, setHighScores] = useState<HighScores>(loadHighScores);

  const answeredRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef(0);
  const startTimeRef = useRef(0);
  const roundBirdsRef = useRef(roundBirds);
  const currentIndexRef = useRef(currentIndex);
  const streakRef = useRef(streak);
  const bestStreakRoundRef = useRef(bestStreakThisRound);
  const answersRef = useRef(answers);

  roundBirdsRef.current = roundBirds;
  currentIndexRef.current = currentIndex;
  streakRef.current = streak;
  bestStreakRoundRef.current = bestStreakThisRound;
  answersRef.current = answers;

  const currentBird = roundBirds[currentIndex] ?? null;
  const score = answers.filter(a => a.correct).length;

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    cancelAnimationFrame(rafRef.current);
    timeoutRef.current = null;
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // Preload next bird image
  useEffect(() => {
    if (currentIndex + 1 < roundBirds.length) {
      const img = new Image();
      img.src = `/images/${roundBirds[currentIndex + 1].id}.jpg`;
    }
  }, [currentIndex, roundBirds]);

  const onTimeout = useCallback(() => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    clearTimers();
    setTimeRemaining(0);

    const bird = roundBirdsRef.current[currentIndexRef.current];
    if (!bird) return;

    streakRef.current = 0;
    setStreak(0);

    const answer: QuizAnswer = {
      birdId: bird.id,
      correctName: bird.commonName,
      selectedName: null,
      correct: false,
      timedOut: true,
    };
    setAnswers(prev => [...prev, answer]);
    answersRef.current = [...answersRef.current, answer];

    setTimeout(() => setPhase('reveal'), 1500);
  }, [clearTimers]);

  const startCountdown = useCallback(() => {
    clearTimers();
    answeredRef.current = false;
    startTimeRef.current = performance.now();
    setTimeRemaining(TIME_LIMIT);

    timeoutRef.current = setTimeout(onTimeout, TIME_LIMIT + 50);

    function tick() {
      if (answeredRef.current) return;
      const elapsed = performance.now() - startTimeRef.current;
      const remaining = Math.max(0, TIME_LIMIT - elapsed);
      setTimeRemaining(remaining);
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [clearTimers, onTimeout]);

  useEffect(() => {
    if (phase === 'playing' && !answeredRef.current) {
      startCountdown();
    }
    return clearTimers;
  }, [phase, currentIndex, startCountdown, clearTimers]);

  function startGame() {
    const selected = shuffle(quizBirds).slice(0, ROUND_SIZE);
    setRoundBirds(selected);
    setCurrentIndex(0);
    setAnswers([]);
    answersRef.current = [];
    setStreak(0);
    streakRef.current = 0;
    setBestStreakThisRound(0);
    bestStreakRoundRef.current = 0;
    setSelectedAnswer(null);
    setCropPosition(randomCrop(selected[0].id));
    setChoices(generateChoices(selected[0], quizBirds));
    answeredRef.current = false;
    setPhase('playing');
  }

  function selectAnswer(name: string) {
    if (answeredRef.current || phase !== 'playing' || !currentBird) return;
    answeredRef.current = true;
    clearTimers();

    const correct = name === currentBird.commonName;
    setSelectedAnswer(name);

    const newStreak = correct ? streakRef.current + 1 : 0;
    streakRef.current = newStreak;
    setStreak(newStreak);
    if (newStreak > bestStreakRoundRef.current) {
      bestStreakRoundRef.current = newStreak;
      setBestStreakThisRound(newStreak);
    }

    const answer: QuizAnswer = {
      birdId: currentBird.id,
      correctName: currentBird.commonName,
      selectedName: name,
      correct,
      timedOut: false,
    };
    setAnswers(prev => [...prev, answer]);
    answersRef.current = [...answersRef.current, answer];

    setTimeout(() => setPhase('reveal'), 1000);
  }

  function nextBird() {
    const next = currentIndex + 1;
    if (next >= roundBirds.length) {
      finishRound();
      return;
    }
    setCurrentIndex(next);
    setSelectedAnswer(null);
    setCropPosition(randomCrop(roundBirds[next].id));
    setChoices(generateChoices(roundBirds[next], quizBirds));
    answeredRef.current = false;
    setPhase('playing');
  }

  function finishRound() {
    const allAnswers = answersRef.current;
    const finalScore = allAnswers.filter(a => a.correct).length;
    const finalBestStreak = Math.max(bestStreakRoundRef.current, streakRef.current);

    const hs = loadHighScores();
    hs.gamesPlayed++;
    if (finalScore > hs.bestScore) hs.bestScore = finalScore;
    if (finalBestStreak > hs.bestStreak) hs.bestStreak = finalBestStreak;

    setHighScores(hs);
    saveHighScores(hs);
    setPhase('results');
  }

  function goToStart() {
    clearTimers();
    setPhase('start');
    setHighScores(loadHighScores());
  }

  return {
    phase,
    currentBird,
    currentIndex,
    roundSize: ROUND_SIZE,
    totalBirds: quizBirds.length,
    choices,
    answers,
    timeRemaining,
    timeLimit: TIME_LIMIT,
    score,
    streak,
    bestStreakThisRound,
    cropPosition,
    selectedAnswer,
    highScores,
    startGame,
    selectAnswer,
    nextBird,
    goToStart,
  };
}
