import * as FunctionsClient from '../firebase/CloudFunctionsClient';
import { Position } from '../../../functions/apiContract/database/GameState';
import { PlayerInfoStorage } from '../uiHelpers/LocalStorageClient';
import { UIActions } from '../uiHelpers/UIActions';

export async function joinGameAndStorePlayerInfo(args: {
  gameId: string;
  playerName: string;
  position: Position;
  storePlayerInfo: (x: PlayerInfoStorage) => void;
}) {
  const { playerName, position, gameId, storePlayerInfo } = args;
  try {
    const joinGameResult = await FunctionsClient.joinGame({
      friendlyName: playerName,
      gameId: gameId,
      position: position,
    });

    storePlayerInfo(joinGameResult);
  } catch (e) {
    UIActions.showErrorAlert(e, {
      message: 'Could not join game. See log for details.',
    });
  }
}
