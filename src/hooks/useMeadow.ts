import { useState, useCallback, useEffect, useRef } from 'react';
import { MEADOW_ANIMALS, type MeadowAnimal } from '../data/animals';

export type MeadowView = 'meadow' | 'rescue' | 'game';

export interface MeadowPopupData {
  id: string;
  message: string;
  type: 'rescue' | 'meadow';
}

export interface MeadowState {
  /** IDs of rescued animals now living in the meadow */
  rescuedAnimals: string[];
  /** Whether the dam has been built (after beaver rescued) */
  damBuilt: boolean;
  /** Whether the snake basket is in the meadow */
  basketPlaced: boolean;
  /** Whether the owl burrow has been dug */
  burrowDug: boolean;
}

const STORAGE_KEY = 'meadowState';

function loadState(): MeadowState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { rescuedAnimals: [], damBuilt: false, basketPlaced: false, burrowDug: false };
}

function saveState(state: MeadowState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useMeadow() {
  const [view, setView] = useState<MeadowView>('meadow');
  const [state, setState] = useState<MeadowState>(loadState);
  const [activeAnimal, setActiveAnimal] = useState<MeadowAnimal | null>(null);
  const [popups, setPopups] = useState<MeadowPopupData[]>([]);
  const popupIdRef = useRef(0);

  // Persist state changes
  useEffect(() => { saveState(state); }, [state]);

  const addPopup = useCallback((message: string, type: 'rescue' | 'meadow') => {
    const id = `popup-${++popupIdRef.current}`;
    setPopups(prev => [...prev, { id, message, type }]);
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== id));
    }, 3000);
  }, []);

  const dismissPopup = useCallback((id: string) => {
    setPopups(prev => prev.filter(p => p.id !== id));
  }, []);

  const availableAnimals = MEADOW_ANIMALS.filter(
    a => !state.rescuedAnimals.includes(a.id)
  );

  const goToMeadow = useCallback(() => {
    setView('meadow');
    setActiveAnimal(null);
  }, []);

  const goToRescue = useCallback(() => {
    if (availableAnimals.length > 0) {
      setView('rescue');
      addPopup('New animals need your help!', 'rescue');
    }
  }, [availableAnimals.length, addPopup]);

  const startGame = useCallback((animal: MeadowAnimal) => {
    setActiveAnimal(animal);
    setView('game');
  }, []);

  const completeRescue = useCallback((animalId: string) => {
    setState(prev => {
      const next = {
        ...prev,
        rescuedAnimals: [...prev.rescuedAnimals, animalId],
      };
      if (animalId === 'beaver') next.damBuilt = true;
      if (animalId === 'snake') next.basketPlaced = true;
      if (animalId === 'owl') next.burrowDug = true;
      return next;
    });

    const animal = MEADOW_ANIMALS.find(a => a.id === animalId);
    const name = animal?.name ?? 'Animal';

    // Show meadow change popup
    addPopup(`${name} has moved into the meadow!`, 'meadow');

    if (animalId === 'beaver') {
      setTimeout(() => addPopup('Beaver built a dam by the pond!', 'meadow'), 1500);
    }
    if (animalId === 'snake') {
      setTimeout(() => addPopup('Snake is curled up in his basket!', 'meadow'), 1500);
    }
    if (animalId === 'owl') {
      setTimeout(() => addPopup('Owl has settled into his new burrow!', 'meadow'), 1500);
    }

    // Return to meadow after short delay
    setTimeout(() => {
      setView('meadow');
      setActiveAnimal(null);
    }, 2000);
  }, [addPopup]);

  const resetMeadow = useCallback(() => {
    const fresh: MeadowState = { rescuedAnimals: [], damBuilt: false, basketPlaced: false, burrowDug: false };
    setState(fresh);
    setView('meadow');
    setActiveAnimal(null);
    addPopup('Meadow has been reset!', 'meadow');
  }, [addPopup]);

  return {
    view,
    state,
    activeAnimal,
    popups,
    availableAnimals,
    goToMeadow,
    goToRescue,
    startGame,
    completeRescue,
    dismissPopup,
    resetMeadow,
  };
}
