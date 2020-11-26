import { firebaseFunctions } from './FirebaseWebClientInFrontend';
import { NewGameResult } from '../../../functions/apiContract/cloudFunctions/NewGame';
import {
  JoinGameRequest,
  JoinGameResult,
} from '../../../functions/apiContract/cloudFunctions/JoinGame';
import {
  SendGameEventRequest,
  SendGameEventResult,
} from '../../../functions/apiContract/cloudFunctions/SendGameEvent';

const callNewGame = firebaseFunctions.httpsCallable('newGame');
const callJoinGame = firebaseFunctions.httpsCallable('joinGame');
const callSendGameEvent = firebaseFunctions.httpsCallable('sendGameEvent');

export function newGame(): Promise<NewGameResult> {
  return callNewGame().then((result) => result.data);
}

export function joinGame(params: JoinGameRequest): Promise<JoinGameResult> {
  return callJoinGame(params).then((result) => result.data);
}

export function sendGameEvent(
  params: SendGameEventRequest
): Promise<SendGameEventResult> {
  return callSendGameEvent(params).then((result) => result.data);
}
