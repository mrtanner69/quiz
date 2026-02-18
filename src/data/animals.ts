export interface MeadowAnimal {
  id: string;
  name: string;
  emoji: string;
  description: string;
  rescueTask: string;
  gameType: 'chop' | 'charm' | 'dig';
  gameInstructions: string;
  /** Number of taps/actions needed to complete the rescue */
  actionsNeeded: number;
  /** Whether this animal swims in the pond after rescue */
  swims: boolean;
}

export const MEADOW_ANIMALS: MeadowAnimal[] = [
  {
    id: 'beaver',
    name: 'Beaver',
    emoji: '',
    description: 'A friendly beaver looking for a home. Help him build a dam!',
    rescueTask: 'Cut down 3 little trees so Beaver can build his dam',
    gameType: 'chop',
    gameInstructions: 'Tap each tree to chop it down!',
    actionsNeeded: 3,
    swims: true,
  },
  {
    id: 'snake',
    name: 'Snake',
    emoji: '',
    description: 'A cute little snake swaying to music. Charm him into his basket!',
    rescueTask: 'Play a tune on the pipe to charm Snake into his basket',
    gameType: 'charm',
    gameInstructions: 'Tap the pipe to play a tune!',
    actionsNeeded: 8,
    swims: false,
  },
  {
    id: 'owl',
    name: 'Burrowing Owl',
    emoji: '',
    description: 'A tiny burrowing owl needs a cosy underground home!',
    rescueTask: 'Use the spade to dig a burrow for Owl',
    gameType: 'dig',
    gameInstructions: 'Tap the spade to dig!',
    actionsNeeded: 6,
    swims: false,
  },
];

/** Otter is a permanent pond resident (not rescued, always present) */
export const POND_RESIDENTS = ['otter'] as const;
