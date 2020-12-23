import { mergePublicAndPrivateStateContexts } from '../gameLogic/stateMachineUtils/mergePublicAndPrivateStateContexts';
import {
  samplePrivateOnlyContextFor,
  SamplePublicContext,
  sampleReconstitutedClientContextFor,
} from './PublicPrivateContextSampleData';

describe('mergePublicAndPrivateStateContexts', () => {
  test('should reconstitute the full state object from the two sources', () => {
    const reconstituted = mergePublicAndPrivateStateContexts({
      publicContext: SamplePublicContext,
      privateContext: samplePrivateOnlyContextFor('east'),
    });
    expect(reconstituted).toEqual(sampleReconstitutedClientContextFor('east'));
  });
});
