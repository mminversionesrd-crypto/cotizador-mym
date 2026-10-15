(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.FinanPaginationEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  function planTailTransfer({ previousTailHeights, finalUsed, finalCapacity, minimumTextHeight = 0 }) {
    let moved = 0;
    let used = finalUsed;
    for (const height of previousTailHeights) {
      if (!Number.isFinite(height) || height < 0 || used + height > finalCapacity) break;
      used += height;
      moved += 1;
    }
    return { moveCount: moved, finalUsed: used, enoughText: used - finalUsed >= minimumTextHeight };
  }
  function shouldContinueBlockOnPage({ remainingHeight, lineHeight }) {
    return Number.isFinite(remainingHeight) && Number.isFinite(lineHeight) && lineHeight > 0 && remainingHeight >= 0;
  }
  function pageClosingMode({ pageIndex, totalPages, legalText, closingPhrase = "doy fe." }) {
    if (pageIndex < totalPages - 1) return "continue";
    const phrase = String(closingPhrase || "").trim().toLocaleLowerCase("es-DO");
    return phrase && String(legalText || "").trim().toLocaleLowerCase("es-DO").endsWith(phrase) ? "final-fill" : "invalid-final";
  }
  function spanishBreakPoints(word) {
    if (!/^[a-záéíóúüñ]{6,}$/u.test(word)) return [];
    const vowels = /[aeiouáéíóúü]/u;
    const joinedOnsets = new Set(["br", "cr", "dr", "fr", "gr", "pr", "tr", "bl", "cl", "fl", "gl", "pl", "ch", "ll", "rr"]);
    const points = [];
    for (let index = 0; index < word.length;) {
      if (!vowels.test(word[index])) { index += 1; continue; }
      while (index < word.length && vowels.test(word[index])) index += 1;
      const consonantStart = index;
      while (index < word.length && !vowels.test(word[index])) index += 1;
      if (index >= word.length) break;
      const run = word.slice(consonantStart, index);
      const point = run.length === 1 || (run.length === 2 && joinedOnsets.has(run))
        ? consonantStart
        : run.length === 2 ? consonantStart + 1 : -1;
      if (point >= 2 && word.length - point >= 2) points.push(point);
    }
    return points;
  }
  function chooseWordBreak(word, fitsHead) {
    for (const point of spanishBreakPoints(word).reverse()) {
      const head = word.slice(0, point);
      if (fitsHead(head)) return { head, tail: word.slice(point) };
    }
    return null;
  }
  function shouldStopTailTransfer({ movedHeight, lineHeight, previousHasText, previousEndsOrdinal, finalFits }) {
    return finalFits && previousHasText && !previousEndsOrdinal && Number.isFinite(lineHeight) && movedHeight >= lineHeight * 2;
  }
  return { planTailTransfer, shouldContinueBlockOnPage, pageClosingMode, spanishBreakPoints, chooseWordBreak, shouldStopTailTransfer };
});
