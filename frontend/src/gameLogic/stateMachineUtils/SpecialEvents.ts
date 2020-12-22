import { Position } from '../../../../functions/apiContract/database/GameState';

export type PlayerSpecificEvent = {
  position?: Position;
};

export type StartGameEvent = {
  type: 'START_GAME';
};

/**
 * XState supports _transient_ states, which are configured with an `always` transition. However,
 * transitions to transient states are never exposed outside the state machine – the machine
 * automatically transitions through them to the next non-transient state.
 *
 * Sometimes we want a state that is exposed but doesn't expect player interaction (for example, to
 * show the results of a round before the next round automatically begins). For this, we can use a
 * state that responds to the AUTO_TRANSITION event. Because such a state is non-transient, the
 * server can capture it to send to the clients, but when it encounters such a state, it will
 * automatically send the AUTO_TRANSITION event back to the state machine to continue the game
 * further.
 */
export type AutoTransitionEvent = {
  type: 'AUTO_TRANSITION';
};

/**
 * Certain events contain secret information (e.g. dealing cards, one player passes a card face-down
 * to another). Because the state machine stores the most recent event as part of its state object,
 * we need to conceal the original event so other players don't see the secret information.
 *
 * We can accomplish this with an extra state that responds to the SECRET_ACTION_COMPLETE event. The
 * server will automatically send this event when it transitions to such a state (similar to the
 * AUTO_TRANSITION events), but it will not send the intermediate state back to the client.
 */
export type SecretActionCompleteEvent = {
  type: 'SECRET_ACTION_COMPLETE';
};
