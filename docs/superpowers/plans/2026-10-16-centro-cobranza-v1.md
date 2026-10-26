# Centro de Cobranza V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar al sistema un centro local de cobranza que permita cargar una cartera activa, registrar gestiones y pagos verificables, dar seguimiento a promesas y producir reportes reconciliables.

**Architecture:** Un núcleo puro y probado define el paquete de cartera, la validación y los cálculos. Una interfaz independiente se integra al menú existente y usa `sessionStorage` solo para continuidad temporal; el archivo JSON exportado es la copia durable. Ningún expediente de cotización se convierte automáticamente en obligación activa.

**Tech Stack:** JavaScript de navegador sin dependencias nuevas, HTML/CSS existentes, pruebas `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-15-mesa-unificada-y-cobranza-design.md` (sección Centro de Cobranza). La Mesa Unificada queda fuera de este plan; su conexión futura se hará mediante un evento de desembolso confirmado.

## Global Constraints

- V1 no tiene servidor, base de datos, sincronización multiusuario, mensajes automáticos ni tareas con el navegador cerrado.
- Un solo responsable edita cada paquete de cartera; exportar el archivo antes de cerrar la sesión.
- Guardar importes en centavos enteros, fechas `YYYY-MM-DD` y moneda explícita; fecha de corte en `America/Santo_Domingo`.
- Cuota programada, pago pendiente, pago confirmado, aplicación, promesa y gestión son hechos distintos.
- No suponer orden de aplicación, mora, gastos ni condonaciones. Si la distribución capital/interés no está documentada, bloquear el saldo contractual desglosado y mostrar la excepción.
- El paquete local contiene datos personales; no enviarlos en enlaces ni registros públicos.
- No alterar el cálculo ni la impresión de los pagarés, cotizaciones y documentos existentes.

## Review Focus

1. Archivo con referencia o cuota duplicada: rechazar el lote completo y conservar la cartera anterior (Task 1).
2. Pago duplicado o sin referencia: impedir confirmación y no reducir saldo (Task 2).
3. Pago parcial, anticipado o reversado: reconstruir saldo al corte sin editar el calendario original (Task 2).
4. Promesa vencida sin pago: marcar incumplida en la cola, sin modificar deuda (Task 3).
5. Archivo manipulado o sesión cerrada sin exportar: detectar integridad y advertir pérdida de cambios (Task 1 y Task 3).

---

### Task 1: Paquete de cartera e importación segura

**Files:**
- Create: `collections/collection-core.js`
- Create: `collections/collection-repository.js`
- Test: `tests/collection-package.test.cjs`

**Interfaces:**
- Produces `CollectionCore.createPackage({asOf, owner, source})`, `validatePackage(package) -> {valid, errors}`, `summarizeImport(current, incoming) -> {added, changed, removed, errors}`, `checksumPackage(package) -> Promise<string>`.
- Produces `CollectionRepository.load()`, `save(package)`, `serialize(package)`, `parse(text)`; format version 1 with `obligations`, `payments`, `contacts`, `promises`, `disputes`, `audit` and manifest.

- [ ] Write tests for a valid active obligation and for duplicate reference, duplicate installment, invalid date, negative amount, missing disbursement confirmation and tampered checksum.
- [ ] Run `node --test tests/collection-package.test.cjs`; confirm expected failures.
- [ ] Implement exact validation and export/import contract. Reject entire invalid imports; `parse` must not mutate current session data.
- [ ] Run the same test; confirm all pass.
- [ ] Commit only this task's files.

### Task 2: Libro de pagos y métricas a fecha de corte

**Files:**
- Modify: `collections/collection-core.js`
- Test: `tests/collection-ledger.test.cjs`

**Interfaces:**
- Produces `recordPendingPayment(package, input)`, `confirmPayment(package, paymentId, application, actor)`, `reversePayment(package, paymentId, reason, actor)` and `snapshot(package, asOf) -> {accounts, totals, exceptions}`.
- Payment application is explicit per installment and concept (`capitalCents`, `interestCents`); no universal allocation rule.

- [ ] Test that pending or duplicate payments and promises never reduce balances; confirmed applications do, and reversal restores them through an audit event.
- [ ] Test partial/early/late payments, invalid allocations, cut-off dates and aging buckets `current`, `1–30`, `31–60`, `61–90`, `90+`.
- [ ] Run `node --test tests/collection-ledger.test.cjs`; confirm failures.
- [ ] Implement immutable ledger transformations and derived balances; never overwrite original installments.
- [ ] Run tests; confirm all pass, then commit.

### Task 3: Centro de trabajo y expedientes de cobranza

**Files:**
- Create: `collections/collection-center.js`
- Create: `collections/collection-center.css`
- Modify: `index.html`
- Modify: `service-worker.js`
- Test: `tests/collection-center-integration.test.cjs`

**Interfaces:**
- The menu opens workspace `collections`; all other workspaces keep their existing behavior.
- UI consumes `CollectionCore` and `CollectionRepository`, exposes import preview/confirm, export, dashboard filter, account detail, contact log, promises, pending/confirmed payment and dispute workflow.

- [ ] Test menu mounting, navigation/Home, import refusal preserving prior data, status labels, read-only computed totals and unsaved export warning.
- [ ] Run the integration test; confirm failures.
- [ ] Implement a spacious dashboard and side-by-side account editor/detail, responsive mobile layout, accessible labels and explicit limits banner. Do not create real links containing personal data or automatic sends.
- [ ] Run integration tests and inspect keyboard/mouse flows at desktop and mobile widths.
- [ ] Commit this task's files.

### Task 4: Reportes, conciliación y release

**Files:**
- Modify: `collections/collection-core.js`
- Modify: `collections/collection-center.js`
- Modify: `collections/collection-center.css`
- Test: `tests/collection-reports.test.cjs`
- Modify: `service-worker.js`

**Interfaces:**
- Produces `buildReports(package, asOf, filters) -> {aging, dueProjection, confirmedCollections, promises, contacts, exceptions, provenance}`.
- CSV exports are analysis copies; JSON remains the master backup. Printable report is Letter size, with date of cut-off, currency, source, record count and calculation note.

- [ ] Test that report totals reconcile to `snapshot`, exclude pending payments from collections, identify stale source and preserve filters/provenance.
- [ ] Run report tests; confirm failures.
- [ ] Implement report cards, CSV export and Letter print view, without claiming unimplemented historical migration or legal automation.
- [ ] Run `node --test tests/*.test.cjs`; verify no regressions in existing calculators and documents.
- [ ] Inspect import/export round trip, print preview, service-worker cache update and mobile layout. Fix discrepancies, then commit.

## Final acceptance gate

No production data should be imported until the business supplies anonymized examples of actual schedules, receipts and payment-allocation rules. The release must clearly identify the V1 limitations and leave unsupported advanced reports visibly unavailable rather than presenting fabricated figures.
