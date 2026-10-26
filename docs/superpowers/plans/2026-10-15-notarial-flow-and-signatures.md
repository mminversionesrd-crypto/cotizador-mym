# Notarial Flow and Signatures Implementation Plan

> **For agentic workers:** Use `executing-plans` to implement these tasks in order. This checkout contains user changes and is the one opened in their browser; preserve them and do not commit or push without a separate request.

**Goal:** Compose the notarial pagaré as continuous text up to each page's actual capacity, without stretching continuation endings, and place a compact signature block immediately after «doy fe.».

**Architecture:** Keep the current document source and DOM pagination, but let the pagination decision attempt a one-line remainder before moving an article. Let the page's real fit and ordinal-orphan check decide the break. Keep the last-line and signature rules identical in measurement and print CSS, with layout diagnostics as the final gate.

**Tech Stack:** Browser JavaScript, CSS print styles, Node `node:test`; no new dependencies.

**Spec:** `docs/specs/document-composition-and-pagination-v1.md`

## Global Constraints

- Do not change legal wording, amounts, rates, or article order.
- Work locally from `file://`; preview and print must share the same composed pages.
- Only the final line after «doy fe.» may receive decorative hyphens.
- Preserve the user's existing dirty checkout and unrelated files; no commit or push.

## Review Focus

- One remaining line after «judicial;»: the next ordinal and initial words stay on that sheet if they fit.
- Ordinal with no initial words fitting: move the ordinal together with text, never leave it alone.
- Long bold text and names: do not create an avoidable blank or split protected identity values.
- One-to-four-page variations: text order, continuation marker, page labels and final signatures stay valid.
- Long signer names: compact group expands without overlap or clipping.

---

### Task 1: Article flow and natural continuation line

**Files:** `document-engine/pagination-engine.js`, `pagare-notarial.js`, `pagare-notarial.css`, `tests/document-composition.test.cjs`, `tests/notarial-print-regression.cjs`.

**Interfaces:** `shouldContinueBlockOnPage({ remainingHeight, lineHeight })` decides whether to *try* the current page; `appendFragmented` still enforces fit and orphan rules.

- [x] Add failing tests for exactly one line of available height and continuation-line alignment; retain the existing ordinal-orphan test.
- [x] Run the focused tests and verify the intended failure.
- [x] Allow the one-line attempt; retain actual-fit and ordinal checks; remove forced justification of the last continuation line in both CSS modes.
- [x] Run focused tests and the complete Node test suite.

### Task 2: Signatures follow the close

**Files:** `pagare-notarial.css`, `document-engine/document-layout-contract.js`, `pagare-notarial.js`, `tests/document-composition.test.cjs`, `tests/notarial-print-regression.cjs`.

**Interfaces:** `validateDocumentLayout({ pages })` receives measured first-signature gap and row gaps, and rejects an overlong gap or page overflow.

- [x] Add failing tests for a first-signature gap beyond 12 mm and a separated signature row.
- [x] Run the focused tests and verify the intended failure.
- [x] Remove bottom anchoring and the fixed tall signature band in measurement and print styles; reserve a compact natural-height group after the close.
- [x] Run focused tests and the complete Node test suite.

### Task 3: Final integrity and cache refresh

**Files:** `index.html`, `tests/notarial-print-regression.cjs`, `docs/specs/document-composition-and-pagination-v1.md` only if an implementation ruling is necessary.

**Interfaces:** The browser sees the new JS/CSS version; the regression checks legal-text integrity, no premature page break, natural last line, close filler only on the final page and signature geometry.

- [x] Update the regression checks and asset version.
- [x] Run syntax checks and all available Node tests. Visual/print automation is unavailable in this environment.
- [x] Review the edited files for unrelated changes, then report the unverified visual/print behavior explicitly.
