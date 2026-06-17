import type { Case } from '../logic/types';

/**
 * Adapted from "The Adventure of the Speckled Band" (public domain),
 * The Adventures of Sherlock Holmes, Arthur Conan Doyle, 1892.
 *
 * Content is DATA, not code. New cases are added as sibling files like this one
 * and registered in src/content/index.ts (Phase 1). No engine changes needed.
 */
const caseSpeckledBand: Case = {
  id: 'speckled-band',
  title: 'The Speckled Band',
  source: 'The Adventures of Sherlock Holmes (1892)',
  briefing: `A frightened young woman, Helen Stoner, calls at Baker Street before dawn. Her twin sister died two years ago, gasping the words "the speckled band." Now Helen has been moved into that same room — and last night she heard the low whistle that preceded her sister's death.`,
  scene: 'Stoke Moran, a crumbling Surrey manor Helen shares with her stepfather, Dr. Grimesby Roylott.',
  suspects: [
    {
      id: 'roylott',
      name: 'Dr. Grimesby Roylott',
      blurb: "Helen's stepfather. A violent temper, mounting debts, and a menagerie of exotic animals from his years in India.",
    },
    {
      id: 'band',
      name: 'The travelling band',
      blurb: 'Wanderers camped on the manor grounds, whom Helen first suspected when she heard the words "speckled band."',
    },
    {
      id: 'fiance',
      name: 'Percy Armitage',
      blurb: "Helen's fiancé. Their coming marriage is exactly what threatens Roylott's income.",
    },
  ],
  clues: [
    {
      id: 'will',
      label: "The stepfather's income",
      description: "Roylott controls the late mother's estate, but each daughter's marriage would cut his income sharply.",
      location: 'Family solicitor',
      source: 'document',
      implicates: ['roylott'],
      redHerring: false,
    },
    {
      id: 'bellrope',
      label: 'The dummy bell-rope',
      description: 'A bell-pull hangs beside the bed but is fastened to nothing — it rings no bell at all.',
      location: 'The bedroom',
      source: 'scene',
      implicates: ['roylott'],
      redHerring: false,
    },
    {
      id: 'ventilator',
      label: 'The false ventilator',
      description: "A small ventilator opens not to the outside air, but into Roylott's adjoining room.",
      location: 'The bedroom',
      source: 'scene',
      implicates: ['roylott'],
      redHerring: false,
    },
    {
      id: 'bed',
      label: 'The bolted bed',
      description: 'The bed is clamped to the floor, fixed directly beneath the bell-rope and the ventilator.',
      location: 'The bedroom',
      source: 'scene',
      implicates: ['roylott'],
      redHerring: false,
    },
    {
      id: 'safe',
      label: 'The saucer and the leash',
      description: "A saucer of milk sits atop a locked safe in Roylott's room; a dog-leash is tied into a curious running loop.",
      location: "Roylott's room",
      source: 'scene',
      implicates: ['roylott'],
      redHerring: false,
    },
    {
      id: 'whistle',
      label: 'The whistle in the night',
      description: 'A low whistle sounds in the small hours, followed by a faint clang of metal.',
      location: 'Reported by Helen',
      source: 'interrogation',
      implicates: ['roylott'],
      redHerring: false,
    },
    {
      id: 'camp',
      label: "The wanderers' camp",
      description: 'The travelling band wear spotted handkerchiefs and camp close to the house — an easy thing to blame.',
      location: 'Manor grounds',
      source: 'scene',
      implicates: ['band'],
      redHerring: true,
    },
  ],
  solution: {
    culpritId: 'roylott',
    motive: "To stop his stepdaughters marrying and taking their share of the estate, which would gut his income.",
    method: 'A trained swamp adder — the "speckled band" — sent through the ventilator and down the dummy bell-rope onto the fixed bed, then recalled with a whistle and a saucer of milk.',
    keyClueIds: ['ventilator', 'bellrope', 'bed', 'whistle', 'will'],
  },
};

export default caseSpeckledBand;
