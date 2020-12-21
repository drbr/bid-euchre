import * as lodash from 'lodash';

/*
 * Deepdash's module export is configured in such a way that it needs to be
 * imported differently in the frontend (ES6-Babel bundle) than in the backend
 * (Node-CommonJS).
 *
 * Fortunately, we are only using Deepdash on the backend, so anything that depends
 * on it is in the backend codebase only.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const addDeepdash = require('deepdash');
const lodashWithDeepdash = addDeepdash(lodash);
export default lodashWithDeepdash;
