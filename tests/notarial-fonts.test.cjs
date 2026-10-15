const test = require('node:test');
const assert = require('node:assert/strict');
const { selectNotarialFont, waitForNotarialFont } = require('../document-engine/notarial-fonts.js');

test('Myriad Pro selects its own print class and an explicit Windows fallback', () => {
  assert.deepEqual(selectNotarialFont('myriad'), {
    className: 'notarial-font--myriad',
    cssFamily: '"Myriad Pro", "Segoe UI", Arial, sans-serif'
  });
});

test('unknown print fonts fall back to the original Courier style', () => {
  assert.equal(selectNotarialFont('missing').className, 'notarial-font--courier');
});

test('printing waits for the selected font to finish loading before pagination', async () => {
  let finishLoading;
  const loading = new Promise((resolve) => { finishLoading = resolve; });
  const calls = [];
  const fontSet = {
    load: (shorthand) => { calls.push(shorthand); return loading; },
    ready: Promise.resolve()
  };
  let completed = false;
  const pending = waitForNotarialFont(fontSet, 'myriad').then(() => { completed = true; });
  await Promise.resolve();
  assert.equal(completed, false);
  assert.deepEqual(calls, ['10pt "Myriad Pro", "Segoe UI", Arial, sans-serif']);
  finishLoading();
  await pending;
  assert.equal(completed, true);
});
