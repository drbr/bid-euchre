import { PartialDeep } from 'type-fest';
import { PlayerIdentities } from '../../apiContract/database/DataModel';
import _ from './importDeepdash';
import { forEachPosition } from '../../../frontend/src/gameLogic/utils/ModelHelpers';
import { EventCountContext } from '../../../frontend/src/gameLogic/stateMachineUtils/TypedStateInterfaces';

export const PRIVATE_PREFIX = /\.?private_/;

export type PrivateContexts<C> = {
  [playerId: string]: PartialDeep<C> & EventCountContext;
};

export type ExtractContextsOpts = {
  includeInPlayerContext: 'all' | 'privateOnly';
};

/**
 * Breaks the game machine _context_ (not the full state object) into "public" and "private"
 * versions, suitable for sending to the clients.
 *
 * @param gameMachineContext
 * @param playerIdsByPosition
 */
export function extractPublicAndPrivateGameStateContexts<C>(
  gameMachineContext: C & EventCountContext,
  playerIdsByPosition: PlayerIdentities,
  opts: ExtractContextsOpts
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
        ..._.pickDeep(privateContextAllPlayers, position, {
          onMatch: { skipChildren: true, cloneDeep: true },
        }),
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
