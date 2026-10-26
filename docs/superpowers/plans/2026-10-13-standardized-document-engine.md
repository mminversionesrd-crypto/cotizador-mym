# Standardized Document Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir un motor único, versionado y verificable para generar e imprimir documentos Carta, priorizando pagarés notariales sin cortes, datos inventados ni cláusulas no aprobadas.

**Architecture:** Un adaptador convertirá la operación compartida en una instantánea documental inmutable. Validación, plantillas, cálculos, paginación y exportación vivirán en módulos separados; las plantillas producirán bloques semánticos y un motor común los paginará con integridad textual y firmas controladas.

**Tech Stack:** HTML5, CSS Paged Media, JavaScript ES2022, Web Crypto, `sessionStorage`, JSON, vendor `docx` existente, Node.js y Playwright.

**Spec:** `docs/specs/standardized-document-engine-v2.md`

## Global Constraints

- Sin base de datos, servidor ni dependencia obligatoria nueva en esta fase.
- Papel Carta 8.5 × 11 pulgadas y funcionamiento por `file://`.
- No modificar cifras de la operación ni aplicar recomendaciones automáticamente.
- No imprimir datos, roles o cláusulas que no estén confirmados.
- No presentar un borrador como instrumento notarial terminado.
- No declarar desembolso si la operación no lo confirma.
- No atribuir ejecutoriedad, autenticidad o aceptación judicial automática.
- Conservar el actual centro de operaciones y las impresiones existentes durante la migración.

## Review Focus

- Una plantilla aprobada nunca debe incorporar una cláusula nueva por un cambio de código o configuración sin subir su versión.
- Nombres, domicilios y tablas extensas deben aumentar páginas sin perder texto ni separar firmas.
- El folio final debe coincidir siempre con la cantidad real de páginas y no con una entrada manual.
- Una operación no desembolsada debe generar lenguaje proyectado, nunca reconocimiento de dinero recibido.
- Una persona de referencia no debe convertirse en codeudor, firmante u obligado por estar presente en el expediente.

---

### Task 1: Inventario documental y contrato canónico

**Files:**
- Create: `document-engine/document-schema.js`
- Create: `document-engine/document-snapshot.js`
- Modify: `document-center.js`
- Test: `tests/document-snapshot.test.cjs`

**Interfaces:**
- Consumes: `OperationCore` y `DocumentCenter.documentData(type, operation)`.
- Produces: `DocumentSnapshot.create(documentType, operation, options)`, `validateShape(snapshot)` y `fingerprint(snapshot): Promise<string>`.

- [ ] Escribir pruebas para tipos, roles, capital separado, estado de desembolso, versión y huella estable.
- [ ] Ejecutar pruebas y confirmar fallo por módulos inexistentes.
- [ ] Implementar la instantánea inmutable con referencias de operación y plantilla.
- [ ] Añadir adaptadores para los documentos existentes sin cambiar su salida actual.
- [ ] Ejecutar pruebas y comprobar aprobación.
- [ ] Commit: `feat: add canonical document snapshots`

### Task 2: Registro de plantillas y cláusulas aprobadas

**Files:**
- Create: `document-engine/template-registry.js`
- Create: `document-engine/templates/notarial-promissory-v2.js`
- Create: `document-engine/templates/private-promissory-v2.js`
- Create: `document-engine/template-policies.json`
- Test: `tests/document-template-registry.test.cjs`

**Interfaces:**
- Consumes: `DocumentSnapshot`.
- Produces: `TemplateRegistry.get(id, version)`, `renderBlocks(snapshot)` y `allowedClauses(productType)`.

- [ ] Escribir pruebas que rechacen plantillas sin versión/aprobación y cláusulas no pactadas.
- [ ] Confirmar fallo inicial.
- [ ] Extraer el texto notarial del archivo monolítico hacia bloques versionados: comparecencia, obligación, condiciones, cláusulas, cierre y firmas.
- [ ] Marcar mora, vencimiento anticipado, garantías generales, renuncias y declaraciones de efecto jurídico como cláusulas sensibles desactivadas por defecto.
- [ ] Exigir responsable y fecha de aprobación para habilitar una plantilla final.
- [ ] Ejecutar pruebas y comprobar aprobación.
- [ ] Commit: `feat: version legal document templates`

### Task 3: Validación financiera, personal y jurídica previa

**Files:**
- Create: `document-engine/document-validator.js`
- Create: `document-engine/amount-in-words.js`
- Modify: `operation-calculators.js`
- Test: `tests/document-validator.test.cjs`

**Interfaces:**
- Consumes: instantánea, reglas de producto y tabla de amortización.
- Produces: `DocumentValidator.preflight(snapshot): {ready, blockers, warnings}` y `reconcile(snapshot)`.

- [ ] Escribir pruebas de cifras/letras, fechas, identidades, duplicados, roles, capital/interés/total y estado de desembolso.
- [ ] Confirmar fallo inicial.
- [ ] Implementar reconciliación de principal, intereses, suma de cuotas, primera fecha y vencimiento final con tolerancia de redondeo de RD$0.01 por cuota.
- [ ] Bloquear datos esenciales faltantes; mostrar advertencias no bloqueantes por separado.
- [ ] Validar que el codeudor tenga rol `solidary_codebtor` y que mora/cláusulas tengan evidencia de pacto.
- [ ] Ejecutar pruebas.
- [ ] Commit: `feat: add document preflight validation`

### Task 4: Sistema visual e impresión compartidos

**Files:**
- Create: `document-engine/print-tokens.css`
- Create: `document-engine/print-components.css`
- Create: `document-engine/document-preview.js`
- Modify: `index.html`
- Test: `tests/print-design-system-regression.cjs`

**Interfaces:**
- Consumes: bloques de plantilla.
- Produces: componentes `document-page`, `document-header`, `document-continuation`, `document-table`, `document-signatures` y `document-footer`.

- [ ] Escribir prueba visual de Carta, tipografía mínima, escala de grises, encabezado, pie y firmas.
- [ ] Confirmar fallo inicial.
- [ ] Definir tokens únicos de tamaño, márgenes, tipografía, espaciado, líneas y colores.
- [ ] Crear familias comercial y jurídica reutilizables.
- [ ] Implementar vista previa con miniaturas, contador, advertencias y datos de plantilla.
- [ ] Ejecutar en escritorio y móvil.
- [ ] Commit: `feat: standardize document print design`

### Task 5: Motor determinista de paginación

**Files:**
- Create: `document-engine/pagination-engine.js`
- Create: `document-engine/text-integrity.js`
- Test: `tests/pagination-engine.test.cjs`
- Test: `tests/pagination-visual-regression.cjs`

**Interfaces:**
- Consumes: `renderBlocks(snapshot)` y tokens Carta.
- Produces: `PaginationEngine.paginate(blocks, config)` con páginas, folios, integridad y diagnóstico.

- [ ] Escribir pruebas para una/múltiples páginas, contenido largo, tablas, encabezados repetidos y grupos atómicos.
- [ ] Confirmar fallo inicial.
- [ ] Esperar `document.fonts.ready` y decodificación de imágenes antes de medir.
- [ ] Paginar primero por bloques semánticos y fragmentar texto solo cuando un bloque completo exceda una hoja.
- [ ] Repetir encabezados de tabla, impedir cortes de filas y mantener juntos reconocimiento y firmas.
- [ ] Calcular folio final desde folio inicial y cantidad de páginas; añadir Página X de Y.
- [ ] Comparar texto fuente contra texto paginado y bloquear cualquier pérdida, duplicación o desbordamiento.
- [ ] Ejecutar pruebas.
- [ ] Commit: `feat: add deterministic letter pagination`

### Task 6: Compositor especializado de pagaré notarial

**Files:**
- Create: `document-engine/notarial-composer.js`
- Modify: `pagare-notarial.js`
- Modify: `pagare-notarial.css`
- Test: `tests/notarial-composer.test.cjs`
- Test: `tests/notarial-print-regression.cjs`

**Interfaces:**
- Consumes: instantánea, plantilla aprobada, preflight y paginador.
- Produces: `NotarialComposer.prepare(operation, controls)` y `generateApproved(snapshot, approval)`.

- [ ] Escribir pruebas que fallen con notario/testigos faltantes, mora no pactada, desembolso no confirmado o plantilla no aprobada.
- [ ] Confirmar fallo inicial.
- [ ] Reemplazar identidades notariales/testigos precargadas por perfiles configurables y confirmados.
- [ ] Eliminar folio final manual y derivarlo de la paginación.
- [ ] Mostrar selección explícita de cláusulas sensibles con resumen de su efecto.
- [ ] Generar lenguaje distinto para operación proyectada y desembolsada.
- [ ] Exigir aprobación jurídica registrada antes de habilitar “Generar versión final”; permitir siempre “Vista previa borrador”.
- [ ] Conservar firmas al pie y trasladar el bloque completo a una hoja identificada cuando no quepa.
- [ ] Ejecutar regresiones con uno y dos obligados.
- [ ] Commit: `feat: rebuild notarial promissory composer`

### Task 7: Integración del resto de documentos

**Files:**
- Modify: `pagare-privado.js`
- Modify: `app.js`
- Modify: `document-center.js`
- Test: `tests/document-center-v2-regression.cjs`

**Interfaces:**
- Consumes: instantáneas, validación, componentes y paginador común.
- Produces: generación uniforme para cotización, solicitud, evaluación, recibo, desembolso, pagaré privado, amortización y entrega.

- [ ] Escribir pruebas de reutilización de datos, documentos permitidos por producto y bloqueo por faltantes.
- [ ] Confirmar fallo inicial.
- [ ] Migrar un documento por vez manteniendo un adaptador al diseño anterior.
- [ ] Aplicar encabezado, referencia, pie, firmas y estados comunes.
- [ ] Reutilizar la misma tabla financiera en pagaré, amortización y resumen sin recalcular en cada plantilla.
- [ ] Ejecutar regresiones después de cada migración.
- [ ] Commit: `feat: migrate documents to shared engine`

### Task 8: Exportación, trazabilidad y paquete documental

**Files:**
- Create: `document-engine/document-export.js`
- Modify: `operation-repository.js`
- Test: `tests/document-export.test.cjs`

**Interfaces:**
- Consumes: instantánea generada y páginas validadas.
- Produces: `exportJson(snapshot)`, `print(snapshot)` y `exportDocx(snapshot)` usando el vendor existente.

- [ ] Escribir pruebas para nombres de archivo, versión, huella, impresión y DOCX Carta.
- [ ] Confirmar fallo inicial.
- [ ] Exportar JSON de trazabilidad y mantener impresión/PDF mediante el diálogo del navegador.
- [ ] Añadir DOCX editable solo como copia de trabajo, claramente separado de la versión cerrada.
- [ ] Advertir cuando una operación cambie después de cerrar una instantánea.
- [ ] Ejecutar pruebas.
- [ ] Commit: `feat: add document export and traceability`

### Task 9: Matriz de aceptación y despliegue gradual

**Files:**
- Create: `tests/document-matrix-regression.cjs`
- Modify: `tests/private-promissory-regression.cjs`
- Modify: `tests/notarial-print-regression.cjs`
- Create: `docs/document-engine-acceptance.md`

**Interfaces:**
- Consumes: motor completo.
- Produces: evidencia reproducible de aceptación y lista de aprobación profesional.

- [ ] Ejecutar la matriz de uno/dos obligados, 1–120 cuotas, textos cortos/largos, frecuencias, mora opcional y estados de desembolso.
- [ ] Verificar Carta a 100 %, PDF del navegador, escala de grises y ausencia de encabezados del navegador.
- [ ] Comparar sumas de tabla contra resumen y monto en letras.
- [ ] Revisar visualmente cada página y conservar capturas/PDF de referencia.
- [ ] Exigir aprobación escrita del profesional jurídico para activar la plantilla notarial v2.
- [ ] Mantener la versión actual como respaldo hasta completar aceptación.
- [ ] Ejecutar la suite completa con cero fallos.
- [ ] Commit: `test: verify standardized document engine`
