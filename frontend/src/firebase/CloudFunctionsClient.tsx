import { firebaseFunctions } from './FirebaseWebClientInFrontend';
import { NewGameResult } from '../../../functions/apiContract/cloudFunctions/NewGame';

const newGameEndpoint = firebaseFunctions.httpsCallable('newGame');

export function newGame(): Promise<NewGameResult> {
  return newGameEndpoint().then((result) => result.data);
}
