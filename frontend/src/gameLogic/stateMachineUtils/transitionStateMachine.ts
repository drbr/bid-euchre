import * as _ from 'lodash';
import { interpret } from 'xstate';
import { SimpleDeferred } from '../utils/SimpleDeferred';
import { GameStateMachine } from '../euchreStateMachine/GameStateMachine';
import { GameEvent, GameState } from '../euchreStateMachine/GameStateTypes';
import { HydratedGameState } from './serializeAndHydrateState';

export async function transitionStateMachine(
  prev: HydratedGameState,
  event: GameEvent
): Promise<GameState> {
  const deferred = new SimpleDeferred<GameState>();
  let ignoredInitialStateCallback = false;

  const machineService = interpret(GameStateMachine)
    .onTransition((state, event) => {
      if (ignoredInitialStateCallback) {
        const hasAnyOutstandingActivities = _.some(state.activities);
        if (!hasAnyOutstandingActivities) {
          deferred.resolve(state);
        }
      }
      ignoredInitialStateCallback = true;
    })
    .start(prev.hydratedState);

  machineService.send(event);
  const nextState = await deferred.promise;

  // Manually add the previous event count into the state object so the client can verify
  // that it didn't skip an update. One would think that the event count always increments by 1,
  // but the machine increments the count by more than 1 for some transitions.
  nextState.context.previousEventCount =
    prev?.hydratedState.context.eventCount || null;

  return nextState;
}
