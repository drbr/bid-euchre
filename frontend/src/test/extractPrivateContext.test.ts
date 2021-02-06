import {
  ExtractContextsOpts,
  extractPublicAndPrivateGameStateContexts,
} from '../../../functions/src/backendStateMachineUtils/extractPrivateContext';
import { forEachPosition } from '../gameLogic/utils/PositionHelpers';
import {
  SampleFullContext,
  SamplePlayerIdentities,
  sampleFullPrivateContextFor as sampleFullPrivateContextFor,
  samplePrivateOnlyContextFor,
  SamplePublicContext,
} from './PublicPrivateContextSampleData';

describe('extractPrivateGameState', () => {
  function getPublicContext(opts: ExtractContextsOpts) {
    return extractPublicAndPrivateGameStateContexts(
      SampleFullContext,
      SamplePlayerIdentities,
      opts
    ).publicContext;
  }

  function getPrivateContext(opts: ExtractContextsOpts) {
    return extractPublicAndPrivateGameStateContexts(
      SampleFullContext,
      SamplePlayerIdentities,
      opts
    ).privateContextsByPlayerId;
  }

  describe('when including all fields in the player contexts', () => {
    test('should return the public game context with the player-private and server-private fields removed', () => {
      const result = getPublicContext({ includeInPlayerContext: 'all' });
      expect(result).toEqual(SamplePublicContext);
    });

    test(
      'should return one private context per player ID, with all the public fields, ' +
        'the player-private fields, and the event counts',
      () => {
        const result = getPrivateContext({ includeInPlayerContext: 'all' });
        forEachPosition(SamplePlayerIdentities, (playerId, position) => {
          const playerPrivateContext = result[playerId];
          expect(playerPrivateContext).toEqual(
            sampleFullPrivateContextFor(position)
          );
        });
      }
    );
  });

  describe('when including only private fields in the player contexts', () => {
    test('should return the public game context with the player-private and server-private fields removed', () => {
      const result = getPublicContext({
        includeInPlayerContext: 'privateOnly',
      });
      expect(result).toEqual(SamplePublicContext);
    });

    test(
      'should return one private context per player ID, with only the player-private fields ' +
        'and the event counts',
      () => {
        const result = getPrivateContext({
          includeInPlayerContext: 'privateOnly',
        });
        forEachPosition(SamplePlayerIdentities, (playerId, position) => {
          const playerPrivateContext = result[playerId];
          expect(playerPrivateContext).toEqual(
            samplePrivateOnlyContextFor(position)
          );
        });
      }
    );
  });
});
