import { PartialDeep } from 'type-fest';
import { PlayerIdentities } from '../../apiContract/database/DataModel';
import _ from './importDeepdash';
import { forEachPosition } from '../../../frontend/src/gameLogic/utils/ModelHelpers';
import { EventCountContext } from '../../../frontend/src/gameLogic/stateMachineUtils/TypedStateInterfaces';

export const PRIVATE_PREFIX = /\.?private_/;

export type PrivateContexts<C> = {
  [playerId: string]: PartialDeep<C> & EventCountContext;
};

// Take an object, copy out the 'private_' stuff from it, assume each `private_` thing is a
// PositionRecord. Make four copies, one for each player, key them by player ID.
// We also need to keep the eventCount/previousEventCount in the private contexts.
export function extractPrivateGameState<C>(
  gameMachineContext: C & EventCountContext,
  playerIdsByPosition: PlayerIdentities
): {
  publicContext: PartialDeep<C> & EventCountContext;
  privateContextsByPlayerId: PrivateContexts<C>;
} {
  const eventCounts: EventCountContext = {
    eventCount: gameMachineContext.eventCount,
    previousEventCount: gameMachineContext.previousEventCount,
  };

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
    if (playerId) {
      const privateContextOnePlayer = {
        ..._.pickDeep(privateContextAllPlayers, position),
        ...eventCounts,
      };
      privateContextsByPlayerId[playerId] = privateContextOnePlayer;
    }
  });

  return {
    publicContext,
    privateContextsByPlayerId,
  };
}
