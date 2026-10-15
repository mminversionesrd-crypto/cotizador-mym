const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function workerHarness() {
  const handlers = new Map();
  const html = { type: 'html' };
  let installed = [];
  const cached = new Map([['./index.html', html]]);
  const context = {
    self: { addEventListener: (name, handler) => handlers.set(name, handler), skipWaiting() {}, clients: { claim() {} } },
    caches: {
      open: async () => ({ addAll: async (files) => { installed = files; }, put: async () => {} }),
      match: async (request) => cached.get(request.url || request) || null,
      keys: async () => [],
      delete: async () => true
    },
    fetch: async () => { throw new Error('offline'); },
    Response: { error: () => ({ type: 'error' }) }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'service-worker.js'), 'utf8'), context);
  return {
    install: async () => { let done; handlers.get('install')({ waitUntil: (promise) => { done = promise; } }); await done; return installed; },
    fetch: async (request) => { let result; handlers.get('fetch')({ request, respondWith: (promise) => { result = promise; } }); return result; }
  };
}

test('el modo sin conexión nunca entrega index.html en lugar de JavaScript', async () => {
  const worker = workerHarness();
  const result = await worker.fetch({ method: 'GET', mode: 'no-cors', url: 'https://example.test/pagare-notarial.js' });
  assert.equal(result.type, 'error');
});

test('el modo sin conexión conserva todos los archivos del motor notarial', async () => {
  const worker = workerHarness();
  const files = await worker.install();
  for (const file of ['./pagare-notarial.js', './pagare-notarial.css', './document-engine/notarial-fonts.js', './document-engine/notarial-debtors.js', './document-engine/pagination-engine.js']) {
    assert.equal(files.includes(file), true, `${file} debe estar precargado`);
  }
});
