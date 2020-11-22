// This is hypothetical - for now.

export type Suit = 'C' | 'S' | 'H' | 'D';
export type Rank = '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export type Card = `${Rank}${Suit}`;

export type DatabaseSchema = {
  games: {
    [gameId: string]: PublicGameState;
  };
  hands: {
    [userAuthId: string]: Hand;
  };
};

export type Positions = 'north' | 'south' | 'east' | 'west';

export type PublicGameState = {
  players: Record<Positions, Player>;
  score: Record<Positions, number>;
  currentDealer: 'north' | 'south' | 'east' | 'west';
  bids: Record<Positions, number | null | 'pass'>;
  trump: 'C' | 'S' | 'H' | 'D';
  tricks: ReadonlyArray<Trick>;
};

export type Player = {
  userAuthId: string;
  displayName: string;
};

export type Hand = ReadonlyArray<string>;

export type Trick = {
  lead: Positions;
} & Record<Positions, Card>;
