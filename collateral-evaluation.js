"use strict";

(function installCollateralEvaluation(globalScope) {
  const number = (value) => Number(value) || 0;
  const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
  function evaluate({ principal, value, admissiblePercent, identityChecks, pendingLegal = false }) {
    const capital = number(principal);
    const baseValue = number(value);
    const percentage = number(admissiblePercent);
    const admissibleValue = round(baseValue * (percentage / 100));
    const loanToValue = baseValue ? round((capital / baseValue) * 100) : 0;
    const coverageRatio = capital ? round(admissibleValue / capital) : 0;
    const blockers = identityChecks.filter((item) => !item.value).map((item) => item.label);
    if (pendingLegal) blockers.push("Revisión jurídica pendiente");
    if (!(capital > 0)) blockers.push("Capital solicitado");
    if (!(baseValue > 0)) blockers.push("Valoración de la garantía");
    const sufficient = capital > 0 && admissibleValue >= capital;
    const alerts = sufficient || !capital || !baseValue ? [] : ["La cobertura admisible de la garantía es insuficiente para el capital solicitado."];
    return { principal: capital, marketValue: baseValue, admissibleValue, loanToValue, coverageRatio, sufficient, blockers, alerts, decision: null };
  }
  function evaluateVehicleCollateral(data = {}) {
    return evaluate({ principal: data.principal, value: data.marketValue, admissiblePercent: data.admissiblePercent || 60, identityChecks: [
      { label: "Chasis del vehículo", value: data.chassis }, { label: "Matrícula del vehículo", value: data.registration }
    ] });
  }
  function evaluateMortgageCollateral(data = {}) {
    return evaluate({ principal: data.principal, value: data.appraisalValue, admissiblePercent: data.admissiblePercent || 50, pendingLegal: !data.legalReview, identityChecks: [
      { label: "Título o identificación registral", value: data.titleNumber }, { label: "Ubicación del inmueble", value: data.address }
    ] });
  }
  const api = { evaluateVehicleCollateral, evaluateMortgageCollateral };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalScope.CollateralEvaluation = api;
})(typeof window !== "undefined" ? window : globalThis);

