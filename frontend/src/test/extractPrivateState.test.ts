import { Position } from '../../../functions/apiContract/database/GameState';
import { forEachPosition } from '../gameLogic/utils/ModelHelpers';
import {
  extractPrivateGameState,
  mergePublicAndPrivateStates,
} from '../gameLogic/stateMachineUtils/extractPrivateState';

const SampleFullContext = {
  eventCount: 153,
  previousEventCount: 150,
  theData: {
    canBeNested: {
      arbitrarily: {
        private_onlyChild: {
          north: 'secret data for north',
          south: 'secret data for south',
          east: 'secret data for east',
          west: 'secret data for west',
        },
      },
      onlyThingsStartingWithPrivateUnderscoreAreConsideredPrivate: true,
      allPrivateStateIsAssumedToBeA: 'PositionRecord',
      private_sibling: {
        north: 'Nancy',
        south: 'Susan',
        east: 'Edward',
        west: 'William',
      },
    },
    otherPositionRecordsAreNotPrivate: {
      north: 'public data for north',
      south: 'public data for south',
      east: 'public data for east',
      west: 'public data for west',
    },
  },
};

/**
 * Public context should _exclude_ anything from the full context marked `private_`.
 */
const SamplePublicContext = {
  eventCount: 153,
  previousEventCount: 150,
  theData: {
    canBeNested: {
      arbitrarily: {},
      onlyThingsStartingWithPrivateUnderscoreAreConsideredPrivate: true,
      allPrivateStateIsAssumedToBeA: 'PositionRecord',
    },
    otherPositionRecordsAreNotPrivate: {
      north: 'public data for north',
      south: 'public data for south',
      east: 'public data for east',
      west: 'public data for west',
    },
  },
};

/**
 * Private state should include the current/previous event counts, and anything marked `private_`,
 * and exclude everything else.
 */
function samplePrivateContextFor(position: Position) {
  const privateOnlyChildPiece =
    SampleFullContext.theData.canBeNested.arbitrarily.private_onlyChild[
      position
    ];
  const privateSiblingPiece =
    SampleFullContext.theData.canBeNested.private_sibling[position];

  return {
    eventCount: 153,
    previousEventCount: 150,
    theData: {
      canBeNested: {
        arbitrarily: {
          private_onlyChild: privateOnlyChildPiece,
        },
        private_sibling: privateSiblingPiece,
      },
    },
  };
}

/**
 * The reconstituted client state should look just like the full state, but with the other players'
 * private info stripped out.
 */
function sampleReconstitutedClientContextFor(position: Position) {
  const privateOnlyChildPiece =
    SampleFullContext.theData.canBeNested.arbitrarily.private_onlyChild[
      position
    ];
  const privateSiblingPiece =
    SampleFullContext.theData.canBeNested.private_sibling[position];

  return {
    eventCount: 153,
    previousEventCount: 150,
    theData: {
      canBeNested: {
        arbitrarily: {
          private_onlyChild: {
            [position]: privateOnlyChildPiece,
          },
        },
        onlyThingsStartingWithPrivateUnderscoreAreConsideredPrivate: true,
        allPrivateStateIsAssumedToBeA: 'PositionRecord',
        private_sibling: {
          [position]: privateSiblingPiece,
        },
      },
      otherPositionRecordsAreNotPrivate: {
        north: 'public data for north',
        south: 'public data for south',
        east: 'public data for east',
        west: 'public data for west',
      },
    },
  };
}

const SamplePlayerIdentities: Record<Position, string> = {
  north: 'northId',
  south: 'southId',
  east: 'eastId',
  west: 'westId',
};

describe('extractPrivateGameState', () => {
  test('should return one copy per player ID, with only the private fields and the event counts', () => {
    const { publicGameStateContext, privateContexts } = extractPrivateGameState(
      SampleFullContext,
      SamplePlayerIdentities
    );

    expect(publicGameStateContext).toEqual(SamplePublicContext);

    forEachPosition(SamplePlayerIdentities, (playerId, position) => {
      const playerPrivateContext = privateContexts[playerId];
      expect(playerPrivateContext).toEqual(samplePrivateContextFor(position));
    });
  });
});

describe('mergePublicAndPrivateStates', () => {
  test('should reconstitute the full state object from the two sources', () => {
    const reconstituted = mergePublicAndPrivateStates(
      SamplePublicContext,
      samplePrivateContextFor('east')
    );
    expect(reconstituted).toEqual(sampleReconstitutedClientContextFor('east'));
  });
});
