import * as _ from 'lodash';
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
  test('one event transitions to another state', async () => {
    const result = await doTransition('simpleEvent');
    expect(result).toEqual(['simpleEvent']);
  });
});
