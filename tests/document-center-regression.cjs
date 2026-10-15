const test = require("node:test");
const assert = require("node:assert/strict");
const Center = require("../document-center.js");

test("devuelve los documentos aplicables al producto sin inventar otros", () => {
  const documents = Center.available({ productType: "motorcycle_financing", people: { customer: {}, codebtor: null }, proposal: {}, asset: {}, evaluation: {} });
  assert.deepEqual(documents.map((item) => item.type), ["quote", "application", "promissory", "amortization", "payment_receipt", "motorcycle_delivery"]);
});

test("un documento indica los datos compartidos faltantes y queda bloqueado", () => {
  const state = Center.readiness("promissory", { productType: "personal_loan", people: { customer: {}, codebtor: null }, proposal: {}, evaluation: {}, asset: {}, collateral: {} });
  assert.equal(state.ready, false);
  assert.ok(state.blockers.includes("Identidad del cliente"));
});

test("el codeudor solo aparece cuando está identificado como solidario", () => {
  const without = Center.documentData("promissory", { productType: "personal_loan", people: { customer: { fullName: "Ana" }, codebtor: null }, proposal: {} });
  const withCodebtor = Center.documentData("promissory", { productType: "personal_loan", people: { customer: { fullName: "Ana" }, codebtor: { fullName: "Luis", role: "solidary_codebtor" } }, proposal: {} });
  assert.equal(without.codebtor, null);
  assert.equal(withCodebtor.codebtor.fullName, "Luis");
});
