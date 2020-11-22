import { NavigateFn } from '@reach/router';
import { newGame } from '../firebase/ApiClient';
import { GamePathLink } from '../routing/paths';

export async function makeNewGameAndNavigateThere(navigate: NavigateFn) {
  const { gameId } = await newGame();
  await navigate(GamePathLink({ gameId }));
}
