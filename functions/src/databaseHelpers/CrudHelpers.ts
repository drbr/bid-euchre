import * as functions from 'firebase-functions';
import { firebaseDatabaseAdminClient } from '../firebase/FirebaseAdminClientInBackend';
import { TypedDataSnapshot } from './TypedDataSnapshot';

/**
 * Thrown when a transaction update failed, either for an internal reason
 * or because the supplied `transactionUpdate` function returned undefined.
 */
export class TRANSACTION_FAILED_ERROR {}

/**
 * Transactionally set a value at `path` according to the `transactionUpdate` function.
 * - If `transactionUpdate` returns a value, it will be written and the promise resolved.
 * - If `transactionUpdate` returns undefined, nothing will be written and the promise rejected.
 */
export async function transactionallySetNode<T>(props: {
  path: string;
  transactionUpdate: (current: T | null) => T | undefined;
}): Promise<TypedDataSnapshot<T>> {
  const { path, transactionUpdate } = props;
  const { committed, snapshot } = await firebaseDatabaseAdminClient
    .ref(path)
    .transaction(transactionUpdate);

  if (committed) {
    return snapshot;
  } else {
    throw new TRANSACTION_FAILED_ERROR();
  }
}

const ID_COLLISION_TRIES = 5;

/**
 * Thrown when creating child nodes if an available ID cannot be found.
 */
export class ID_COLLISION_ERROR {}

/**
 * Transactionally create a child at `path` with `value` and key specified by `generateKey`.
 *
 * There are two main use cases for this:
 *   1. Create a new node with a randomly-generated key; try multiple times in case there are
 *      conflicts.
 *   2. Create a new node with a static key – useful for when we need to do it transactionally.
 */
export async function transactionallyCreateChildNode<T>(props: {
  generatePath: () => string;
  value: T;
  tries?: number;
}): Promise<TypedDataSnapshot<T>> {
  const { value, generatePath } = props;
  let tries = props.tries ?? ID_COLLISION_TRIES;

  while (tries > 0) {
    const path = generatePath();
    const { committed, snapshot } = await firebaseDatabaseAdminClient
      .ref(`${path}`)
      .transaction((current) => {
        return current ? undefined : value;
      });

    if (committed) {
      return snapshot;
    } else {
      tries--;
      functions.logger.debug(
        `ID collision when creating node at ${path}/. Will try ${tries} more times.`
      );
    }
  }
  return Promise.reject(new ID_COLLISION_ERROR());
}
