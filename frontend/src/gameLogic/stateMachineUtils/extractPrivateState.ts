import { PlayerIdentities } from '../../../../functions/apiContract/database/DataModel';
import _ from '../utils/importDeepdash';

// Take an object, copy out the 'private_' stuff from it, assume each `private_` thing is a
// PositionRecord. Make four copies, one for each player, key them by player ID.
// We also need to keep the eventCount/previousEventCount in the private contexts.
export function extractPrivateGameState<C>(
  gameMachineContext: C,
  playerIdentities: PlayerIdentities
): {
  publicGameStateContext: C;
  privateContexts: {
    [playerId: string]: Partial<C>;
  };
} {
  // TODO: Temporary implementation!
  return {
    publicGameStateContext: gameMachineContext,
    privateContexts: {},
  };
}

// Get one copy of the partial private state, merge it with the public state.
export function mergePublicAndPrivateStates<C>(
  publicContext: C,
  privateContext: Partial<C>
): C {
  return _.merge(publicContext, privateContext);
}
