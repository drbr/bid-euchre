import { extractPublicAndPrivateGameStateContexts } from '../../../functions/src/backendStateMachineUtils/extractPrivateState';
import { forEachPosition } from '../gameLogic/utils/ModelHelpers';
import {
  SampleFullContext,
  SamplePlayerIdentities,
  samplePrivateContextFor,
  SamplePublicContext,
} from './PublicPrivateStateSampleData';

describe('extractPrivateGameState', () => {
  test('should return the public game state with the player-private and server-private fields removed', () => {
    const {
      publicContext: publicGameStateContext,
    } = extractPublicAndPrivateGameStateContexts(
      SampleFullContext,
      SamplePlayerIdentities
    );

    expect(publicGameStateContext).toEqual(SamplePublicContext);
  });

  test('should return one private state per player ID, with only the player-private fields and the event counts', () => {
    const {
      privateContextsByPlayerId: privateContexts,
    } = extractPublicAndPrivateGameStateContexts(
      SampleFullContext,
      SamplePlayerIdentities
    );

    forEachPosition(SamplePlayerIdentities, (playerId, position) => {
      const playerPrivateContext = privateContexts[playerId];
      expect(playerPrivateContext).toEqual(samplePrivateContextFor(position));
    });
  });
});
