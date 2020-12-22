import { PartialDeep } from 'type-fest';
import { GameConfig } from '../../../functions/apiContract/database/DataModel';
import { Position } from '../../../functions/apiContract/database/GameState';
import {
  GameContext,
  GameStateConfig,
} from './euchreStateMachine/GameStateTypes';
import { getStateConfigFromJson } from './stateMachineUtils/serializeAndHydrateState';
import { EventCountContext } from './stateMachineUtils/TypedStateInterfaces';

/**
 * The database returns null values as nonexistent keys. Deep-map client-side to keys with undefined
 * values.
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

export function mapGameStateFromDatabase(
  original: string | null | undefined
): GameStateConfig | null {
  return original ? getStateConfigFromJson(original) : null;
}

export function parsePrivateGameContextFromDatabase(
  original: string | null | undefined
): PartialDeep<GameContext> & EventCountContext {
  if (!original) {
    return {
      eventCount: 0,
      previousEventCount: null,
    };
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
