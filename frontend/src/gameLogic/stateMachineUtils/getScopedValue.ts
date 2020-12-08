import * as _ from 'lodash';
import { EventObject, State, StateValue } from 'xstate';

// export type MatcherFn<V extends string> = (stateValue: V) => boolean;
//
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
