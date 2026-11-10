'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { record, recordDirect, movements, monthlyTargets, nextMonth } = require('../performance-core');

const today = '2026-11-10';
const credit = () => ({ reference: 'OP-1', productType: 'motorcycle_financing', crm: { stage: 'formalization', approvedAmount: 1000 } });
const entry = (id, date, amount, kind = 'credit', employee = 'credit-executive') =>
  ({ id, date, amount, kind, employee, note: 'Receipt ' + id });
const add = (op, item) => { op.performance = record(op, item, today); };
const values = (op, indicator) => movements([op], indicator).map(({ date, value, employee }) => [date, value, employee]);

test('una venta financiada separa la entrega, el monto vendido y el capital desembolsado', () => {
  const op = credit();
  add(op, entry('sale', '2026-10-29', 1450, 'sale', 'sales-executive'));
  add(op, entry('first', '2026-10-30', 350));
  add(op, entry('second', '2026-11-04', 650));
  assert.deepEqual(values(op, 'saleCount'), [['2026-10-29', 1, 'sales-executive']]);
  assert.deepEqual(values(op, 'saleAmount'), [['2026-10-29', 1450, 'sales-executive']]);
  assert.deepEqual(values(op, 'creditCount'), [['2026-10-30', 1, 'credit-executive']]);
  assert.deepEqual(values(op, 'creditAmount'), [['2026-10-30', 350, 'credit-executive'], ['2026-11-04', 650, 'credit-executive']]);
  assert.throws(() => add(op, entry('third', today, 1)), /supera el capital/);
  assert.throws(() => add(op, entry('other-sale', today, 100, 'sale')), /entrega confirmada/);
});

test('una reversión parcial conserva la unidad hasta revertir el último desembolso vigente', () => {
  const op = credit();
  add(op, entry('first', '2026-10-31', 400));
  add(op, entry('second', '2026-11-01', 600));
  add(op, { id: 'r1', reverses: 'first', date: '2026-11-02', note: 'Reversión parcial' });
  assert.equal(values(op, 'creditCount').length, 1);
  assert.equal(values(op, 'creditAmount').at(-1)[1], -400);
  assert.throws(() => add(op, { id: 'duplicate', reverses: 'first', date: today, note: 'Duplicada' }), /ya fue revertido/);
  add(op, { id: 'r2', reverses: 'second', date: today, note: 'Reversión final' });
  assert.deepEqual(values(op, 'creditCount').at(-1), [today, -1, 'credit-executive']);
});

test('una operación de contado solo aporta a ventas y las propuestas no acreditan resultados', () => {
  const op = { ...credit(), productType: 'motorcycle_cash_sale' };
  assert.throws(() => add(op, entry('loan', today, 100)), /contado/);
  op.crm.stage = 'approved';
  assert.throws(() => add(op, entry('sale', today, 100, 'sale')), /formalización/);
  assert.deepEqual(values(op, 'saleCount'), []);
});

test('la meta recurrente rige hasta el próximo cambio y conserva los períodos anteriores', () => {
  const legacy = { employee: 'ana', metric: 'saleCount', month: '2026-09', target: 8 };
  const first = { ...legacy, month: '2026-10', target: 12, recurring: true };
  const second = { ...first, month: '2027-01', target: 18 };
  const other = { ...first, employee: 'luis', target: 4 };
  const goals = [second, legacy, first, other];
  assert.deepEqual(monthlyTargets(goals, '2026-08'), []);
  assert.deepEqual(monthlyTargets(goals, '2026-09'), [legacy]);
  assert.deepEqual(monthlyTargets(goals, '2026-12'), [first, other]);
  assert.deepEqual(monthlyTargets(goals, '2027-02'), [second, other]);
});

test('una venta directa acredita una unidad y una reversión resta del mes en que se registra', () => {
  let performance = recordDirect([], entry('sale', '2026-10-30', 1200, 'sale'), today);
  performance = recordDirect(performance, { id: 'r1', reverses: 'sale', date: '2026-11-03', note: 'Anulada' }, today);
  const source = { reference: 'Comprobante 1', direct: true, performance };
  assert.deepEqual(movements([source], 'saleCount').map((row) => [row.date, row.value, row.direct]),
    [['2026-10-30', 1, true], ['2026-11-03', -1, true]]);
  assert.equal(movements([source], 'creditAmount').length, 0);
});

test('una nueva entrega no se puede registrar antes de la reversión de la entrega previa', () => {
  const op = credit();
  add(op, entry('first', '2026-10-30', 1450, 'sale'));
  add(op, { id: 'reverse', reverses: 'first', date: '2026-11-04', note: 'Anulada' });
  assert.throws(() => add(op, entry('second', '2026-11-01', 1450, 'sale')), /anterior a otro movimiento/);
  add(op, entry('second', '2026-11-05', 1450, 'sale'));
  assert.deepEqual(values(op, 'saleCount').map((row) => row[1]), [1, -1, 1]);
});

test('la baja deja intacta la meta del mes en curso y excluye los objetivos futuros del ejecutivo', () => {
  const endsBefore = nextMonth('2026-12');
  assert.equal(endsBefore, '2027-01');
  const goal = { employee: 'ana', metric: 'saleCount', target: 10, month: '2026-08', recurring: true, endsBefore };
  const scheduled = { ...goal, month: '2027-02', target: 20 };
  assert.deepEqual(monthlyTargets([goal, scheduled], '2026-12'), [goal]);
  assert.deepEqual(monthlyTargets([goal, scheduled], '2027-02'), []);
});
