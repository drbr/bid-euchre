import * as _ from 'lodash';
import './CustomMatchers';
import { transitionStateMachine } from '../../../functions/src/backendStateMachineUtils/transitionStateMachine';
import {
  TransitionTestStateName,
  TransitionTestStateMachine,
} from './TransitionTestStateMachine';

async function doTransition(
  testKey: TransitionTestStateName,
  data?: string
): Promise<TransitionTestStateName[]> {
  const nextStates = await transitionStateMachine(
    TransitionTestStateMachine,
    { hydratedState: TransitionTestStateMachine.initialState },
    {
      type: testKey,
      data,
    }
  );

  return nextStates.map((s) => s.value as TransitionTestStateName);
}

describe('transitionStateMachine function', () => {
  describe('Simple transitions', () => {
    test('simple transition to another state', async () => {
      const result = await doTransition('simpleEvent');
      expect(result).toEqual(['simpleEvent']);
    });

    test('transition to another state via a transient state', async () => {
      const result = await doTransition('simpleEventWithTransientState');
      expect(result).toEqual(['destination']);
    });
  });

  describe('Automatic transitions', () => {
    test('one auto-transition', async () => {
      const result = await doTransition('autoTransition1');
      expect(result).toEqual(['autoTransition1', 'destination']);
    });

    test('two auto-transitions', async () => {
      const result = await doTransition('autoTransition2');
      expect(result).toEqual([
        'autoTransition2',
        'autoTransition1',
        'destination',
      ]);
    });

    test('state cannot respond to events in addition to AUTO_TRANSITION', () => {
      const result = doTransition('respondsToMultipleAutomaticEvents');
      return expect(result).rejects.toMatchErrorMessage(
        /may not respond to events in addition to AUTO_TRANSITION/
      );
    });

    /*

    // Secret data in event
    entry responds to event TEST2, which contains some secret info, goes to TEST2A
    TEST2A responds to SECRET_EVENT_DONE, goes to TEST2B
    TEST2B responds to NEXT

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
