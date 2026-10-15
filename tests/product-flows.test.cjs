const test = require("node:test");
const assert = require("node:assert/strict");
const Flows = require("../product-flows.js");

test("cada producto presenta información común y secciones especializadas", () => {
  assert.deepEqual(Flows.sections("personal_loan").map((section) => section.id), ["customer", "financing", "personal_profile", "review"]);
  assert.ok(Flows.sections("commercial_loan").some((section) => section.id === "business"));
  assert.ok(Flows.sections("vehicle_secured_loan").some((section) => section.id === "vehicle_collateral"));
  assert.ok(Flows.sections("mortgage_secured_loan").some((section) => section.id === "mortgage_collateral"));
  assert.ok(Flows.sections("smartphone_financing").some((section) => section.id === "device"));
  assert.ok(Flows.sections("appliance_financing").some((section) => section.id === "appliance"));
  assert.ok(Flows.sections("motorcycle_cash_sale").some((section) => section.id === "profitability"));
});

test("calcula avance y bloqueos desde los requisitos del producto", () => {
  const empty = { people: { customer: {}, codebtor: null }, proposal: {}, evaluation: {}, asset: {}, collateral: {} };
  const state = Flows.completion("personal_loan", empty);
  assert.equal(state.percent, 0);
  assert.ok(state.blockers.length >= 5);
  const ready = {
    people: { customer: { fullName: "Ana Pérez", idNumber: "001-0000000-0", address: "La Vega" }, codebtor: null },
    proposal: { principal: 100000, purpose: "Capital personal" }, evaluation: { monthlyIncome: 50000 }, asset: {}, collateral: {}
  };
  assert.equal(Flows.completion("personal_loan", ready).percent, 100);
});

test("los campos del codeudor aparecen únicamente cuando existe obligación solidaria", () => {
  const without = Flows.fields("personal_loan", { people: { codebtor: null } });
  const withCodebtor = Flows.fields("personal_loan", { people: { codebtor: {} } });
  assert.equal(without.some((field) => field.path.startsWith("people.codebtor")), false);
  assert.equal(withCodebtor.some((field) => field.path === "people.codebtor.idNumber"), true);
});
