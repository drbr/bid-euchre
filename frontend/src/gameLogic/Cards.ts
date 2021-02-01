export type Suit = 'C' | 'S' | 'H' | 'D';
export type Rank = '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export type Card = {
  rank: Rank;
  suit: Suit;
};

export type Hand = ReadonlyArray<Card>;

/**
 * Returns the cards that are considered to be part of the given suit for this particular round –
 * takes into account that the left bower switches to the trump suit.
 */
export function cardsInDescendingOrderForEffectiveSuit(params: {
  suit: Suit;
  trump: Suit;
}): ReadonlyArray<Card> {
  const { suit, trump } = params;
  if (suit === trump) {
    return [
      { suit, rank: 'J' },
      { suit: SuitOfSameColor[suit], rank: 'J' },
      { suit, rank: 'A' },
      { suit, rank: 'K' },
      { suit, rank: 'Q' },
      { suit, rank: '10' },
      { suit, rank: '9' },
    ];
  } else if (suit === SuitOfSameColor[trump]) {
    return [
      { suit, rank: 'A' },
      { suit, rank: 'K' },
      { suit, rank: 'Q' },
      { suit, rank: '10' },
      { suit, rank: '9' },
    ];
  } else {
    return [
      { suit, rank: 'A' },
      { suit, rank: 'K' },
      { suit, rank: 'Q' },
      { suit, rank: 'J' },
      { suit, rank: '10' },
      { suit, rank: '9' },
    ];
  }
}

/**
 * Returns the effective suit of the given card for this particular round –
 * takes into account that the left bower switches to the trump suit.
 */
export function getEffectiveSuit(params: { card: Card; trump: Suit }): Suit {
  const { card, trump } = params;
  if (card.rank === 'J' && card.suit === SuitOfSameColor[trump]) {
    return trump;
  } else {
    return card.suit;
  }
}

const SuitOfSameColor: Record<Suit, Suit> = {
  C: 'S',
  S: 'C',
  D: 'H',
  H: 'D',
};
