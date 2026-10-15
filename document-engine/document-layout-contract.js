(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.FinanDocumentLayout = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const normalize = (value) => String(value || "").replace(/\s+/g, " ").trim();
  function validateDocumentLayout({ sourceText, pages, safetyPx = 8 }) {
    const diagnostics = [];
    if (normalize(sourceText) !== normalize(pages.map((page) => page.legalText).join(""))) diagnostics.push({ code: "TEXT_MISMATCH" });
    pages.forEach((page, index) => {
      if (page.contentBottom > page.pageBottom + 1) diagnostics.push({ code: "PAGE_OVERFLOW", page: index + 1 });
      if (index < pages.length - 1 && (!page.legalText.trim() || !page.hasContinuation)) diagnostics.push({ code: "EMPTY_CONTINUATION", page: index + 1 });
      if (index === pages.length - 1 && !page.legalText.trim()) diagnostics.push({ code: "EMPTY_CONTINUATION", page: index + 1 });
      if (page.signatureBottom != null && page.signatureBottom > page.pageBottom - safetyPx) diagnostics.push({ code: "SIGNATURE_MARGIN", page: index + 1 });
      if (index < pages.length - 1 && page.fillCount > 0) diagnostics.push({ code: "PREMATURE_FILL", page: index + 1 });
      if (index < pages.length - 1 && page.continuationBottom != null && page.pageBottom - page.continuationBottom > 90) diagnostics.push({ code: "EXCESSIVE_CONTINUATION_GAP", page: index + 1 });
      if (index < pages.length - 1 && page.continuationLastLineStretched) diagnostics.push({ code: "STRETCHED_CONTINUATION_LINE", page: index + 1 });
      if (page.orphanHeading) diagnostics.push({ code: "ORPHAN_HEADING", page: index + 1 });
      if (page.closingFillSameLine === false) diagnostics.push({ code: "CLOSING_FILL_WRAP", page: index + 1 });
      if (page.signatureCount != null && page.signatureCount !== (index === pages.length - 1 ? 1 : 0)) diagnostics.push({ code: "SIGNATURE_SPLIT", page: index + 1 });
      if (page.signatureFirstTop != null && page.signatureFirstTop - page.contentBottom > 46) diagnostics.push({ code: "EXCESSIVE_FINAL_GAP", page: index + 1 });
      if (page.signatureRowGaps?.some((gap) => gap > 54)) diagnostics.push({ code: "EXCESSIVE_SIGNATURE_SPACING", page: index + 1 });
      if (page.pageNumber != null && (page.pageNumber !== index + 1 || page.totalPages !== pages.length)) diagnostics.push({ code: "PAGE_NUMBER_REFLOW", page: index + 1 });
    });
    return diagnostics;
  }
  return { validateDocumentLayout };
});
