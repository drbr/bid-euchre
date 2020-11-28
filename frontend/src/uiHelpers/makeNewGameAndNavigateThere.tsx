import { NavigateFn } from '@reach/router';
import { newGame } from '../firebase/CloudFunctionsClient';
import { GamePathLink } from '../app/paths';
import { UIActions } from './UIActions';

export async function makeNewGameAndNavigateThere(navigate: NavigateFn) {
  try {
    const { gameId } = await newGame();
    await navigate(GamePathLink({ gameId }));
  } catch (e) {
    UIActions.showErrorAlert(e, {
      message: 'Could not create new game. See log for details.',
    });
  }
}
