import { Position } from '../../../functions/apiContract/database/GameState';

/**
 * The full context, containing both public and private data. The server uses
 * this to perform state transitions.
 */
export const SampleFullContext = {
  eventCount: 153,
  previousEventCount: 150,
  theData: {
    canBeNested: {
      arbitrarily: {
        private_onlyChild: {
          north: ['secret', 'data', 'for', 'north'],
          south: ['secret', 'data', 'for', 'south'],
          east: ['secret', 'data', 'for', 'east'],
          west: ['secret', 'data', 'for', 'west'],
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
      north: ['public', 'data', 'for', 'north'],
      south: ['public', 'data', 'for', 'south'],
      east: ['public', 'data', 'for', 'east'],
      west: ['public', 'data', 'for', 'west'],
    },
  },
};

/**
 * Public context should _exclude_ anything from the full context marked `private_`.
 * Clients (players and spectators) get this version of the context.
 */
export const SamplePublicContext = {
  eventCount: 153,
  previousEventCount: 150,
  theData: {
    canBeNested: {
      arbitrarily: {},
      onlyThingsStartingWithPrivateUnderscoreAreConsideredPrivate: true,
      allPrivateStateIsAssumedToBeA: 'PositionRecord',
    },
    otherPositionRecordsAreNotPrivate: {
      north: ['public', 'data', 'for', 'north'],
      south: ['public', 'data', 'for', 'south'],
      east: ['public', 'data', 'for', 'east'],
      west: ['public', 'data', 'for', 'west'],
    },
  },
};

/**
 * Private state should include the current/previous event counts, and anything marked `private_`,
 * and exclude everything else.
 *
 * Only the specific player gets this version of the context.
 */
export function samplePrivateContextFor(position: Position) {
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
        private_sibling: {
          [position]: privateSiblingPiece,
        },
      },
    },
  };
}

/**
 * The reconstituted client state should look just like the full state, but with the other players'
 * private info stripped out.
 *
 * Each client will merge its public and private context together to result in an
 * object that looks like this.
 */
export function sampleReconstitutedClientContextFor(position: Position) {
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
        north: ['public', 'data', 'for', 'north'],
        south: ['public', 'data', 'for', 'south'],
        east: ['public', 'data', 'for', 'east'],
        west: ['public', 'data', 'for', 'west'],
      },
    },
  };
}

export const SamplePlayerIdentities: Record<Position, string> = {
  north: 'northId',
  south: 'southId',
  east: 'eastId',
  west: 'westId',
};
