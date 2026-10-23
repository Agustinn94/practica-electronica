/**
 * Planilla de la práctica de Electrónica (Instituto Técnico «Ing. Anacleto Tobar»).
 * Recibe lo que mandan las páginas de los chicos y le contesta a la página del profe.
 * Se pega entero en Extensiones > Apps Script de una planilla nueva de Google.
 */
const CLAVE = 'CAMBIAME';           // poné acá una clave tuya (la vas a escribir en la página del profe)
const HORAS_TABLERO = 6;            // cuánto tiempo recuerda el tablero en vivo

// ---------- entradas ----------
function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    registrar_(d);
    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error: ' + err);
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.accion === 'estado' || p.accion === 'limpiar') {
    if (CLAVE === 'CAMBIAME' || p.clave !== CLAVE) return json_({ error: 'clave' });
    if (p.accion === 'limpiar') { limpiar_(p.curso); return json_({ ok: true }); }
    return json_(estado_(p.curso));
  }
  return json_({ ok: true, hola: 'Planilla de práctica funcionando' });
}

// ---------- lo que pasa con cada aviso ----------
const ALERTAS = { salida: true, foco: true, pantalla: true, tecla: true, copiar: true, cerro: true, volvio_a_entrar: true };
const TEXTO = { salida: 'Salió de la página', vuelta: 'Volvió a la página', foco: 'Otra ventana encima', pantalla: 'Salió de pantalla completa',
  tecla: 'Atajo de teclado o captura', copiar: 'Intentó copiar o pegar', cerro: 'Cerró o recargó la página', volvio_a_entrar: 'Volvió a entrar al trabajo',
  inicio: 'Empezó el trabajo', entrega: 'Entregó', practica: 'Terminó una práctica guiada' };

function registrar_(d) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const curso = String(d.curso || 'x').toLowerCase();
    const cache = CacheService.getScriptCache();
    const est = JSON.parse(cache.get('est_' + curso) || '{}');
    const al = JSON.parse(cache.get('al_' + curso) || '[]');
    const k = String(d.clave_alumno || d.alumno);
    const a = est[k] || { alumno: d.alumno, lista: d.lista, salidas: 0, fuera_s: 0 };
    a.alumno = d.alumno; a.lista = d.lista; a.ultima = Date.now();
    if (d.actividad) a.actividad = d.actividad;
    if (d.total) a.total = d.total;
    if (d.pregunta) a.pregunta = d.pregunta;
    if (d.respondidas !== undefined) a.respondidas = d.respondidas;
    if (d.salidas !== undefined) a.salidas = Math.max(a.salidas || 0, d.salidas);
    switch (d.tipo) {
      case 'inicio': a.estado = 'trabajando'; a.salidas = 0; a.fuera_s = 0; a.nota = null; a.respondidas = 0; a.pregunta = 1; break;
      case 'salida': a.estado = 'afuera'; break;
      case 'vuelta': a.estado = 'trabajando'; a.fuera_s = (a.fuera_s || 0) + (Number(d.seg) || 0); break;
      case 'entrega': a.estado = 'entregó'; a.nota = d.nota; a.respondidas = d.total; a.fuera_s = d.fuera_s; break;
      case 'practica': if (a.estado !== 'trabajando' && a.estado !== 'afuera') a.estado = 'practicando'; a.series = (a.series || 0) + 1; a.bien = (a.bien || 0) + (Number(d.aciertos) || 0); break;
      default: if (!a.estado) a.estado = 'trabajando';
    }
    est[k] = a;
    if (ALERTAS[d.tipo] || d.tipo === 'vuelta') {
      al.push({ t: Date.now(), alumno: d.alumno, lista: d.lista, tipo: d.tipo, texto: TEXTO[d.tipo] || d.tipo, detalle: d.detalle || (d.seg ? 'Estuvo afuera ' + d.seg + ' s' : ''), grave: !!ALERTAS[d.tipo] });
      while (al.length > 80) al.shift();
    }
    const ttl = HORAS_TABLERO * 3600;
    cache.put('est_' + curso, JSON.stringify(est), ttl);
    cache.put('al_' + curso, JSON.stringify(al), ttl);
    if (d.tipo !== 'pulso') anotar_(d);
  } finally {
    lock.releaseLock();
  }
}

// ---------- planilla ----------
function hoja_(nombre, encabezado) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(nombre);
  if (!sh) { sh = ss.insertSheet(nombre); sh.appendRow(encabezado); sh.setFrozenRows(1); sh.getRange(1, 1, 1, encabezado.length).setFontWeight('bold').setBackground('#1F3A5F').setFontColor('#FFFFFF'); }
  return sh;
}
function anotar_(d) {
  const ahora = new Date();
  const curso = String(d.curso || '').toUpperCase();
  hoja_('Eventos', ['Fecha y hora', 'Curso', 'Alumno', 'N.°', 'Qué pasó', 'Detalle', 'Actividad', 'Pregunta'])
    .appendRow([ahora, curso, d.alumno, d.lista, TEXTO[d.tipo] || d.tipo, d.detalle || (d.seg ? 'Estuvo afuera ' + d.seg + ' s' : ''), d.actividad || '', d.pregunta || '']);
  if (d.tipo === 'entrega') {
    const repetido = promedios_(d);
    hoja_('Notas', ['Fecha y hora', 'Curso', 'Alumno', 'N.°', 'Actividad', 'Nota', 'Bien', 'Total', 'Veces que salió', 'Segundos afuera', 'Minutos', 'Se cortó por tiempo', 'Respuestas', 'Para pensar (lo que escribió)', 'Observación'])
      .appendRow([ahora, curso, d.alumno, d.lista, d.actividad, d.nota, d.aciertos, d.total, d.salidas, d.fuera_s, d.minutos, d.por_tiempo ? 'sí' : 'no', d.respuestas || '', d.reflexion || '', repetido ? 'Lo hizo otra vez: en Promedios quedó la primera nota' : '']);
  }
  if (d.tipo === 'practica') {
    hoja_('Práctica', ['Fecha y hora', 'Curso', 'Alumno', 'N.°', 'Tipo de consignas', 'Temas', 'Bien', 'De'])
      .appendRow([ahora, curso, d.alumno, d.lista, d.tipo_consignas, d.temas, d.aciertos, d.total]);
  }
}
// Una hoja por curso: una fila por alumno y una columna por trabajo. El promedio final junta los trabajos y el examen.
function promedios_(d) {
  const sh = hoja_('Promedios ' + String(d.curso).toUpperCase(), ['Alumno', 'N.° de lista', 'Examen (lo cargás vos)', 'Promedio de los trabajos', 'Nota final (promedio de todo)']);
  const ultCol = Math.max(sh.getLastColumn(), 5);
  const enc = sh.getRange(1, 1, 1, ultCol).getValues()[0];
  let col = enc.indexOf(d.actividad) + 1;
  if (col < 1) { col = ultCol + 1; sh.getRange(1, col).setValue(d.actividad).setFontWeight('bold').setBackground('#1F3A5F').setFontColor('#FFFFFF'); }
  const ult = sh.getLastRow();
  let fila = 0;
  if (ult > 1) {
    const nombres = sh.getRange(2, 1, ult - 1, 1).getValues();
    for (let i = 0; i < nombres.length; i++) if (norm_(nombres[i][0]) === norm_(d.alumno)) { fila = i + 2; break; }
  }
  if (!fila) { fila = ult + 1; sh.getRange(fila, 1, 1, 2).setValues([[d.alumno, d.lista]]); }
  const yaEstaba = sh.getRange(fila, col).getValues()[0][0];
  if (yaEstaba !== '' && yaEstaba !== null) return true;   // si lo repite, queda la primera nota
  sh.getRange(fila, col).setValue(d.nota);
  sh.getRange(fila, 4).setFormula('=IFERROR(ROUND(AVERAGE(F' + fila + ':' + fila + '),2),"")');
  sh.getRange(fila, 5).setFormula('=IFERROR(ROUND(IF(C' + fila + '="",AVERAGE(F' + fila + ':' + fila + '),AVERAGE(C' + fila + ',F' + fila + ':' + fila + ')),2),"")');
  return false;
}
function norm_(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim(); }

// ---------- tablero del profe ----------
function estado_(curso) {
  curso = String(curso || '').toLowerCase();
  const cache = CacheService.getScriptCache();
  const est = JSON.parse(cache.get('est_' + curso) || '{}');
  const al = JSON.parse(cache.get('al_' + curso) || '[]');
  const alumnos = Object.keys(est).map(function (k) { return est[k]; }).sort(function (a, b) { return (a.lista || 99) - (b.lista || 99); });
  return { alumnos: alumnos, alertas: al, ahora: Date.now(), planilla: SpreadsheetApp.getActive().getUrl() };
}
function limpiar_(curso) {
  const cache = CacheService.getScriptCache();
  cache.remove('est_' + String(curso).toLowerCase()); cache.remove('al_' + String(curso).toLowerCase());
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// Ejecutá esta función una vez desde el editor: pide los permisos y deja armadas las hojas.
function preparar() {
  hoja_('Eventos', ['Fecha y hora', 'Curso', 'Alumno', 'N.°', 'Qué pasó', 'Detalle', 'Actividad', 'Pregunta']);
  hoja_('Notas', ['Fecha y hora', 'Curso', 'Alumno', 'N.°', 'Actividad', 'Nota', 'Bien', 'Total', 'Veces que salió', 'Segundos afuera', 'Minutos', 'Se cortó por tiempo', 'Respuestas', 'Para pensar (lo que escribió)', 'Observación']);
  hoja_('Práctica', ['Fecha y hora', 'Curso', 'Alumno', 'N.°', 'Tipo de consignas', 'Temas', 'Bien', 'De']);
  const h = SpreadsheetApp.getActive().getSheetByName('Hoja 1') || SpreadsheetApp.getActive().getSheetByName('Sheet1');
  if (h && h.getLastRow() === 0 && SpreadsheetApp.getActive().getSheets().length > 1) SpreadsheetApp.getActive().deleteSheet(h);
  Logger.log('Listo: ' + SpreadsheetApp.getActive().getUrl());
}
