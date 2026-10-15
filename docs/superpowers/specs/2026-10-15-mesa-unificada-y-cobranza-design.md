# Diseño propuesto: Mesa Unificada y Centro de Cobranza

Fecha: 15 de octubre de 2026. Estado: **propuesta para aprobación; no autoriza implementación**.

## Intención y alcance

M&M Inversiones y VegaMotors necesitan dos espacios conectados: una Mesa Unificada clara para originar, evaluar, formalizar y entregar cada operación; y un Centro de Cobranza para seguir cuotas, pagos y gestiones hasta la liquidación o una derivación revisada. El colaborador debe saber qué dato falta, qué acción corresponde y de dónde sale cada cifra sin recorrer un formulario continuo y denso.

La primera entrega seguirá siendo una aplicación web estática sin base de datos ni servidor. La elección del usuario fue comenzar así y conectar una base de datos después. Por tanto, la automatización inicial será **local y asistida**: cálculos, alertas, colas de tareas, plantillas y reportes derivados de archivos importados. No habrá sincronización multiusuario, envío automático de mensajes, recordatorios ejecutados con la página cerrada ni confirmación bancaria automática. Estas capacidades requieren servicios y permisos posteriores.

Son dos proyectos secuenciales: primero se ordena la Mesa y se estabiliza el expediente; después se construye Cobranza sobre ese contrato de datos. El sistema actual y las impresiones existentes deben conservarse durante la transición.

## Estado observado en el repositorio

- `operation-workbench.js` monta ocho productos en una misma pantalla. `product-flows.js` dibuja todas las secciones una tras otra; `operation-stage-nav` es visual, no una navegación real. Esto explica la sensación de amontonamiento.
- La Mesa ya calcula cuota, capacidad, margen y cobertura, y ofrece documentos vinculados. No debe reescribirse el motor financiero si no hay una discrepancia probada.
- `operation-repository.js` conserva **una** operación en `sessionStorage` y exporta/importa JSON. No constituye cartera persistente ni libro de pagos.
- `app.js` dispone de ficha de visita de cobro preparada para papel; el resultado se completa manualmente. Hay recibos de ingreso, pero no un libro conciliado de pagos ni historial longitudinal de gestiones.
- `document-center.js` abre documentos, aunque algunos destinos y requisitos aún no expresan todas las condiciones operativas de cada fase. La conexión debe verificarse antes de activar documentos finales.

## Objetivos y límites

1. Separar visualmente tareas y campos; mostrar una etapa principal cada vez con un resumen lateral útil y una acción primaria inequívoca.
2. Reutilizar personas, condiciones, bien, garantía, decisión y documentos sin pedirlos dos veces ni trasladar silenciosamente datos incorrectos.
3. Distinguir dato faltante, advertencia, bloqueo y decisión humana. Ningún porcentaje de completitud equivale a aprobación crediticia.
4. Crear un rastro financiero verificable: cuota programada, pago confirmado, aplicación del pago, saldo, atraso y gestión son hechos distintos.
5. Producir reportes reproducibles a una fecha de corte y con indicación de la procedencia de los datos.
6. Preparar una migración futura a base de datos sin cambiar el significado de los campos ni rehacer la interfaz.

No se pretende aprobar créditos automáticamente, declarar desembolsos no realizados, asignar mora no pactada, ejecutar cobros bancarios, enviar mensajes sin revisión, ni dar por cumplidas exigencias legales sin validación humana. No se promete cartera compartida en tiempo real con archivos locales.

## Lenguaje de trabajo propuesto

- **Operación**: expediente previo o en formalización. Una propuesta no es un préstamo vivo.
- **Obligación activa**: operación aprobada, formalizada y cuyo desembolso o entrega efectiva ha sido confirmado. Solo entonces entra en cartera.
- **Cuota programada**: vencimiento previsto por el calendario contractual. No es un pago recibido.
- **Pago confirmado**: ingreso cuya fecha, importe, medio y referencia fueron comprobados por un colaborador. Un recibo emitido no basta por sí solo para conciliarlo.
- **Aplicación del pago**: reparto auditable entre capital, interés y demás conceptos **solo si están pactados y permitidos**. No se reescribe retroactivamente una cuota original.
- **Gestión de cobro**: intento o contacto documentado con canal, fecha, responsable, resultado y próximo paso; no altera el saldo.
- **Promesa de pago**: compromiso registrado y pendiente de cumplimiento; no reduce el saldo hasta que exista pago confirmado.
- **Acuerdo de regularización**: cambio pactado y documentado; no se convierte automáticamente en contrato nuevo ni borra el historial.
- **Derivación**: transferencia controlada a revisión superior o jurídica; no equivale a demanda ni ejecución.

Estos términos pasan al glosario del proyecto cuando se aprueben.

## Mesa Unificada: estructura y experiencia

### Inicio de la Mesa

El selector inicial agrupa los ocho productos en cuatro familias: venta de motocicletas, financiamiento de bienes, préstamos sin garantía real y préstamos con garantía real. Cada tarjeta explica qué se prepara, qué documento final puede salir y el tiempo estimado de captura. La selección abre un expediente nuevo o uno importado; cambiar de producto requiere confirmar qué datos específicos se descartarán. Una referencia, cliente, producto, estado, fecha de última exportación y botón Inicio permanecen visibles.

### Pantalla de captura

En escritorio: navegación de etapas a la izquierda, **una etapa activa en el centro**, y a la derecha una ficha fija con propuesta, bloqueos y siguiente acción. En móvil: etapas horizontales compactas, formulario de una columna y resumen plegable. Espaciado generoso, títulos concretos, máximo dos columnas de campos en cada tarjeta, controles con ejemplos y explicación breve del porqué del dato. Secciones condicionales, como codeudor o garantía, aparecen solo cuando aplican. No se pierde la información al ir atrás.

Cada etapa indica `Pendiente`, `En revisión`, `Completa` o `Bloqueada` por reglas; no solo un porcentaje. Los errores quedan junto al campo y el botón Continuar lleva al primero. Guardar/exportar no se confunde con aprobar o formalizar. La vista previa de documento queda al lado solo en la etapa documental, como en el pagaré notarial.

### Ruta común con puertas de control

1. **Inicio**: familia, producto, sucursal, referencia, responsable y fecha. Importar expediente existente con previsualización y rechazo de versión incompatible.
2. **Personas**: cliente; codeudor solidario solo cuando se activa y acepta esa calidad. Identificación, contacto, domicilio y datos personales que requiera el producto; campos de terceros separados del cliente. Verificar duplicidad de documento y registrar origen/consentimiento de datos.
3. **Objeto y condiciones**: necesidad real, bien o garantía según ruta; precio, inicial, capital, tasa, periodicidad, plazo, primera fecha y método de cálculo. Mostrar capital, intereses y total programado por separado. Recomendaciones nunca sobrescriben valores escritos.
4. **Evaluación**: capacidad personal o flujo de negocio, documentos de respaldo, alertas y garantías. Registrar resultado humano, responsable, fecha y fundamento; no convertir una fórmula en aprobación.
5. **Expediente**: checklist obligatorio, condicional y jurídico por producto; pendiente/recibido/verificado/no aplicable con motivo, responsable y fecha. No basta un checkbox anónimo.
6. **Decisión**: aprobar, condicionar, pedir cambios o rechazar con motivos; bloquear una decisión final si falta información esencial. Congelar una versión de la propuesta aprobada.
7. **Formalización**: generar solo documentos compatibles con esa versión; previsualizar y comprobar nombres, montos, fechas, codeudor, firmas y paginación. Confirmación humana de firmas y controles jurídicos.
8. **Desembolso o entrega**: fecha, importe/bien efectivamente entregado, medio, referencia y comprobante. Solo esta confirmación crea obligación activa y calendario de cobranza. Si se cancela, dejar la operación cerrada sin cartera.

### Campos por producto (además de los comunes)

| Ruta | Captura especializada y control imprescindible | Salida principal |
|---|---|---|
| Compra/venta de motocicleta | Costo de adquisición, proveedor, transporte, preparación, unidad (chasis/motor), precio, descuento, margen interno, entrega y documentos de traspaso | Cotización, recibo y acta de entrega; sin cartera si es contado |
| Financiamiento de motocicleta | Unidad identificada, inicial, capital, propuesta, capacidad, seguro/placa/matrícula según caso y entrega física | Solicitud, evaluación, pagaré, tabla y entrega; luego cartera |
| Préstamo personal | Destino real, fuente de ingresos, compromisos, capacidad y codeudor opcional | Decisión, formalización, desembolso y cartera |
| Préstamo comercial | Identidad del negocio/RNC cuando aplique, actividad, antigüedad, ventas, costos, gastos, deudas y ciclo de caja; distinguir empresa y obligados | Evaluación de flujo y cobertura, formalización y cartera |
| Garantía de vehículo | Propietario, placa/matrícula, chasis, valor, gravámenes, inspección física y revisión documental; no deducir propiedad por posesión | Ficha de garantía y revisión antes de formalizar |
| Garantía hipotecaria | Titular, ubicación e identificación registral, tasación, gravámenes y revisión jurídica expresa | Expediente jurídico pendiente hasta validación; no aprobación registral automática |
| Smartphone | Marca/modelo, IMEI/serie, precio, inicial, capacidad, garantía comercial y confirmación de serie en entrega | Propuesta, formalización y entrega; luego cartera |
| Electrodoméstico | Categoría, marca/modelo/serie, accesorios, garantía, proveedor, precio e inicial | Propuesta, formalización y entrega; luego cartera |

Los campos exigidos por ley o regulador deben confirmarse con asesoría según la naturaleza y licencia de la empresa. El diseño distinguirá `obligatorio para operación`, `requerido por política interna` y `pendiente de criterio jurídico`; no etiquetará como “reglamentario” algo que no haya sido validado.

## Centro de Cobranza: áreas y procesos

### Entrada y calidad de cartera

Un asistente importa operaciones activas, tablas vigentes y pagos confirmados desde archivos versionados; acepta mapeos CSV/Excel solo con vista previa. Detecta referencias repetidas, clientes homónimos, cuotas duplicadas, pagos sin referencia, importes negativos, fechas imposibles y diferencias de saldo. Un lote con errores no sobrescribe la cartera. Registra fuente, fecha de corte, responsable, total de registros aceptados/rechazados y copia de respaldo. Si no hay archivo confiable, la pantalla no inventa atrasos ni reportes.

### Tablero de trabajo

Vista inicial con cartera al día, vence hoy, próxima a vencer, vencida, promesas para hoy, promesas incumplidas, pagos por conciliar y casos en disputa o revisión. Cada número abre una lista filtrada. Filtros por sucursal, gestor, producto, días de atraso, saldo, fecha y estado. Indicador permanente de **fecha de corte** y advertencia si la cartera importada está desactualizada.

### Ficha de una obligación

Cabecera de cliente/obligados y referencia; saldos separados de capital, interés devengado, cuotas vencidas, cargos pactados y total exigible; cronograma original y estado de cada cuota; pagos con aplicación; línea de tiempo de contactos, visitas, promesas, acuerdos, documentos y disputas. Acciones: registrar gestión, abrir promesa, registrar pago para conciliación, emitir estado de cuenta, preparar visita, proponer acuerdo o escalar. Ninguna acción cambia el saldo sin un evento financiero validado.

### Flujo preventivo y de mora

1. **Prevención**: cola de vencimientos próximos; borradores de recordatorio claros, sin revelar deuda a terceros. Contacto permitido y frecuencia configurables según consentimiento y revisión jurídica.
2. **Primer atraso**: cálculo de días vencidos y saldo a fecha; verificar si hay pagos en tránsito o disputa antes de contactar. Registrar intento, resultado y próximo seguimiento.
3. **Contacto efectivo**: confirmar identidad, motivo real del impago, capacidad y canal de respuesta. Opciones de promesa, pago parcial o revisión; guiones de trato digno, sin amenazas automáticas.
4. **Promesa**: importe, fecha, canal, responsable y confirmación; tarea automática local al vencimiento. Cumplida solo si se concilia un pago suficiente, parcial si falta saldo, incumplida si vence sin pago; no se borra el evento anterior.
5. **Pago**: capturar recibo, método, fecha efectiva, referencia y evidencia; conciliación manual; aplicar por la regla contractual confirmada. Imprimir o exportar comprobante; recalcular atraso desde el libro de movimientos.
6. **Regularización**: propuesta de acuerdo o reestructuración con escenarios comparables, aprobación y documento firmado. El calendario nuevo empieza solo tras confirmación; conservar original e historial.
7. **Escalación**: reglas configurables por días, monto y resultado, siempre con revisión humana. Bloquear derivación automática si hay disputa abierta, pago pendiente de conciliar o falta expediente. Entrega a jurídico con paquete documental y trazabilidad, no demanda generada automáticamente.
8. **Cierre**: liquidación con saldo cero verificado, constancia, liberación de garantía por proceso separado cuando aplique, y archivo sin borrar historial.

### Herramientas de gestor y supervisor

- Cola diaria priorizada por vencimiento, promesa y urgencia comprobable; asignación manual, notas estructuradas y siguiente acción.
- Calendario de compromisos y visitas; fichas de ruta con resultado que vuelve al expediente digital. Sin geolocalización ni rastreo personal por defecto.
- Plantillas de llamada, WhatsApp, correo y carta como **borradores revisables**. En V1 el colaborador envía manualmente; no enviar por el mero hecho de cambiar un estado.
- Registro de no contacto, contacto equivocado, datos corregidos, disputa y queja, con suspensión de acciones inapropiadas hasta revisión.
- Panel de supervisor para revisar excepciones, promesas vencidas, pagos sin conciliar, cambios de calendario y casos sensibles. Sin base de datos compartida, la asignación simultánea entre gestores no es fiable: V1 opera con un responsable por archivo de cartera.

### Reportes exportables

Todos muestran fecha de corte, filtros, moneda, método de cálculo, total de registros y procedencia. PDF/Carta para lectura e impresión; CSV/XLSX para análisis; sin mezclar pagos programados con ingresos reales.

1. Antigüedad de saldos: corriente, 1–30, 31–60, 61–90 y 90+ días, con desglose por producto/sucursal/gestor.
2. Vencimientos y recaudo esperado por semana/mes, explícitamente **proyección**.
3. Cobros confirmados por día/mes, canal, producto y gestor, separados de pagos pendientes de conciliar.
4. Recuperación de cartera vencida: saldo de apertura, nuevos atrasos, pagos aplicados, ajustes autorizados y saldo de cierre.
5. Promesas creadas, cumplidas, parciales, incumplidas y aún abiertas; importe prometido frente a cobrado.
6. Efectividad de contacto y visita: intentos, contactos efectivos, compromisos, pagos posteriores; evitar equiparar número de llamadas con eficacia.
7. Evolución de mora y migración de tramos entre dos cortes comparables.
8. Concentración y exposición por producto, sucursal, rango de saldo y garantía, sin decisión automática sobre personas.
9. Excepciones: pagos sin referencia, cuotas discrepantes, documentos faltantes, disputas, quejas, acuerdos y derivaciones.
10. Auditoría de cambios y acciones, con motivo y actor identificados cuando el proceso de archivo local permita atribución verificable.

## Contrato de datos y reglas de cálculo

Entidades versionadas: `Persona`, `Operación`, `Versión aprobada`, `Obligación`, `Calendario`, `Cuota`, `Movimiento de pago`, `Aplicación`, `Gestión`, `Promesa`, `Acuerdo`, `Documento`, `Disputa` y `Evento de auditoría`. Referencias estables enlazan cada entidad sin usar el nombre como clave. Los montos se almacenan en centavos enteros o decimal exacto; la interfaz solo formatea. Zona horaria de Santo Domingo; fecha efectiva de pago distinta de fecha de registro. Los reportes reconstruyen saldos desde calendario más movimientos validados, no desde campos de total editables.

La política de aplicación de pagos, interés, mora, gastos, condonación y reestructuración debe reflejar **cada contrato real**; no se codificará un orden universal supuesto. Toda corrección se hace con movimiento compensatorio y motivo, no borrando un pago. Se deben probar pagos parciales, adelantados, atrasados, duplicados, reversados y operaciones con distintas frecuencias antes de activar reportes de saldo.

## Persistencia y seguridad sin base de datos

La edición usa memoria de sesión; el archivo exportado es la copia durable. Exportación/importación manual de paquete versionado JSON con manifiesto y suma de comprobación; CSV solo para intercambio, no como fuente maestra completa. Guardado explícito con aviso de cambios no exportados, copia de seguridad y prueba de restauración. La importación muestra diferencias antes de reemplazar datos y conserva el último archivo válido. Si se considera cifrado local del archivo, se diseñará recuperación/gestión de clave antes de prometerlo.

No se colocan cédulas, teléfonos, domicilios o importes en enlaces de mensajería ni en registros públicos. El paquete local contiene datos personales: el usuario debe custodiarlo, restringir acceso al equipo y aplicar una política de retención. La primera etapa no puede ofrecer permisos reales por gestor, respaldo automático, trabajo simultáneo ni recordatorios con navegador cerrado; se indicará esto dentro de la interfaz.

## Protección del cliente y revisión jurídica

Trato digno, minimización de datos, finalidad del contacto, identidad del destinatario, registro de preferencias y mecanismo de disputa son requisitos de diseño. La Ley 172-13 sobre datos personales y la Ley 358-05 de protección al consumidor son referencias de revisión. Las directrices recientes de la Superintendencia de Bancos sobre cobro se analizarán **si la empresa entra en su ámbito**; no se asumirá que toda norma para entidades supervisadas aplica automáticamente a M&M. Un asesor deberá validar plantillas, horarios, contactos a terceros, mora, acuerdos y retención antes de habilitar comunicaciones masivas o actuaciones jurídicas.

Referencias oficiales: https://dgii.gov.do/transparencia/marcoLegal/Documents/Leyes/172-13.pdf ; https://proconsumidor.gob.do/files/ley-358-05.pdf ; https://sb.gob.do/prensa/superintendencia-de-bancos-emite-lineamientos-para-el-trato-digno-en-cobro-de-deudas-a-usuariosas-del-sector-financiero/ .

## Orden de construcción propuesto tras aprobación

**Fase 1 — Mesa legible.** Navegación real por etapas, selector agrupado, formularios espaciados, resumen contextual y errores por campo. Mantener cálculos y documentos existentes. Pruebas de escritorio/móvil y regresión de los ocho productos.

**Fase 2 — Expediente confiable.** Completar campos condicionales, decisión humana, versionado de propuesta, confirmación de desembolso/entrega y exportación/importación robusta. La primera `Obligación` nace aquí, no antes.

**Fase 3 — Libro de cartera local.** Importación con conciliación, calendario inmutable, pagos/aplicaciones y cálculo de saldo/atraso; reportes financieros básicos. No activar gestión masiva hasta reconciliar datos de ejemplo contra registros reales.

**Fase 4 — Gestión de cobranza.** Colas, ficha, promesas, visitas, acuerdos, disputas, borradores de comunicación, escalación humana y documentos de cobro.

**Fase 5 — Analítica y transición.** Reportes completos, pruebas de corte y auditoría; luego decisión separada de base de datos, acceso multiusuario, sincronización, copias de seguridad y automatización de comunicaciones.

## Criterios de aceptación

- En cada producto solo se ve la etapa activa, con acceso claro a las demás y sin perder datos ni producir desplazamiento horizontal.
- Se puede completar un expediente desde la selección hasta entrega/desembolso con bloqueos específicos, responsables visibles y sin declararlo aprobado por un cálculo.
- Los ocho productos tienen matriz de campos y documentos verificada; ningún dato común se solicita dos veces.
- Una cartera importada con duplicados o pagos sin referencia muestra errores y no sustituye datos válidos.
- Un pago parcial, adelantado, reversado o fuera de fecha produce saldos y reportes reconciliables; la promesa no reduce saldo.
- Cada reporte concilia con el libro de pagos al mismo corte y expone filtros/procedencia.
- Ningún mensaje sale automáticamente en V1 y ninguna gestión divulga deuda a un tercero sin base y autorización revisadas.
- La versión sin base de datos advierte claramente sobre límites de continuidad, colaboración y respaldo.
- Las impresiones mantienen legibilidad, márgenes, firmas, paginación y cálculos existentes mediante pruebas de regresión.

## Decisiones del diseñador que requieren confirmación al aprobar

1. V1 tendrá un responsable por paquete de cartera; no habrá edición simultánea entre computadoras.
2. Los estados de gestión y tramos de mora propuestos serán configurables y se revisarán con la política real de la empresa.
3. Los mensajes serán borradores, no envíos automáticos; la automatización real vendrá después de datos persistentes, consentimientos y revisión jurídica.
4. El archivo exportado será la fuente durable inicial. La Mesa actual conserva su sesión hasta migrarse al nuevo contrato.
5. Antes de implementar el libro financiero habrá que obtener uno o varios ejemplos anonimizados de calendario, pagos y recibos para fijar la aplicación contractual correcta.
