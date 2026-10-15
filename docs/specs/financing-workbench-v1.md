# Mesa unificada de compra, venta y financiamiento

## Objetivo

Convertir el sistema actual en una mesa de operaciones sin servidor que cubra compra, venta, financiamiento, evaluación, garantías, formalización y control. La primera versión trabajará con estado temporal y archivos JSON; una base de datos futura deberá poder sustituir esa persistencia sin cambiar los formularios ni los flujos.

## Alcance funcional

### Núcleo compartido

- Un expediente temporal conserva una sola vez cliente, codeudor, propuesta, bien, garantía y documentos.
- Cada pantalla consume el mismo expediente y devuelve cambios al mismo estado.
- El sistema permite crear, duplicar, exportar, importar y limpiar una operación.
- Los cambios sin exportar producen una advertencia antes de abandonar o reiniciar.
- La información se mantiene durante la sesión del navegador; no se presenta como almacenamiento permanente.

### Motor de productos

El producto financiero seleccionado controla campos, reglas, recomendaciones, checklist y documentos. Debe cubrir:

1. Compra de motocicleta al contado.
2. Financiamiento de motocicleta.
3. Préstamo personal.
4. Préstamo comercial.
5. Préstamo con garantía de vehículo.
6. Préstamo con garantía hipotecaria.
7. Financiamiento de smartphone.
8. Financiamiento de electrodoméstico.

Las políticas iniciales serán configurables en un archivo JSON local y nunca sustituirán los valores escritos por el colaborador sin confirmación explícita.

## Ruta general de una operación

1. **Iniciar**: elegir producto financiero y origen del cliente.
2. **Identificar**: completar cliente y codeudor si corresponde.
3. **Configurar**: indicar bien, necesidad, precio, inicial o capital solicitado.
4. **Simular**: generar propuestas comparables y seleccionar una.
5. **Precalificar**: calcular capacidad y señalar alertas sin aprobar automáticamente.
6. **Evaluar**: completar información específica del producto y garantías.
7. **Revisar expediente**: mostrar requisitos recibidos, pendientes y bloqueantes.
8. **Decidir**: proceder, modificar, rechazar o dejar pendiente con motivo.
9. **Formalizar**: generar únicamente documentos válidos para la operación.
10. **Desembolsar o entregar**: habilitar la acción solo si no existen bloqueos.
11. **Controlar**: producir recibos, acuerdos, cartas y seguimiento.

## Flujos óptimos por proceso

### Compra y venta de motocicletas

1. Registrar costo de adquisición, transporte, preparación y accesorios.
2. Identificar la unidad por marca, modelo, año, color, chasis y motor.
3. Calcular costo total, precio de venta, descuento, margen y rentabilidad.
4. Seleccionar contado o financiado.
5. En contado, generar cotización, recibo y acta de entrega.
6. En financiado, continuar a propuesta, solicitud, evaluación y formalización.
7. Confirmar placa, matrícula, seguro, llaves y accesorios antes de entregar.

### Financiamiento de motocicletas

1. Elegir o describir la unidad y su precio.
2. Definir inicial, capital, plazo, tasa y frecuencia.
3. Comparar cuota baja, propuesta equilibrada y menor costo total.
4. Precalificar con ingresos, compromisos y relación cuota/ingreso.
5. Completar identidad, residencia, trabajo, referencias y codeudor si aplica.
6. Verificar documentos del cliente y de la unidad.
7. Aprobar manualmente la propuesta seleccionada.
8. Generar pagaré, amortización, autorización, recibo de inicial y orden de entrega.
9. Entregar la unidad únicamente al cerrar el checklist.

### Préstamo personal

1. Registrar destino real, monto solicitado e ingresos.
2. Calcular capacidad disponible y propuesta financiera.
3. Completar residencia, empleo, compromisos y referencias.
4. Determinar si requiere codeudor según revisión humana.
5. Revisar expediente, decidir y formalizar.
6. Desembolsar solo después de firmas y validaciones.

### Préstamo comercial

1. Identificar negocio, actividad, antigüedad y destino del capital.
2. Registrar ventas, costos, gastos, deudas y flujo disponible.
3. Calcular cobertura de la cuota con flujo comercial, separada del ingreso personal.
4. Registrar proveedores, clientes o referencias comerciales.
5. Proponer plazo compatible con el ciclo de recuperación.
6. Evaluar, decidir, documentar y desembolsar.

### Garantía de vehículo

1. Completar datos del préstamo y del propietario del vehículo.
2. Identificar marca, modelo, año, chasis, matrícula y placa.
3. Registrar valor comercial, valor admisible y gravámenes declarados.
4. Calcular relación préstamo/valor y cobertura.
5. Exigir fotos y documentos mediante checklist, sin incorporarlos permanentemente todavía.
6. Bloquear formalización cuando falte identificación o valoración esencial.

### Garantía hipotecaria

1. Identificar propietario, tipo de inmueble, ubicación y título.
2. Registrar tasación, valor admisible, monto solicitado y gravámenes declarados.
3. Calcular relación préstamo/valor y cobertura.
4. Mostrar checklist registral, de tasación y revisión jurídica.
5. Mantener estado “requiere revisión jurídica” hasta confirmación manual.
6. No atribuir aceptación registral ni ejecutoriedad automática.

### Smartphones y electrodomésticos

1. Elegir categoría, marca, modelo, precio y proveedor.
2. Registrar IMEI o serie, capacidad, color, condición y garantía comercial cuando corresponda.
3. Definir inicial y condiciones de financiamiento.
4. Comparar propuestas y precalificar al cliente.
5. Generar cotización, recibo de inicial, pagaré, amortización y acta de entrega.
6. Confirmar físicamente serie, accesorios y garantía antes de firmar la entrega.

## Experiencia de usuario

- Una barra de operación permanece visible con referencia, cliente, producto, estado y avance.
- La captura principal queda a la izquierda y el resumen/validación a la derecha.
- Los datos opcionales se abren en paneles laterales; los esenciales permanecen visibles.
- Cada proceso presenta una sola acción principal y el siguiente paso recomendado.
- Los errores aparecen junto al dato y el botón de avance lleva al primer bloqueo.
- Inicio, volver y cambiar de herramienta permanecen visibles en todas las pantallas.
- Escritorio y móvil no deben tener desbordamiento horizontal.

## Persistencia temporal sin base de datos

- Estado en memoria para cálculos inmediatos.
- `sessionStorage` para sobrevivir recargas dentro de la sesión.
- Exportación e importación JSON versionada para conservar una operación.
- Fotografías se mantienen solo durante la sesión o se descargan por separado.
- No se promete historial multiusuario, seguridad de servidor ni respaldo automático.

## Preparación para base de datos

El formulario no accederá directamente al almacenamiento. Utilizará un repositorio con métodos `load`, `save`, `export` e `import`; inicialmente el repositorio será temporal y luego podrá ser reemplazado por una API.

