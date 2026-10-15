const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const { letterPageGeometry } = require("../document-engine/page-geometry.js");
const { composeNotarialBlocks, formatNotarialControlLine } = require("../document-engine/document-blocks.js");
const { fillerCount } = require("../document-engine/line-finisher.js");
const { planTailTransfer, shouldContinueBlockOnPage, pageClosingMode, spanishBreakPoints, chooseWordBreak, shouldStopTailTransfer } = require("../document-engine/pagination-engine.js");
const { validateDocumentLayout } = require("../document-engine/document-layout-contract.js");

test("cada hoja del pagaré cabe en Carta con márgenes de impresora y reserva contra redondeo", () => {
  const geometry = letterPageGeometry();
  assert.equal(geometry.pageWidthIn, 8.5);
  assert.equal(geometry.pageHeightIn, 11);
  assert.equal(geometry.contentWidthIn <= geometry.pageWidthIn - 1, true);
  assert.equal(geometry.contentHeightIn <= geometry.pageHeightIn - 1.1, true);
});

test("la medición y la impresión usan el mismo ancho y tamaño de texto legible", () => {
  const css = fs.readFileSync(path.join(__dirname, "../pagare-notarial.css"), "utf8");
  assert.match(css, /\.notarial-print-report\.is-measuring \.notarial-print-page \{[^}]*width: var\(--notarial-content-width, 7\.26in\)/);
  assert.match(css, /body\[data-print-target="document-notarial-promissory"\] \.notarial-print-page \{[^}]*width: var\(--notarial-content-width, 7\.26in\)/);
  assert.match(css, /\.notarial-print-report\.is-measuring \.notarial-legal-copy \{[^}]*font-size: 11pt/);
  assert.match(css, /\.notarial-legal-copy \{[^}]*font-size: 11pt/);
});

test("las hojas intermedias continúan sin aviso visible ni renglón reservado", () => {
  const script = fs.readFileSync(path.join(__dirname, "../pagare-notarial.js"), "utf8");
  const css = fs.readFileSync(path.join(__dirname, "../pagare-notarial.css"), "utf8");
  assert.doesNotMatch(script, /SIGUE AL DORSO|CONTIN[ÚU]A AL DORSO/i);
  assert.match(css, /\.notarial-print-report \.notarial-continued \{[^}]*height: 0/);
  assert.doesNotMatch(css, /\.notarial-continued::before|\.notarial-continued::after/);
});

test("la hoja notarial se centra dentro de márgenes laterales simétricos", () => {
  const geometry = letterPageGeometry();
  const css = fs.readFileSync(path.join(__dirname, "../pagare-notarial.css"), "utf8");
  assert.equal(geometry.marginLeftIn, geometry.marginRightIn);
  assert.match(css, /body\[data-print-target="document-notarial-promissory"\] \.notarial-print-page \{[^}]*margin-inline: auto/);
});

test("los artículos conservan su texto y el cierre no incorpora decoración", () => {
  const blocks = composeNotarialBlocks([
    { text: "Comparecieron las partes. " },
    { article: "PRIMERO:", text: "PRIMERO: Capital adeudado. " },
    { article: "SEGUNDO:", text: "SEGUNDO: Forma de pago. " },
    { text: "Yo certifico y doy fe." }
  ]);
  assert.deepEqual(blocks.map(({ kind }) => kind), ["appearance", "article", "article", "closing"]);
  assert.equal(blocks.map(({ text }) => text).join(""), "Comparecieron las partes. PRIMERO: Capital adeudado. SEGUNDO: Forma de pago. Yo certifico y doy fe.");
});

test("el encabezado del pagaré conserva acto y folio sin numeración visible de páginas", () => {
  assert.equal(typeof formatNotarialControlLine, "function");
  assert.equal(formatNotarialControlLine({ actNumber: "1", actWords: "UNO", folioNumber: "2", folioWords: "DOS", pageNumber: 1, totalPages: 2 }),
    '<p class="notarial-control-line">ACTO NÚMERO UNO (1). FOLIO NÚMERO DOS (2).</p>');
});

test("el relleno de guiones jamás ocupa una línea nueva", () => {
  assert.equal(fillerCount({ remainingWidth: 0, hyphenWidth: 6, safetyGap: 2 }), 0);
  assert.equal(fillerCount({ remainingWidth: 37, hyphenWidth: 6, safetyGap: 2 }), 5);
  assert.equal(fillerCount({ remainingWidth: 7, hyphenWidth: 6, safetyGap: 2 }), 0);
});

test("traslada el cierre a la hoja de firmas sin desbordarla ni dejar página de solo firmas", () => {
  const plan = planTailTransfer({ previousTailHeights: [34, 36, 32], finalUsed: 335, finalCapacity: 480, minimumTextHeight: 60 });
  assert.equal(plan.moveCount, 3);
  assert.equal(plan.finalUsed, 437);
});

test("un nombre largo que aumenta la altura de firmas reduce el texto trasladable", () => {
  const plan = planTailTransfer({ previousTailHeights: [34, 36, 32], finalUsed: 431, finalCapacity: 480, minimumTextHeight: 60 });
  assert.equal(plan.moveCount, 1);
});

test("un artículo continúa en la hoja actual mientras quepa al menos una línea", () => {
  assert.equal(shouldContinueBlockOnPage({ remainingHeight: 64, lineHeight: 19 }), true);
  assert.equal(shouldContinueBlockOnPage({ remainingHeight: 31, lineHeight: 19 }), true);
});

test("un artículo puede comenzar en el único renglón útil restante", () => {
  assert.equal(shouldContinueBlockOnPage({ remainingHeight: 19, lineHeight: 19 }), true);
  assert.equal(shouldContinueBlockOnPage({ remainingHeight: 0, lineHeight: 19 }), true);
  assert.equal(shouldContinueBlockOnPage({ remainingHeight: -1, lineHeight: 19 }), false);
});

test("solo la última hoja terminada en doy fe admite guiones de cierre", () => {
  assert.equal(pageClosingMode({ pageIndex: 0, totalPages: 2, legalText: "aceptación judicial;" }), "continue");
  assert.equal(pageClosingMode({ pageIndex: 1, totalPages: 2, legalText: "yo certifico y doy fe." }), "final-fill");
  assert.equal(pageClosingMode({ pageIndex: 1, totalPages: 2, legalText: "yo certifico y firmo." }), "invalid-final");
  assert.equal(pageClosingMode({ pageIndex: 1, totalPages: 2, legalText: "así lo firmo.", closingPhrase: "firmo." }), "final-fill");
});

test("el corte de palabra usa puntos silábicos conservadores y excluye cifras o nombres resaltados", () => {
  assert.deepEqual(spanishBreakPoints("documento"), [2, 4, 7]);
  assert.deepEqual(spanishBreakPoints("pagaré"), [2, 4]);
  assert.deepEqual(spanishBreakPoints("001234"), []);
  assert.deepEqual(spanishBreakPoints("ACREEDOR"), []);
});

test("elige el corte más largo que cabe y conserva ambas mitades del texto", () => {
  assert.deepEqual(chooseWordBreak("documento", (head) => head.length <= 5), { head: "docu", tail: "mento" });
  assert.equal(chooseWordBreak("documento", () => false), null);
});

test("al reservar firmas traslada solo dos líneas finales, sin vaciar ni dejar ordinal huérfano", () => {
  assert.equal(shouldStopTailTransfer({ movedHeight: 40, lineHeight: 19, previousHasText: true, previousEndsOrdinal: false, finalFits: true }), true);
  assert.equal(shouldStopTailTransfer({ movedHeight: 20, lineHeight: 19, previousHasText: true, previousEndsOrdinal: false, finalFits: true }), false);
  assert.equal(shouldStopTailTransfer({ movedHeight: 40, lineHeight: 19, previousHasText: true, previousEndsOrdinal: true, finalFits: true }), false);
});

test("bloquea una hoja final sin texto, firma fuera de margen y pérdida de texto", () => {
  const problems = validateDocumentLayout({
    sourceText: "Capital y firmas",
    pages: [
      { legalText: "Capital", contentBottom: 600, pageBottom: 1008, hasContinuation: true, signatureBottom: null },
      { legalText: "", contentBottom: 50, pageBottom: 1008, hasContinuation: false, signatureBottom: 1020 }
    ]
  });
  assert.deepEqual(problems.map(({ code }) => code), ["TEXT_MISMATCH", "EMPTY_CONTINUATION", "SIGNATURE_MARGIN"]);
});

test("detecta folio, ordinal, firmas y cierre mal compuestos", () => {
  const problems = validateDocumentLayout({
    sourceText: "PRIMERO: Capital",
    pages: [{
      legalText: "PRIMERO: Capital", contentBottom: 700, pageBottom: 1008,
      hasContinuation: false, signatureBottom: 990, signatureFirstTop: 970,
      signatureCount: 2, pageNumber: 2, totalPages: 1,
      orphanHeading: true, closingFillSameLine: false
    }]
  });
  assert.deepEqual(problems.map(({ code }) => code), ["ORPHAN_HEADING", "CLOSING_FILL_WRAP", "SIGNATURE_SPLIT", "EXCESSIVE_FINAL_GAP", "PAGE_NUMBER_REFLOW"]);
});

test("el contrato rechaza relleno prematuro en una hoja de continuación", () => {
  const problems = validateDocumentLayout({
    sourceText: "Texto que continúa y termina.",
    pages: [
      { legalText: "Texto que continúa ", contentBottom: 500, pageBottom: 1008, hasContinuation: true, fillCount: 1 },
      { legalText: "y termina.", contentBottom: 480, pageBottom: 1008, hasContinuation: false, fillCount: 0 }
    ]
  });
  assert.deepEqual(problems.map(({ code }) => code), ["PREMATURE_FILL"]);
});

test("el contrato rechaza una hoja intermedia que abandona demasiado espacio útil", () => {
  const problems = validateDocumentLayout({
    sourceText: "Texto continuado",
    pages: [
      { legalText: "Texto ", contentBottom: 720, continuationBottom: 810, pageBottom: 1008, hasContinuation: true },
      { legalText: "continuado", contentBottom: 400, pageBottom: 1008, hasContinuation: false }
    ]
  });
  assert.deepEqual(problems.map(({ code }) => code), ["EXCESSIVE_CONTINUATION_GAP"]);
});

test("el contrato detecta firmas excesivamente separadas dentro de la misma hoja", () => {
  const problems = validateDocumentLayout({
    sourceText: "Yo certifico y doy fe.",
    pages: [{
      legalText: "Yo certifico y doy fe.", contentBottom: 100, pageBottom: 1008,
      signatureFirstTop: 130, signatureBottom: 940, signatureCount: 1,
      signatureRowGaps: [230, 218, 225]
    }]
  });
  assert.deepEqual(problems.map(({ code }) => code), ["EXCESSIVE_SIGNATURE_SPACING"]);
});

test("el contrato rechaza estirar el último renglón de una hoja que continúa", () => {
  const problems = validateDocumentLayout({
    sourceText: "Texto continuado",
    pages: [
      { legalText: "Texto ", contentBottom: 900, pageBottom: 1008, hasContinuation: true, continuationBottom: 980, continuationLastLineStretched: true },
      { legalText: "continuado", contentBottom: 300, pageBottom: 1008, hasContinuation: false }
    ]
  });
  assert.deepEqual(problems.map(({ code }) => code), ["STRETCHED_CONTINUATION_LINE"]);
});

test("el contrato exige que las firmas comiencen cerca del cierre", () => {
  const problems = validateDocumentLayout({
    sourceText: "Yo doy fe.",
    pages: [{ legalText: "Yo doy fe.", contentBottom: 150, pageBottom: 1008, signatureFirstTop: 210, signatureBottom: 550, signatureCount: 1 }]
  });
  assert.deepEqual(problems.map(({ code }) => code), ["EXCESSIVE_FINAL_GAP"]);
});

test("el contrato limita la separación entre renglones de firmas", () => {
  const problems = validateDocumentLayout({
    sourceText: "Yo doy fe.",
    pages: [{ legalText: "Yo doy fe.", contentBottom: 150, pageBottom: 1008, signatureFirstTop: 180, signatureBottom: 550, signatureCount: 1, signatureRowGaps: [32, 80, 30] }]
  });
  assert.deepEqual(problems.map(({ code }) => code), ["EXCESSIVE_SIGNATURE_SPACING"]);
});
