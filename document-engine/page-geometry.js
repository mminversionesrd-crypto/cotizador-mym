(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.FinanPageGeometry = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  function letterPageGeometry() {
    return Object.freeze({
      pageWidthIn: 8.5,
      pageHeightIn: 11,
      marginTopIn: .25,
      marginBottomIn: .25,
      marginLeftIn: .62,
      marginRightIn: .62,
      contentWidthIn: 7.26,
      contentHeightIn: 10.5,
      signatureSafetyPx: 8
    });
  }
  return { letterPageGeometry };
});
