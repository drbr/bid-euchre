import * as _ from 'lodash';
import { assign, Machine, StateNodeConfig } from 'xstate';
import { BiddingContext } from './BiddingStateTypes';
import {
  GameContext,
  GameEvent,
  GameMeta,
  GameStateSchema,
  ScoreDelta,
} from './GameStateTypes';
import { RoundStates } from './RoundStateMachine';
import { RoundContext } from './RoundStateTypes';
import { TypedStateSchema } from '../stateMachineUtils/TypedStateInterfaces';
import {
  PartnershipForPosition,
  OpposingTeamOf,
} from '../utils/PositionHelpers';
import { Partnership } from '../EuchreTypes';

export type AllContext = GameContext & RoundContext & BiddingContext;

const initialGameContext: GameContext = {
  score: {
    eastwest: 0,
    northsouth: 0,
  },
  trickCount: {
    east: 0,
    west: 0,
    north: 0,
    south: 0,
  },
  scoreDelta: null,
  eventCount: 0,
  previousEventCount: null,
};

// const GameActions: ActionFunctionMap<GameContext, GameEvent> = {
//   addEventToContext: assign({
//     eventCount: (context) => context.eventCount + 1,
//   }),
// };

export const GameStateMachine = Machine<
  GameContext,
  GameStateSchema,
  GameEvent
>(
  {
    id: 'EuchreStateMachine',
    type: 'parallel',
    strict: true,
    context: initialGameContext,
    states: {
      runGame: {
        id: 'runGame',
        initial: 'entry',
        states: {
          entry: {
            on: {
              START_GAME: 'round',
            },
          },
          round: {
            ...(RoundStates as StateNodeConfig<
              GameContext,
              TypedStateSchema<GameMeta, RoundContext>,
              GameEvent
            >),
            onDone: {
              target: 'checkIfGameIsWon',
              actions: assign((context) =>
                assignScoreFromRoundContext(
                  context as GameContext & RoundContext
                )
              ),
            },
          },
          checkIfGameIsWon: {
            always: [
              {
                target: 'roundCompleteInfo',
                cond: (context) => !determineWinner(context),
              },
              {
                target: 'gameCompleteInfo',
              },
            ],
          },
          roundCompleteInfo: {
            meta: { blocking: true },
            on: {
              AUTO_TRANSITION: 'round',
            },
          },
          gameCompleteInfo: { type: 'final' },
        },
      },
      // recordEvents: {
      //   on: {
      //     '*': {
      //       actions: 'addEventToContext',
      //     },
      //   },
      // },
    },
  }
  // {
  //   actions: GameActions,
  // }
);

export function assignScoreFromRoundContext(
  context: GameContext & RoundContext
): Pick<GameContext, 'score' | 'scoreDelta'> {
  const { highestBid, highestBidder, trickCount, score } = context;
  if (!(highestBid && highestBidder && trickCount && score)) {
    throw new Error(
      'Cannot compute score; highest bid/bidder, trick count, and score are not present'
    );
  }
  if (!_.isNumber(highestBid)) {
    throw new Error('Cannot compute score; highest bid is not a number');
  }

  const teamTricks: Record<Partnership, number> = {
    northsouth: trickCount.north + trickCount.south,
    eastwest: trickCount.east + trickCount.west,
  };

  const offense = PartnershipForPosition[highestBidder];
  const bidWasMet = teamTricks[offense] >= highestBid;

  const offenseScore = {
    side: 'offense' as const,
    delta: bidWasMet ? teamTricks[offense] : -highestBid,
  };
  const defenseScore = {
    side: 'defense' as const,
    delta: teamTricks[OpposingTeamOf[offense]],
  };

  const scoreDelta: ScoreDelta = {
    bidWasMet,
    northsouth: offense === 'northsouth' ? offenseScore : defenseScore,
    eastwest: offense === 'northsouth' ? defenseScore : offenseScore,
  };

  return {
    score: {
      northsouth: score.northsouth + scoreDelta.northsouth.delta,
      eastwest: score.eastwest + scoreDelta.eastwest.delta,
    },
    scoreDelta,
  };
}

const WIN_GAME_POINTS = 32;

export function getSides(
  context: GameContext
): { offense: Partnership; defense: Partnership } {
  const offense = _.findKey(
    context.scoreDelta,
    (d) => typeof d === 'object' && d.side === 'offense'
  ) as Partnership;
  const defense = OpposingTeamOf[offense];

  if (!offense || !defense) {
    throw new Error(
      'Cannot determine partnership sides; score delta was not defined'
    );
  }

  return { offense, defense };
}

/**
 * First team to pass the point threshold is the winner. The "offense" team always scores first,
 * so offense wins if both teams pass the threshold on the same turn, even if the defense ended
 * up at a higher score.
 */
export function determineWinner(context: GameContext): Partnership | null {
  const { offense, defense } = getSides(context);
  if (context.score[offense] >= WIN_GAME_POINTS) {
    return offense;
  }
  if (context.score[defense] >= WIN_GAME_POINTS) {
    return defense;
  }
  return null;
}
