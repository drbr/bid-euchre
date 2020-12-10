import * as _ from 'lodash';
import { PartialDeep } from 'type-fest';
import { EventCountContext } from './TypedStateInterfaces';

/**
 * Merges the two contexts together.
 */
export function mergePublicAndPrivateStateContexts<C>(params: {
  publicContext: PartialDeep<C> & EventCountContext;
  privateContext: PartialDeep<C> & EventCountContext;
}): C {
  return _.merge({}, params.publicContext, params.privateContext) as C;
}
