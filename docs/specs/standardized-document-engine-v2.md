# Motor estandarizado de documentos e impresión v2

## Objetivo

Crear un único motor de documentos para FinanPro que reutilice los datos reales de la operación, produzca vistas previas Carta estables, mantenga las firmas en el pie correspondiente y bloquee cualquier versión final incompleta o jurídicamente no aprobada. La primera prioridad es el pagaré notarial; el mismo motor debe servir luego para pagaré privado, cotización, solicitud, evaluación, recibos, desembolso, amortización y entrega.

## Principios

- La operación es la única fuente de cliente, obligados, capital, intereses, fechas, bien y garantía.
- Un documento se genera desde una instantánea inmutable; los cambios posteriores de la operación no alteran silenciosamente lo ya revisado.
- Capital, intereses, mora, gastos y total programado permanecen como conceptos separados.
- No se declara desembolso, entrega, recepción, autenticidad, fuerza ejecutoria ni aceptación judicial sin el estado y la aprobación que correspondan.
- El codeudor solidario solo aparece si la operación lo identifica expresamente con ese rol.
- Mora, vencimiento anticipado, garantías generales, renuncias y otras cláusulas sensibles son optativas y solo aparecen cuando fueron pactadas y aprobadas.
- Las plantillas legales tienen versión, estado de aprobación, responsable y fecha de vigencia.
- El sistema genera un borrador sujeto a revisión profesional; no sustituye al notario ni al abogado.
- Papel Carta: 8.5 × 11 pulgadas. Ninguna hoja depende del tamaño de la pantalla.

## Modelo documental canónico

Cada generación crea un `DocumentSnapshot` con:

- identificación: documento, operación, plantilla, versión, fecha y estado;
- partes: acreedor, deudor, codeudor solidario, notario y testigos según corresponda;
- obligación: moneda, capital, estado del desembolso, origen real y fechas;
- condiciones: tasa, periodicidad, base, cuotas, frecuencia y medio de pago;
- cronograma: capital, interés, cuota y saldo por período;
- cláusulas: claves habilitadas, evidencia de pacto y versión aprobada;
- control notarial: acto, municipio, provincia, fecha, protocolo y folios;
- trazabilidad: advertencias, aprobación jurídica y huella de la instantánea.

## Estados

1. `draft`: faltan datos o decisiones.
2. `ready_for_review`: cifras y datos completos; aún no aprobado jurídicamente.
3. `legally_approved`: plantilla y cláusulas aprobadas para la operación.
4. `generated`: instantánea cerrada y lista para imprimir.
5. `superseded`: existe una versión posterior; se conserva la referencia anterior.

Sin base de datos, las instantáneas se conservan en la sesión y mediante exportación JSON; no se presentan como archivo permanente institucional.

## Flujo del pagaré notarial

1. Abrir la operación y elegir “Pagaré notarial”.
2. Verificar que el producto admite ese documento.
3. Completar únicamente datos notariales no presentes en la operación.
4. Confirmar roles: deudor, codeudor solidario, acreedor, notario y testigos.
5. Confirmar si hubo desembolso; si no lo hubo, redactar como obligación proyectada y no como dinero recibido.
6. Seleccionar una plantilla jurídica aprobada.
7. Activar únicamente cláusulas pactadas, mostrando su efecto antes de incluirlas.
8. Reconciliar capital, tasa, cuota, intereses, fechas y monto en letras contra la tabla.
9. Ejecutar prevalidación de identidad, fechas, folios, cifras, roles y cláusulas.
10. Generar vista previa paginada con folios derivados automáticamente del número real de páginas.
11. Revisar diferencias y advertencias; bloquear “versión final” hasta registrar aprobación jurídica.
12. Cerrar una instantánea, imprimir en Carta y exportar el expediente documental.

## Reglas de paginación

- Medir únicamente después de cargar fuentes e imágenes.
- Encabezado completo en la primera página y encabezado de continuidad con referencia en las demás.
- Mostrar “Página X de Y” y folio real en cada hoja.
- Derivar folio final desde folio inicial + páginas - 1; nunca pedirlo como dato independiente.
- No separar títulos de su primer párrafo ni rótulos de su valor.
- Repetir encabezados de tabla al cambiar de página.
- No dividir una fila de amortización.
- Mantener juntos reconocimiento, menciones manuscritas aplicables y firmas.
- Colocar las firmas en el pie de la última hoja o en una hoja exclusiva de firmas identificada, nunca flotando en medio de una página.
- Verificar integridad textual antes y después de paginar.
- Bloquear impresión si hay desbordamiento, texto perdido, folios incoherentes o firmas cortadas.

## Estándar visual

- Dos familias: documento comercial y documento jurídico.
- Tipografía, márgenes, encabezado, pie, tablas, firmas y avisos definidos por tokens de impresión compartidos.
- Texto jurídico entre 10 y 11 puntos; notas nunca menores de 8 puntos.
- Contraste apto para impresión monocromática.
- Logos y escudo con tamaño fijo; ninguna imagen externa necesaria al imprimir.
- Vista previa con miniaturas, contador de páginas, advertencias y comparación de cifras.
- La tipografía de una plantilla aprobada no puede cambiar después de generar la instantánea.

## Matriz mínima de aceptación

- Uno y dos obligados, con nombres y domicilios cortos y muy largos.
- Codeudor inexistente, solidario y persona de referencia no obligada.
- Mensual, quincenal y semanal.
- Interés simple, saldo insoluto y pago final, solo donde la política lo permita.
- Sin mora y con mora expresamente pactada.
- Operación proyectada y operación desembolsada.
- Tabla de 1, 12, 36, 60 y 120 cuotas.
- Una, dos y múltiples páginas.
- Impresión Carta a 100 %, PDF del navegador y escala de grises.
- Navegadores Chromium de escritorio; uso local por `file://` intacto.

## Control jurídico

La fuente normativa primaria de referencia será la Ley núm. 140-15 del Notariado y la normativa vigente que resulte aplicable. La redacción final, identidad del notario, testigos, protocolo, cláusulas y efecto jurídico deben ser aprobados por un profesional competente antes de marcar una plantilla como vigente. El software no emitirá garantías de ejecutoriedad o aceptación judicial.

