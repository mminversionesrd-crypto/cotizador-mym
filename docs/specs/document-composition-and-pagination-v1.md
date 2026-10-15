# Estructura de redacción, composición y paginación documental — v1, revisión 2

Revisión: 15 de octubre de 2026. Esta especificación precede los cambios de programa y sustituye las reglas de ubicación de artículos y firmas de la versión anterior.

## Propósito

El pagaré notarial debe leerse como un texto continuo, bien redactado y compuesto en hojas Carta. La página se corta por el espacio realmente disponible, **nunca por la expectativa de que un artículo determinado empiece en la hoja siguiente**. El cierre y las firmas deben verse próximos y ordenados. Estas reglas serán la base reutilizable para futuros modelos, sin copiarles la redacción jurídica del pagaré actual.

## Alcance y límites

- Primera aplicación: pagaré notarial auténtico de un deudor. No cambiar importes, tasas, nombres, cláusulas ni su orden como parte de este trabajo de composición.
- Vista previa, documento listo para imprimir e impresión Carta a escala 100 % usan las mismas páginas compuestas; deben seguir funcionando desde `file://`.
- El motor decide la distribución física. La plantilla define sus textos, campos, orden de comparecientes y reglas particulares de cierre y firmas. No se inserta texto jurídico para rellenar espacio.
- La corrección formal no equivale a aprobación jurídica ni garantiza aceptación judicial. La redacción definitiva y la convención notarial requieren revisión profesional.

## 1. Fuente única de redacción

El documento parte de una secuencia ordenada de bloques semánticos:

1. `documentHeader`: título e identidad notarial, solo donde la plantilla los exige.
2. `pageControl`: acto y folio en cada hoja, sin rótulo visible de «Página X de Y».
3. `appearance`: comparecientes y testigos.
4. `article`: ordinal y texto del artículo, en el orden real de la redacción.
5. `closing`: oración final que termina en «doy fe.».
6. `continuation`: marca «SIGUE AL DORSO» en cada hoja que tiene texto legal posterior.
7. `signatureGroup`: firmantes reales de la plantilla, con espacio de firma, nombre y calidad.

La secuencia describe funciones, **no páginas predeterminadas**. `SEXTO`, `SÉPTIMO` o cualquier otro ordinal puede quedar en la primera o en una hoja posterior según quepa. Un artículo puede empezar al final de una hoja y continuar en la siguiente, siempre que el ordinal no quede solo.

Se conserva un texto fuente inmutable. La concatenación del texto visible de todas las hojas, excluyendo marcas de continuación, numeración, guiones de cierre y partición visual de palabras, debe reproducirlo exactamente tras normalizar únicamente espacios tipográficos. No se permite perder, duplicar, reordenar ni inventar palabras.

El énfasis en negrita es **estilo**, no una instrucción de mantener juntas cláusulas enteras. Solo son indivisibles los tokens que la plantilla marque expresamente como protegidos: identificaciones, importes, nombres cuando corresponda, ordinales y otras unidades que perderían sentido al partirse.

## 2. Geometría y medición únicas

- Papel Carta: 8.5 × 11 pulgadas. El área útil y los márgenes provienen de una sola configuración física compartida por medición, vista previa e impresión.
- Se miden dimensiones reales después de cargar fuentes e imágenes. Un cambio de fuente, dato, escala o ancho obliga a recomponer todas las páginas.
- Encabezados y controles repetidos reservan su altura **antes** de colocar texto. «SIGUE AL DORSO» también reserva espacio en las hojas intermedias.
- El área útil termina antes del margen imprimible. Ninguna palabra, marca o firma puede desbordarse, aunque `scrollHeight` parezca aceptable por redondeo.
- La vista previa escala páginas ya compuestas; no puede decidir saltos diferentes a los de impresión.

## 3. Flujo de texto y salto de página

El paginador consume la redacción en orden, de izquierda a derecha y de arriba abajo:

1. Coloca el siguiente token o fragmento en la hoja actual si cabe con la tipografía real y los elementos repetidos reservados.
2. Si aparece un ordinal, prueba **ordinal más el inicio legible de su artículo** en el espacio restante. Solo mueve el ordinal cuando de otro modo quedaría aislado. No exige trasladar dos líneas completas ni el artículo entero por defecto.
3. Si un artículo cabe parcialmente, conserva en esa hoja la parte que cabe y continúa la misma redacción en la siguiente. No salta preventivamente porque el artículo anterior terminara en «judicial;» ni porque el siguiente sea `SÉPTIMO`.
4. Si el siguiente token protegido no cabe, pasa completo a la hoja siguiente. Una palabra corriente solo puede dividirse en una sílaba segura, con un único guion de partición al final de la hoja; su continuación abre la siguiente. Si la partición no es segura, la palabra pasa completa.
5. Antes de fijar cada salto comprueba que no haya ordinal huérfano, línea artificialmente vacía o espacio vertical aprovechable suficiente para texto posterior. La excepción es un token realmente indivisible o la reserva física obligatoria.
6. Reserva las firmas únicamente al componer la **última** hoja. Si no caben junto con el cierre, traslada hacia esa hoja el mínimo texto final necesario, manteniendo ambas hojas correctamente aprovechadas. Nunca crea una hoja de solo firmas si puede evitarlo sin romper la redacción.
7. Una vez establecidas las hojas, calcula folios y conserva el índice de página solo como dato interno de navegación y validación. Si el folio altera las medidas, recompone y vuelve a verificar.

No se busca que un artículo ocupe el mismo lugar que en el archivo modelo. Se busca que cada hoja use todo el espacio disponible para contenido real y que el salto resulte natural.

## 4. Renglones, justificación y cierre

- Los renglones interiores de un párrafo pueden justificarse con el motor tipográfico. **El último renglón de una hoja que continúa no se estira para tocar el margen derecho**: conserva sus espacios naturales. No se insertan espacios repetidos ni se altera el espaciado de letras para simular una línea llena.
- Si «judicial;» termina al inicio o a mitad de un renglón y cabe el comienzo del artículo siguiente, ese artículo sigue inmediatamente en el mismo flujo. Un salto de artículo no significa un salto de línea ni de página salvo que la plantilla aprobada lo establezca de forma expresa.
- El pequeño espacio horizontal que reste porque la próxima palabra no cabe es un resultado tipográfico normal; **no** se corrige estirando palabras, agregando guiones decorativos o desplazando texto que sí cabe.
- Ninguna hoja intermedia recibe guiones de relleno al final de su texto. «SIGUE AL DORSO» es una marca independiente de continuación, no una excusa para terminar el párrafo antes de tiempo.
- Solo después de la frase final «doy fe.» se calculan los guiones de cierre, en **ese mismo renglón** y sin generar un renglón adicional. Si no queda ancho suficiente, se omiten; nunca se sustituyen palabras por guiones.
- La frase de cierre y cualquier convención de guiones son datos de la plantilla, no una regla jurídica global del motor.

## 5. Firmas: proximidad, orden y espacio manuscrito

- Las firmas siguen al cierre de la redacción. No se anclan al borde inferior de la hoja ni se distribuyen por toda la altura libre: ello produjo la separación excesiva de las capturas.
- Separación objetivo entre el final de «doy fe.» y el **inicio del bloque**: 6–12 mm. El espacio libre sobrante queda **después** del bloque de firmas, no entre sus renglones ni como gran vacío antes del primero.
- Orden del modelo actual: deudor centrado; dos testigos en paralelo; acreedor centrado; notaria centrada. Cada uno tiene línea de firma, nombre y calidad debajo. Los dos testigos comparten un renglón visual.
- Cada firma dispone de un área manuscrita útil de al menos 10 mm sobre su línea. La separación vertical entre renglones visuales es estable y compacta: objetivo 8–14 mm desde las etiquetas de un renglón hasta el área de firma del siguiente. Nombres largos pueden aumentar la altura necesaria, nunca superponerse.
- El bloque es indivisible. Si no cabe completo con el margen inferior de seguridad, se recompone el salto de texto; no se reduce la letra, no se cortan firmas y no se mueve una firma sola a otra hoja.
- El lugar final se decide por proximidad al cierre y cabida real, no por una coordenada fija del pie. Esto reemplaza la regla anterior que repartía espacio libre dentro del grupo.

## 6. Contrato reutilizable del compositor

**Entrada:** bloques semánticos ordenados, datos reales, configuración física de la plantilla, fuentes, tokens protegidos y política particular de cierre/firmas.

**Salida:** páginas compuestas, texto reconstruido, posiciones medidas, `diagnostics[]` y `printReady`. Vista previa e impresión consumen esta misma salida.

**Invariantes comprobables:**

- Integridad y orden del texto; ninguna palabra inventada o perdida.
- Ningún ordinal solo al pie de página; ningún artículo preasignado a una página.
- Texto real hasta el último espacio útil compatible con los elementos reservados y tokens protegidos.
- Última línea de continuación sin estiramiento artificial; guiones decorativos solo tras el cierre final.
- Continuación presente solo cuando exista texto posterior; folios correctos e índices de página internos coherentes, sin contador visible en el documento ni en la vista previa.
- Bloque de firmas completo, cercano al cierre, compacto, legible y dentro del área imprimible.

Los diagnósticos existentes (`TEXT_MISMATCH`, `PAGE_OVERFLOW`, `ORPHAN_HEADING`, `EMPTY_CONTINUATION`, `CLOSING_FILL_WRAP`, `SIGNATURE_SPLIT`, `SIGNATURE_MARGIN`, `EXCESSIVE_SIGNATURE_SPACING`, `EXCESSIVE_FINAL_GAP`, `PAGE_NUMBER_REFLOW`) se mantienen mientras resulten útiles. La implementación añadirá diagnósticos específicos para un salto prematuro y para la última línea indebidamente estirada; no bastará comprobar altura total o cantidad de nodos.

## 7. Casos de aceptación antes de imprimir

1. En la primera hoja, «judicial;» queda con espacio suficiente para el ordinal siguiente: este comienza allí mismo, aunque sea `SEXTO` o `SÉPTIMO`.
2. Un artículo solo mueve su ordinal si no cabe con palabras iniciales legibles; cuando sí caben, el artículo continúa en la misma hoja y, si hace falta, en la próxima.
3. El último renglón de una hoja intermedia conserva espacios naturales. No contiene guiones de relleno y la continuación no duplica ni pierde texto.
4. Solo el renglón final que termina en «doy fe.» recibe guiones hasta donde quepan sin saltar de línea.
5. La primera firma empieza a 6–12 mm del cierre; las demás mantienen el orden y las distancias compactas, sin superposición ni corte. El blanco restante puede quedar por debajo del bloque.
6. Nombres largos, importes, cédulas, cuatro tipografías, una a cuatro hojas y variaciones de datos no alteran el contenido ni desordenan las firmas.
7. Cada PDF Carta a 100 % coincide con la vista previa en texto, saltos, folios, cierre y firmas. Se revisan las páginas visualmente, además de sus posiciones medidas.

Si una combinación de fuente o datos impide cumplir estas reglas, se bloquea la versión final y se muestra el motivo; no se genera silenciosamente un documento defectuoso.

## Decisiones editoriales pendientes

La notaria deberá confirmar el texto jurídico definitivo y si su protocolo exige una convención específica de guiones o firmas. Esta consulta no bloquea la corrección técnica del flujo de texto y de la posición de firmas descrita aquí, pero sí la aprobación jurídica del modelo final.
