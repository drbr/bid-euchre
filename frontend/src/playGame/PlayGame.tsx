import { memo, useCallback } from 'react';
import { AnyEventObject } from 'xstate';
import { GameDisplayPure } from '../euchreGameDisplay/GameDisplay';
import * as FunctionsClient from '../firebase/CloudFunctionsClient';
import * as DAO from '../firebase/FrontendDAO';
import { InProgressGameConfig } from '../gameLogic/apiContract/database/DataModel';
import { Position } from '../gameLogic/apiContract/database/Position';
import { GameStateMachine } from '../gameLogic/euchreStateMachine/GameStateMachine';
import {
  GameEvent,
  GameStateConfig,
} from '../gameLogic/euchreStateMachine/GameStateTypes';
import {
  HydratedGameState,
  hydrateStateFromConfig,
} from '../gameLogic/stateMachineUtils/serializeAndHydrateState';
import { willEventApply } from '../gameLogic/stateMachineUtils/willEventApply';
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
    (event: AnyEventObject, currentGameState: HydratedGameState) =>
      FunctionsClient.sendGameEvent({
        event,
        existingEventCount: currentGameState.hydratedState.context.eventCount,
        gameId,
        playerId,
      }),
    [gameId, playerId]
  );

  const {
    currentGameState,
    dispatchToBuffer,
    bufferMachineMode,
  } = useBufferWithGameState({ gameId, playerId, sendGameEventToServer });

  const sendGameEventToBufferMachine = useCallback(
    (event: AnyEventObject) => {
      dispatchToBuffer({
        type: 'SEND_GAME_EVENT_TO_SERVER',
        gameEvent: event,
      });
    },
    [dispatchToBuffer]
  );

  const isEventValid = useCallback(
    (event: GameEvent) =>
      bufferMachineMode === 'head' &&
      willEventApply(GameStateMachine, currentGameState, event),
    [currentGameState, bufferMachineMode]
  );

  if (!currentGameState) {
    return <div>Loading…</div>;
  }

  const gameState = currentGameState.hydratedState;

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
      <GameDisplayPure
        stateValue={gameState.value}
        stateContext={gameState.context}
        gameConfig={props.gameConfig}
        seatedAt={props.seatedAt}
        isEventValid={isEventValid}
        sendGameEvent={sendGameEventToBufferMachine}
        sendGameEventInProgress={bufferMachineMode === 'sendingGameEvent'}
      />
    </div>
  );
});

function useBufferWithGameState(props: {
  gameId: string;
  playerId: string | null;
  sendGameEventToServer: (
    event: AnyEventObject,
    currentGameState: HydratedGameState
  ) => Promise<void>;
}) {
  const { gameId, playerId } = props;

  const [head, storeHead] = useStateHeadStorage({ gameId });

  const {
    currentGameState,
    addSnapshotToBuffer,
    dispatchToBuffer,
    bufferMachineMode,
  } = useStateBuffer({
    initialHead: head,
    onHeadChanged: storeHead,
    sendGameEventToServer: props.sendGameEventToServer,
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

  return {
    currentGameState,
    dispatchToBuffer,
    bufferMachineMode,
  };
}

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
