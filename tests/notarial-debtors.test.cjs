const assert = require('node:assert/strict');
const test = require('node:test');
const { composeDebtorParties } = require('../document-engine/notarial-debtors.js');

const principal = {
  name: 'ANA GARCÍA', id: '001-1234567-8', gender: 'female',
  nationality: 'Dominicana', civilStatus: 'Soltera', occupation: 'Comerciante',
  address: 'CALLE UNO, CASA NÚMERO 2, SECTOR CENTRO, CIUDAD DE LA VEGA, PROVINCIA LA VEGA, REPÚBLICA DOMINICANA'
};
const codebtor = {
  name: 'JUAN PÉREZ', id: '002-1234567-8', gender: 'male',
  nationality: 'Dominicano', civilStatus: 'Casado', occupation: 'Empleado privado',
  address: 'CALLE DOS, CASA NÚMERO 4, SECTOR NORTE, CIUDAD DE LA VEGA, PROVINCIA LA VEGA, REPÚBLICA DOMINICANA'
};

test('un deudor conserva la redacción singular y una sola firma de deudor', () => {
  const result = composeDebtorParties({ principal });
  assert.match(result.appearance, /ANA GARCÍA/);
  assert.match(result.appearance, /Quien me ha.*DECLARADO LO SIGUIENTE/);
  assert.match(result.firstClause, /LA DEUDORA.*declara y reconoce ser deudora personal/);
  assert.equal(result.signatures.length, 1);
  assert.equal(result.signatures[0].role, 'DEUDORA');
});

test('dos comparecientes constan con generales separadas, solidaridad expresa y ambas firmas', () => {
  const result = composeDebtorParties({ principal, codebtor });
  assert.match(result.appearance, /ANA GARCÍA.*001-1234567-8.*CALLE UNO.*JUAN PÉREZ.*002-1234567-8.*CALLE DOS/s);
  assert.match(result.appearance, /CODEUDOR SOLIDARIO.*ambos serán denominados.*LOS DEUDORES.*Ambos me han.*DECLARADO LO SIGUIENTE/s);
  assert.match(result.firstClause, /LOS DEUDORES.*solidariamente/is);
  assert.match(result.solidarityClause, /acreedor podrá reclamar.*cualquiera.*sin cobrar más de lo efectivamente adeudado/is);
  assert.match(result.secondClause, /LOS DEUDORES.*consienten/);
  assert.match(result.thirdClause, /LOS DEUDORES RECONOCEN ADEUDAR/);
  assert.match(result.fourthClause, /LOS DEUDORES/);
  assert.match(result.fourthConsequence, /perderán/);
  assert.match(result.fifthClause, /LOS DEUDORES.*sus respectivos bienes/i);
  assert.doesNotMatch(result.fifthClause, /excusión|fiador/i);
  assert.deepEqual(result.signatures.map(({ name, role }) => [name, role]), [
    ['ANA GARCÍA', 'DEUDORA PRINCIPAL'], ['JUAN PÉREZ', 'CODEUDOR SOLIDARIO']
  ]);
});

test('los datos de los comparecientes se escapan antes de insertarse en el pagaré', () => {
  const result = composeDebtorParties({ principal: { ...principal, name: '<script>alert(1)</script>' }, codebtor });
  assert.doesNotMatch(result.appearance, /<script>/);
  assert.match(result.appearance, /&lt;script&gt;/i);
});

test('dos deudoras se identifican en femenino y firman con roles femeninos', () => {
  const result = composeDebtorParties({ principal, codebtor: { ...codebtor, gender: 'female' } });
  assert.match(result.appearance, /CODEUDORA SOLIDARIA.*ambas serán denominadas.*LAS DEUDORAS.*Ambas me han/s);
  assert.match(result.firstClause, /LAS DEUDORAS/);
  assert.match(result.solidarityClause, /La codeudora asume/);
  assert.equal(result.signatures[1].role, 'CODEUDORA SOLIDARIA');
});
