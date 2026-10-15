const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.setDefaultTimeout(8000);
    const errors = [];
    page.on("console", (message) => {
      if (message.type() === "error" && !message.text().includes("Failed to load resource")) errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(pathToFileURL(path.resolve(__dirname, "..", "index.html")).href, { waitUntil: "domcontentloaded", timeout: 10000 });
    await page.locator('[data-workspace-target="quote"]').first().click();

    await page.locator("#productAmount").fill("187500");
    await page.locator("#downPayment").fill("37500");
    assert.equal(await page.locator("#monthlyRate").isVisible(), true, "operación y condiciones deben estar disponibles en una sola pantalla");
    await page.locator("#termSelect").fill("19");
    await page.locator("#monthlyRate").fill("4.25");
    await page.locator("#rateType").selectOption("monthly");

    await page.locator("#productMenu > summary").click();
    await page.locator('[data-product="Smartphone"]').click();

    assert.equal(await page.locator("#productAmount").inputValue(), "187500", "cambiar producto no debe modificar el precio");
    assert.equal(await page.locator("#downPayment").inputValue(), "37500", "cambiar producto no debe modificar la inicial");
    assert.equal(await page.locator("#termSelect").inputValue(), "19", "cambiar producto no debe modificar el plazo escrito");
    assert.equal(await page.locator("#monthlyRate").inputValue(), "4.25", "cambiar producto no debe modificar la tasa escrita");
    assert.equal(await page.locator("#rateType").inputValue(), "monthly", "cambiar producto no debe modificar el tipo de tasa");

    await page.locator("label:has(#includeCustomerData)").click();
    assert.equal(await page.locator("#customerDataPanel").isVisible(), true, "el check del cliente debe abrir su cuadro");
    await page.locator("#customerFirstNames").fill("Ana María");
    await page.locator("#customerLastNames").fill("Pérez Gómez");
    await page.locator("#customerId").fill("00112345678");
    await page.locator("#customerStreet").fill("Avenida Central");
    await page.locator("#customerHouseNumber").fill("18");
    await page.locator("#customerSector").fill("Los Jardines");
    await page.locator("#customerCity").fill("Santiago");
    await page.locator("#customerProvince").fill("Santiago");
    assert.equal(await page.locator("#customerId").inputValue(), "001-1234567-8", "la cédula debe formatearse");

    await page.locator("label:has(#includeCodebtorData)").click();
    assert.equal(await page.locator("#codebtorDataPanel").isVisible(), true, "el check del codeudor debe abrir su cuadro");
    await page.locator("#codebtorFirstNames").fill("Luis Alberto");
    await page.locator("#codebtorLastNames").fill("Santos Díaz");
    await page.locator("#codebtorId").fill("40298765432");
    await page.locator("#codebtorStreet").fill("Calle Segunda");
    await page.locator("#codebtorHouseNumber").fill("22");
    await page.locator("#codebtorSector").fill("Centro");
    await page.locator("#codebtorCity").fill("Santiago");
    await page.locator("#codebtorProvince").fill("Santiago");

    await page.locator("#applyRecommendedConditionsBtn").click();
    await page.locator("#savePartyPanelBtn").click();
    assert.equal(await page.locator("#reviewCustomer").textContent(), "Ana María Pérez Gómez");
    assert.match(await page.locator("#reviewCustomerAddress").textContent(), /Avenida Central/);
    assert.match(await page.locator("#reviewCodebtor").textContent(), /Luis Alberto Santos Díaz/);
    await page.locator("#sidebarPlanBtn").click();
    assert.equal(await page.locator("#printModal").getAttribute("aria-hidden"), "false", "el plan debe abrirse después de validar");
    assert.match(await page.locator("#printGoodFor").textContent(), /BUENO Y VÁLIDO POR RD\$/);
    assert.equal(await page.locator("#printCodebtorSignatureBlock").getAttribute("hidden"), null, "la firma del codeudor debe aparecer cuando se incluye");

    assert.deepEqual(errors, [], `la página produjo errores: ${errors.join(" | ")}`);
    console.log("quote UX regression passed");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
