const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
  const output = process.env.QUOTE_VISUAL_OUTPUT || path.join(os.tmpdir(), "cotizador-mym-private-promissory");
  fs.mkdirSync(output, { recursive: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.setDefaultTimeout(5000);
    await page.goto(pathToFileURL(path.resolve(__dirname, "..", "index.html")).href, { waitUntil: "domcontentloaded" });
    await page.locator('[data-workspace-target="quote"]').first().click();

    await page.locator("#productAmount").fill("60000");
    await page.locator("#downPayment").fill("10000");
    await page.locator("#monthlyRate").fill("3");
    await page.locator("#termSelect").fill("12");
    await page.locator("label:has(#includeCustomerData)").click();
    await page.locator("#customerFirstNames").fill("Ana María");
    await page.locator("#customerLastNames").fill("Pérez Gómez");
    await page.locator("#customerId").fill("00112345678");
    await page.locator("#customerStreet").fill("Avenida Central");
    await page.locator("#customerHouseNumber").fill("18");
    await page.locator("#customerSector").fill("Los Jardines");
    await page.locator("#customerCity").fill("Santiago");
    await page.locator("#customerProvince").fill("Santiago");
    await page.locator("label:has(#includeCodebtorData)").click();
    await page.locator("#codebtorFirstNames").fill("Luis Alberto");
    await page.locator("#codebtorLastNames").fill("Santos Díaz");
    await page.locator("#codebtorId").fill("40298765432");
    await page.locator("#codebtorStreet").fill("Calle Segunda");
    await page.locator("#codebtorHouseNumber").fill("22");
    await page.locator("#codebtorSector").fill("Centro");
    await page.locator("#codebtorCity").fill("Santiago");
    await page.locator("#codebtorProvince").fill("Santiago");
    await page.locator("#savePartyPanelBtn").click();

    await page.locator("#openPrivatePromissoryBtn").click();
    assert.equal(await page.locator("#privatePromissoryDialog").getAttribute("open") !== null, true, "el documento debe abrir en pantalla");
    const settings = page.locator("#privatePromissorySettings");
    await page.locator("#generatePrivatePromissoryBtn").click();
    assert.equal(await page.locator("#privatePromissoryValidation").getAttribute("class").then((value) => value.includes("is-invalid")), true, "debe impedir la versión final cuando faltan datos esenciales");
    assert.equal(await page.locator("#privatePromissoryReport").isHidden(), true, "un documento incompleto no debe mostrarse como final");
    await settings.locator('[name="creditorName"]').fill("M&M Inversiones");
    await settings.locator('[name="creditorId"]').fill("1-01-12345-6");
    await settings.locator('[name="creditorAddress"]').fill("Avenida Principal 10, La Vega");
    await settings.locator('[name="subscriptionCity"]').fill("La Vega");
    await settings.locator('[name="paymentMethod"]').fill("transferencia bancaria o caja del acreedor");
    await page.locator("#generatePrivatePromissoryBtn").click();

    const report = page.locator("#privatePromissoryReport");
    await report.waitFor({ state: "visible" });
    const text = await report.innerText();
    assert.match(text, /PAGARÉ BAJO FIRMA PRIVADA Y TABLA DE AMORTIZACIÓN/);
    assert.match(text, /ANA MARÍA PÉREZ GÓMEZ/i);
    assert.match(text, /M&M INVERSIONES/i);
    assert.match(text, /CODEUDOR SOLIDARIO/i);
    assert.doesNotMatch(text, /FIADOR/i);
    assert.match(text, /CINCUENTA MIL PESOS DOMINICANOS CON 00\/100/);
    assert.match(text, /RD\$50,000\.00/);
    assert.match(text, /Capital adeudado/i);
    assert.match(text, /Intereses programados/i);
    assert.match(text, /Total programado/i);
    assert.match(text, /artículo 188 del Código de Comercio/i);
    assert.match(text, /artículos 1322 y 1326 del Código Civil/i);
    assert.match(text, /escriba de puño y letra/i);
    assert.doesNotMatch(text, /(?:tiene|posee|goza de) fuerza ejecutoria notarial/i);
    assert.doesNotMatch(text, /dinero recibido/i);
    assert.equal(await report.locator("tbody tr").count(), 12, "la tabla debe reutilizar las doce cuotas del cálculo");
    assert.equal(await report.locator(".private-promissory-signature--codebtor").count(), 1, "el codeudor solidario debe firmar");
    assert.equal(await report.locator(".private-promissory-page-number").count() >= 2, true, "las páginas deben numerarse");
    await page.locator("#privatePromissoryDialog").screenshot({ path: path.join(output, "private-promissory-dialog.png") });
    await report.locator(".private-promissory-page").first().screenshot({ path: path.join(output, "private-promissory-page-1.png") });
    await report.locator(".private-promissory-page").last().screenshot({ path: path.join(output, "private-promissory-signatures.png") });

    await page.locator("#closePrivatePromissoryBtn").click();
    await page.locator("#editPartyDataBtn").click();
    await page.locator("label:has(#includeCodebtorData)").click();
    await page.locator("#savePartyPanelBtn").click();
    await page.locator("#openPrivatePromissoryBtn").click();
    await page.locator("#generatePrivatePromissoryBtn").click();
    const withoutCodebtor = await report.innerText();
    assert.doesNotMatch(withoutCodebtor, /obligación solidaria/i);
    assert.equal(await report.locator(".private-promissory-signature--codebtor").count(), 0, "sin codeudor no debe imprimirse su firma");

    await page.locator("#closePrivatePromissoryBtn").click();
    await page.locator("#termSelect").fill("36");
    await page.locator("#openPrivatePromissoryBtn").click();
    await page.locator("#generatePrivatePromissoryBtn").click();
    assert.equal(await report.locator("tbody tr").count(), 36, "el documento multipágina debe conservar todas las cuotas");
    assert.equal(await report.locator(".private-promissory-page").count(), 3, "treinta y seis cuotas deben repartirse sin cortar el reconocimiento y las firmas");
    assert.equal(await report.locator(".private-promissory-page__header").count(), 3, "cada página debe repetir la identificación de la operación");
    await page.evaluate(() => { document.body.dataset.printTarget = "private-promissory"; });
    await page.emulateMedia({ media: "print" });
    const clippedPages = await report.locator(".private-promissory-page").evaluateAll((pages) => pages.filter((item) => item.scrollHeight > item.clientHeight + 1).length);
    assert.equal(clippedPages, 0, "ninguna página carta debe ocultar contenido");
    const signatureFooterGap = await report.locator(".private-promissory-page").last().evaluate((sheet) => {
      const signatures = sheet.querySelector(".private-promissory-manuals");
      return Math.round(sheet.getBoundingClientRect().bottom - signatures.getBoundingClientRect().bottom);
    });
    assert.equal(signatureFooterGap <= 46, true, "las firmas deben cerrar el pie de la última hoja");

    console.log("private promissory regression passed");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
