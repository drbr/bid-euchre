import './CustomMatchers';
import {
  INVALID_STATE_TRANSITION_ERROR,
  transitionStateMachine,
} from '../gameLogic/stateMachineUtils/transitionStateMachine';
import {
  TransitionTestStateName,
  TransitionTestStateMachine,
  INITIAL_EVENT_COUNT,
} from './TransitionTestStateMachine';
import { EventCountContext } from '../gameLogic/stateMachineUtils/TypedStateInterfaces';

async function doTransition(testKey: TransitionTestStateName, data?: string) {
  const initialState = TransitionTestStateMachine.initialState;
  const nextStates = await transitionStateMachine(
    TransitionTestStateMachine,
    { hydratedState: initialState },
    {
      type: testKey,
      data,
    }
  );

  const stateNames = nextStates.map((s) => s.value as TransitionTestStateName);
  return { nextStates, stateNames };
}

/* eslint jest/expect-expect: ["warn", { "assertFunctionNames": ["expect", "expectEventCounts"] }] */
describe('transitionStateMachine function', () => {
  describe('Simple Transitions', () => {
    test('simple transition to another state', async () => {
      const { stateNames } = await doTransition('simpleEvent');
      expect(stateNames).toEqual(['simpleEvent']);
    });

    test('transition to another state via a transient state', async () => {
      const { stateNames } = await doTransition(
        'simpleEventWithTransientState'
      );
      expect(stateNames).toEqual(['destination']);
    });
  });

  describe('Automatic Transitions', () => {
    test('one auto-transition', async () => {
      const { stateNames } = await doTransition('autoTransition1');
      expect(stateNames).toEqual(['autoTransition1', 'destination']);
    });

    test('two auto-transitions', async () => {
      const { stateNames } = await doTransition('autoTransition2');
      expect(stateNames).toEqual([
        'autoTransition2',
        'autoTransition1',
        'destination',
      ]);
    });

    test("after an auto-transition, the resulting state's event will be AUTO_TRANSITION", async () => {
      const { nextStates } = await doTransition('autoTransition1');
      expect(nextStates[1].event).toEqual({ type: 'AUTO_TRANSITION' });
    });

    test('a state node is not allowed to respond to events in addition to AUTO_TRANSITION', () => {
      const result = doTransition('respondsToAutoTransitionAndNext');
      return expect(result).rejects.toMatchErrorMessage(
        /may not respond to events in addition to AUTO_TRANSITION/
      );
    });

    test(
      'the "done" event of a hierarchical machine does not count as an additional event ' +
        'when evaluating AUTO_TRANSITION',
      async () => {
        const { stateNames } = await doTransition(
          'respondsToAutoTransitionAndDone'
        );
        expect(stateNames).toEqual([
          { respondsToAutoTransitionAndDone: 'first' },
          'destination',
        ]);
      }
    );

    test(
      'when an event contains secret data, its immediate destination can be passed over ' +
        'in the exposed transitions by responding to the SECRET_ACTION_COMPLETE event',
      async () => {
        const { stateNames } = await doTransition('secretAction', 'TOP SECRET');
        expect(stateNames).toEqual(['destination']);
      }
    );

    test(
      'when an event contains secret data, the resulting state ' +
        'will not contain the secret data',
      async () => {
        const { nextStates } = await doTransition('secretAction', 'TOP SECRET');
        expect(nextStates).toHaveLength(1);
        const destinationState = nextStates[0];
        expect(destinationState.event).toEqual({
          type: 'SECRET_ACTION_COMPLETE',
        });
        expect(JSON.stringify(destinationState)).not.toContain('TOP SECRET');
      }
    );

    test(
      'when the machine invokes a secret event, the destination state is passed over ' +
        'in the exposed transitions',
      async () => {
        const { stateNames } = await doTransition('invokeSecretAction');
        expect(stateNames).toEqual(['invokeSecretAction', 'destination']);
      }
    );

    test(
      'when the machine invokes a secret event, the resulting states ' +
        'will not contain the secret data',
      async () => {
        const { nextStates } = await doTransition('invokeSecretAction');
        expect(nextStates).toHaveLength(2);
        for (const destinationState of nextStates) {
          expect(JSON.stringify(destinationState)).not.toContain('TOP SECRET');
        }
      }
    );

    test('a state node is not allowed to respond to events in addition to SECRET_ACTION_COMPLETE', () => {
      const result = doTransition('respondsToSecretActionAndNext');
      return expect(result).rejects.toMatchErrorMessage(
        /may not respond to events in addition to SECRET_ACTION_COMPLETE/
      );
    });

    test('a state node is not allowed to invoke a service and respond to the special events', async () => {
      const result = doTransition('invokeAndAutoTransition');
      return expect(result).rejects.toMatchErrorMessage(
        /but there were still activities in progress/
      );
    });
  });

  describe('Invalid events', () => {
    test('should abort if a state node is given a non-enumerated event', () => {
      const result = doTransition(
        'thisEventDoesNotExist' as TransitionTestStateName
      );
      return expect(result).rejects.toBeInstanceOf(
        INVALID_STATE_TRANSITION_ERROR
      );
    });

    test('should abort if a state node is given a non-enumerated event from an invoked service', () => {
      const result = doTransition('invokeANonEnumeratedEvent');
      return expect(result).rejects.toBeInstanceOf(
        INVALID_STATE_TRANSITION_ERROR
      );
    });

    test(
      'should abort if given an enumerated event but no change is effected ' +
        '(e.g. the guards are not met)',
      () => {
        const result = doTransition('transitionOnlyIfTruthy');
        return expect(result).rejects.toBeInstanceOf(
          INVALID_STATE_TRANSITION_ERROR
        );
      }
    );
  });

  describe('Updating event counts', () => {
    function expectEventCounts(
      states: ReadonlyArray<{ context: EventCountContext }>,
      ...counts: ReadonlyArray<number>
    ) {
      const eventContexts = states.map((s) => s.context);
      if (eventContexts.length === 0) {
        throw new Error(
          'Should have received at least one state to verify event counts'
        );
      }

      const basis = INITIAL_EVENT_COUNT;
      const expected = counts.map((c) => ({
        eventCount: c + basis,
        previousEventCount: c - 1 + basis,
      }));

      expect(eventContexts).toEqual(expected);
    }

    test('a single returned state should update event counts once', async () => {
      const { nextStates } = await doTransition('simpleEvent');
      expectEventCounts(nextStates, 1);
    });

    test('multiple returned events should update the event counts each time', async () => {
      const { nextStates } = await doTransition('autoTransition2');
      expectEventCounts(nextStates, 1, 2, 3);
    });

    test('going through a transient state does not update the event counts extra', async () => {
      const { nextStates } = await doTransition(
        'simpleEventWithTransientState'
      );
      expectEventCounts(nextStates, 1);
    });

    test('going through a SECRET_ACTION_COMPLETE event does not update the event counts extra', async () => {
      const { nextStates } = await doTransition('invokeSecretAction');
      expectEventCounts(nextStates, 1, 2);
    });
  });
});
