import {
  PlayerPrivateGameState,
  PublicGameConfig,
} from '../../../functions/apiContract/database/DataModel';
import { Position } from '../../../functions/apiContract/database/GameState';
import { GameState } from './stateMachine/GameStateTypes';
import { hydrateState } from './StateMachineHelpers';

/**
 * The database returns null values as nonexistent keys. Deep-map client-side to keys with undefined
 * values.
 */
export function mapGameConfigFromDatabase(
  original: PublicGameConfig | null | undefined
): PublicGameConfig | null {
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

export function mapGameMachineStateFromDatabase(
  original: string | null | undefined
): GameState | null {
  console.log(original);
  return original ? hydrateState(original).hydratedState : null;
}

export function mapPrivateGameStateFromDatabase(
  original: PlayerPrivateGameState | null | undefined
): PlayerPrivateGameState | null {
  if (!original) {
    return null;
  }
  return {
    hand: original.hand,
  };
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
