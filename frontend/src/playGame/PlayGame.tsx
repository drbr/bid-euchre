import { memo, useCallback } from 'react';
import { AnyEventObject } from 'xstate';
import { GameDisplayDelegatorPure } from '../euchreGameDisplay/GameDisplayDelegator';
import * as FunctionsClient from '../firebase/CloudFunctionsClient';
import * as DAO from '../firebase/FrontendDAO';
import { InProgressGameConfig } from '../gameLogic/apiContract/database/DataModel';
import { Position } from '../gameLogic/apiContract/database/Position';
import { GameStateConfig } from '../gameLogic/euchreStateMachine/GameStateTypes';
import {
  HydratedGameState,
  hydrateStateFromConfig,
} from '../gameLogic/stateMachineUtils/serializeAndHydrateState';
import { useStateHeadStorage } from '../uiHelpers/LocalStorageClient';
import { Subscription, useSubscription } from '../uiHelpers/useSubscription';
import { useStateBuffer } from './useStateBuffer';

export type PlayGameProps = {
  gameId: string;
  playerId: string | null;
  gameConfig: InProgressGameConfig;
  seatedAt: Position | null;
};

export const PlayGamePure = memo(function PlayGame(props: PlayGameProps) {
  const { gameId, playerId } = props;

  const sendGameEventToServer = useCallback(
    (currentGameState: HydratedGameState, event: AnyEventObject) =>
      FunctionsClient.sendGameEvent({
        event,
        existingEventCount: currentGameState.hydratedState.context.eventCount,
        gameId,
        playerId,
      }),
    [gameId, playerId]
  );

  const [head, storeHead] = useStateHeadStorage({ gameId });

  const {
    currentGameState,
    addSnapshotToBuffer,
    sendGameEventViaBufferMachine,
    isGameEventValid,
    unblockHead,
    bufferMachineMode,
    dispatchToBuffer,
  } = useStateBuffer({
    participatingInGame: !!props.seatedAt,
    initialHead: head,
    onHeadChanged: storeHead,
    sendGameEventToServer: sendGameEventToServer,
  });

  const putDownloadedGameStateInBuffer = useCallback(
    (data: GameStateConfig | null) => {
      if (!data) {
        throw new Error(`Game with ID ${gameId} was not found!`);
      } else {
        const hydrated = hydrateStateFromConfig(data);
        addSnapshotToBuffer(hydrated);
      }
    },
    [addSnapshotToBuffer, gameId]
  );

  useSubscription(
    { gameId, playerId },
    subscribeToPublicOrPrivateGameState,
    putDownloadedGameStateInBuffer
  );

  if (!currentGameState) {
    return <div>Loading…</div>;
  }

  const gameState = currentGameState?.hydratedState;

  /* Add stuff to the window for debugging */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (window as any).gameState = gameState;
  (window as any).goForward = () =>
    dispatchToBuffer({ type: 'DETACHED_GO_FORWARD' });
  (window as any).goBack = () => dispatchToBuffer({ type: 'DETACHED_GO_BACK' });
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div style={{ width: '100%' }}>
      <p>
        {props.playerId ? null : 'You are a spectator of the current game!'}
      </p>
      <GameDisplayDelegatorPure
        stateValue={gameState.value}
        stateContext={gameState.context}
        gameConfig={props.gameConfig}
        seatedAt={props.seatedAt}
        isEventValid={isGameEventValid}
        sendGameEvent={sendGameEventViaBufferMachine}
        sendGameEventInProgress={bufferMachineMode.mode === 'sendingGameEvent'}
        unblockHead={unblockHead}
      />
    </div>
  );
});

const subscribeToPublicOrPrivateGameState: Subscription<
  { gameId: string; playerId: string | null },
  GameStateConfig
> = (params, callback) => {
  const { gameId, playerId } = params;
  if (playerId) {
    return DAO.subscribeToPrivateGameState({ gameId, playerId }, callback);
  } else {
    return DAO.subscribeToPublicGameState({ gameId }, callback);
  }
};
