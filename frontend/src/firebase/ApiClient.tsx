import { firebaseFunctions } from './InitFirebaseInFrontend';
import { NewGameResult } from '../../../functions/apiContract/functions/NewGame';

/** Type-safe version of Firebase's HttpsCallableResult */
export type TypedHttpsCallableResult<T> = {
  readonly data: T;
};

const newGameEndpoint = firebaseFunctions.httpsCallable('newGame');

export function newGame(): Promise<NewGameResult> {
  return newGameEndpoint().then((result) => result.data);
}
