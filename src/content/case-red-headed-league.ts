import type { Case } from '../logic/types';

/**
 * Adapted from "The Red-Headed League" (public domain),
 * The Adventures of Sherlock Holmes, Arthur Conan Doyle, 1892.
 *
 * Faithful in its clues; lightly simplified for play — the game names a single
 * culprit (the "assistant," John Clay), and treats the vanished League manager
 * as the misdirection. Like every case, this is DATA: adding it required no engine
 * change, only this file and one line in src/content/index.ts.
 */
const caseRedHeadedLeague: Case = {
  id: 'red-headed-league',
  title: 'The Red-Headed League',
  source: 'The Adventures of Sherlock Holmes (1892)',
  briefing: `A red-haired pawnbroker, Jabez Wilson, was hired by the "Red-Headed League" to copy out the encyclopaedia for four pounds a week — easy money, on the odd condition that he stay at the League's office every morning. Eight weeks on, the League dissolved overnight with a curt notice on the door. Holmes suspects the absurd job was a blind for something happening back at the shop.`,
  scene: "Wilson's pawnshop on dingy Saxe-Coburg Square — and the busy thoroughfare that backs onto it.",
  suspects: [
    {
      id: 'clay',
      name: 'Vincent Spaulding',
      blurb: "Wilson's young assistant, happy to work for half wages and forever slipping down into the cellar. (In truth, John Clay, a practised thief.)",
    },
    {
      id: 'ross',
      name: 'Duncan Ross',
      blurb: 'The League\'s manager, who set Wilson his daily task — then vanished the moment the League "dissolved."',
    },
    {
      id: 'wilson',
      name: 'Jabez Wilson',
      blurb: 'The pawnbroker himself: baffled, out of pocket, and convinced he has merely been made a fool of.',
    },
  ],
  clues: [
    {
      id: 'halfwages',
      label: 'The cut-price assistant',
      description: 'The assistant came cheap — he offered to work for half wages, asking only that he be free to come and go from the cellar.',
      location: 'The pawnshop',
      source: 'scene',
      implicates: ['clay'],
      redHerring: false,
    },
    {
      id: 'knees',
      label: 'The worn knees',
      description: "The knees of the assistant's trousers are worn, wrinkled, and stained — the marks of a man who spends his hours kneeling.",
      location: 'The pawnshop',
      source: 'scene',
      implicates: ['clay'],
      redHerring: false,
    },
    {
      id: 'cellar',
      label: 'Hours in the cellar',
      description: 'The assistant vanishes into the cellar for hours together, claiming to be developing photographs.',
      location: 'The cellar',
      source: 'scene',
      implicates: ['clay'],
      redHerring: false,
    },
    {
      id: 'bank',
      label: 'The neighbour behind the wall',
      description: 'The shabby square backs directly onto a branch vault of the City & Suburban Bank.',
      location: 'Saxe-Coburg Square',
      source: 'scene',
      implicates: ['clay'],
      redHerring: false,
    },
    {
      id: 'sounding',
      label: 'The hollow pavement',
      description: "Holmes raps the pavement before the shop with his stick: the cellar runs not toward the street, but back — toward the bank.",
      location: 'Saxe-Coburg Square',
      source: 'scene',
      implicates: ['clay'],
      redHerring: false,
    },
    {
      id: 'notice',
      label: 'The vanished League',
      description: 'The Red-Headed League dissolved overnight — a curt notice nailed to the door, its manager Duncan Ross gone without a forwarding address.',
      location: "The League's office",
      source: 'document',
      implicates: ['ross'],
      redHerring: true,
    },
  ],
  solution: {
    culpritId: 'clay',
    motive: 'To empty the shop every morning so he could work undisturbed beneath it.',
    method: 'The whole League was a blind — a fake job to lure the pawnbroker away while the "assistant" dug a tunnel from the cellar toward the City & Suburban Bank vault.',
    keyClueIds: ['halfwages', 'knees', 'cellar', 'bank', 'sounding'],
  },
};

export default caseRedHeadedLeague;
