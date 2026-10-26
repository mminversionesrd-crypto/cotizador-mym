# Document Composition and Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar huecos evitables, cierres separados y firmas mal ubicadas del pagaré notarial mediante reglas de composición reutilizables en todos los documentos.

**Architecture:** Separar el texto legal en bloques semánticos, paginar esos bloques con geometría Carta compartida y reservar el bloque de firmas antes de decidir el último salto. La vista previa y la impresión consumirán exactamente el mismo árbol de páginas. La plantilla notarial conservará sus datos y redacción actuales mientras se sustituye su mecanismo de composición.

**Tech Stack:** JavaScript y CSS existentes; Node.js y Playwright de las regresiones locales.

**Spec:** `docs/specs/document-composition-and-pagination-v1.md`

## Global Constraints

- Trabajar en el checkout actual sin sobrescribir cambios ajenos ni crear commits que incluyan el árbol ya modificado.
- No cambiar cifras financieras, identidades ni cláusulas jurídicas como parte de esta corrección de formato.
- Mantener impresión Carta y funcionamiento local por `file://`.
- El cierre con guiones se decide por la plantilla jurídica; los documentos comerciales pueden usar otra regla.
- Una página solo se declara lista cuando supera controles de texto, geometría, firmas, renglón final y numeración.

## Review Focus

- Una frase final muy próxima al borde derecho no debe provocar un renglón compuesto solo por guiones.
- Nombres largos de firmantes no deben empujar la firma notarial fuera del margen imprimible.
- Un cambio de tipografía puede alterar el número de páginas; folios y contador deben recalcularse.
- Un artículo largo puede continuar, pero su ordinal no puede quedar solo al final de la hoja.
- La primera y última hojas no deben quedar casi vacías por reservar firmas o insertar «SIGUE AL DORSO» prematuramente.

---

### Task 1: Bloques de documento y geometría Carta

**Files:**
- Create: `document-engine/document-blocks.js`
- Create: `document-engine/page-geometry.js`
- Modify: `pagare-notarial.js`
- Test: `tests/document-blocks.test.cjs`

**Interfaces:**
- Consumes: datos ya validados del formulario notarial.
- Produces: `composeNotarialBlocks(values): DocumentBlock[]` y `letterPageGeometry(templateId, fontId): PageGeometry`.

- [ ] Escribir prueba que compare el texto fuente con los bloques, verifique el orden y trate los guiones como decoración.
- [ ] Ejecutar la prueba y confirmar fallo.
- [ ] Extraer encabezado, artículos, cierre, continuación y firmas a bloques sin editar su redacción.
- [ ] Centralizar ancho, alto, márgenes y zona segura de firmas Carta; hacer que vista previa e impresión usen esos tokens.
- [ ] Ejecutar prueba y confirmar aprobación.

### Task 2: Motor de paginación y equilibrio de la hoja final

**Files:**
- Create: `document-engine/pagination-engine.js`
- Modify: `pagare-notarial.js`
- Test: `tests/document-pagination.test.cjs`

**Interfaces:**
- Consumes: `DocumentBlock[]` y `PageGeometry` de Task 1.
- Produces: `paginateDocument(blocks, geometry): { pages, diagnostics, printReady }`.

- [ ] Escribir pruebas para 1/2/3/4 hojas, ordinal huérfano, nombre largo, firma indivisible y hoja final con hueco excesivo.
- [ ] Ejecutar pruebas y confirmar fallo.
- [ ] Esperar fuentes e imágenes, medir bloques en área Carta y reservar firmas antes del último salto.
- [ ] Reequilibrar las dos últimas hojas trasladando texto completo o líneas válidas hasta usar el espacio disponible y conservar firmas en la zona inferior.
- [ ] Recalcular página/folio después de estabilizar el contenido; bloquear desborde y firma cortada.
- [ ] Ejecutar pruebas y confirmar aprobación.

### Task 3: Renglón final, continuación y composición de firmas

**Files:**
- Create: `document-engine/line-finisher.js`
- Modify: `pagare-notarial.css`
- Modify: `pagare-notarial.js`
- Test: `tests/notarial-print-regression.cjs`

**Interfaces:**
- Consumes: páginas de Task 2.
- Produces: `fillLastLine(line, marker, width): LineFillResult`, `composeSignatureGroup(signers, geometry): SignatureGroup`.

- [ ] Escribir pruebas geométricas que fallen si los guiones después de «doy fe.» saltan de línea, si el renglón anterior a «SIGUE AL DORSO» deja un hueco evitable o si alguna firma queda fuera de la banda segura.
- [ ] Ejecutar la regresión y confirmar fallo.
- [ ] Sustituir la regla independiente por relleno del renglón final medido con la fuente real.
- [ ] Recolocar el grupo completo de firmas según su altura real, preservando orden, espacio para firma y margen inferior.
- [ ] Ejecutar la regresión en las cuatro tipografías y confirmar aprobación.

### Task 4: Contrato reutilizable y aceptación de impresión

**Files:**
- Create: `document-engine/document-layout-contract.js`
- Modify: `pagare-privado.js` únicamente para consumir el contrato común cuando su plantilla lo permita, sin cambiar texto.
- Test: `tests/document-layout-contract.test.cjs`
- Test: `tests/notarial-print-regression.cjs`
- Document: `docs/document-layout-acceptance.md`

**Interfaces:**
- Consumes: bloques, geometría, páginas y diagnósticos de Tasks 1–3.
- Produces: `validateDocumentLayout(pages, policy): Diagnostic[]`, utilizable por las próximas plantillas.

- [ ] Escribir pruebas de integridad textual, hoja intermedia vacía, tabla sin filas partidas, folios correctos y coincidencia vista previa/impresión.
- [ ] Ejecutar pruebas y confirmar fallo.
- [ ] Añadir los diagnósticos tipados definidos en la especificación y bloquear impresión si hay fallos críticos.
- [ ] Revisar PDF Carta a 100 % y capturas de todas las páginas del ejemplo del usuario; documentar el resultado y los límites de la plantilla.
- [ ] Ejecutar regresión notarial y suite existente, corregir solo fallos causados por esta migración y entregar evidencia.

## Self-review

- La especificación exige redacción por bloques (Task 1), paginación y folios (Task 2), guiones y firmas (Task 3), y controles reutilizables (Task 4).
- Los casos críticos de Review Focus se prueban en Tasks 2–4.
- Las interfaces van en orden: bloques y geometría → páginas → acabados → validación común.
- No se declara éxito solo por ausencia de desborde: se requieren mediciones de huecos, renglón final y posiciones de firmas.
