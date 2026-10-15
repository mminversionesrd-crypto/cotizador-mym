"use strict";

(function installOperationRepository(globalScope) {
  const STORAGE_KEY = "mm-financing-operation-v1";
  const fallbackValues = new Map();
  const fallbackStorage = {
    getItem: (key) => fallbackValues.get(key) ?? null,
    setItem: (key, value) => fallbackValues.set(key, String(value)),
    removeItem: (key) => fallbackValues.delete(key)
  };
  function validate(operation) {
    if (!operation || typeof operation !== "object") throw new Error("El archivo no contiene una operación válida.");
    if (operation.schemaVersion !== 1) throw new Error("La versión del expediente no es compatible.");
    if (!operation.reference || !operation.productType) throw new Error("El expediente no contiene referencia o producto.");
    return operation;
  }
  function createRepository(storage = globalScope.sessionStorage || fallbackStorage) {
    return {
      load() {
        const raw = storage.getItem(STORAGE_KEY);
        if (!raw) return null;
        try { return validate(JSON.parse(raw)); } catch { return null; }
      },
      save(operation) {
        const valid = validate(operation);
        storage.setItem(STORAGE_KEY, JSON.stringify(valid));
        return valid;
      },
      clear() { storage.removeItem(STORAGE_KEY); },
      export(operation) { return JSON.stringify(validate(operation), null, 2); },
      import(raw) {
        let parsed;
        try { parsed = JSON.parse(String(raw || "")); } catch { throw new Error("El archivo JSON no se puede leer."); }
        const valid = validate(parsed);
        storage.setItem(STORAGE_KEY, JSON.stringify(valid));
        return valid;
      }
    };
  }
  const singleton = createRepository();
  const api = { createRepository, load: singleton.load, save: singleton.save, clear: singleton.clear, export: singleton.export, import: singleton.import };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalScope.OperationRepository = api;
})(typeof window !== "undefined" ? window : globalThis);

