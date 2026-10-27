# Práctica de Electrónica

Páginas para que los alumnos de Electrónica 1 (4.° año) y Electrónica 2 (5.° año) del Instituto Técnico «Ing. Anacleto Tobar» practiquen y hagan los trabajos prácticos con nota. Lic. Gutiérrez.

- `index.html`: elegir la materia.
- `alumno.html?c=e1` y `alumno.html?c=e2`: práctica guiada sin nota, trabajo práctico con nota y ver el resumen para la carpeta.
- `profe.html`: tablero del docente en vivo con los avisos de quién sale de la página y las notas.
- `presentacion.html`: Electrónica Industrial 1, presentación del proyecto para proyectar (con voz; espacio o flechas para avanzar). El video `video-planta.mp4` va en la misma carpeta.
- `industrial.html`: Electrónica Industrial 1, guía del proyecto planta de nivel (video con voz, conexiones paso a paso, simulador, programa y exposiciones). La carpeta `planta` tiene el programa del ESP32.
- `banco-e1.js` y `banco-e2.js`: las preguntas, los códigos de los trabajos y el resumen.
- `Codigo.gs`: lo que va en la planilla de Google (Extensiones > Apps Script).
- `config.js`: la dirección de la planilla.

## Conectar la planilla (6 pasos)

1. Abrí una planilla nueva de Google (sheets.new) y ponele de nombre «Práctica Electrónica - Notas».
2. Menú **Extensiones > Apps Script**.
3. Borrá lo que hay, pegá todo `Codigo.gs`, cambiá `CAMBIAME` (línea 6) por una clave tuya y guardá.
4. Arriba elegí la función **preparar** y tocá **Ejecutar**. Aceptá los permisos (Configuración avanzada > Ir al proyecto > Permitir).
5. **Implementar > Nueva implementación > Aplicación web**. Ejecutar como: *Yo*. Quién tiene acceso: *Cualquier persona*. Implementar.
6. Copiá la dirección que termina en `/exec` y pegala en `config.js` y en la página del docente.

La planilla arma sola las hojas **Notas**, **Eventos**, **Práctica** y **Promedios E1 / E2** (una fila por alumno, la nota del examen la cargás vos y la nota final promedia todo).
