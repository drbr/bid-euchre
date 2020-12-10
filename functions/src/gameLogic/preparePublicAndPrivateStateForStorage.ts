import * as _ from 'lodash';
import { PlayerIdentities } from '../../apiContract/database/DataModel';
import { GameState } from '../../../frontend/src/gameLogic/euchreStateMachine/GameStateTypes';
import { extractPublicAndPrivateGameStateContexts } from './extractPrivateState';
import {
  sanitizeStateMetadata,
  serializeState,
} from '../../../frontend/src/gameLogic/stateMachineUtils/serializeAndHydrateState';

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
  privateContextsJsonByPlayerId: Record<string, string>;
} {
  const sanitizedState = sanitizeStateMetadata(state);

  const {
    publicContext,
    privateContextsByPlayerId,
  } = extractPublicAndPrivateGameStateContexts(state.context, playerIdentities);

  const publicState = { ...sanitizedState, context: publicContext };
  const publicStateJson = serializeState(publicState);

  const privateContextsJsonByPlayerId = _.mapValues(
    privateContextsByPlayerId,
    (context) => JSON.stringify(context)
  );

  return { publicStateJson, privateContextsJsonByPlayerId };
}
