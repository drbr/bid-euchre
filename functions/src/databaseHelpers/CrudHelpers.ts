import * as functions from 'firebase-functions';
import { firebaseDatabaseAdminClient } from '../firebase/FirebaseAdminClientInBackend';
import { TypedDataSnapshot } from '../../apiContract/database/TypedDataSnapshot';

const ID_COLLISION_TRIES = 5;

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
  path: string;
  value: T;
  generateKey: () => string;
  tries?: number;
}): Promise<TypedDataSnapshot<T>> {
  const { path, value, generateKey } = props;
  let tries = props.tries ?? ID_COLLISION_TRIES;

  while (tries > 0) {
    const key: string = generateKey();
    const { committed, snapshot } = await firebaseDatabaseAdminClient
      .ref(`${path}/${key}`)
      .transaction((current) => {
        return current ? undefined : value;
      });

    if (committed) {
      return snapshot;
    } else {
      tries--;
      functions.logger.info(
        `ID collision when creating node at ${path}/. Will try ${tries} more times.`
      );
    }
  }
  return Promise.reject(new ID_COLLISION_ERROR());
}
