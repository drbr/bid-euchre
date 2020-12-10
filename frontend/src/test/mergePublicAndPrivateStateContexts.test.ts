import { mergePublicAndPrivateStateContexts } from '../gameLogic/stateMachineUtils/mergePublicAndPrivateStateContexts';
import {
  samplePrivateContextFor,
  SamplePublicContext,
  sampleReconstitutedClientContextFor,
} from './PublicPrivateStateSampleData';

describe('mergePublicAndPrivateStateContexts', () => {
  test('should reconstitute the full state object from the two sources', () => {
    const reconstituted = mergePublicAndPrivateStateContexts({
      publicContext: SamplePublicContext,
      privateContext: samplePrivateContextFor('east'),
    });
    expect(reconstituted).toEqual(sampleReconstitutedClientContextFor('east'));
  });
});
