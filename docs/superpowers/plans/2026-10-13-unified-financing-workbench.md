# Unified Financing Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar una mesa unificada sin base de datos para compra, venta, financiamiento, garantías, expedientes, documentos y control.

**Architecture:** Un núcleo de operación versionado mantendrá el estado compartido y lo expondrá a formularios configurados por producto. Un repositorio temporal basado en sesión y archivos JSON quedará detrás de una interfaz reemplazable, de modo que una API futura no obligue a rehacer la experiencia ni los cálculos.

**Tech Stack:** HTML5, CSS, JavaScript ES2022, `sessionStorage`, archivos JSON, Node.js y Playwright para pruebas.

**Spec:** `docs/specs/financing-workbench-v1.md`

**Estado:** Implementado y verificado el 13 de octubre de 2026. Los commits previstos se omitieron para no mezclar cambios previos del usuario en el checkout actual.

## Global Constraints

- No usar base de datos, servidor ni dependencias nuevas.
- No modificar silenciosamente valores financieros introducidos por el colaborador.
- No confundir bien financiado, garantía real, deudor, codeudor solidario o fiador.
- No declarar desembolso, entrega, aprobación o recepción antes de su confirmación explícita.
- Conservar cálculos, pagarés, firmas al pie e impresión existentes.
- Mantener funcionamiento mediante archivo local y diseño responsive.

## Review Focus

- Una operación importada con versión desconocida se rechaza con explicación y sin perder el expediente actual.
- Cambiar de producto conserva datos comunes, elimina requisitos ajenos y pide confirmación antes de aplicar nuevas condiciones.
- Capital, inicial, intereses, gastos y total programado nunca se mezclan en un solo concepto.
- Un codeudor solo genera obligaciones y documentos cuando fue identificado expresamente como solidario.
- Una garantía insuficiente genera alerta y bloqueo configurable, pero no una decisión crediticia automática.

---

### Task 1: Núcleo de operación y repositorio temporal

**Files:**
- Create: `operation-core.js`
- Create: `operation-repository.js`
- Test: `tests/operation-core.test.cjs`
- Test: `tests/operation-repository.test.cjs`

**Interfaces:**
- Produces: `OperationCore.create(productType)`, `OperationCore.patch(operation, changes)`, `OperationCore.changeProduct(operation, productType)`, `OperationRepository.load()`, `save(operation)`, `export(operation)`, `import(json)`.

- [ ] Escribir pruebas de creación, actualización inmutable, cambio de producto y separación entre bien y garantía.
- [ ] Ejecutar las pruebas y confirmar que fallan por módulos inexistentes.
- [ ] Implementar esquema versionado con referencia, personas, propuesta, bien, garantía, evaluación, expediente, documentos y estado.
- [ ] Implementar persistencia de sesión, exportación e importación JSON con validación de versión.
- [ ] Ejecutar pruebas y comprobar aprobación completa.
- [ ] Commit: `feat: add temporary operation core`

### Task 2: Motor de productos y reglas configurables

**Files:**
- Create: `product-rules.js`
- Create: `product-policies.json`
- Test: `tests/product-rules.test.cjs`

**Interfaces:**
- Consumes: `OperationCore`.
- Produces: `ProductRules.get(type)`, `requirements(type, operation)`, `recommendations(type, operation)`, `validate(type, operation)`.

- [ ] Escribir pruebas para los ocho productos, requisitos condicionales y conservación de valores escritos.
- [ ] Ejecutar pruebas y confirmar el fallo inicial.
- [ ] Definir políticas de campos, documentos, plazos, iniciales y alertas sin imponer aprobación.
- [ ] Implementar recomendaciones que solo se aplican mediante confirmación explícita.
- [ ] Ejecutar pruebas y comprobar aprobación.
- [ ] Commit: `feat: add configurable product rules`

### Task 3: Barra de expediente y selector de proceso

**Files:**
- Create: `operation-workbench.js`
- Create: `operation-workbench.css`
- Modify: `index.html`
- Modify: `ultimate-ui.js`
- Test: `tests/operation-workbench-regression.cjs`

**Interfaces:**
- Consumes: `OperationCore`, `OperationRepository`, `ProductRules`.
- Produces: `OperationWorkbench.mount(root)`, `openOperation(operation)`, `navigate(stage)`.

- [ ] Escribir prueba visual para selector de ocho procesos, barra persistente, Inicio y ausencia de desbordamiento.
- [ ] Ejecutar prueba y confirmar que falla.
- [ ] Construir selector por tarea y barra con referencia, cliente, producto, estado y avance.
- [ ] Añadir acciones crear, duplicar, exportar, importar y limpiar con advertencia de cambios.
- [ ] Integrar navegación con los 18 accesos actuales.
- [ ] Ejecutar prueba en escritorio y móvil.
- [ ] Commit: `feat: add unified operation workbench`

### Task 4: Formularios especializados y expediente dinámico

**Files:**
- Create: `product-flows.js`
- Modify: `operation-workbench.js`
- Modify: `operation-workbench.css`
- Test: `tests/product-flows.test.cjs`

**Interfaces:**
- Consumes: reglas y operación compartida.
- Produces: `ProductFlows.sections(type, operation)`, `completion(type, operation)`, `blockers(type, operation)`.

- [ ] Escribir pruebas de secciones y campos para personal, comercial, motocicleta, vehículo, hipoteca, smartphone y electrodoméstico.
- [ ] Ejecutar y confirmar fallo inicial.
- [ ] Construir formularios configurables con datos comunes, secciones propias y codeudor condicional.
- [ ] Implementar checklist dinámico, porcentaje y navegación al primer bloqueo.
- [ ] Conectar cambios al expediente sin duplicar cliente ni propuesta.
- [ ] Ejecutar pruebas funcionales y visuales.
- [ ] Commit: `feat: add specialized financing flows`

### Task 5: Simulación, comparación, capacidad y rentabilidad

**Files:**
- Create: `operation-calculators.js`
- Modify: `operation-workbench.js`
- Test: `tests/operation-calculators.test.cjs`

**Interfaces:**
- Produces: `calculateProposal(input)`, `compareProposals(input)`, `calculateCapacity(profile)`, `calculateMargin(sale)`, `calculateCommercialCoverage(business)`.

- [ ] Escribir pruebas para cifras, redondeo, entradas inválidas y separación entre capital e intereses.
- [ ] Ejecutar y confirmar fallo inicial.
- [ ] Extraer cálculos puros reutilizando las fórmulas actuales.
- [ ] Implementar tres propuestas comparables y selección explícita.
- [ ] Implementar capacidad personal, cobertura comercial y margen de venta.
- [ ] Conectar resultados al resumen lateral sin alterar valores del formulario.
- [ ] Ejecutar pruebas y comparar con cálculos actuales.
- [ ] Commit: `feat: add proposal and profitability calculators`

### Task 6: Evaluación de garantías reales

**Files:**
- Create: `collateral-evaluation.js`
- Modify: `product-flows.js`
- Test: `tests/collateral-evaluation.test.cjs`

**Interfaces:**
- Produces: `evaluateVehicleCollateral(data)`, `evaluateMortgageCollateral(data)` y bloqueos documentales.

- [ ] Escribir pruebas de relación préstamo/valor, cobertura, propiedad distinta y datos esenciales faltantes.
- [ ] Ejecutar y confirmar fallo inicial.
- [ ] Implementar ficha vehicular con identificación, valoración y gravámenes declarados.
- [ ] Implementar ficha hipotecaria con inmueble, título, tasación y revisión jurídica.
- [ ] Añadir alertas explicativas sin aprobación automática.
- [ ] Ejecutar pruebas.
- [ ] Commit: `feat: add collateral evaluation flows`

### Task 7: Centro documental conectado

**Files:**
- Create: `document-center.js`
- Modify: `app.js`
- Modify: `pagare-privado.js`
- Modify: `pagare-notarial.js`
- Test: `tests/document-center-regression.cjs`

**Interfaces:**
- Consumes: expediente y requisitos del producto.
- Produces: `DocumentCenter.available(operation)`, `readiness(documentType, operation)`, `open(documentType)`.

- [ ] Escribir prueba de disponibilidad, reutilización de datos, bloqueo por faltantes y codeudor condicional.
- [ ] Ejecutar y confirmar fallo inicial.
- [ ] Crear tablero de documentos requeridos, listos y bloqueados.
- [ ] Precargar cotización, recibo, pagaré, amortización, autorización, desembolso y entrega.
- [ ] Mantener paginación, firmas al pie y validaciones legales actuales.
- [ ] Ejecutar regresiones de impresión.
- [ ] Commit: `feat: connect operation document center`

### Task 8: Continuidad, modo sin conexión y protección de trabajo

**Files:**
- Create: `app.webmanifest`
- Create: `service-worker.js`
- Modify: `index.html`
- Modify: `operation-repository.js`
- Test: `tests/offline-and-export-regression.cjs`

**Interfaces:**
- Consumes: repositorio temporal.
- Produces: instalación local, caché de archivos estáticos, advertencia de cambios y paquete JSON versionado.

- [ ] Escribir pruebas para manifiesto, recursos esenciales, exportación e importación segura.
- [ ] Ejecutar y confirmar fallo inicial.
- [ ] Añadir manifiesto e instalación sin bloquear uso por `file://`.
- [ ] Implementar service worker solamente cuando la página se sirva por HTTP/HTTPS.
- [ ] Añadir indicador de cambios no exportados y confirmación antes de limpiar.
- [ ] Ejecutar pruebas en archivo local y contexto HTTP.
- [ ] Commit: `feat: add offline operation continuity`

### Task 9: Integración completa y aceptación

**Files:**
- Modify: `tests/ultimate-ui-regression.cjs`
- Modify: `tests/quote-ux-regression.cjs`
- Create: `tests/end-to-end-product-flows.cjs`

**Interfaces:**
- Consumes: todos los módulos anteriores.
- Produces: evidencia de aceptación para los ocho procesos.

- [ ] Probar una ruta completa por cada producto desde creación hasta documentos disponibles.
- [ ] Probar cambio de producto, exportación/importación y datos condicionales.
- [ ] Probar escritorio, móvil, teclado y reducción de movimiento.
- [ ] Ejecutar todas las pruebas existentes y nuevas; exigir cero fallos.
- [ ] Revisar visualmente inicio, formularios, garantías, centro documental e impresión.
- [ ] Commit: `test: verify unified financing workbench`
