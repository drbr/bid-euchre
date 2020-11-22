import { firebaseFunctions } from './InitFirebase';
import { NewGameResult } from '../../../functions/apiContract/models/NewGame';

/** Type-safe version of Firebase's HttpsCallableResult */
export type TypedHttpsCallableResult<T> = {
  readonly data: T;
};

const newGameEndpoint = firebaseFunctions.httpsCallable('newGame');

export function newGame(): Promise<NewGameResult> {
  return newGameEndpoint().then((result) => result.data);
}
