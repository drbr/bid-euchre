import { NavigateFn } from '@reach/router';
import * as FunctionsClient from '../firebase/CloudFunctionsClient';
import { GamePathLink } from '../app/paths';
import { UIActions } from '../uiHelpers/UIActions';

export async function makeNewGameAndNavigateThere(navigate: NavigateFn) {
  try {
    const { gameId } = await FunctionsClient.newGame();
    await navigate(GamePathLink({ gameId }));
  } catch (e) {
    UIActions.showErrorAlert(e, {
      message: 'Could not create new game. See log for details.',
    });
  }
}
