const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve(__dirname, "..", "index.html")).href, { waitUntil: "domcontentloaded" });
    const output = process.env.ULTIMATE_UI_OUTPUT;
    if (output) { fs.mkdirSync(output, { recursive: true }); await page.screenshot({ path: path.join(output, "ultimate-home-desktop.png"), fullPage: true }); }

    assert.equal(await page.locator(".ultimate-home-hero").isVisible(), true, "la portada operativa debe mostrarse al iniciar");
    assert.equal(await page.locator(".ultimate-recent__items button").count(), 3, "el inicio debe ofrecer tres accesos recientes");
    assert.equal(await page.locator(".workspace-choice").count(), 19, "las 19 herramientas deben mantenerse disponibles");
    assert.equal(await page.locator(".workspace .ultimate-workspace-nav").count(), await page.locator(".workspace").count(), "todas las herramientas internas deben incluir navegación a Inicio");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, "el inicio no debe desbordar horizontalmente");

    await page.locator('.workspace-menu-nav a[href="#controlToolsTitle"]').click();
    await page.locator('[data-workspace-target="payment"]').click();
    assert.equal(await page.locator("#documentWorkspace-payment .ultimate-progress-rail").isVisible(), true, "los documentos deben mostrar control lateral");
    assert.equal(await page.locator("#documentWorkspace-payment .ultimate-workspace-nav [data-ultimate-home]").isVisible(), true, "cada herramienta debe ofrecer regreso visible a Inicio");
    if (output) await page.screenshot({ path: path.join(output, "ultimate-document-desktop.png"), fullPage: false });
    assert.equal(await page.locator(".ultimate-home-hero").isVisible(), false, "la portada debe ocultarse al abrir una herramienta");
    const initialProgress = await page.locator("#documentWorkspace-payment [data-progress-ring] strong").textContent();
    assert.notEqual(initialProgress, "100%", "un documento incompleto no debe mostrarse listo");
    await page.locator('#documentWorkspace-payment [name="staff"]').fill("María Santos");
    await page.locator('#documentWorkspace-payment [name="branch"]').selectOption({ label: "VegaMotors" });
    const updatedProgress = await page.locator("#documentWorkspace-payment [data-progress-ring] strong").textContent();
    assert.notEqual(updatedProgress, initialProgress, "el progreso debe reaccionar al llenado");

    await page.locator("#documentWorkspace-payment [data-ultimate-home]").click();
    assert.match(await page.locator(".ultimate-recent__items").textContent(), /Recibo de ingreso/, "la herramienta utilizada debe aparecer entre recientes");

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobile.goto(pathToFileURL(path.resolve(__dirname, "..", "index.html")).href, { waitUntil: "domcontentloaded" });
    if (output) await mobile.screenshot({ path: path.join(output, "ultimate-home-mobile.png"), fullPage: true });
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, "el inicio móvil no debe desbordar horizontalmente");
    await mobile.locator('[data-workspace-target="application"]').click();
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, "la solicitud móvil no debe desbordar horizontalmente");
    assert.equal(await mobile.locator("#creditApplication .ultimate-progress-rail").isVisible(), true, "la solicitud debe conservar el panel de preparación en móvil");

    assert.deepEqual(errors, [], `la interfaz produjo errores: ${errors.join(" | ")}`);
    console.log("ultimate UI regression passed");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
