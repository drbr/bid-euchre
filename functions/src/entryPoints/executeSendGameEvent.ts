import {
  SendGameEventRequest,
  SendGameEventResult,
} from '../../apiContract/cloudFunctions/SendGameEvent';

/**
 * Thrown if the user is not in the game or it's not currently the user's turn
 */
export class USER_NOT_AUTHORIZED_ERROR {}

export default async function executeSendGameEvent(
  request: SendGameEventRequest
): Promise<SendGameEventResult> {
  // Validate the user
}
