import * as _ from 'lodash';
import { EventObject, interpret, State, StateConfig, StateValue } from 'xstate';
import { SimpleDeferred } from './SimpleDeferred';
import { GameStateMachine } from './stateMachine/GameStateMachine';
import {
  GameContext,
  GameEvent,
  GameState,
} from './stateMachine/GameStateTypes';
import { PrivateActionCompleteEventType } from './stateMachine/SpecialEvents';

export function transitionStateMachine(
  prev: HydratedState<GameState> | null,
  event: GameEvent
): GameState {
  const stateObj = prev ? prev.hydratedState : undefined;
  const nextState = GameStateMachine.transition(stateObj, event);

  // Manually add the previous event count into the state object so the client can verify
  // that it didn't skip an update. One would think that the event count always increments by 1,
  // but the machine increments the count by more than 1 for some transitions.
  nextState.context.previousEventCount =
    prev?.hydratedState.context.eventCount || null;

  return nextState;
}

export async function transitionStateMachineWithInterpreter(
  prev: HydratedState<GameState> | null,
  event: GameEvent
): Promise<GameState> {
  const deferred = new SimpleDeferred<GameState>();

  const machineService = interpret(GameStateMachine, {
    state: prev?.hydratedState,
  })
    .onTransition((state, event) => {
      // console.log('In state machine transition listener. New state:');
      // console.log(state);
      console.log('In state machine transition listener. Event:');
      console.log(event);
      if (event.type === PrivateActionCompleteEventType) {
        deferred.resolve(state);
      }
    })
    .start();

  machineService.send(event);
  const nextState = await deferred.promise;

  // Manually add the previous event count into the state object so the client can verify
  // that it didn't skip an update. One would think that the event count always increments by 1,
  // but the machine increments the count by more than 1 for some transitions.
  nextState.context.previousEventCount =
    prev?.hydratedState.context.eventCount || null;

  return nextState;
}

/**
 * Use a special object to store hydrated state so we can type-safely make sure we're requiring it,
 * because it's too easy to send a parsed object into a place that expects a fully-hydrated state
 * instance.
 */
export type HydratedState<T> = {
  hydratedState: T;
};

export function hydrateState(stateAsJson: string): HydratedState<GameState> {
  const parsed: StateConfig<GameContext, GameEvent> = JSON.parse(stateAsJson);
  const createdState = State.create(parsed);
  const hydratedState = GameStateMachine.resolveState(createdState);
  return { hydratedState: hydratedState };
}

export function serializeState(state: GameState): string {
  return JSON.stringify(state);
}

export function getInitialMachineState(): GameState {
  return GameStateMachine.initialState;
}

// export type MatcherFn<V extends string> = (stateValue: V) => boolean;

// /**
//  * Creates a function that simplifies the usage of `stateMatches` with hierarchial states.
//  *
//  * For example: Instead of calling `state.matches('game.round.nameTrump')`, first create a matcher,
//  * then use it to match the state at the level we're on:
//  *
//  *     const stateMatches = createMatcher(state, 'game', 'round');
//  *     stateMatches('nameTrump');
//  *
//  * @param supervalues The values higher up in the state hierarchy to match.
//  */
// export function createScopedMatcher<C, E extends EventObject, V extends string>(
//   state: State<C, E>,
//   ...parentValues: string[]
// ): MatcherFn<V> {
//   const prefix = parentValues.join('.');
//   return (stateValue: V) => state.matches(`${prefix}.${stateValue}`);
// }

/**
 * Gets the state's value, scoped down by the parent keys.
 *
 * Example: if the state value is `{ foo: { bar: { baz: 'quux'} } }',
 * `getScopedValue(state, 'foo', 'bar')` would return `{baz: 'quux'}`.
 *
 * @param state The original state
 * @param parentValues The values to scope down by
 */
export function getScopedValue<C, E extends EventObject>(
  state: State<C, E>,
  ...parentValues: string[]
): StateValue {
  let val = state.value;
  for (const p of parentValues) {
    if (typeof val === 'string') {
      throw new Error(
        `Key ${p} does not exist on state value ${JSON.stringify(val)}`
      );
    }
    val = val[p];
  }
  return val;
}

/**
 * Like `getScopedValue`, but always returns the value as a string: either the same string as
 * `getScopedValue`, or the key of the object.
 *
 * It is assumed that this will NOT be used to stringify a parallel state node, where there would be
 * more than one key on the object.
 */
export function getScopedValueString<
  V extends string,
  C,
  E extends EventObject
>(state: State<C, E>, ...parentValues: string[]): V {
  const scopedValue = getScopedValue(state, ...parentValues);
  if (typeof scopedValue === 'string') {
    return scopedValue as V;
  } else {
    const keys = _.keys(scopedValue);
    if (keys.length > 1) {
      throw new Error(`Multiple nodes found on scoped state ${scopedValue}`);
    }
    return _.first(keys) as V;
  }
}
