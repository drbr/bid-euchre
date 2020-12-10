import * as _ from 'lodash';
import { PartialDeep } from 'type-fest';
import { EventCountContext } from './TypedStateInterfaces';

// Get one copy of the partial private state, merge it with the public state.
export function mergePublicAndPrivateStates<C>(
  publicContext: PartialDeep<C> & EventCountContext,
  privateContext: PartialDeep<C> & EventCountContext
): C {
  return _.merge(publicContext, privateContext) as C;
}
