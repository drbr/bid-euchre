import { useMachine } from '@xstate/react';
import { useCallback, useEffect } from 'react';
import { AnyEventObject } from 'xstate';
import { InProgressGameConfig } from '../../../../functions/apiContract/database/DataModel';
import { Position } from '../../../../functions/apiContract/database/GameState';
import { sendGameEvent } from '../../firebase/CloudFunctionsClient';
import * as DAO from '../../firebase/FrontendDAO';
import { GameStateConfig } from '../../gameLogic/euchreStateMachine/GameStateTypes';
import {
  HydratedGameState,
  hydrateStateFromConfig,
} from '../../gameLogic/stateMachineUtils/serializeAndHydrateState';
import { UIActions } from '../../uiHelpers/UIActions';
import { Subscription } from '../../uiHelpers/useObservedState';
import { BufferEvent, createBufferStateMachine } from './BufferMachine';
import { PlayGameForStatePure } from './PlayGameWithState';

export type PlayGameProps = {
  gameId: string;
  playerId: string | null;
  gameConfig: InProgressGameConfig;
  seatedAt: Position | null;
};

const BufferMachine = createBufferStateMachine<HydratedGameState>();

export function PlayGame(props: PlayGameProps) {
  const { gameId, playerId } = props;

  const [bufferState, dispatch] = useMachine(BufferMachine);

  const buffer = bufferState.context;
  const currentGameState = buffer.currentIndexShowing
    ? buffer.gameStateSnapshots[buffer.currentIndexShowing]
    : null;
  console.log('State buffer: %o', buffer);

  useEffect(
    () =>
      subscribeToGameStateToAddToBuffer({
        gameId,
        playerId,
        dispatch,
      }),
    [gameId, playerId, dispatch]
  );

  const sendGameEventToStateMachine = useCallback(
    async (event: AnyEventObject) => {
      try {
        if (currentGameState) {
          await sendGameEvent({
            event,
            existingEventCount:
              currentGameState.hydratedState.context.eventCount,
            gameId: props.gameId,
            playerId: props.playerId,
          });
        }
      } catch (e) {
        UIActions.showErrorAlert(e, {
          message: 'Could not send game event. See log for details.',
        });
      }
    },
    [currentGameState, props.gameId, props.playerId]
  );

  if (!currentGameState) {
    return <div>Loading…</div>;
  }

  return (
    <PlayGameForStatePure
      {...props}
      gameState={currentGameState.hydratedState}
      sendGameEvent={sendGameEventToStateMachine}
      dispatchStateBufferAction={dispatch}
    />
  );
}

function subscribeToGameStateToAddToBuffer(params: {
  gameId: string;
  playerId: string | null;
  dispatch: (event: BufferEvent<HydratedGameState>) => void;
}) {
  const { gameId, playerId, dispatch } = params;
  const stateSubscription = subscribeToPublicOrPrivateGameState;
  console.debug('Subscribing to game state');
  console.debug(stateSubscription);

  const unsubscribeFn = stateSubscription({ gameId, playerId }, (data) => {
    if (!data) {
      throw new Error(`Game with ID ${gameId} was not found!`);
    } else {
      const hydrated = hydrateStateFromConfig(data);
      dispatch({
        type: 'RECV_SNAPSHOT',
        snapshot: hydrated,
        index: hydrated.hydratedState.context.eventCount,
      });
    }
  });

  return () => {
    console.debug('Unsubscribing from game state');
    console.debug(stateSubscription);
    if (unsubscribeFn) {
      unsubscribeFn();
    }
  };
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
