const test = require("node:test");
const assert = require("node:assert/strict");

const Core = require("../operation-core.js");

test("crea una operación versionada que separa bien financiado y garantía", () => {
  const operation = Core.create("motorcycle_financing");
  assert.equal(operation.schemaVersion, 1);
  assert.equal(operation.productType, "motorcycle_financing");
  assert.notEqual(operation.asset, operation.collateral);
  assert.deepEqual(operation.people, { customer: {}, codebtor: null });
  assert.match(operation.reference, /^OP-/);
});

test("actualiza una operación sin mutar el expediente anterior", () => {
  const original = Core.create("personal_loan");
  const updated = Core.patch(original, { people: { customer: { fullName: "Ana Pérez" } }, proposal: { principal: 85000 } });
  assert.equal(original.people.customer.fullName, undefined);
  assert.equal(updated.people.customer.fullName, "Ana Pérez");
  assert.equal(updated.proposal.principal, 85000);
});

test("cambiar producto conserva personas y valores financieros escritos pero reinicia requisitos específicos", () => {
  const operation = Core.patch(Core.create("motorcycle_financing"), {
    people: { customer: { fullName: "Luis Díaz" } },
    proposal: { price: 175000, downPayment: 35000, term: 18, monthlyRate: 3.2 },
    asset: { chassis: "ABC123" }, requirements: { old: true }, documents: { quote: "ready" }
  });
  const changed = Core.changeProduct(operation, "smartphone_financing");
  assert.equal(changed.people.customer.fullName, "Luis Díaz");
  assert.equal(changed.proposal.price, 175000);
  assert.equal(changed.proposal.term, 18);
  assert.deepEqual(changed.requirements, {});
  assert.deepEqual(changed.documents, {});
  assert.deepEqual(changed.asset, {});
});

