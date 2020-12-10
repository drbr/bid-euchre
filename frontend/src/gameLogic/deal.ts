import * as _ from 'lodash';
import {
  Hand,
  Rank,
  Card,
  Suit,
} from '../../../functions/apiContract/database/Cards';
import { Position } from '../../../functions/apiContract/database/GameState';

const NUMBER_OF_CARDS_PER_HAND = 6;

export function deal(): Record<Position, Hand> {
  const deck = generateDeckOfCards();
  const shuffled = _.shuffle(deck);
  const fourHands = _.chunk(shuffled, NUMBER_OF_CARDS_PER_HAND);

  return {
    north: fourHands[0],
    south: fourHands[1],
    east: fourHands[2],
    west: fourHands[3],
  };
}

const Ranks: ReadonlyArray<Rank> = ['9', '10', 'J', 'Q', 'K', 'A'];
const Suits: ReadonlyArray<Suit> = ['C', 'S', 'H', 'D'];

function generateDeckOfCards(): Card[] {
  const deck: Card[] = [];

  for (const suit of Suits) {
    for (const rank of Ranks) {
      deck.push({ rank, suit });
    }
  }

  return deck;
}
