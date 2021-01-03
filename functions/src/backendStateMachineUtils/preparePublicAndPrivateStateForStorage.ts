import * as _ from 'lodash';
import { PlayerIdentities } from '../../../frontend/src/gameLogic/apiContract/database/DataModel';
import { GameState } from '../../../frontend/src/gameLogic/euchreStateMachine/GameStateTypes';
import { serializeState } from '../../../frontend/src/gameLogic/stateMachineUtils/serializeAndHydrateState';
import { extractPublicAndPrivateGameStateContexts } from './extractPrivateContext';

/**
 * Sanitizes the state and breaks it apart into "public state" and "private contexts".
 * The JSON objects returned by this method are in formats ready to send to clients.
 *
 * @param state
 * @param playerIdentities
 */

export function preparePublicAndPrivateStateForStorage(
  state: GameState,
  playerIdentities: PlayerIdentities
): {
  publicStateJson: string;
  privateStatesJsonByPlayerId: Record<string, string>;
} {
  const {
    publicContext,
    privateContextsByPlayerId,
  } = extractPublicAndPrivateGameStateContexts(
    state.context,
    playerIdentities,
    { includeInPlayerContext: 'all' }
  );

  const publicState = { ...state, context: publicContext };
  const publicStateJson = serializeState(publicState);

  const privateStatesJsonByPlayerId = _.mapValues(
    privateContextsByPlayerId,
    (privateContext) => {
      // If storing all the data in the player-private contexts, insert it into the state and
      // serialize. If storing only the private data, serialize the context directly. Doing so will
      // require changes in the frontend, but will save space and bandwidth. For now, we're passing
      // all the data in the private states, so the frontend doesn't need to worry about reconciling
      // them.
      const privateState = { ...state, context: privateContext };
      return JSON.stringify(privateState);
    }
  );

  return { publicStateJson, privateStatesJsonByPlayerId };
}
