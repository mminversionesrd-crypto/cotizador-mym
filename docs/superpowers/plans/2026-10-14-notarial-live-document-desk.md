# Notarial Live Document Desk Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir Pagaré notarial en una mesa documental de dos columnas con formulario compacto y vista previa paginada idéntica a la impresión.

**Architecture:** El formulario seguirá siendo la única fuente de datos. `renderPrint()` seguirá siendo la única fuente del documento; una nueva capa de vista previa clonará sus páginas, las escalará y permitirá navegar sin duplicar texto jurídico ni cálculos.

**Tech Stack:** HTML generado con JavaScript, CSS Grid, Playwright, impresión CSS tamaño Carta.

**Spec:** Propuesta aprobada en el chat del 14 de octubre de 2026 y `docs/specs/standardized-document-engine-v2.md`.

## Global Constraints

- No duplicar el texto jurídico entre vista previa e impresión.
- Conservar cálculos, validaciones, folios consecutivos y firmas al pie.
- No generar la versión final con información esencial faltante.
- Mantener funcionamiento local sin nuevas dependencias ni base de datos.
- Usar diseño azul moderno coherente con la calculadora de pagos.

## Review Focus

- Campos incompletos: la vista previa debe mostrarse como borrador y señalar el primer dato pendiente.
- Documento de varias páginas: navegación, contador y miniaturas deben coincidir con el resultado impreso.
- Escritura rápida: la actualización debe estar limitada para no bloquear el formulario.
- Pantallas estrechas: formulario primero y vista previa debajo sin desbordamiento horizontal.
- Impresión: solo se imprime el informe legal, nunca la mesa de edición.

---

### Task 1: Contrato de interfaz y vista previa

**Files:**
- Modify: `tests/notarial-print-regression.cjs`
- Modify: `pagare-notarial.js`

**Interfaces:**
- Consumes: `renderPrint()` y `validate()` existentes.
- Produces: `[data-notarial-editor]`, `[data-notarial-preview]`, `[data-preview-pages]`, `refreshLivePreview()`.

- [ ] Escribir una prueba que exija la distribución editor/vista previa, estado de borrador, páginas clonadas y navegación.
- [ ] Ejecutar la prueba y confirmar que falla por ausencia de la nueva mesa documental.
- [ ] Añadir la estructura mínima y el render de páginas desde el informe legal existente.
- [ ] Ejecutar la prueba y confirmar que pasa.

### Task 2: Formulario compacto inspirado en la calculadora

**Files:**
- Modify: `pagare-notarial.css`
- Modify: `pagare-notarial.js`

**Interfaces:**
- Consumes: secciones existentes del formulario.
- Produces: panel izquierdo compacto, resumen financiero y acciones persistentes.

- [ ] Añadir prueba de geometría que confirme dos columnas en escritorio y una columna en móvil.
- [ ] Verificar el fallo antes del CSS nuevo.
- [ ] Implementar Grid, campos compactos, jerarquía visual y adaptación móvil.
- [ ] Verificar geometría, foco y ausencia de desbordamiento.

### Task 3: Navegación y actualización segura

**Files:**
- Modify: `pagare-notarial.js`
- Modify: `pagare-notarial.css`
- Modify: `tests/notarial-print-regression.cjs`

**Interfaces:**
- Consumes: páginas generadas por `renderPrint()`.
- Produces: `showPreviewPage(index)`, contador, anterior/siguiente y actualización diferida.

- [ ] Probar que editar capital o deudor actualiza la vista y que los botones cambian de página sin alterar datos.
- [ ] Implementar actualización diferida y navegación accesible.
- [ ] Confirmar que vista previa e impresión contienen el mismo texto y número de páginas.

### Task 4: Paginación, recursos y regresión completa

**Files:**
- Modify: `index.html`
- Verify: `pagare-notarial.js`, `pagare-notarial.css`, `tests/*.cjs`

**Interfaces:**
- Consumes: mesa documental final.
- Produces: versión de recursos actualizada y evidencia de regresión.

- [ ] Actualizar las versiones de JS/CSS para invalidar recursos antiguos.
- [ ] Verificar separadores completos, firmas al pie, folios, integridad textual y vista previa visual.
- [ ] Ejecutar los 18 archivos de pruebas y confirmar cero fallos.
