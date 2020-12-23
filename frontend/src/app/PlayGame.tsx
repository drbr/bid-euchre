import { Dispatch, Reducer, useCallback, useEffect, useReducer } from 'react';
import { AnyEventObject } from 'xstate';
import { InProgressGameConfig } from '../../../functions/apiContract/database/DataModel';
import { Position } from '../../../functions/apiContract/database/GameState';
import { sendGameEvent } from '../firebase/CloudFunctionsClient';
import * as DAO from '../firebase/FrontendDAO';
import { GameStateConfig } from '../gameLogic/euchreStateMachine/GameStateTypes';
import {
  HydratedGameState,
  hydrateStateFromConfig,
} from '../gameLogic/stateMachineUtils/serializeAndHydrateState';
import { assertUnreachable } from '../uiHelpers/TypescriptUtils';
import { UIActions } from '../uiHelpers/UIActions';
import { Subscription } from '../uiHelpers/useObservedState';
import { PlayGameForStatePure } from './PlayGameWithState';

export type PlayGameProps = {
  gameId: string;
  playerId: string | null;
  gameConfig: InProgressGameConfig;
  seatedAt: Position | null;
};

export function PlayGame(props: PlayGameProps) {
  const { gameId, playerId } = props;

  const [gameStateBuffer, dispatch] = useReducer(stateBufferReducer, {
    currentIndex: null,
    states: [],
  });

  const currentGameState = gameStateBuffer.currentIndex
    ? gameStateBuffer.states[gameStateBuffer.currentIndex]
    : null;
  console.log('State buffer: %o', gameStateBuffer);

  useEffect(
    () =>
      subscribeToGameStateToAddToBuffer({
        gameId,
        playerId,
        dispatch,
      }),
    [gameId, playerId]
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

type StateBuffer = {
  currentIndex: number | null;
  states: ReadonlyArray<HydratedGameState>;
};

export type StateBufferAction =
  | {
      type: 'add';
      newState: HydratedGameState;
    }
  | { type: 'switchTo'; index: number }
  | { type: 'goForward' }
  | { type: 'goBack' };

const stateBufferReducer: Reducer<StateBuffer, StateBufferAction> = (
  prevBuffer,
  action
) => {
  function goToIndex(i: number) {
    if (!prevBuffer.states[i]) {
      throw new Error('Tried to switch to a state not present in the client');
    }
    return {
      currentIndex: i,
      states: prevBuffer.states,
    };
  }

  switch (action.type) {
    case 'add': {
      if (!action.newState) {
        throw new Error('Tried to add a null object into the state buffer');
      }
      const index = action.newState.hydratedState.context.eventCount;
      return {
        currentIndex: prevBuffer.currentIndex ?? index,
        states: {
          ...prevBuffer.states,
          [index]: action.newState,
        },
      };
    }
    case 'switchTo':
      return goToIndex(action.index);
    case 'goForward':
      return goToIndex((prevBuffer.currentIndex ?? 0) + 1);
    case 'goBack':
      return goToIndex((prevBuffer.currentIndex ?? 0) - 1);
    default:
      assertUnreachable(action);
      return prevBuffer;
  }
};

function subscribeToGameStateToAddToBuffer(params: {
  gameId: string;
  playerId: string | null;
  dispatch: Dispatch<StateBufferAction>;
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
      dispatch({ type: 'add', newState: hydrated });
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
