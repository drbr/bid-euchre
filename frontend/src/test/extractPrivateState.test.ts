import { extractPrivateGameState } from '../../../functions/src/gameLogic/extractPrivateState';
import { forEachPosition } from '../gameLogic/utils/ModelHelpers';
import {
  SampleFullContext,
  SamplePlayerIdentities,
  samplePrivateContextFor,
  SamplePublicContext,
} from './PublicPrivateStateSampleData';

describe('extractPrivateGameState', () => {
  test('should return the public game state with the private fields removed', () => {
    const { publicContext: publicGameStateContext } = extractPrivateGameState(
      SampleFullContext,
      SamplePlayerIdentities
    );

    expect(publicGameStateContext).toEqual(SamplePublicContext);
  });

  test('should return one private state per player ID, with only the private fields and the event counts', () => {
    const {
      privateContextsByPlayerId: privateContexts,
    } = extractPrivateGameState(SampleFullContext, SamplePlayerIdentities);

    forEachPosition(SamplePlayerIdentities, (playerId, position) => {
      const playerPrivateContext = privateContexts[playerId];
      expect(playerPrivateContext).toEqual(samplePrivateContextFor(position));
    });
  });
});
