import { useMemo } from 'react';
import createPersistedState from 'use-persisted-state';
import { Position } from "../gameLogic/apiContract/database/Position";

export const StorageKey_StateHead = (gameId: string) =>
  `game_${gameId}_stateHead`;

export const useRawColorSchemeState = createPersistedState('colorSchemeId');
export function useColorSchemeStorage(initial: number) {
  const usePersistedStateColorScheme = useRawColorSchemeState<number>(initial);
  return usePersistedStateColorScheme;
}

export type PlayerInfoStorage = {
  position: Position;
  friendlyName: string;
  playerId: string;
};

/**
 * Uses synced local storage to store the player info. When retrieving, returns
 * `'gameNotFound'` if no record is found for that game ID.
 */
export function usePlayerInfoStorage(params: { gameId: string }) {
  const useRawState = useMemo(
    () => createPersistedState(`game_${params.gameId}`),
    [params.gameId]
  );

  const [rawPlayerInfo, setRawPlayerInfo] = useRawState<PlayerInfoStorage>();
  return [rawPlayerInfo ?? 'gameNotFound', setRawPlayerInfo] as const;
}

/**
 * Uses synced local storage to store the player info. When retrieving, returns
 * `'gameNotFound'` if no record is found for that game ID.
 *
 * The initial value is 1, because that's the first event count that will have
 * a state snapshot.
 */
export function useStateHeadStorage(params: {
  gameId: string;
}): [number, (h: number) => void] {
  const useRawState = useMemo(
    () => createPersistedState(`game_${params.gameId}_stateHead`),
    [params.gameId]
  );

  return useRawState(1);
}
