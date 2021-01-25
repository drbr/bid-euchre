import { GameMeta } from '../euchreStateMachine/GameStateTypes';
import { HydratedGameState } from './serializeAndHydrateState';

/**
 * State metadata is returned in a format that's hard to deal with, because we have no way of
 * programmatically generating the keys. So this function extracts the meta we actually care about
 * and returns it. If the state meta contains multiple objects with conflicting values, this
 * function gives no guarantee about what the value will be.
 *
 * Example:
 *
 *     // Original meta
 *     {
 *       'EuchreStateMachine.runGame': {
 *         message: "In the game",
 *       },
 *       'EuchreStateMachine.runGame.round.bidding.allPlayersPassedInfo': {
 *         blocking: true,
 *       },
 *     }
 *
 *     // Flattened meta
 *     {
 *       message: "In the game",
 *       blocking: true,
 *     }
 *
 * See https://xstate.js.org/docs/guides/states.html#state-meta-data
 */
export function flattenGameMeta(s: HydratedGameState): GameMeta {
  const meta = s.hydratedState.meta;
  let flattenedMeta = {};
  for (const key in meta) {
    const subMeta = meta[key];
    flattenedMeta = {
      ...flattenedMeta,
      ...subMeta,
    };
  }

  return flattenedMeta;
}
