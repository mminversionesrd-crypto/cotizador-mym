const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
  try {
    const output = path.resolve(__dirname, "..", "test-results");
    fs.mkdirSync(output, { recursive: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve(__dirname, "..", "index.html")).href, { waitUntil: "domcontentloaded" });
    assert.equal(await page.locator('[data-workspace-target="operations"]').count(), 1, "el inicio debe incluir la mesa unificada");
    await page.locator('[data-workspace-target="operations"]').click();
    assert.equal(await page.locator("#operationWorkbench").isVisible(), true);
    assert.equal(await page.locator("[data-operation-product]").count(), 8, "deben existir ocho procesos especializados");
    assert.equal(await page.locator("#operationWorkbench [data-ultimate-home]").isVisible(), true, "la mesa debe permitir volver a Inicio");

    await page.locator('[data-operation-product="personal_loan"]').click();
    await page.locator('[data-operation-path="people.customer.fullName"]').fill("Ana Pérez");
    await page.locator('[data-operation-path="people.customer.idNumber"]').fill("001-1234567-8");
    await page.locator('[data-operation-path="people.customer.address"]').fill("La Vega");
    await page.locator('[data-operation-path="proposal.principal"]').fill("100000");
    await page.locator('[data-operation-path="proposal.term"]').fill("12");
    await page.locator('[data-operation-path="proposal.monthlyRate"]').fill("3");
    await page.locator('[data-operation-path="proposal.purpose"]').fill("Capital personal");
    await page.locator('[data-operation-path="evaluation.monthlyIncome"]').fill("50000");
    assert.equal(await page.locator("#operationReadiness").textContent(), "100% listo");
    assert.match(await page.locator("#operationProposalSummary").textContent(), /RD\$136,000.00/);
    assert.equal(await page.locator("#operationDocumentList article").count() >= 5, true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);
    await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
    await page.screenshot({ path: path.join(output, "operation-workbench-desktop.png"), fullPage: false });

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobile.goto(pathToFileURL(path.resolve(__dirname, "..", "index.html")).href, { waitUntil: "domcontentloaded" });
    await mobile.locator('[data-workspace-target="operations"]').click();
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, "la mesa móvil no debe desbordar");
    await mobile.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
    await mobile.screenshot({ path: path.join(output, "operation-workbench-mobile.png"), fullPage: false });
    assert.deepEqual(errors, [], `errores de página: ${errors.join(" | ")}`);
    console.log("operation workbench regression passed");
  } finally { await browser.close(); }
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });
