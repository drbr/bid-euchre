import { Position } from '../../../functions/apiContract/database/GameState';

export function retrieveColorSchemeId(): number {
  const rawStorageValue = localStorage.getItem('colorSchemeId');
  return Number(rawStorageValue) || 0;
}

export function storeColorSchemeId(i: number): void {
  localStorage.setItem('colorSchemeId', String(i));
}

export type PlayerInfoStorage = {
  position: Position;
  friendlyName: string;
  playerId: string;
};

export function storePlayerInfoForGame(
  params: PlayerInfoStorage & { gameId: string }
): void {
  const playerInfo: PlayerInfoStorage = {
    position: params.position,
    friendlyName: params.friendlyName,
    playerId: params.playerId,
  };
  localStorage.setItem(`game_${params.gameId}`, JSON.stringify(playerInfo));
}

export function retrievePlayerInfoForGame(params: {
  gameId: string;
}): PlayerInfoStorage | undefined {
  const maybeInfo = localStorage.getItem(`game_${params.gameId}`);
  return maybeInfo ? JSON.parse(maybeInfo) : undefined;
}
