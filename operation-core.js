"use strict";

(function installOperationCore(globalScope) {
  const SCHEMA_VERSION = 1;
  const securedProducts = new Set(["vehicle_secured_loan", "mortgage_secured_loan"]);
  const assetProducts = new Set(["motorcycle_cash_sale", "motorcycle_financing", "smartphone_financing", "appliance_financing"]);

  const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
  const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);
  function merge(base, changes) {
    const result = clone(base) || {};
    Object.entries(changes || {}).forEach(([key, value]) => {
      result[key] = isObject(value) && isObject(result[key]) ? merge(result[key], value) : clone(value);
    });
    return result;
  }
  function reference() {
    const now = new Date();
    const stamp = now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
    return `OP-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }
  function create(productType = "personal_loan") {
    return {
      schemaVersion: SCHEMA_VERSION,
      reference: reference(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      productType,
      stage: "start",
      status: "draft",
      people: { customer: {}, codebtor: null },
      proposal: { currency: "DOP" },
      asset: {},
      collateral: {},
      evaluation: {},
      requirements: {},
      documents: {},
      decision: {},
      audit: []
    };
  }
  function patch(operation, changes) {
    const next = merge(operation, changes);
    next.updatedAt = new Date().toISOString();
    return next;
  }
  function changeProduct(operation, productType) {
    const next = patch(operation, {
      productType,
      stage: "configure",
      status: "draft",
      requirements: operation.requirements,
      documents: operation.documents,
      evaluation: operation.evaluation,
      decision: operation.decision
    });
    next.requirements = {};
    next.documents = {};
    next.evaluation = {};
    next.decision = {};
    next.asset = assetProducts.has(productType) ? {} : {};
    next.collateral = securedProducts.has(productType) ? {} : {};
    next.audit = [...(operation.audit || []), { type: "product_changed", at: next.updatedAt, productType }];
    return next;
  }

  const api = { SCHEMA_VERSION, create, patch, changeProduct, clone };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalScope.OperationCore = api;
})(typeof window !== "undefined" ? window : globalThis);

