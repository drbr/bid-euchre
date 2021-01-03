import {
  JoinGameRequest,
  JoinGameResult,
} from '../gameLogic/apiContract/cloudFunctions/JoinGame';
import { NewGameResult } from '../gameLogic/apiContract/cloudFunctions/NewGame';
import {
  SendGameEventRequest,
  SendGameEventResult,
} from '../gameLogic/apiContract/cloudFunctions/SendGameEvent';
import { firebaseFunctions } from './FirebaseWebClientInFrontend';

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
