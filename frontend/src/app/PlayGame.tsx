import { Dispatch, memo, SetStateAction, useEffect, useState } from 'react';
import { PartialDeep } from 'type-fest';
import { AnyEventObject } from 'xstate';
import { InProgressGameConfig } from '../../../functions/apiContract/database/DataModel';
import { Position } from '../../../functions/apiContract/database/GameState';
import { sendGameEvent } from '../firebase/CloudFunctionsClient';
import * as DAO from '../firebase/FrontendDAO';
import { GameStateMachine } from '../gameLogic/euchreStateMachine/GameStateMachine';
import {
  GameContext,
  GameEvent,
  GameState,
  GameStateConfig,
} from '../gameLogic/euchreStateMachine/GameStateTypes';
import { mergePublicAndPrivateStateContexts } from '../gameLogic/stateMachineUtils/mergePublicAndPrivateStateContexts';
import {
  HydratedGameState,
  hydrateStateFromConfig,
} from '../gameLogic/stateMachineUtils/serializeAndHydrateState';
import { EventCountContext } from '../gameLogic/stateMachineUtils/TypedStateInterfaces';
import { willEventApply } from '../gameLogic/stateMachineUtils/willEventApply';
import { GameDisplay } from '../gameScreens/GameDisplay';
import { UIActions } from '../uiHelpers/UIActions';
import {
  ObservedState,
  Subscription,
  useObservedState,
} from '../uiHelpers/useObservedState';

export type PlayGameContainerProps = {
  gameId: string;
  playerId: string | null;
  gameConfig: InProgressGameConfig;
  seatedAt: Position | null;
};

export function PlayGameContainer(props: PlayGameContainerProps) {
  const { gameId, playerId } = props;

  const fetchedPublicGameState = useObservedState(
    { gameId },
    DAO.subscribeToPublicGameState,
    onPublicGameStateFetched
  );

  const fetchedPrivateGameContext = useObservedState(
    { gameId, playerId },
    privateGameContextSubscription,
    onPrivateGameContextFetched
  );

  const [
    syncedGameState,
    setSyncedGameState,
  ] = useState<HydratedGameState | null>(null);

  useEffect(
    () =>
      reconstituteGameStateIfInSync(
        fetchedPublicGameState,
        fetchedPrivateGameContext,
        playerId,
        setSyncedGameState
      ),
    [fetchedPublicGameState, fetchedPrivateGameContext, playerId]
  );

  if (!syncedGameState) {
    return <div>Loading…</div>;
  }

  return (
    <PlayGameWithKnownStatePure
      {...props}
      gameState={syncedGameState.hydratedState}
    />
  );
}

type PlayGameProps = PlayGameContainerProps & {
  gameState: GameState;
};

const PlayGameWithKnownStatePure = memo(function PlayGameWithKnownState(
  props: PlayGameProps
) {
  async function sendEventToStateMachine(event: AnyEventObject) {
    try {
      await sendGameEvent({
        event,
        existingEventCount: props.gameState.context.eventCount,
        gameId: props.gameId,
        playerId: props.playerId,
      });
    } catch (e) {
      UIActions.showErrorAlert(e, {
        message: 'Could not send game event. See log for details.',
      });
    }
  }

  function isEventValid(event: AnyEventObject): boolean {
    return willEventApply(
      GameStateMachine,
      props.gameState,
      event as GameEvent
    );
  }

  /* Add stuff to the window for debugging */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (window as any).gameState = props.gameState;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div>
      <p>
        {props.playerId ? null : 'You are a spectator of the current game!'}
      </p>
      <GameDisplay
        stateValue={props.gameState.value}
        stateContext={props.gameState.context}
        gameConfig={props.gameConfig}
        seatedAt={props.seatedAt}
        sendGameEvent={sendEventToStateMachine}
        isEventValid={isEventValid}
      />
    </div>
  );
});

function onPublicGameStateFetched(
  prev: GameStateConfig,
  next: GameStateConfig
) {
  return onStateMachineContextFetched(prev.context, next.context, 'public');
}

function onPrivateGameContextFetched(
  prev: EventCountContext,
  next: EventCountContext
) {
  return onStateMachineContextFetched(prev, next, 'private');
}

function onStateMachineContextFetched(
  prev: EventCountContext,
  next: EventCountContext,
  type: string
) {
  const actualPrevCount = prev.eventCount;
  const expectedPrevCount = next.previousEventCount || 0;
  const nextCount = next.eventCount;
  console.debug(`Received new ${type} state machine context from the database`);
  console.debug(next);
  if (actualPrevCount !== expectedPrevCount) {
    console.warn(
      `Possible error in state transition: previous local state had event count ${actualPrevCount}, ` +
        `new state has previous eventCount ${expectedPrevCount} and current count ${nextCount}`
    );
  }
}

/**
 * The public and private game states are fetched separately and must be combined in order to
 * correctly render the game. This effect waits until the private and public state are both in sync,
 * then combines them and dispatches the reconstituted value.
 */
function reconstituteGameStateIfInSync(
  publicGameState: ObservedState<GameStateConfig>,
  privateGameContext: ObservedState<
    PartialDeep<GameContext> & EventCountContext
  >,
  playerId: string | null,
  setSyncedGameState: Dispatch<SetStateAction<HydratedGameState | null>>
): void {
  if (publicGameState === 'loading' || publicGameState === 'gameNotFound') {
    return; // Can't sync the state until we have it
  }

  // If the player isn't part of the game, we'll never get any private state,
  // so no special merging needs to happen.
  if (!playerId) {
    const hydratedState = hydrateStateFromConfig(publicGameState);
    setSyncedGameState(hydratedState);
    return;
  }

  if (
    privateGameContext === 'loading' ||
    privateGameContext === 'gameNotFound'
  ) {
    return; // Can't sync the state until we have it
  }

  // Merge the private and public state only when they match.
  // Otherwise, do nothing; we'll try again when the inputs change.
  const publicEventCount = publicGameState.context.eventCount;
  const privateEventCount = privateGameContext.eventCount;
  if (publicEventCount === privateEventCount) {
    const mergedContext = mergePublicAndPrivateStateContexts({
      publicContext: publicGameState.context,
      privateContext: privateGameContext,
    }) as GameContext;
    const newStateConfig = {
      ...publicGameState,
      context: mergedContext,
    };
    const hydratedState = hydrateStateFromConfig(newStateConfig);
    setSyncedGameState(hydratedState);
    return;
  }
}

const privateGameContextSubscription: Subscription<
  { gameId: string; playerId: string | null },
  PartialDeep<GameContext> & EventCountContext
> = (params, callback) => {
  if (params.playerId) {
    return DAO.subscribeToPrivateGameContext(
      { gameId: params.gameId, playerId: params.playerId },
      callback
    );
  }
};
