// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace DatabaseNodes {
  export const publicGameConfig = '/publicGameConfig';
  export function publicGameConfigForGame(gameId: string): string {
    return `${publicGameConfig}/${gameId}`;
  }

  export const playerIdentities = '/playerIdentities';
  export function playerIdentitiesForGame(gameId: string): string {
    return `${playerIdentities}/${gameId}`;
  }
}
