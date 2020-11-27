import { useEffect, useMemo, useState } from 'react';

export type UnsubscribeFn = () => void;

export type Subscription<P extends Record<string, unknown>, T> = (
  params: P,
  callback: (data: T | null) => void
) => UnsubscribeFn | undefined;

export type ObservedState<T> = T | 'loading' | 'gameNotFound';

/**
 * Subscribe to an "observable" from the DAO and get state updates when it changes.
 * @param subscription
 * @param params These are spread into a useEffect dependency array, so the keys should stay
 * consistent over time.
 */
export function useObservedState<P extends Record<string, unknown>, T>(
  params: P,
  subscription: Subscription<P, T>,
  shouldUpdate?: (prev: T, next: T) => boolean
): ObservedState<T> {
  const [thing, setThing] = useState<T | 'loading' | 'gameNotFound'>('loading');

  // Memoize the inputs to prevent subscribe/unsubscribe churn,
  // because they could have been passed in via new objects or closures.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedParams = useMemo(() => params, [...Object.values(params)]);
  const memoizedSubscription = useMemo(() => subscription, [subscription]);
  const memoizedShouldUpdate = useMemo(() => shouldUpdate, [shouldUpdate]);

  useEffect(() => {
    console.debug('Subscribing to observed state');
    console.debug(memoizedSubscription);
    const unsubscribeFn = memoizedSubscription(memoizedParams, (data) =>
      setThing((prev) => {
        if (!data) {
          return 'gameNotFound';
        } else if (prev === 'loading' || prev === 'gameNotFound') {
          return data;
        } else if (!memoizedShouldUpdate) {
          return data;
        } else {
          return memoizedShouldUpdate(prev, data) ? data : prev;
        }
      })
    );
    return () => {
      console.debug('Unsubscribing from observed state');
      console.debug(memoizedSubscription);
      if (unsubscribeFn) {
        unsubscribeFn();
      }
    };
    // return unsubscribeFn;
  }, [memoizedParams, memoizedSubscription, memoizedShouldUpdate]);
  return thing;
}
