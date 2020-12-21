import { StateNodeConfig } from 'xstate';
import {
  ThePlayContext,
  ThePlayEvent,
  ThePlayStateSchema,
} from './ThePlayStateTypes';
import { RoundContext } from './RoundStateTypes';

export const ThePlayStates: StateNodeConfig<
  ThePlayContext,
  ThePlayStateSchema,
  ThePlayEvent
> = {
  key: 'thePlay',
  initial: 'entry',
  states: {
    entry: {},

    /*
    Context:
      - cards played publicly to the most recent trick
      - Won tricks count for each partnership
      - Awaited player
    */

    /*
    First awaited player is the winning bidder
    Start the first trick - await the player to lead a card
    Next player follows
      Check if trick is complete – subsequent player follows if not everyone has played yet
    Determine winning card – add trick to total
    Determine if more tricks should be played - go to lead or end
      Lead the next trick and leave the cards from last time showing until the first card is led
    End – return each partnership's trick count back up


    MAKE SURE THE CARDS CONTINUE TO SHOW AFTER THE END OF EACH TRICK

    */
    thePlayComplete: {
      type: 'final',
    },
  },
};

export function assignInitialThePlayContext(
  parentContext: RoundContext
): ThePlayContext {
  return {
    tricks: null,
  };
}
