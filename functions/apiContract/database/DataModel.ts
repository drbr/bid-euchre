import { Position } from './GameState';

export type DatabaseSchema = {
  games: {
    [gameId: string]: AllGameInfo;
  };
  gameEvents: {
    [gameId: string]: string[];
  };
};

export type AllGameInfo = {
  gameState: {
    fullJson: string;
    publicJson: string;
    privateContextsJson: PrivateGameContextsJson;
  };
  gameConfig: GameConfig;
  playerIdentities: PlayerIdentities;
};

/**
 * The public game config contains information about the setup of a particular game: house rules,
 * player names, and such. This object will be created as soon as a user requests a "new game". The
 * data in this object can change before the game begins, but stays constant once the game has
 * started.
 *
 * This state can be read by anyone (players and observers).
 */
export type GameConfig = {
  /**
   * We need to initialize with at least one non-null value so the database will actually create the
   * entry
   */
  gameStatus: GameStatus;
  playerFriendlyNames: Record<Position, string | null>;
};

/** The status of the game, as stored in the game config */
export type GameStatus = 'waitingToStart' | 'inProgress' | 'finished';

export type InProgressGameConfig = GameConfig & {
  playerFriendlyNames: Record<Position, string>;
};

/**
 * Player identities list the user IDs for each player in the game, and are thus private to the
 * server.
 */
export type PlayerIdentities = Record<Position, string | null>;

/**
 * This state is private to an individual player; only that player is allowed to read it. Each
 * player has their own separate instance of this state for each game they are a part of, keyed by
 * Game ID and Player ID. Since a player knows only their own ID, this is "security by obscurity".
 *
 * The JSON object represented here is a partial listing of the secret fields from the State Machine
 * Context, and should be merged back into the context client-side before use.
 *
 * This object will exist during a game's `inProgress` phase.
 */
export type PrivateGameContextsJson = {
  [playerId: string]: string;
};
