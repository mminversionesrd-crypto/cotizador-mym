const test = require("node:test");
const assert = require("node:assert/strict");
const Core = require("../operation-core.js");
const Repository = require("../operation-repository.js");

function memoryStorage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key) };
}

test("guarda y recupera el expediente durante la sesión", () => {
  const repository = Repository.createRepository(memoryStorage());
  const operation = Core.patch(Core.create("commercial_loan"), { people: { customer: { fullName: "Comercial Duarte" } } });
  repository.save(operation);
  assert.equal(repository.load().people.customer.fullName, "Comercial Duarte");
});

test("exporta e importa una operación versionada", () => {
  const repository = Repository.createRepository(memoryStorage());
  const operation = Core.create("vehicle_secured_loan");
  const restored = repository.import(repository.export(operation));
  assert.equal(restored.reference, operation.reference);
  assert.equal(restored.productType, "vehicle_secured_loan");
});

test("rechaza una versión desconocida sin reemplazar el expediente actual", () => {
  const repository = Repository.createRepository(memoryStorage());
  const current = Core.create("personal_loan");
  repository.save(current);
  assert.throws(() => repository.import(JSON.stringify({ schemaVersion: 99 })), /versión/i);
  assert.equal(repository.load().reference, current.reference);
});
