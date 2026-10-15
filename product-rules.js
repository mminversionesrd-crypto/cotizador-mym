"use strict";

(function installProductRules(globalScope) {
  const commonStages = ["identify", "configure", "simulate", "evaluate", "documents"];
  const commonRequirements = [
    { id: "customer_identity", label: "Identidad del cliente", path: "people.customer.idNumber" },
    { id: "customer_name", label: "Nombre del cliente", path: "people.customer.fullName" },
    { id: "customer_address", label: "Domicilio del cliente", path: "people.customer.address" }
  ];
  const products = [
    { type: "motorcycle_cash_sale", label: "Compra y venta de motocicleta", family: "sale", icon: "fa-motorcycle", stages: ["identify", "configure", "profitability", "documents", "delivery"], documents: ["quote", "payment_receipt", "motorcycle_delivery"], termOptions: [0], minimumDownPercent: 100, requirements: [
      { id: "motorcycle_identity", label: "Identificación de la motocicleta", path: "asset.chassis" }, { id: "sale_price", label: "Precio de venta", path: "proposal.price" }
    ] },
    { type: "motorcycle_financing", label: "Financiamiento de motocicleta", family: "financing", icon: "fa-motorcycle", stages: [...commonStages, "delivery"], documents: ["quote", "application", "promissory", "amortization", "payment_receipt", "motorcycle_delivery"], termOptions: [6, 12, 15, 18, 24, 30, 36], minimumDownPercent: 15, suggestedMonthlyRate: 3, requirements: [
      { id: "income", label: "Ingresos del cliente", path: "evaluation.monthlyIncome" }, { id: "motorcycle_identity", label: "Motocicleta cotizada", path: "asset.model" }, { id: "down_payment", label: "Inicial", path: "proposal.downPayment", allowZero: false }
    ] },
    { type: "personal_loan", label: "Préstamo personal", family: "loan", icon: "fa-hand-holding-dollar", stages: commonStages, documents: ["application", "evaluation", "promissory", "amortization", "disbursement"], termOptions: [3, 6, 9, 12, 18, 24], suggestedMonthlyRate: 3, requirements: [
      { id: "income", label: "Ingresos del cliente", path: "evaluation.monthlyIncome" }, { id: "debt_origin", label: "Destino real del préstamo", path: "proposal.purpose" }, { id: "principal", label: "Capital solicitado", path: "proposal.principal" }
    ] },
    { type: "commercial_loan", label: "Préstamo comercial", family: "business", icon: "fa-store", stages: commonStages, documents: ["application", "evaluation", "promissory", "amortization", "disbursement"], termOptions: [3, 6, 9, 12, 18, 24, 36], suggestedMonthlyRate: 3, requirements: [
      { id: "business_cashflow", label: "Flujo disponible del negocio", path: "evaluation.business.availableCashflow" }, { id: "business_activity", label: "Actividad del negocio", path: "evaluation.business.activity" }, { id: "principal", label: "Capital solicitado", path: "proposal.principal" }
    ] },
    { type: "vehicle_secured_loan", label: "Préstamo con garantía de vehículo", family: "secured", icon: "fa-car-rear", stages: [...commonStages, "collateral"], documents: ["application", "evaluation", "promissory", "amortization", "disbursement", "collateral_sheet"], termOptions: [6, 12, 18, 24, 36], maximumLoanToValue: .6, suggestedMonthlyRate: 3, requirements: [
      { id: "income", label: "Ingresos del cliente", path: "evaluation.monthlyIncome" }, { id: "vehicle_identity", label: "Chasis de la garantía", path: "collateral.chassis" }, { id: "vehicle_valuation", label: "Valoración del vehículo", path: "collateral.marketValue" }, { id: "registration", label: "Matrícula del vehículo", path: "collateral.registration" }
    ] },
    { type: "mortgage_secured_loan", label: "Préstamo con garantía hipotecaria", family: "secured", icon: "fa-house-lock", stages: [...commonStages, "collateral", "legal_review"], documents: ["application", "evaluation", "promissory_notarial", "amortization", "disbursement", "collateral_sheet"], termOptions: [12, 24, 36, 48, 60], maximumLoanToValue: .5, suggestedMonthlyRate: 2.5, requirements: [
      { id: "income", label: "Ingresos del cliente", path: "evaluation.monthlyIncome" }, { id: "property_title", label: "Título o identificación registral", path: "collateral.titleNumber" }, { id: "property_valuation", label: "Tasación del inmueble", path: "collateral.appraisalValue" }, { id: "legal_review", label: "Revisión jurídica", path: "collateral.legalReview" }
    ] },
    { type: "smartphone_financing", label: "Financiamiento de smartphone", family: "financing", icon: "fa-mobile-screen-button", stages: [...commonStages, "delivery"], documents: ["quote", "application", "promissory", "amortization", "payment_receipt", "asset_delivery"], termOptions: [3, 6, 9, 12], minimumDownPercent: 20, suggestedMonthlyRate: 3, requirements: [
      { id: "income", label: "Ingresos del cliente", path: "evaluation.monthlyIncome" }, { id: "device_model", label: "Modelo del smartphone", path: "asset.model" }, { id: "device_imei", label: "IMEI o serie", path: "asset.serial" }
    ] },
    { type: "appliance_financing", label: "Financiamiento de electrodoméstico", family: "financing", icon: "fa-plug-circle-bolt", stages: [...commonStages, "delivery"], documents: ["quote", "application", "promissory", "amortization", "payment_receipt", "asset_delivery"], termOptions: [3, 6, 9, 12, 18, 24], minimumDownPercent: 15, suggestedMonthlyRate: 3, requirements: [
      { id: "income", label: "Ingresos del cliente", path: "evaluation.monthlyIncome" }, { id: "appliance_model", label: "Electrodoméstico", path: "asset.model" }, { id: "appliance_serial", label: "Número de serie", path: "asset.serial" }
    ] }
  ];
  const productMap = new Map(products.map((product) => [product.type, product]));
  const valueAt = (source, path) => path.split(".").reduce((value, key) => value?.[key], source);
  const present = (value, requirement) => requirement.allowZero ? value !== undefined && value !== null && value !== "" : Boolean(value);

  function get(type) {
    const product = productMap.get(type);
    if (!product) throw new Error(`Producto financiero desconocido: ${type}`);
    return JSON.parse(JSON.stringify(product));
  }
  function list() { return products.map((product) => get(product.type)); }
  function requirements(type, operation = {}) {
    const product = get(type);
    const items = [...commonRequirements, ...product.requirements];
    if (operation.people?.codebtor) items.push({ id: "codebtor_identity", label: "Identidad del codeudor solidario", path: "people.codebtor.idNumber" });
    return items;
  }
  function recommendations(type, operation = {}) {
    const product = get(type);
    const price = Number(operation.proposal?.price) || 0;
    return {
      termOptions: product.termOptions || [],
      suggestedMonthlyRate: product.suggestedMonthlyRate || 0,
      minimumDownPercent: product.minimumDownPercent || 0,
      minimumDownPayment: price * ((product.minimumDownPercent || 0) / 100),
      maximumLoanToValue: product.maximumLoanToValue || null
    };
  }
  function validate(type, operation = {}) {
    const missing = requirements(type, operation).filter((item) => !present(valueAt(operation, item.path), item));
    return { ready: missing.length === 0, blockers: missing.map((item) => item.label), missing, decision: null };
  }
  const api = { get, list, requirements, recommendations, validate };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalScope.ProductRules = api;
})(typeof window !== "undefined" ? window : globalThis);

