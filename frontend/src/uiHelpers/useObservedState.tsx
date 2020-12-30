import { useCallback, useState } from 'react';
import { Subscription, useSubscription } from './useSubscription';

export type ObservedState<T> = T | 'loading' | 'gameNotFound';

/**
 * Subscribe to an "observable" from the DAO and store it in component state. When the observable
 * changes, the state gets updated.
 * @param params These are memoized individually within the hook; they can be passed in as an
 * object.
 * @param subscription This should be a constant object, otherwise it will cause
 * subscribe/unsubscribe churn. Memoize it with `useCallback` if necessary.
 * @param onChange Called when the value changes, but not when initially populated. This should be a
 * constant object, otherwise it will cause subscribe/unsubscribe churn. Memoize it with
 * `useCallback` if necessary.
 */
export function useObservedState<P extends Record<string, unknown>, T>(
  params: P,
  subscription: Subscription<P, T>,
  onChange?: (prev: T, next: T) => void
): ObservedState<T> {
  const [thing, setThing] = useState<T | 'loading' | 'gameNotFound'>('loading');

  const callback = useCallback(
    (data: T | null) =>
      setThing((prev) => {
        if (!data) {
          return 'gameNotFound';
        } else if (prev === 'loading' || prev === 'gameNotFound') {
          return data;
        } else {
          if (onChange) {
            onChange(prev, data);
          }
          return data;
        }
      }),
    [onChange]
  );

  useSubscription(params, subscription, callback);
  return thing;
}
