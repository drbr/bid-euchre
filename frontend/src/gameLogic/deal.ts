import * as _ from 'lodash';
import { Card, Hand, Rank, Suit } from './apiContract/database/Cards';
import { Position } from './apiContract/database/GameState';

const NUMBER_OF_CARDS_PER_HAND = 6;

export function deal(): Record<Position, Hand> {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const hands = dealOnce();
    if (!wasAnyPlayerDealtABadHand(hands)) {
      return hands;
    }
  }
}

export function dealOnce(): Record<Position, Hand> {
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

/**
 * In our rules, if a player was dealt four 9s, it qualifies for an automatic redeal. Other "bad
 * hand" conditions could be added here too, if we want to add game config to support them.
 */
function wasAnyPlayerDealtABadHand(hands: Record<Position, Hand>): boolean {
  function handContainsFourNines(hand: Hand): boolean {
    return hand.filter((card) => card.rank === '9').length === 4;
  }

  return _.some(hands, handContainsFourNines);
}
