const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

async function prepare(page) {
  await page.goto(pathToFileURL(path.resolve(__dirname, "..", "index.html")).href, { waitUntil: "domcontentloaded" });
  await page.locator('[data-workspace-target="quote"]').first().click();
  await page.locator("#includeCustomerData").check({ force: true });
  await page.locator("#customerFirstNames").fill("Ana María");
  await page.locator("#customerLastNames").fill("Pérez Gómez");
  await page.locator("#customerId").fill("00112345678");
  await page.locator("#customerStreet").fill("Avenida Central");
  await page.locator("#customerHouseNumber").fill("18");
  await page.locator("#customerSector").fill("Los Jardines");
  await page.locator("#customerCity").fill("Santiago");
  await page.locator("#customerProvince").fill("Santiago");
  await page.locator("#includeCodebtorData").evaluate((input) => {
    input.checked = true;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.locator("#codebtorFirstNames").fill("Luis Alberto");
  await page.locator("#codebtorLastNames").fill("Santos Díaz");
  await page.locator("#codebtorId").fill("40298765432");
  await page.locator("#codebtorStreet").fill("Calle Segunda");
  await page.locator("#codebtorHouseNumber").fill("22");
  await page.locator("#codebtorSector").fill("Centro");
  await page.locator("#codebtorCity").fill("Santiago");
  await page.locator("#codebtorProvince").fill("Santiago");
  await page.locator("#savePartyPanelBtn").click();
  await page.waitForTimeout(300);
  await page.locator("#quoteWorkspace").scrollIntoViewIfNeeded();
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
  const output = process.env.QUOTE_VISUAL_OUTPUT || path.join(os.tmpdir(), "cotizador-mym-visual-smoke");
  fs.mkdirSync(output, { recursive: true });
  try {
    const menu = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    await menu.goto(pathToFileURL(path.resolve(__dirname, "..", "index.html")).href, { waitUntil: "domcontentloaded" });
    assert.equal(await menu.locator(".workspace-menu-nav a").count(), 4, "el menú debe mostrar las cuatro etapas disponibles");
    assert.equal(await menu.locator(".workspace-choice").count(), 19, "todas las herramientas deben conservar acceso guiado");
    assert.equal(await menu.locator(".workspace-choice:not([data-tool-label])").count(), 0, "cada opción debe indicar su tipo de tarea");
    await menu.locator("#workspaceMenu").scrollIntoViewIfNeeded();
    await menu.screenshot({ path: path.join(output, "workspace-menu-desktop.png"), fullPage: false });

    const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    await prepare(desktop);
    assert.equal(await desktop.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, "desktop no debe tener desbordamiento horizontal");
    await desktop.evaluate(() => window.scrollTo(0, 0));
    await desktop.screenshot({ path: path.join(output, "quote-ux-desktop.png"), fullPage: false });
    assert.equal(await desktop.locator("#monthlyRate").isVisible(), true, "las condiciones deben verse junto a la operación");
    await desktop.locator("#editPartyDataBtn").click();
    await desktop.screenshot({ path: path.join(output, "quote-party-drawer-desktop.png"), fullPage: false });
    await desktop.locator("#savePartyPanelBtn").click();
    await desktop.locator("#sidebarPlanBtn").click();
    await desktop.evaluate(() => {
      const input = document.querySelector('input[name="planPrintMode"][value="amortization"]');
      input.checked = true;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await desktop.evaluate(() => { document.body.dataset.printTarget = "quote"; });
    await desktop.emulateMedia({ media: "print" });
    const quoteSignatureGap = await desktop.locator("#printReport").evaluate((sheet) => {
      const signatures = sheet.querySelector(".print-signatures");
      return Math.round(sheet.getBoundingClientRect().bottom - signatures.getBoundingClientRect().bottom);
    });
    assert.equal(quoteSignatureGap <= 48, true, "las firmas de la cotización deben quedar en el pie de la hoja");
    await desktop.locator("#printReport").screenshot({ path: path.join(output, "quote-print-preview.png") });

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    await prepare(mobile);
    await mobile.evaluate(() => window.scrollTo(0, 0));
    const mobileLayout = await mobile.evaluate(() => ({
      fits: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      overflowers: [...document.querySelectorAll("body *")]
        .filter((element) => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
        .slice(0, 12)
        .map((element) => ({ tag: element.tagName, id: element.id, className: element.className, right: Math.round(element.getBoundingClientRect().right) }))
    }));
    if (!mobileLayout.fits) console.error("mobile layout overflow", mobileLayout);
    assert.equal(mobileLayout.fits, true, "móvil no debe tener desbordamiento horizontal");
    await mobile.screenshot({ path: path.join(output, "quote-ux-mobile.png"), fullPage: false });
    console.log("quote visual smoke passed");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
