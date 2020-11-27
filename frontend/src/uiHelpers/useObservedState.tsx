import { useEffect, useMemo, useState } from 'react';

export type UnsubscribeFn = () => void;

export type Subscription<P extends Record<string, unknown>, T> = (
  params: P,
  callback: (data: T | null) => void
) => UnsubscribeFn | undefined;

export type ObservedState<T> = T | 'loading' | 'gameNotFound';

/**
 * Subscribe to an "observable" from the DAO and get state updates when it changes.
 * @param params These are memoized individually within the hook.
 * @param subscription This should be a constant object, otherwise it will cause
 * subscribe/unsubscribe churn. Memoize it with `useCallback` if necessary.
 * @param onChange This should be a constant object, otherwise it will cause
 * subscribe/unsubscribe churn. Memoize it with `useCallback` if necessary.
 */
export function useObservedState<P extends Record<string, unknown>, T>(
  params: P,
  subscription: Subscription<P, T>,
  onChange?: (prev: T, next: T) => void
): ObservedState<T> {
  const [thing, setThing] = useState<T | 'loading' | 'gameNotFound'>('loading');

  // Memoize the params' individual pieces to prevent subscribe/unsubscribe churn,
  // because they will have been passed in as an object instead of individual values.
  // Memoizing the subscription and shouldUpdate is useless here – they need to be
  // memoized on the client side via useCallback.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedParams = useMemo(() => params, [...Object.values(params)]);

  useEffect(() => {
    console.debug('Subscribing to observable state');
    console.debug(subscription);
    const unsubscribeFn = subscription(memoizedParams, (data) =>
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
      })
    );
    return () => {
      console.debug('Unsubscribing from observed state');
      console.debug(subscription);
      if (unsubscribeFn) {
        unsubscribeFn();
      }
    };
  }, [memoizedParams, subscription, onChange]);
  return thing;
}
