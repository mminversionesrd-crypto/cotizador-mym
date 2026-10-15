const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');
const app = readFileSync(join(root, 'app.js'), 'utf8');
const styles = readFileSync(join(root, 'styles.css'), 'utf8');

test('la pre-solicitud muestra avance y cuatro bloques de preparación', () => {
  assert.match(app, /preapplication-readiness/);
  assert.match(app, /preReadinessPercent/);
  assert.match(app, /data-readiness-step="control"/);
  assert.match(app, /data-readiness-step="client"/);
  assert.match(app, /data-readiness-step="finance"/);
  assert.match(app, /data-readiness-step="evidence"/);
});

test('recopila ubicación dominicana y un perfil de ingresos útil', () => {
  for (const field of ['preProvince', 'preMunicipality', 'preIncomeType', 'preWorkTime', 'preOtherIncome', 'prePurpose']) {
    assert.match(app, new RegExp(`name=["']${field}["']`));
  }
  assert.match(app, /Distrito Nacional/);
  assert.match(app, /Santo Domingo/);
  assert.match(app, /const income = mainIncome \+ otherIncome/);
});

test('valida cédula y teléfono antes de imprimir', () => {
  assert.match(app, /documentIsValid/);
  assert.match(app, /phoneIsValid/);
  assert.match(app, /validateFormats\(true\)/);
  assert.match(app, /aria-invalid/);
});

test('el rediseño conserva adaptación móvil, impresión y movimiento reducido', () => {
  assert.match(styles, /Pre-solicitud v2/);
  assert.match(styles, /@media screen and \(max-width: 700px\)/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
  assert.match(styles, /body\[data-print-target="preapplication"\]/);
});
