import * as _ from 'lodash';
import { assign, StateNodeConfig } from 'xstate';
import {
  PlayCardEvent,
  ThePlayContext,
  ThePlayEvent,
  ThePlayStateSchema,
} from './ThePlayStateTypes';
import { RoundContext } from './RoundStateTypes';
import { Position } from '../apiContract/database/Position';
import {
  cardsInDescendingOrderForEffectiveSuit,
  getEffectiveSuit,
  Suit,
} from '../Cards';
import { mapPositions, NextPlayer } from '../utils/PositionHelpers';

export const ThePlayStates: StateNodeConfig<
  ThePlayContext,
  ThePlayStateSchema,
  ThePlayEvent
> = {
  key: 'thePlay',
  initial: 'trick',
  entry: assign((context) =>
    assignInitialThePlayContext((context as unknown) as RoundContext)
  ),
  states: {
    trick: {
      initial: 'waitForLead',
      states: {
        waitForLead: {
          on: {
            PLAY_CARD: {
              target: 'waitForFollow',
              cond: isCardPlayedByAwaitedPlayerAndInTheirHand,
              actions: assign({
                currentTrick: (context, event) =>
                  trickWithCardPlayed(context, event),
                private_hands: (context, event) =>
                  playerHandsWithCardRemoved(context, event),
                awaitedPlayer: (context) => NextPlayer[context.awaitedPlayer],
              }),
            },
          },
        },
        waitForFollow: {
          on: {
            PLAY_CARD: {
              target: 'checkIfAllPlayersHavePlayed',
              cond: isFollowValid,
              actions: assign({
                currentTrick: (context, event) =>
                  trickWithCardPlayed(context, event),
                private_hands: (context, event) =>
                  playerHandsWithCardRemoved(context, event),
                awaitedPlayer: (context) => NextPlayer[context.awaitedPlayer],
              }),
            },
          },
        },
        checkIfAllPlayersHavePlayed: {
          always: [
            {
              cond: haveAllPlayersPlayedToTrick,
              target: 'complete',
            },
            {
              target: 'waitForFollow',
            },
          ],
        },
        complete: {
          type: 'final',
        },
      },
      onDone: {
        target: 'trickCompleteInfo',
        actions: assign({
          trickCount: (context) => addWonTrickToCount(context),
          awaitedPlayer: (context) => getTrickWinner(context),
        }),
      },
    },
    trickCompleteInfo: {
      meta: { blocking: true },
      on: {
        AUTO_TRANSITION: 'checkIfMoreTricksToPlay',
      },
    },
    checkIfMoreTricksToPlay: {
      always: [
        {
          target: 'thePlayComplete',
          cond: arePlayersOutOfCardsAfterTrick,
        },
        {
          target: 'trick',
          actions: assign((context) =>
            assignInitialTrickContextForLeader(getTrickWinner(context))
          ),
        },
      ],
    },
    thePlayComplete: {
      type: 'final',
    },
  },
};

function isCardPlayedByAwaitedPlayerAndInTheirHand(
  context: ThePlayContext,
  event: PlayCardEvent
): boolean {
  if (event.position !== context.awaitedPlayer) {
    return false;
  }

  const playerHand = context.private_hands[event.position];
  const isCardInPlayerHand = !!_.find(playerHand, (c) =>
    _.isEqual(c, event.card)
  );
  return isCardInPlayerHand;
}

function getEffectiveLedSuit(context: ThePlayContext): Suit {
  const ledCard = context.currentTrick[context.leader];
  const trump = context.trump;
  if (!ledCard) {
    throw new Error('Cannot evaluate trick, no card was led!');
  }
  if (!trump) {
    throw new Error('Cannot evaluate trick, no trump is named!');
  }

  return getEffectiveSuit({ card: ledCard, trump });
}

function isFollowValid(context: ThePlayContext, event: PlayCardEvent): boolean {
  if (!isCardPlayedByAwaitedPlayerAndInTheirHand(context, event)) {
    return false;
  }

  const followerHand = context.private_hands[event.position];
  const trump = context.trump;
  const ledSuit = getEffectiveLedSuit(context);
  if (!trump) {
    throw new Error('Cannot evaluate follow card, no trump is named!');
  }

  const followerHasAnyOfLedSuit = followerHand.some(
    (card) => getEffectiveSuit({ card, trump }) === ledSuit
  );
  return followerHasAnyOfLedSuit
    ? getEffectiveSuit({ card: event.card, trump }) === ledSuit
    : true;
}

function trickWithCardPlayed(
  context: ThePlayContext,
  event: PlayCardEvent
): ThePlayContext['currentTrick'] {
  return {
    ...context.currentTrick,
    [event.position]: event.card,
  };
}

function playerHandsWithCardRemoved(
  context: ThePlayContext,
  event: PlayCardEvent
): ThePlayContext['private_hands'] {
  const originalHands = context.private_hands;
  return {
    ...originalHands,
    [event.position]: originalHands[event.position].filter(
      (c) => !_.isEqual(c, event.card)
    ),
  };
}

function haveAllPlayersPlayedToTrick(context: ThePlayContext): boolean {
  return _.every(context.currentTrick, (card) => card !== null);
}

function arePlayersOutOfCardsAfterTrick(context: ThePlayContext): boolean {
  const cardCounts = mapPositions(context.private_hands, (hand) => hand.length);
  for (const count of cardCounts) {
    if (count !== cardCounts[0]) {
      throw new Error('Not all players have the same number of cards');
    }
  }
  return cardCounts[0] === 0;
}

export function getTrickWinner(context: ThePlayContext): Position {
  const trump = context.trump;

  if (!haveAllPlayersPlayedToTrick(context)) {
    throw new Error('Trick is not yet complete; cannot determine a winner');
  }
  if (!trump) {
    throw new Error('Cannot evaluate trick; trump is not named!');
  }
  const ledSuit = getEffectiveLedSuit(context);

  const possibleWinningCards = [
    ...cardsInDescendingOrderForEffectiveSuit({ suit: trump, trump }),
    ...cardsInDescendingOrderForEffectiveSuit({ suit: ledSuit, trump }),
  ];

  for (const potentialHighestCard of possibleWinningCards) {
    const potentialHighestPlayer = _.findKey(
      context.currentTrick,
      (trickCard) => _.isEqual(trickCard, potentialHighestCard)
    );
    if (potentialHighestPlayer) {
      return potentialHighestPlayer as Position;
    }
  }

  throw new Error('No player was found to have played the highest card');
}

export function assignInitialThePlayContext(
  parentContext: RoundContext
): ThePlayContext {
  const highestBidder = parentContext.highestBidder;
  if (!highestBidder) {
    throw new Error('Cannot start The Play, no highest bidder is recorded');
  }

  return {
    private_hands: parentContext.private_hands,
    trump: parentContext.trump,
    ...assignInitialTrickContextForLeader(highestBidder),
    trickCount: {
      north: 0,
      south: 0,
      east: 0,
      west: 0,
    },
  };
}

function assignInitialTrickContextForLeader(
  leader: Position
): Pick<ThePlayContext, 'awaitedPlayer' | 'leader' | 'currentTrick'> {
  return {
    leader: leader,
    awaitedPlayer: leader,
    currentTrick: {
      north: null,
      south: null,
      east: null,
      west: null,
    },
  };
}

function addWonTrickToCount(
  context: ThePlayContext
): ThePlayContext['trickCount'] {
  const trickWinner = getTrickWinner(context);
  return {
    ...context.trickCount,
    [trickWinner]: context.trickCount[trickWinner] + 1,
  };
}
