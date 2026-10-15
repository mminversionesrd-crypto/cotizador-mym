(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.FinanLineFinisher = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  function fillerCount({ remainingWidth, hyphenWidth, safetyGap = 2 }) {
    if (!Number.isFinite(remainingWidth) || !Number.isFinite(hyphenWidth) || hyphenWidth <= 0) return 0;
    return Math.max(0, Math.floor((remainingWidth - safetyGap) / hyphenWidth));
  }

  function lastTextNode(element) {
    const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node;
    let last = null;
    while ((node = walker.nextNode())) if (node.textContent.trim()) last = node;
    return last;
  }

  function fillTrailingLine(paragraph, className = "notarial-line-fill") {
    paragraph.querySelector(`.${className}`)?.remove();
    const node = lastTextNode(paragraph);
    if (!node) return 0;
    const text = node.textContent;
    const end = text.length;
    const range = paragraph.ownerDocument.createRange();
    range.setStart(node, Math.max(0, end - 1));
    range.setEnd(node, end);
    const characterBox = range.getBoundingClientRect();
    const paragraphBox = paragraph.getBoundingClientRect();
    const style = getComputedStyle(node.parentElement);
    const canvas = paragraph.ownerDocument.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const hyphenWidth = context.measureText("-").width + parseFloat(style.letterSpacing || "0") || context.measureText("-").width;
    const count = fillerCount({ remainingWidth: paragraphBox.right - characterBox.right, hyphenWidth, safetyGap: 2 });
    if (!count) return 0;
    const filler = paragraph.ownerDocument.createElement("span");
    filler.className = className;
    filler.setAttribute("aria-hidden", "true");
    filler.textContent = "-".repeat(count);
    node.parentNode.insertBefore(filler, node.nextSibling);
    while (filler.textContent.length) {
      const boxes = [...filler.getClientRects()];
      if (boxes.every((box) => box.top <= characterBox.top + 2)) break;
      filler.textContent = filler.textContent.slice(0, -1);
    }
    const actual = filler.textContent.length;
    if (!actual) filler.remove();
    return actual;
  }

  return { fillerCount, fillTrailingLine };
});
