import { AnyEventObject } from 'xstate';
import * as FunctionsClient from '../firebase/CloudFunctionsClient';
import { HydratedGameState } from '../gameLogic/stateMachineUtils/serializeAndHydrateState';
import { UIActions } from '../uiHelpers/UIActions';

export async function sendGameEventToServer(params: {
  gameId: string;
  playerId: string | null;
  currentGameState: HydratedGameState | null | undefined;
  event: AnyEventObject;
}) {
  try {
    if (params.currentGameState) {
      await FunctionsClient.sendGameEvent({
        event: params.event,
        existingEventCount:
          params.currentGameState.hydratedState.context.eventCount,
        gameId: params.gameId,
        playerId: params.playerId,
      });
    }
  } catch (e) {
    UIActions.showErrorAlert(e, {
      message: 'Could not send game event. See log for details.',
    });
  }
}
