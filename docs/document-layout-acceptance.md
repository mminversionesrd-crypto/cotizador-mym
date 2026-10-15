# Composición e impresión documental: estado de aceptación

## Aplicación actual

El pagaré notarial auténtico de un deudor es la primera plantilla que consume la geometría Carta y el contrato de diagnósticos de `document-engine/`. La redacción legal, las partes, las cifras y la fórmula del préstamo no se modificaron. El pagaré privado conserva su propio diseño y no se considera migrado al nuevo compositor.

## Reglas implementadas

- La medición, la vista previa y la impresión usan una hoja Carta con área útil de 7.26 × 10.5 pulgadas.
- Encabezado y número de página se reservan antes de paginar el contenido.
- Los ordinales se trasladan con el texto siguiente cuando un fragmento se corta al final de una hoja.
- Solo el último renglón de la última hoja puede recibir guiones de relleno, inmediatamente después de «doy fe.». Las hojas anteriores continúan el texto sin ese relleno.
- Los artículos se fragmentan para aprovechar la hoja actual cuando hay espacio suficiente; un ordinal no queda aislado. Una palabra corriente puede dividirse con un solo guion en un punto silábico conservador, sin dividir nombres, números ni cantidades destacadas.
- Las firmas son un grupo único. Su espacio se distribuye entre las firmas, empezando cerca del cierre y terminando con margen inferior.
- El documento no se imprime si detecta texto perdido, hoja vacía, desborde, firma fuera del margen, ordinal huérfano, relleno partido, folios inconsistentes o vacío excesivo antes de las firmas.
- La vista previa clona exactamente las páginas compuestas para imprimir; no genera una segunda versión del texto.

## Verificación disponible

- `node --test tests\*.test.cjs`: 51 pruebas aprobadas el 15 de octubre de 2026.
- `node --check pagare-notarial.js` y `node --check document-engine\line-finisher.js`: sin error de sintaxis.
- La prueba de regresión visual en navegador y la inspección de PDF Carta quedan pendientes en este entorno. No se declara que esas verificaciones hayan pasado.

## Criterio para las siguientes plantillas

Cada documento nuevo debe declarar sus bloques, geometría, reglas de continuación y firmas, y pasar el contrato común antes de habilitar «Imprimir». La revisión jurídica del texto y de la convención de guiones corresponde al profesional responsable; la paginación automática no garantiza validez legal ni aceptación judicial.

La política reutilizable para futuros pagarés distingue tres elementos: guion **único de partición** de una palabra entre hojas; ausencia de relleno en hojas intermedias; y guiones **de cierre** solo después de la frase final configurada para esa plantilla.
