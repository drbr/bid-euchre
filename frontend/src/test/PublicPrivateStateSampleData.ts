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
        private_onlyChild_canMapComplexDataTypes: {
          north: ['secret', 'data', 'for', 'north'],
          south: ['secret', 'data', 'for', 'south'],
          east: ['secret', 'data', 'for', 'east'],
          west: ['secret', 'data', 'for', 'west'],
        },
      },
      private_sibling_canMapPrimitiveDataTypes: {
        north: 'Nancy',
        south: 'Susan',
        east: 'Edward',
        west: 'William',
      },
      privateDataWhoseKeyDoesNotStartWithPrivateUnderscoreIs:
        'not actually private',
      private_dataThatIsNotAPositionRecordIs: 'private to the server',
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
      privateDataWhoseKeyDoesNotStartWithPrivateUnderscoreIs:
        'not actually private',
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
 * Private state should include the current/previous event counts, and any position records marked
 * `private_`, and exclude everything else (including other `private_` fields that are not position
 * records).
 *
 * Only the specific player gets this version of the context.
 */
export function samplePrivateContextFor(position: Position) {
  const privateOnlyChildPiece =
    SampleFullContext.theData.canBeNested.arbitrarily
      .private_onlyChild_canMapComplexDataTypes[position];
  const privateSiblingPiece =
    SampleFullContext.theData.canBeNested
      .private_sibling_canMapPrimitiveDataTypes[position];

  return {
    eventCount: 153,
    previousEventCount: 150,
    theData: {
      canBeNested: {
        arbitrarily: {
          private_onlyChild_canMapComplexDataTypes: {
            [position]: privateOnlyChildPiece,
          },
        },
        private_sibling_canMapPrimitiveDataTypes: {
          [position]: privateSiblingPiece,
        },
      },
    },
  };
}

/**
 * The reconstituted client state should look just like the full state, but with only one player's
 * private info.
 *
 * Each client will merge its public and private context together to result in an
 * object that looks like this.
 */
export function sampleReconstitutedClientContextFor(position: Position) {
  const privateOnlyChildPiece =
    SampleFullContext.theData.canBeNested.arbitrarily
      .private_onlyChild_canMapComplexDataTypes[position];
  const privateSiblingPiece =
    SampleFullContext.theData.canBeNested
      .private_sibling_canMapPrimitiveDataTypes[position];

  return {
    eventCount: 153,
    previousEventCount: 150,
    theData: {
      canBeNested: {
        arbitrarily: {
          private_onlyChild_canMapComplexDataTypes: {
            [position]: privateOnlyChildPiece,
          },
        },
        private_sibling_canMapPrimitiveDataTypes: {
          [position]: privateSiblingPiece,
        },
        privateDataWhoseKeyDoesNotStartWithPrivateUnderscoreIs:
          'not actually private',
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
