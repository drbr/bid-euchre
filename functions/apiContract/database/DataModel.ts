import { Card, Hand, Suit } from './Cards';
import { Position, Bid, Partnership } from './GameState';

export type DatabaseSchema = {
  publicGameState: {
    [gameId: string]: PublicGameState;
  };
  publicGameConfig: {
    [gameId: string]: PublicGameConfig;
  };
  playerIdentities: {
    [gameId: string]: PlayerIdentities;
  };
  playerPrivateGameState: {
    [gameId: string]: {
      [playerId: string]: PlayerPrivateGameState;
    };
  };
};

/**
 * This state represents the game as it progresses, and is managed by the State Machine. Data in the
 * Public Game State is visible to all players as well as observers.
 *
 * This object will be created once the game is fully configured; its creation signifies the start
 * of gameplay.
 */
export type PublicGameState = {
  score: Record<Partnership, number>;
  currentDealer: Position;
  bids?: Record<Position, Bid>;
  trump?: Suit;
  currentTrickLead: Position;
  currentTrick?: Partial<Record<Position, Card>>;
  wonTricks: Record<Partnership, number>;
};

/**
 * The public game config contains information about the setup of a particular game: house rules,
 * player names, and such. This object will be created as soon as a user requests a "new game". The
 * data in this object can change before the game begins, but stays constant once the game has
 * started.
 *
 * This state can be read by anyone (players and observers).
 */
export type PublicGameConfig = {
  gameExists: boolean;
  playerFriendlyNames: Record<Position, string>;
};

/**
 * Player identities list the user IDs for each player in the game, and are thus private to the
 * server.
 */
export type PlayerIdentities = Partial<Record<Position, string>>;

/**
 * This state is private to an individual player; only that player is allowed to read it while the
 * game is in progress. Each player has their own separate instance of this state for each game they
 * are a part of.
 *
 * This object will be created once the game is fully configured; its creation signifies the start
 * of gameplay.
 */
export type PlayerPrivateGameState = {
  position: Position;
  hand: Hand;
};
