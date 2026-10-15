const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const Core = require("../operation-core.js");
const Repository = require("../operation-repository.js");

const root = path.resolve(__dirname, "..");

test("el manifiesto identifica la aplicación y sus iconos", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "app.webmanifest"), "utf8"));
  assert.equal(manifest.name, "FinanPro | Centro de Operaciones");
  assert.equal(manifest.display, "standalone");
  assert.equal(Array.isArray(manifest.icons), true);
  assert.equal(manifest.icons.length > 0, true);
});

test("el modo sin conexión conserva los recursos esenciales", () => {
  const worker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
  ["index.html", "operation-workbench.js", "operation-workbench.css", "product-policies.json"].forEach((resource) => assert.match(worker, new RegExp(resource.replace(".", "\\."))));
  const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(index, /rel="manifest" href="app\.webmanifest"/);
  assert.match(index, /location\.protocol === "https:" \|\| location\.hostname === "localhost"/);
});

test("un archivo incompatible no reemplaza el expediente actual", () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) || null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key) };
  const repository = Repository.createRepository(storage);
  const current = Core.create("personal_loan");
  repository.save(current);
  assert.throws(() => repository.import(JSON.stringify({ ...current, schemaVersion: 99 })), /versión/);
  assert.deepEqual(repository.load(), current);
});
