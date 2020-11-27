import { useEffect, useState } from 'react';

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

  useEffect(
    () => {
      return subscription(params, (data) =>
        setThing((prev) => {
          if (!data) {
            return 'gameNotFound';
          } else if (prev === 'loading' || prev === 'gameNotFound') {
            return data;
          } else if (!shouldUpdate) {
            return data;
          } else {
            return shouldUpdate(prev, data) ? data : prev;
          }
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [subscription, ...Object.values(params)]
  );
  return thing;
}
