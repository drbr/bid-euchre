import { AnyEventObject } from 'xstate';
import * as FunctionsClient from '../firebase/CloudFunctionsClient';
import { UIActions } from '../uiHelpers/UIActions';

export type SendGameEventToServerParams = {
  gameId: string;
  playerId: string | null;
  existingEventCount: number;
  event: AnyEventObject;
};

export async function sendGameEventToServer(
  params: SendGameEventToServerParams
) {
  try {
    await FunctionsClient.sendGameEvent({
      event: params.event,
      existingEventCount: params.existingEventCount,
      gameId: params.gameId,
      playerId: params.playerId,
    });
  } catch (e) {
    UIActions.showErrorAlert(e, {
      message: 'Could not send game event. See log for details.',
    });
    throw e;
  }
}
