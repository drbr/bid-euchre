import { Dispatch, SetStateAction } from 'react';
import { PartialDeep } from 'type-fest';
import {
  GameContext,
  GameStateConfig,
} from '../gameLogic/euchreStateMachine/GameStateTypes';
import { mergePublicAndPrivateStateContexts } from '../gameLogic/stateMachineUtils/mergePublicAndPrivateStateContexts';
import {
  HydratedGameState,
  hydrateStateFromConfig,
} from '../gameLogic/stateMachineUtils/serializeAndHydrateState';
import { EventCountContext } from '../gameLogic/stateMachineUtils/TypedStateInterfaces';
import { ObservedState } from '../uiHelpers/useObservedState';

// export const privateGameContextSubscription: Subscription<
//   { gameId: string; playerId: string | null },
//   PartialDeep<GameContext> & EventCountContext
// > = (params, callback) => {
//   if (params.playerId) {
//     return DAO.subscribeToPrivateGameState(
//       { gameId: params.gameId, playerId: params.playerId },
//       callback
//     );
//   }
// };

/**
 * The public and private game states are fetched separately and must be combined in order to
 * correctly render the game. This effect waits until the private and public state are both in sync,
 * then combines them and dispatches the reconstituted value.
 */
export function reconstituteGameStateIfInSync(
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

// function onPublicGameStateFetched(
//   prev: GameStateConfig,
//   next: GameStateConfig
// ) {
//   return onStateMachineContextFetched(prev.context, next.context, 'public');
// }

// function onPrivateGameContextFetched(
//   prev: EventCountContext,
//   next: EventCountContext
// ) {
//   return onStateMachineContextFetched(prev, next, 'private');
// }

function onStateFetched(
  prev: GameStateConfig,
  next: GameStateConfig,
  type: string
) {
  const actualPrevCount = prev.context.eventCount;
  const expectedPrevCount = next.context.previousEventCount || 0;
  const nextCount = next.context.eventCount;
  console.debug(`Received new ${type} game state from the database`);
  console.debug(next);
  if (actualPrevCount !== expectedPrevCount) {
    console.warn(
      `Possible error in state transition: previous local state had event count ${actualPrevCount}, ` +
        `new state has previous eventCount ${expectedPrevCount} and current count ${nextCount}`
    );
  }
}
