import * as _ from 'lodash';
import { useEffect, useMemo } from 'react';

export type UnsubscribeFn = () => void;

export type Subscription<P extends Record<string, unknown>, T> = (
  params: P,
  callback: (data: T | null) => void
) => UnsubscribeFn | undefined;

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
export function useSubscription<P extends Record<string, unknown>, T>(
  params: P,
  subscription: Subscription<P, T>,
  callback: (data: T | null) => void
): void {
  // Memoize the params' individual pieces to prevent subscribe/unsubscribe churn,
  // because they will have been passed in as an object instead of individual values.
  // Memoizing the subscription and shouldUpdate is useless here – they need to be
  // memoized on the client side via useCallback.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedParams = useMemo(() => params, [..._.values(params)]);

  useEffect(() => {
    console.debug('Subscribing to observable data: %o', subscription);
    const unsubscribeFn = subscription(memoizedParams, callback);
    return () => {
      console.debug('Unsubscribing from observable data: %o', subscription);
      if (unsubscribeFn) {
        unsubscribeFn();
      }
    };
  }, [memoizedParams, subscription, callback]);
}
