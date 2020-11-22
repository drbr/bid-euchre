import { firebaseDatabaseAdminClient } from '../firebase/FirebaseAdminClientInBackend';
import { TypedDataSnapshot } from './TypedDataSnapshot';

const ID_COLLISION_TRIES = 5;

export async function tryCreatingListNodeWithData<T>(props: {
  path: string;
  data: T;
  generateId: () => string;
}): Promise<TypedDataSnapshot<T>> {
  const { path, data, generateId } = props;
  let tries = ID_COLLISION_TRIES;

  while (tries > 0) {
    const id: string = generateId();
    const { committed, snapshot } = await firebaseDatabaseAdminClient
      .ref(`${path}/${id}`)
      .transaction((current) => {
        return current ? undefined : data;
      });

    if (committed) {
      console.log(snapshot);
      return snapshot;
    } else {
      tries--;
      console.log(
        `ID collision when creating node at ${path}/. Will try ${tries} more times.`
      );
    }
  }
  return Promise.reject(
    'Failed to create a node at ${path}/ with a unique ID.'
  );
}
