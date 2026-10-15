(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.FinanNotarialFonts = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const fonts = Object.freeze({
    courier: Object.freeze({ className: "notarial-font--courier", cssFamily: '"Courier New", Courier, monospace' }),
    times: Object.freeze({ className: "notarial-font--times", cssFamily: '"Times New Roman", Times, serif' }),
    georgia: Object.freeze({ className: "notarial-font--georgia", cssFamily: 'Georgia, "Times New Roman", serif' }),
    arial: Object.freeze({ className: "notarial-font--arial", cssFamily: 'Arial, Helvetica, sans-serif' }),
    myriad: Object.freeze({ className: "notarial-font--myriad", cssFamily: '"Myriad Pro", Arial, Helvetica, sans-serif' })
  });

  function selectNotarialFont(value) {
    return fonts[value] || fonts.courier;
  }

  async function waitForNotarialFont(fontSet, value) {
    if (!fontSet) return;
    if (typeof fontSet.load === "function") await fontSet.load(`10pt ${selectNotarialFont(value).cssFamily}`);
    if (fontSet.ready) await fontSet.ready;
  }

  return { selectNotarialFont, waitForNotarialFont };
});
