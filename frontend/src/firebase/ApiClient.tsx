import { firebaseFunctions } from './InitFirebase';
import {
  NewGameRequest,
  NewGameResult,
} from '../../../functions/src/models/NewGame';

/** Type-safe version of Firebase's HttpsCallableResult */
export type TypedHttpsCallableResult<T> = {
  readonly data: T;
};

const newGameEndpoint = firebaseFunctions.httpsCallable('newGame');

export function newGame(data: NewGameRequest): Promise<NewGameResult> {
  return newGameEndpoint(data).then((result) => result.data);
}
