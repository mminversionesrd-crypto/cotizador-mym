(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.FinanDocumentBlocks = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  function composeNotarialBlocks(parts) {
    return parts.map((part, index) => ({
      kind: part.article ? "article" : /doy fe\.$/i.test(part.text.trim()) ? "closing" : index === 0 ? "appearance" : "paragraph",
      article: part.article || null,
      text: part.text,
      node: part.node || null
    }));
  }
  function formatNotarialControlLine({ actNumber, actWords, folioNumber, folioWords }) {
    return `<p class="notarial-control-line">ACTO NÚMERO ${escapeHtml(actWords)} (${escapeHtml(actNumber)}). FOLIO NÚMERO ${escapeHtml(folioWords)} (${escapeHtml(folioNumber)}).</p>`;
  }
  return { composeNotarialBlocks, formatNotarialControlLine };
});
