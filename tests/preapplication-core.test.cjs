const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateOperation,
  validateParty,
  validateApplication,
  validateDecision
} = require('../preapplication-core.js');

const completeParty = {
  firstName: 'Ana',
  lastName: 'Pérez',
  idNumber: '001-1234567-8',
  phone: '809-555-1212',
  address: 'Calle Principal 10, sector Centro, Santo Domingo',
  landmark1: 'Frente al parque',
  landmark2: 'Al lado de la farmacia',
  dataReport: 'Score consultado; sin atrasos vigentes.'
};

test('calcula la cuota estimada por interés simple con la tasa y plazo escritos', () => {
  assert.deepEqual(calculateOperation({ amount: 100000, monthlyRate: 3, months: 12 }), {
    principal: 100000,
    interest: 36000,
    total: 136000,
    installment: 11333.33
  });
});

test('rechaza montos, tasas o plazos que no permiten calcular la operación', () => {
  assert.equal(calculateOperation({ amount: 0, monthlyRate: 3, months: 12 }), null);
  assert.equal(calculateOperation({ amount: 100000, monthlyRate: -1, months: 12 }), null);
  assert.equal(calculateOperation({ amount: 100000, monthlyRate: 3, months: 0 }), null);
});

test('exige los ocho datos definidos para solicitante y codeudor', () => {
  assert.deepEqual(validateParty(completeParty), {});
  const errors = validateParty({ ...completeParty, address: '', landmark2: '', dataReport: '' });
  assert.equal(errors.address, 'Completa la dirección específica.');
  assert.equal(errors.landmark2, 'Completa la segunda referencia de ubicación.');
  assert.equal(errors.dataReport, 'Escribe el resultado consultado en Data Crédito.');
});

test('valida cédula, teléfono y evita repetir la cédula del solicitante', () => {
  assert.equal(validateParty({ ...completeParty, idNumber: '123' }).idNumber, 'Escribe una cédula de 11 dígitos.');
  assert.equal(validateParty({ ...completeParty, phone: '123' }).phone, 'Escribe un teléfono de 10 dígitos.');
  const errors = validateApplication({ applicant: completeParty, hasCoDebtor: true, coDebtor: { ...completeParty } });
  assert.equal(errors.coDebtor.idNumber, 'El codeudor debe usar una cédula diferente.');
});

test('solo exige los datos del codeudor cuando se activa', () => {
  assert.deepEqual(validateApplication({ applicant: completeParty, hasCoDebtor: false, coDebtor: {} }).coDebtor, {});
  assert.ok(validateApplication({ applicant: completeParty, hasCoDebtor: true, coDebtor: {} }).coDebtor.firstName);
});

test('la decisión permite tres resultados y exige explicar la aprobación observada', () => {
  assert.equal(validateDecision({ decision: '' }), 'Selecciona la decisión final.');
  assert.equal(validateDecision({ decision: 'Aprobado' }), '');
  assert.equal(validateDecision({ decision: 'Rechazado' }), '');
  assert.equal(validateDecision({ decision: 'Aprobado con observaciones', observations: '' }), 'Escribe las observaciones o condiciones de aprobación.');
  assert.equal(validateDecision({ decision: 'Aprobado con observaciones', observations: 'Presentar garante solidario.' }), '');
});
