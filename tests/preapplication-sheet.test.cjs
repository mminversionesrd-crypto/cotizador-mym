const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');
const index = readFileSync(join(root, 'index.html'), 'utf8');
const app = readFileSync(join(root, 'app.js'), 'utf8');
const styles = readFileSync(join(root, 'styles.css'), 'utf8');

test('carga el cálculo antes de iniciar la interfaz', () => {
  const corePosition = index.indexOf('preapplication-core.js');
  const appPosition = index.indexOf('app.js');
  assert.ok(corePosition >= 0);
  assert.ok(corePosition < appPosition);
});

test('la operación aparece antes que solicitante y codeudor', () => {
  const operation = app.indexOf('preapplication-v3-operation');
  const applicant = app.indexOf('preapplication-v3-applicant');
  const coDebtor = app.indexOf('preapplication-v3-codebtor');
  assert.ok(operation >= 0 && operation < applicant && applicant < coDebtor);
  for (const field of ['preOperationType', 'preAmount', 'prePurpose', 'preRate', 'preTerm', 'prePayment']) assert.match(app, new RegExp(`name="${field}"`));
});

test('solicitante y codeudor incluyen los mismos datos y sus cédulas', () => {
  for (const suffix of ['FirstName', 'LastName', 'IdNumber', 'Phone', 'Address', 'Landmark1', 'Landmark2', 'DataReport', 'IdPhoto']) {
    assert.match(app, new RegExp(`name="preApplicant${suffix}"`));
    assert.match(app, new RegExp(`name="preCoDebtor${suffix}"`));
  }
  assert.match(app, /name="preHasCoDebtor"/);
});

test('incluye las tres decisiones y observaciones condicionales', () => {
  assert.match(app, /value="Aprobado"/);
  assert.match(app, /value="Rechazado"/);
  assert.match(app, /value="Aprobado con observaciones"/);
  assert.match(app, /name="preDecisionObservations"/);
});

test('la ficha se imprime en una sola hoja carta horizontal con dos cédulas grandes', () => {
  assert.match(styles, /@page\s+preapplication-landscape\s*\{[^}]*size:\s*letter landscape/s);
  assert.match(styles, /page:\s*preapplication-landscape/);
  assert.match(styles, /height:\s*7\.65in/);
  assert.match(styles, /max-height:\s*7\.65in/);
  assert.match(styles, /preapplication-v3-print-ids/);
  assert.match(styles, /object-fit:\s*contain/);
});
