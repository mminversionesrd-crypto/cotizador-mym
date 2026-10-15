"use strict";

(function installDocumentCenter(globalScope) {
  const Rules = globalScope.ProductRules || (typeof require === "function" ? require("./product-rules.js") : null);
  const labels = {
    quote: "Cotización", application: "Solicitud de crédito", evaluation: "Evaluación",
    promissory: "Pagaré bajo firma privada", promissory_notarial: "Pagaré notarial",
    amortization: "Tabla de amortización", payment_receipt: "Recibo de ingreso",
    disbursement: "Orden de desembolso", motorcycle_delivery: "Acta de entrega de motocicleta",
    asset_delivery: "Acta de entrega del bien", collateral_sheet: "Ficha de garantía"
  };
  const targets = { quote: "quote", application: "application", evaluation: "evaluation", promissory: "promissory", promissory_notarial: "notarial-promissory", amortization: "quote", payment_receipt: "payment", disbursement: "disbursement", motorcycle_delivery: "motorcycle-delivery", asset_delivery: "motorcycle-delivery", collateral_sheet: "evaluation" };
  function readiness(documentType, operation) {
    const validation = Rules.validate(operation.productType, operation);
    const extra = [];
    if (["promissory", "promissory_notarial", "amortization", "disbursement"].includes(documentType) && !(Number(operation.proposal?.principal) > 0)) extra.push("Capital solicitado");
    return { ready: validation.ready && extra.length === 0, blockers: [...new Set([...validation.blockers, ...extra])] };
  }
  function available(operation) {
    return Rules.get(operation.productType).documents.map((type) => ({ type, label: labels[type] || type, target: targets[type] || null, ...readiness(type, operation) }));
  }
  function documentData(documentType, operation) {
    const codebtor = operation.people?.codebtor?.role === "solidary_codebtor" ? operation.people.codebtor : null;
    return {
      documentType,
      reference: operation.reference,
      customer: operation.people?.customer || {},
      codebtor,
      proposal: operation.proposal || {},
      asset: operation.asset || {},
      collateral: operation.collateral || {},
      evaluation: operation.evaluation || {}
    };
  }
  const api = { available, readiness, documentData };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalScope.DocumentCenter = api;
})(typeof window !== "undefined" ? window : globalThis);

