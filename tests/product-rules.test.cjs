const test = require("node:test");
const assert = require("node:assert/strict");
const Rules = require("../product-rules.js");

const productTypes = [
  "motorcycle_cash_sale", "motorcycle_financing", "personal_loan", "commercial_loan",
  "vehicle_secured_loan", "mortgage_secured_loan", "smartphone_financing", "appliance_financing"
];

test("define los ocho productos con ruta, requisitos y documentos", () => {
  assert.deepEqual(Rules.list().map((product) => product.type), productTypes);
  productTypes.forEach((type) => {
    const product = Rules.get(type);
    assert.ok(product.label);
    assert.ok(product.stages.length >= 4);
    assert.ok(product.documents.length >= 2);
  });
});

test("los requisitos cambian según producto y codeudor", () => {
  const personal = Rules.requirements("personal_loan", { people: { codebtor: null } });
  const commercial = Rules.requirements("commercial_loan", { people: { codebtor: null } });
  const secured = Rules.requirements("vehicle_secured_loan", { people: { codebtor: { fullName: "María" } } });
  assert.ok(personal.some((item) => item.id === "income"));
  assert.ok(commercial.some((item) => item.id === "business_cashflow"));
  assert.ok(secured.some((item) => item.id === "vehicle_valuation"));
  assert.ok(secured.some((item) => item.id === "codebtor_identity"));
});

test("las recomendaciones se devuelven aparte y no modifican la operación", () => {
  const operation = { proposal: { term: 19, monthlyRate: 4.25, downPayment: 37500, price: 187500 } };
  const before = JSON.stringify(operation);
  const recommendation = Rules.recommendations("motorcycle_financing", operation);
  assert.equal(JSON.stringify(operation), before);
  assert.ok(recommendation.termOptions.includes(18));
  assert.ok(recommendation.minimumDownPayment > 0);
});

test("valida bloqueos esenciales sin convertirlos en aprobación automática", () => {
  const result = Rules.validate("mortgage_secured_loan", { people: { customer: {} }, proposal: {}, collateral: {} });
  assert.equal(result.ready, false);
  assert.ok(result.blockers.includes("Identidad del cliente"));
  assert.ok(result.blockers.includes("Título o identificación registral"));
  assert.equal(result.decision, null);
});
