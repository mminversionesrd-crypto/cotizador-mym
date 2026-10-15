const assert = require("node:assert/strict");
const test = require("node:test");
const Core = require("../operation-core.js");
const Rules = require("../product-rules.js");
const Flows = require("../product-flows.js");
const Documents = require("../document-center.js");
const Calculators = require("../operation-calculators.js");

function atPath(source, path, value) {
  const parts = path.split(".");
  let cursor = source;
  parts.forEach((part, index) => {
    if (index === parts.length - 1) cursor[part] = value;
    else cursor = cursor[part] ||= {};
  });
}

function complete(type) {
  const operation = Core.create(type);
  operation.proposal = { currency: "DOP", principal: 100000, price: 120000, downPayment: 20000, term: 12, monthlyRate: 3, frequency: "monthly", purpose: "Operación declarada" };
  Rules.requirements(type, operation).forEach((requirement) => {
    const current = requirement.path.split(".").reduce((value, key) => value?.[key], operation);
    if (current !== undefined && current !== null && current !== "" && current !== false) return;
    atPath(operation, requirement.path, requirement.path.match(/Value|Income|Cashflow|price/i) ? 200000 : requirement.path === "collateral.legalReview" ? true : "Dato confirmado");
  });
  return operation;
}

test("los ocho procesos llegan a documentos sin duplicar el expediente", () => {
  const products = Rules.list();
  assert.equal(products.length, 8);
  products.forEach(({ type }) => {
    const operation = complete(type);
    assert.equal(Flows.completion(type, operation).ready, true, type);
    const documents = Documents.available(operation);
    assert.equal(documents.length > 0, true, type);
    assert.equal(documents.every((document) => document.ready), true, `${type}: ${documents.flatMap((document) => document.blockers).join(", ")}`);
    assert.equal(Flows.sections(type).some((section) => section.id === "review"), true, type);
  });
});

test("cambiar de producto conserva cliente y cifras escritas", () => {
  const source = Core.patch(complete("motorcycle_financing"), { people: { customer: { fullName: "Ana Pérez", idNumber: "001-1234567-8", address: "La Vega" } }, proposal: { principal: 87500, monthlyRate: 2.75, term: 18 } });
  const changed = Core.changeProduct(source, "smartphone_financing");
  assert.equal(changed.people.customer.fullName, "Ana Pérez");
  assert.equal(changed.proposal.principal, 87500);
  assert.equal(changed.proposal.monthlyRate, 2.75);
  assert.equal(changed.proposal.term, 18);
});

test("capital, intereses y total permanecen separados", () => {
  const result = Calculators.calculateProposal({ principal: 100000, monthlyRate: 3, term: 12, frequency: "monthly" });
  assert.equal(result.principal, 100000);
  assert.equal(result.interest, 36000);
  assert.equal(result.total, 136000);
  assert.equal(result.principal + result.interest, result.total);
});

test("el codeudor solo se incorpora cuando está marcado como solidario", () => {
  const operation = complete("personal_loan");
  operation.people.codebtor = { role: "reference", fullName: "Persona de referencia", idNumber: "001" };
  assert.equal(Documents.documentData("promissory", operation).codebtor, null);
  operation.people.codebtor.role = "solidary_codebtor";
  assert.equal(Documents.documentData("promissory", operation).codebtor.fullName, "Persona de referencia");
});
