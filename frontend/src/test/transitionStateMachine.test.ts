import * as _ from 'lodash';
import './CustomMatchers';
import { transitionStateMachine } from '../../../functions/src/backendStateMachineUtils/transitionStateMachine';
import {
  TransitionTestStateName,
  TransitionTestStateMachine,
} from './TransitionTestStateMachine';

async function doTransition(testKey: TransitionTestStateName, data?: string) {
  const nextStates = await transitionStateMachine(
    TransitionTestStateMachine,
    { hydratedState: TransitionTestStateMachine.initialState },
    {
      type: testKey,
      data,
    }
  );

  const stateNames = nextStates.map((s) => s.value as TransitionTestStateName);
  return { nextStates, stateNames };
}

describe('transitionStateMachine function', () => {
  describe('Simple transitions', () => {
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

  describe('Auto-Transitions', () => {
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

    test('a state node may not respond to events in addition to AUTO_TRANSITION', () => {
      const result = doTransition('respondsToMultipleAutomaticEvents');
      return expect(result).rejects.toMatchErrorMessage(
        /may not respond to events in addition to AUTO_TRANSITION/
      );
    });

    test('when an event contains secret data, its destination is passed over in the exposed transitions', async () => {
      const { stateNames } = await doTransition('secretAction');
      expect(stateNames).toEqual(['destination']);
    });

    test("when an event contains secret data, the resulting state's event will be SECRET_ACTION_COMPLETE", async () => {
      const { nextStates } = await doTransition('secretAction');
      expect(nextStates[0].event).toEqual({ type: 'SECRET_ACTION_COMPLETE' });
    });
    /*

    // Auto-invoke secret event, then shroud it
    entry responds to TEST5, which goes to TEST5A
    TEST5A invokes a service that sends an event with some secret stuff, which goes to TEST5B
    TEST5B responds to SECRET_EVENT_DONE, goes to TEST5C
    TEST5C responds to NEXT

    // Secret data and then auto-invoke
    entry responds to TEST6, which contains some secret info, goes to TEST6A
    TEST6A responds to SECRET_EVENT_DONE, goes to TEST6B
    TEST6B responds to AUTO_TRANSITION, goes to TEST6C
    TEST6C responds to NEXT
    */
    // Should error if state node responds to SECRET_EVENT_DONE/AUTO_TRANSITION and something else

    // Should error if auto-transition state has invoked a service
  });

  describe('Invalid events', () => {
    // Respond to non-enumerated event from entry
    // Respond to non-enumerated event from after an AUTO_TRANSITION
    // Respond to event without the right condition from entry
    // Respond to event without the right condition from after an AUTO_TRANSITION
  });

  describe('Updating event counts', () => {
    // Increments the event counts correctly from X
    // Increments the event counts correctly from null
    // (Test both via an auto-increment event)
  });
});
