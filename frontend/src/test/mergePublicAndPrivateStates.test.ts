import { mergePublicAndPrivateStates } from '../gameLogic/stateMachineUtils/mergePublicAndPrivateState';
import {
  samplePrivateContextFor,
  SamplePublicContext,
  sampleReconstitutedClientContextFor,
} from './PublicPrivateStateSampleData';

describe('mergePublicAndPrivateStates', () => {
  test('should reconstitute the full state object from the two sources', () => {
    const reconstituted = mergePublicAndPrivateStates(
      SamplePublicContext,
      samplePrivateContextFor('east')
    );
    expect(reconstituted).toEqual(sampleReconstitutedClientContextFor('east'));
  });
});
