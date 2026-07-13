import assert from 'node:assert/strict';

import {
  MESH_CONSULT_OPTIONS,
  resolveMeshConsultChoice,
} from './meshReferral';

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

assert.deepEqual(
  MESH_CONSULT_OPTIONS.map(({ choice, label }) => ({ choice, label })),
  [
    {
      choice: 'mesh_only',
      label: '네, 방충망만 할게요 (제휴사에서 연락 부탁드려요)',
    },
    {
      choice: 'with_windows',
      label: '아니오, 창호랑 같이 하고 싶어요',
    },
    {
      choice: 'other_consult',
      label: '아니에요 괜찮아요',
    },
  ],
);

assert.equal(
  resolveMeshConsultChoice('other_consult', region),
  null,
);

console.log('meshReferral tests passed');
