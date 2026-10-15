const test = require("node:test");
const assert = require("node:assert/strict");
const Calc = require("../operation-calculators.js");

test("calcula capital, interés simple, total y cuota sin mezclar conceptos", () => {
  const result = Calc.calculateProposal({ price: 120000, downPayment: 20000, monthlyRate: 2.5, term: 12, frequency: "monthly" });
  assert.deepEqual(result, { principal: 100000, interest: 30000, total: 130000, installment: 10833.33, paymentCount: 12, frequency: "monthly" });
});

test("distribuye el mismo total en frecuencia mensual, quincenal o semanal", () => {
  assert.equal(Calc.calculateProposal({ principal: 50000, monthlyRate: 3, term: 12, frequency: "monthly" }).paymentCount, 12);
  assert.equal(Calc.calculateProposal({ principal: 50000, monthlyRate: 3, term: 12, frequency: "biweekly" }).paymentCount, 24);
  assert.equal(Calc.calculateProposal({ principal: 50000, monthlyRate: 3, term: 12, frequency: "weekly" }).paymentCount, 48);
});

test("compara tres alternativas ordenadas por objetivo", () => {
  const plans = Calc.compareProposals({ principal: 100000, monthlyRate: 3, termOptions: [6, 12, 18], frequency: "monthly" });
  assert.deepEqual(plans.map((plan) => plan.key), ["lowest_payment", "balanced", "lowest_cost"]);
  assert.equal(plans[0].term, 18);
  assert.equal(plans[2].term, 6);
  assert.ok(plans[0].installment < plans[2].installment);
  assert.ok(plans[2].total < plans[0].total);
});

test("calcula capacidad personal sin aprobar automáticamente", () => {
  const capacity = Calc.calculateCapacity({ monthlyIncome: 60000, monthlyCommitments: 8000, proposedPayment: 11000 });
  assert.equal(capacity.maximumDebtPayment, 21000);
  assert.equal(capacity.availableForNewPayment, 13000);
  assert.equal(capacity.withinCapacity, true);
  assert.equal(capacity.decision, null);
});

test("calcula margen de venta y cobertura comercial", () => {
  const margin = Calc.calculateMargin({ purchaseCost: 80000, transport: 3000, preparation: 2000, accessories: 1000, salePrice: 110000, discount: 5000 });
  assert.equal(margin.totalCost, 86000);
  assert.equal(margin.netSale, 105000);
  assert.equal(margin.grossMargin, 19000);
  assert.equal(margin.marginPercent, 18.1);
  const business = Calc.calculateCommercialCoverage({ sales: 180000, costs: 90000, expenses: 35000, currentDebtPayments: 10000, proposedPayment: 15000 });
  assert.equal(business.availableCashflow, 45000);
  assert.equal(business.coverageRatio, 3);
});

test("rechaza datos financieros que no permiten calcular", () => {
  assert.throws(() => Calc.calculateProposal({ principal: -1, monthlyRate: 3, term: 12 }), /capital/i);
  assert.throws(() => Calc.calculateProposal({ principal: 1000, monthlyRate: 3, term: 0 }), /plazo/i);
});

