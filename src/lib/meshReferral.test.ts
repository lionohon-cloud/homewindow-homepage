import assert from 'node:assert/strict';

import { resolveMeshConsultChoice } from './meshReferral';

const region = '1101';

assert.deepEqual(resolveMeshConsultChoice('mesh_only', region), {
  region,
  consultField: 'SAFETY_SCREEN',
  meshReferralRequested: true,
});

assert.deepEqual(resolveMeshConsultChoice('with_windows', region), {
  region,
  consultField: 'WINDOW_QUOTE',
  meshReferralRequested: false,
});

console.log('meshReferral tests passed');
