/* eslint-disable @typescript-eslint/no-namespace */

export const LobbyPath = '/';

export const gameId = 'gameId' as const;

export type GamePathRouteProps = { [gameId]?: string };

export const GamePathRoute = `game/:${gameId}`;

export function GamePathLink({ gameId }: GamePathRouteProps) {
  return `game/${gameId}`;
}
