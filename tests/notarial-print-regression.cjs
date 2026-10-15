const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.setDefaultTimeout(10000);
    await page.goto(pathToFileURL(path.resolve(__dirname, "..", "index.html")).href, { waitUntil: "domcontentloaded" });
    await page.locator('[data-workspace-target="notarial-promissory"]').evaluate((button) => button.click());

    const form = page.locator("#notarialPromissoryForm");
    const workspace = page.locator("#documentWorkspace-notarial-promissory");
    assert.equal(await workspace.locator("[data-notarial-editor]").count(), 1, "la mesa debe tener un editor documental");
    assert.equal(await workspace.locator("[data-notarial-preview]").count(), 1, "la mesa debe mostrar la vista previa al lado");
    assert.equal(await workspace.locator("[data-notarial-step]").count(), 4, "el formulario debe dividirse en cuatro pasos navegables");
    assert.equal(await workspace.locator("[data-notarial-step].is-active").getAttribute("data-notarial-step"), "1", "el flujo debe comenzar en control del acto");
    assert.equal(await workspace.locator("[data-notarial-panel]:visible").count(), 1, "solo debe mostrarse una etapa del formulario a la vez");
    assert.equal(await workspace.locator("[data-notarial-operation-strip]").count(), 1, "el editor debe conservar un resumen vivo como el cotizador");
    assert.equal(await workspace.locator('[data-notarial-step="4"].is-complete').count(), 0, "la revisión no debe marcarse completa mientras falten datos");
    assert.equal(await workspace.locator("[data-notarial-final-actions]:visible").count(), 0, "imprimir debe aparecer únicamente en la revisión final");
    assert.equal(await form.locator('[name="folioEnd"]').getAttribute("readonly"), "", "el folio final debe calcularse y no escribirse manualmente");
    await workspace.locator("[data-preview-pages] .notarial-print-page").first().waitFor();
    const previewHeaderGeometry = await workspace.locator("[data-preview-pages] .notarial-print-header").first().evaluate((header) => {
      const viewport = header.closest("[data-preview-viewport]").getBoundingClientRect();
      const pages = header.closest("[data-preview-pages]").getBoundingClientRect();
      const title = header.querySelector("h1").getBoundingClientRect();
      return { pagesWidth: pages.width, viewportWidth: viewport.width, titleLeft: title.left, titleRight: title.right, viewportLeft: viewport.left, viewportRight: viewport.right };
    });
    assert.equal(previewHeaderGeometry.pagesWidth <= previewHeaderGeometry.viewportWidth, true, "la hoja debe caber en el ancho útil de la vista previa");
    assert.equal(previewHeaderGeometry.titleLeft >= previewHeaderGeometry.viewportLeft && previewHeaderGeometry.titleRight <= previewHeaderGeometry.viewportRight, true, "el encabezado notarial debe quedar visible y centrado dentro de la hoja");
    assert.match(await workspace.locator("[data-preview-state]").innerText(), /Borrador/i, "los datos incompletos deben identificarse como borrador");

    const desktopLayout = await workspace.locator("[data-notarial-desk]").evaluate((desk) => {
      const editor = desk.querySelector("[data-notarial-editor]").getBoundingClientRect();
      const preview = desk.querySelector("[data-notarial-preview]").getBoundingClientRect();
      return { editorLeft: editor.left, editorRight: editor.right, previewLeft: preview.left, previewWidth: preview.width };
    });
    assert.equal(desktopLayout.previewLeft > desktopLayout.editorRight, true, "en escritorio la vista previa debe quedar a la derecha del formulario");
    assert.equal(desktopLayout.previewWidth >= 390, true, "la vista previa debe conservar un ancho útil");
    assert.match(await page.locator('[data-workspace-target="notarial-promissory"]').innerText(), /Auténtico · un deudor/i, "el acceso debe identificar la modalidad habilitada");
    assert.equal(await form.locator('[name="debtorCount"]').count(), 0, "la primera versión no debe mezclar la modalidad de dos deudores");
    assert.equal(await form.locator('[data-notarial-variant="single"][aria-current="true"]').count(), 1, "un deudor debe ser la plantilla activa");
    assert.equal(await form.locator('[data-notarial-variant][disabled]').count(), 3, "las variantes pendientes deben mostrarse sin permitir su uso");
    await workspace.locator('[data-notarial-step="2"]').click();
    assert.equal(await workspace.locator('[data-notarial-panel="2"]:visible').count(), 1, "personas debe abrir su panel sin recargar la página");
    await form.locator('[name="creditorKey"][value="jarvis"]').evaluate((radio) => {
      radio.checked = true;
      radio.dispatchEvent(new Event("change", { bubbles: true }));
    });
    assert.equal(await form.locator('[name="creditorAddress"]').inputValue(), "CALLE JOSÉ MARTÍ NÚMERO 85, SECTOR EL HATICO, LA VEGA", "Jarvis debe conservar el domicilio del documento fuente");
    await workspace.locator('[data-notarial-step="1"]').click();
    await form.locator('[name="actNumber"]').fill("321");
    await form.locator('[name="folioStart"]').fill("614");
    await workspace.locator('[data-notarial-step="2"]').click();
    await form.locator('[name="debtorName"]').fill("Ana María Pérez Gómez");
    await workspace.locator("[data-preview-pages]").getByText(/ANA MARÍA PÉREZ GÓMEZ/i).first().waitFor();
    await form.locator('[name="debtorId"]').fill("00112345678");
    await form.locator('[name="debtorAddress"]').fill("Avenida Central");
    await form.locator('[name="debtorHouseNumber"]').fill("18");
    await form.locator('[name="debtorSector"]').fill("Los Jardines");
    await workspace.locator('[data-notarial-step="3"]').click();
    await form.locator('[name="principal"]').fill("50000");
    await form.locator('[name="rate"]').fill("3");
    await form.locator('[name="installments"]').fill("12");
    await form.locator('[name="lateRate"]').fill("5");
    assert.equal(await form.locator('[name="disbursementConfirmed"]').isChecked(), false, "el sistema no debe presumir que el capital ya fue desembolsado");
    await workspace.locator("[data-preview-alert]").getByText(/confirma que el capital fue desembolsado/i).waitFor();
    await form.locator('[name="disbursementConfirmed"]').check();
    await workspace.locator('[data-notarial-step="4"]').click();
    await workspace.locator("[data-notarial-status].is-success").waitFor();
    assert.match(await workspace.locator("[data-notarial-status]").innerText(), /listo para revisar/i, "el formulario debe confirmar cuando el documento está completo");

    await workspace.locator('[data-preview-page="2"]').waitFor({ state: "attached" });
    const previewPageCount = await workspace.locator("[data-preview-pages] .notarial-print-page").count();
    assert.equal(previewPageCount >= 2, true, "la vista previa debe representar todas las hojas generadas");
    await workspace.locator("[data-preview-next]").click();
    assert.equal(await workspace.locator("[data-preview-pages]").getAttribute("data-current-page"), "2", "siguiente debe mostrar la segunda hoja");
    assert.equal(await workspace.locator("[data-preview-counter]").count(), 0, "la navegación no debe mostrar contador de páginas");
    if (process.env.NOTARIAL_SCREENSHOT) {
      await workspace.locator("[data-preview-previous]").click();
      await workspace.locator("[data-preview-viewport]").evaluate((viewport) => viewport.scrollTo(0, 0));
      await workspace.locator("[data-notarial-preview]").screenshot({ path: process.env.NOTARIAL_SCREENSHOT });
      await workspace.locator("[data-preview-next]").click();
    }

    await page.setViewportSize({ width: 700, height: 1000 });
    const mobileLayout = await workspace.locator("[data-notarial-desk]").evaluate((desk) => {
      const editor = desk.querySelector("[data-notarial-editor]").getBoundingClientRect();
      const preview = desk.querySelector("[data-notarial-preview]").getBoundingClientRect();
      return { editorBottom: editor.bottom, previewTop: preview.top, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
    });
    assert.equal(mobileLayout.previewTop >= mobileLayout.editorBottom, true, "en móvil la vista previa debe quedar debajo del formulario");
    assert.equal(mobileLayout.overflow <= 1, true, "la mesa documental no debe desbordar horizontalmente");
    await page.setViewportSize({ width: 1440, height: 1000 });

    await form.locator("[data-notarial-print]").click();

    const report = page.locator("#notarialPromissoryPrintReport");
    assert.equal(await report.getAttribute("data-pagination-state"), "valid", "el motor notarial debe conservar una paginación válida");
    assert.equal(await report.getAttribute("data-text-integrity"), "valid", "la paginación no debe perder texto legal");
    const pageFits = await report.locator(".notarial-print-page").evaluateAll((pages) => pages.map((page) => page.scrollHeight <= page.clientHeight + 1));
    assert.equal(pageFits.every(Boolean), true, "ninguna hoja imprimible debe desbordar verticalmente");
    assert.equal(await report.locator(".notarial-print-page:not(:last-child) .notarial-line-fill").count(), 0, "las hojas de continuación no llevan guiones de relleno");
    assert.equal(await report.locator("strong .notarial-page-break-hyphen").count(), 0, "nombres, cifras y énfasis legales no deben partirse");
    assert.equal(await report.locator(".notarial-print-page:not(:last-child).notarial-print-page--flows-on").count(), previewPageCount - 1, "las hojas anteriores deben conservar la continuidad del texto");
    const continuationAlignment = await report.locator(".notarial-print-page:not(:last-child) .notarial-legal-copy > p:first-child").evaluateAll((paragraphs) => paragraphs.map((paragraph) => getComputedStyle(paragraph).textAlignLast));
    assert.equal(continuationAlignment.every((alignment) => alignment !== "justify"), true, "la última línea de cada hoja intermedia no debe estirarse");
    assert.equal(Number(await report.getAttribute("data-first-page-free-space")) <= 90, true, "la primera hoja debe aprovechar su área legal antes de continuar al dorso");
    const orphanOrdinals = await report.locator(".notarial-print-page:not(:last-child)").evaluateAll((pages) => pages.map((sheet) => {
      const copy = sheet.querySelector(".notarial-legal-copy > p:first-child").cloneNode(true);
      copy.querySelectorAll(".notarial-line-fill").forEach((fill) => fill.remove());
      return /(?:PRIMERO|SEGUNDO|TERCERO|CUARTO|QUINTO|SEXTO|SÉPTIMO):\s*$/.test(copy.textContent.trim());
    }));
    assert.equal(orphanOrdinals.some(Boolean), false, "ningún ordinal debe quedar solo al pie de una hoja");
    assert.equal(await report.locator(".notarial-signatures").count(), 1, "las firmas notariales deben permanecer juntas");
    const legalText = await report.locator(".notarial-legal-copy").allInnerTexts();
    const previewText = await workspace.locator("[data-preview-pages] .notarial-legal-copy").allInnerTexts();
    assert.deepEqual(previewText, legalText, "la vista previa y la impresión deben usar exactamente el mismo texto jurídico");
    assert.equal(await report.locator("[data-page-label]").count(), 0, "el pagaré impreso no debe mostrar PÁGINA X DE Y");
    assert.equal(await report.locator(".notarial-control-line").count(), previewPageCount, "cada hoja debe conservar acto y folio");
    assert.doesNotMatch(legalText.join(" "), /EL\/LOS|\(N\)|DEUDOR\(ES\)/i, "la modalidad individual debe usar redacción singular definitiva");
    assert.match(legalText.join(" "), /EL DEUDOR/i, "el texto debe identificar al deudor individual");

    await page.emulateMedia({ media: "print" });
    const continuationRule = await report.locator(".notarial-continued").first().evaluate((element) => {
      const own = getComputedStyle(element);
      const before = getComputedStyle(element, "::before");
      const after = getComputedStyle(element, "::after");
      return {
        display: own.display,
        beforeGrow: before.flexGrow,
        afterGrow: after.flexGrow,
        beforeBorder: before.borderTopStyle,
        afterBorder: after.borderTopStyle
      };
    });
    assert.deepEqual(continuationRule, {
      display: "flex",
      beforeGrow: "1",
      afterGrow: "1",
      beforeBorder: "solid",
      afterBorder: "solid"
    }, "SIGUE AL DORSO debe completar ambos lados con líneas flexibles");

    const closing = await report.locator(".notarial-print-page").last().evaluate((sheet) => {
      const paragraph = sheet.querySelector(".notarial-legal-copy > p:first-child");
      const filler = paragraph.querySelector(".notarial-line-fill");
      const lastText = [...paragraph.querySelectorAll(".notarial-flow-unit, .notarial-flow-fragment")].at(-1);
      const textNodes = [];
      const walker = document.createTreeWalker(lastText, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) if (node.textContent.includes("doy fe.")) textNodes.push(node);
      const sentence = textNodes.at(-1);
      const range = document.createRange();
      const offset = sentence.textContent.lastIndexOf("doy fe.") + "doy fe.".length;
      range.setStart(sentence, offset - 1);
      range.setEnd(sentence, offset);
      const textBox = range.getBoundingClientRect();
      const fillerBoxes = filler ? [...filler.getClientRects()] : [];
      return { hasFiller: Boolean(filler), sameLine: fillerBoxes.every((box) => Math.abs(box.top - textBox.top) < 3), noSeparateRule: !sheet.querySelector(".notarial-closing-rule") };
    });
    assert.equal(closing.noSeparateRule, true, "el cierre no debe dejar una regla aislada en otro renglón");
    assert.equal(closing.sameLine, true, "los guiones de cierre no deben saltar debajo de «doy fe.»");

    const signatureLayout = await report.locator(".notarial-print-page").last().evaluate((sheet) => {
      const copy = sheet.querySelector(".notarial-legal-copy > p:first-child").getBoundingClientRect();
      const signatures = sheet.querySelector(".notarial-signatures");
      const first = signatures.firstElementChild.getBoundingClientRect();
      const last = signatures.lastElementChild.getBoundingClientRect();
      const pageBox = sheet.getBoundingClientRect();
      const rows = [...signatures.children].map((signer) => signer.getBoundingClientRect()).reduce((groups, box) => {
        if (groups.length && Math.abs(groups.at(-1).top - box.top) < 3) groups.at(-1).bottom = Math.max(groups.at(-1).bottom, box.bottom);
        else groups.push({ top: box.top, bottom: box.bottom });
        return groups;
      }, []);
      return { firstGap: first.top - copy.bottom, lastBottom: last.bottom, pageBottom: pageBox.bottom, rowGaps: rows.slice(1).map((row, index) => row.top - rows[index].bottom) };
    });
    assert.equal(signatureLayout.firstGap >= 20 && signatureLayout.firstGap <= 46, true, "la primera firma debe seguir de cerca al cierre");
    assert.equal(signatureLayout.rowGaps.every((gap) => gap >= 25 && gap <= 54), true, "las firmas deben formar un bloque compacto y legible");
    assert.equal(signatureLayout.lastBottom <= signatureLayout.pageBottom - 8, true, "la firma notarial debe tener margen físico inferior");

    const assets = await page.evaluate(() => ({
      script: [...document.scripts].find((item) => item.src.includes("pagare-notarial.js"))?.src || "",
      style: [...document.styleSheets].map((item) => item.href || "").find((href) => href.includes("pagare-notarial.css")) || ""
    }));
    assert.match(assets.script, /v=20261015-layout6/, "el JavaScript notarial debe invalidar la versión anterior");
    assert.match(assets.style, /v=20261015-layout6/, "los estilos notariales deben invalidar la versión anterior");

    const pageCount = await report.locator(".notarial-print-page").count();
    assert.equal(pageCount >= 1, true, "el pagaré debe producir al menos una hoja carta");
    assert.equal(signatureLayout.lastBottom < signatureLayout.pageBottom, true, "el blanco sobrante debe quedar después del bloque sin cortar la firma notarial");

    console.log("notarial print regression passed");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
