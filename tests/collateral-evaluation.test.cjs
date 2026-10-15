const test = require("node:test");
const assert = require("node:assert/strict");
const Collateral = require("../collateral-evaluation.js");

test("evalúa cobertura vehicular y señala identificación faltante", () => {
  const result = Collateral.evaluateVehicleCollateral({ principal: 300000, marketValue: 600000, admissiblePercent: 60, chassis: "", registration: "MAT-10" });
  assert.equal(result.loanToValue, 50);
  assert.equal(result.admissibleValue, 360000);
  assert.equal(result.coverageRatio, 1.2);
  assert.equal(result.sufficient, true);
  assert.ok(result.blockers.includes("Chasis del vehículo"));
  assert.equal(result.decision, null);
});

test("evalúa garantía hipotecaria y conserva revisión jurídica como bloqueo", () => {
  const result = Collateral.evaluateMortgageCollateral({ principal: 2000000, appraisalValue: 5000000, admissiblePercent: 50, titleNumber: "T-123", legalReview: false });
  assert.equal(result.loanToValue, 40);
  assert.equal(result.admissibleValue, 2500000);
  assert.equal(result.sufficient, true);
  assert.ok(result.blockers.includes("Revisión jurídica pendiente"));
  assert.equal(result.decision, null);
});

test("una garantía insuficiente alerta sin rechazar automáticamente", () => {
  const result = Collateral.evaluateVehicleCollateral({ principal: 500000, marketValue: 600000, admissiblePercent: 60, chassis: "CH-1", registration: "MAT-1" });
  assert.equal(result.sufficient, false);
  assert.ok(result.alerts.some((message) => /insuficiente/i.test(message)));
  assert.equal(result.decision, null);
});
