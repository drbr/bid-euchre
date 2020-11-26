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
  subscription: Subscription<P, T>
): ObservedState<T> {
  const [thing, setThing] = useState<T | 'loading' | 'gameNotFound'>('loading');

  useEffect(
    () => {
      return subscription(params, (data) => setThing(data ?? 'gameNotFound'));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [subscription, ...Object.values(params)]
  );
  return thing;
}
