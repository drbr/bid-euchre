
export type GamePathRouteProps = { gameId?: string };

export function GamePathLink({ gameId }: GamePathRouteProps) {
  return `/game/${gameId}`;
}
