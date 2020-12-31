import { memo, useCallback } from 'react';
import { AnyEventObject } from 'xstate';
import { InProgressGameConfig } from '../../../functions/apiContract/database/DataModel';
import { Position } from '../../../functions/apiContract/database/GameState';
import * as DAO from '../firebase/FrontendDAO';
import { GameStateMachine } from '../gameLogic/euchreStateMachine/GameStateMachine';
import {
  GameEvent,
  GameStateConfig,
} from '../gameLogic/euchreStateMachine/GameStateTypes';
import { hydrateStateFromConfig } from '../gameLogic/stateMachineUtils/serializeAndHydrateState';
import { willEventApply } from '../gameLogic/stateMachineUtils/willEventApply';
import { GameDisplayPure } from '../gameScreens/GameDisplay';
import { sendGameEventToServer } from '../routines/sendGameEventToServer';
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

  const [currentGameState, dispatchToStateBuffer] = useBufferWithGameState(
    props
  );

  const sendGameEventToStateMachine = useCallback(
    (event: AnyEventObject) => {
      void sendGameEventToServer({
        gameId,
        playerId,
        currentGameState,
        event,
      });
    },
    [currentGameState, gameId, playerId]
  );

  const isEventValid = useCallback(
    (event: AnyEventObject) =>
      willEventApply(GameStateMachine, currentGameState, event as GameEvent),
    [currentGameState]
  );

  const goForward = () =>
    dispatchToStateBuffer({ type: 'DETACHED_GO_FORWARD' });
  const goBack = () => dispatchToStateBuffer({ type: 'DETACHED_GO_BACK' });

  /* Add stuff to the window for debugging */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (window as any).gameState = currentGameState?.hydratedState;
  (window as any).goForward = goForward;
  (window as any).goBack = goBack;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  if (!currentGameState) {
    return <div>Loading…</div>;
  }
  const gameState = currentGameState.hydratedState;

  return (
    <div>
      <p>
        {props.playerId ? null : 'You are a spectator of the current game!'}
      </p>
      <GameDisplayPure
        stateValue={gameState.value}
        stateContext={gameState.context}
        gameConfig={props.gameConfig}
        seatedAt={props.seatedAt}
        sendGameEvent={sendGameEventToStateMachine}
        isEventValid={isEventValid}
      />
    </div>
  );
});

function useBufferWithGameState(props: {
  gameId: string;
  playerId: string | null;
}) {
  const { gameId, playerId } = props;

  const [head, storeHead] = useStateHeadStorage({ gameId });

  const [
    currentGameState,
    addSnapshotToBuffer,
    dispatchToBuffer,
  ] = useStateBuffer({ initialHead: head, onHeadChanged: storeHead });

  const processReceivedGameState = useCallback(
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
    processReceivedGameState
  );

  return [currentGameState, dispatchToBuffer] as [
    typeof currentGameState,
    typeof dispatchToBuffer
  ];
}

const subscribeToPublicOrPrivateGameState: Subscription<
  { gameId: string; playerId: string | null },
  GameStateConfig
> = (params, callback) => {
  if (params.playerId) {
    return DAO.subscribeToPrivateGameState(
      { gameId: params.gameId, playerId: params.playerId },
      callback
    );
  } else {
    return DAO.subscribeToPublicGameState({ gameId: params.gameId }, callback);
  }
};
