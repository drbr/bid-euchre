export type Suit = 'C' | 'S' | 'H' | 'D';
export type Rank = '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export type Card = {
  rank: Rank;
  suit: Suit;
};

export type Hand = ReadonlyArray<Card>;
