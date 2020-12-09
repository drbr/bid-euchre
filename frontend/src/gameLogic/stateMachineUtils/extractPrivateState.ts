import { PartialDeep } from 'type-fest';
import { Position } from '../../../../functions/apiContract/database/GameState';
import _ from '../utils/importDeepdash';
import { forEachPosition } from '../utils/ModelHelpers';
import { EventCountContext } from './TypedStateInterfaces';

export const PRIVATE_PREFIX = /\.?private_/;

export type PrivateContexts<C> = {
  [playerId: string]: PartialDeep<C> & EventCountContext;
};

// Take an object, copy out the 'private_' stuff from it, assume each `private_` thing is a
// PositionRecord. Make four copies, one for each player, key them by player ID.
// We also need to keep the eventCount/previousEventCount in the private contexts.
export function extractPrivateGameState<C>(
  gameMachineContext: C & EventCountContext,
  playerIdsByPosition: Record<Position, string>
): {
  publicContext: PartialDeep<C> & EventCountContext;
  privateContextsByPlayerId: PrivateContexts<C>;
} {
  const eventCounts: EventCountContext = {
    eventCount: gameMachineContext.eventCount,
    previousEventCount: gameMachineContext.previousEventCount,
  };

  // First, get the public version by removing the private stuff
  // Next, get the private "template" by keeping only the private stuff
  // Finally, turn the template into four actual things by keeping only the leaf node
  //    for each position
  // Add the event context back in.
  const publicContext = {
    ..._.omitDeep(gameMachineContext, PRIVATE_PREFIX),
    ...eventCounts,
  };

  const privateContextAllPlayers = _.pickDeep(
    gameMachineContext,
    PRIVATE_PREFIX
  );

  const privateContextsByPlayerId: PrivateContexts<C> = {};
  forEachPosition(playerIdsByPosition, (playerId, position) => {
    const privateContextOnePlayer = {
      ..._.pickDeep(privateContextAllPlayers, position),
      ...eventCounts,
    };
    privateContextsByPlayerId[playerId] = privateContextOnePlayer;
  });

  return {
    publicContext,
    privateContextsByPlayerId,
  };
}

// Get one copy of the partial private state, merge it with the public state.
export function mergePublicAndPrivateStates<C>(
  publicContext: PartialDeep<C> & EventCountContext,
  privateContext: PartialDeep<C> & EventCountContext
): C {
  return _.merge(publicContext, privateContext) as C;
}
