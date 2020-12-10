import {
  AllGameInfo,
  GameConfig,
  GameStates,
} from '../../../functions/apiContract/database/DataModel';
import { Position } from '../../../functions/apiContract/database/GameState';
import { GameContext, GameState } from './euchreStateMachine/GameStateTypes';
import { hydrateState } from './stateMachineUtils/serializeAndHydrateState';

/**
 * The database returns null values as nonexistent keys. Deep-map client-side to keys with undefined
 * values.
 */
export function mapGameInfoFromDatabase(
  original: AllGameInfo | null | undefined
): AllGameInfo | null {
  if (!original) {
    return null;
  }
  return {
    gameStates: {
      fullJson: original.gameStates.fullJson,
      publicJson: original.gameStates.publicJson,
      privateContextsJson: original.gameStates.privateContextsJson || {},
    },
    // The game config is initialized with the game info, so this will never be null.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    gameConfig: mapGameConfigFromDatabase(original.gameConfig)!,
    playerIdentities: mapPositionRecordFromDatabase(original.playerIdentities),
  };
}

/**
 * The frontend queries the game config by itself, so it might be null if the game hasn't been
 * initialized yet.
 */
export function mapGameConfigFromDatabase(
  original: GameConfig | null | undefined
): GameConfig | null {
  if (!original) {
    return null;
  }
  return {
    gameStatus: original.gameStatus,
    playerFriendlyNames: mapPositionRecordFromDatabase(
      original.playerFriendlyNames
    ),
  };
}

export function mapGameStatesFromDatabase(
  original: GameStates | null
): GameStates {
  return {
    fullJson: original?.fullJson ?? '{}',
    publicJson: original?.publicJson ?? '{}',
    privateContextsJson: original?.privateContextsJson ?? {},
  };
}

export function mapPublicGameStateFromDatabase(
  original: string | null | undefined
): GameState | null {
  console.debug('Received game state from database:');
  console.debug(original);
  return original ? hydrateState(original).hydratedState : null;
}

export function mapPrivateGameStateFromDatabase(
  original: string | null | undefined
): Partial<GameContext> {
  if (!original) {
    return {};
  }
  return JSON.parse(original);
}

export function mapPositionRecordFromDatabase<T>(
  original: Record<Position, T | null> | null | undefined
): Record<Position, T | null> {
  if (!original) {
    return {
      north: null,
      south: null,
      east: null,
      west: null,
    };
  } else {
    return {
      north: original.north ?? null,
      south: original.south ?? null,
      east: original.east ?? null,
      west: original.west ?? null,
    };
  }
}
