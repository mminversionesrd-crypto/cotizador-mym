# CRM interactivo local — implementación
Objetivo: aplicar el plan aprobado al Centro de Financiamiento, sin modificar FinanPro.
Arquitectura: repositorio local versionado con múltiples expedientes y referencia activa; flujo y auditoría en módulo puro; bandeja, panel y formularios nativos en módulo independiente. Reutilizar la mesa y los documentos actuales.
- [x] Repositorio: migración del expediente de sesión, múltiples registros, respaldo y restauración atómica; pruebas de datos inválidos y errores de almacenamiento.
- [x] Flujo: etapas y requisitos, revisión explícita de decisiones, seguimiento e historial; pruebas de restricciones.
- [x] Bandeja: tabla/tablero, búsqueda y filtros, ficha lateral, próxima acción, gestión y archivo.
- [x] Conectar mesa activa y calculadora con formularios; borradores y revisión antes de confirmar.
- [x] Indicadores agregados y gráficos por etapa, producto y período con filtros al pulsar.
- [x] Verificar pruebas existentes, navegación, persistencia, móvil y recuperación; respaldo y copia al proyecto real.
Alcance: datos locales en este navegador. Responsable es una atribución registrada, no un control de identidad. Sin servidor multiusuario ni envío de mensajes. No borrar expedientes al iniciar otro. No inferir aprobación ni desembolso desde campos completos. No reemplazar cambios sin respaldo y validación.

Verificación: 82 pruebas automáticas aprobadas; navegador CRM y aislamiento aprobados. Revisión independiente corregida: fotos y cálculos por expediente, recuperación con almacenamiento dañado, validación de importación y producto/caché de solicitud. Los respaldos no incluyen fotos; la interfaz solicita conservar los soportes y volver a adjuntarlos. Servidor multiusuario fuera del alcance de esta entrega local.
