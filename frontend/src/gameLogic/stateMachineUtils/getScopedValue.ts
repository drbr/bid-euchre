import * as _ from 'lodash';
import { StateValue } from 'xstate';

/**
 * Gets the state's value, scoped down by the parent keys.
 *
 * Example: if the state value is `{ foo: { bar: { baz: 'quux'} } }',
 * `getScopedValue(state, 'foo', 'bar')` would return `{baz: 'quux'}`.
 *
 * @param state The original state
 * @param parentValues The values to scope down by
 */
export function getScopedValue(
  stateValue: StateValue,
  ...parentValues: string[]
): StateValue {
  let val = stateValue;
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
export function getScopedValueString<V extends string>(
  stateValue: StateValue,
  ...parentValues: string[]
): V {
  const scopedValue = getScopedValue(stateValue, ...parentValues);
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
