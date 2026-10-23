// Motor de la práctica: práctica guiada sin nota, trabajos prácticos con nota y aviso al docente si alguien sale de la página.
// Sigue los Lineamientos Institucionales de Evaluación del IAT: encabezado, criterios por escrito, consignas numeradas
// y de distinto tipo (sencillas, de comprensión, genuinas y metacognitivas).
(function () {
  'use strict';
  const B = window.BANCO, CFG = window.CONFIG || {};
  const $ = (s, el) => (el || document).querySelector(s);
  const app = $('#app');
  const DOCENTE = 'Lic. Gutiérrez';

  // ---------- utilidades ----------
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const leer = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  const borrar = (k) => { try { localStorage.removeItem(k); } catch (e) {} };
  function hash(s) { let h = 1779033703 ^ s.length; for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; } return () => { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); return (h ^= h >>> 16) >>> 0; }; }
  function rng(semilla) {
    let a = hash(String(semilla))();
    const next = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    return { next, pick: (arr) => arr[Math.floor(next() * arr.length)], mezclar: (arr) => { const b = arr.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; } };
  }
  const NF = {};
  function f(x, d) {
    const k = d === undefined ? 'a' : 'd' + d;
    NF[k] = NF[k] || new Intl.NumberFormat('es-AR', d === undefined ? { maximumFractionDigits: 4 } : { minimumFractionDigits: d, maximumFractionDigits: d });
    return NF[k].format(x);
  }
  function leerNumero(s) {
    s = String(s || '').trim().replace(/\s+/g, '').replace(/[^\d,.\-]/g, '');
    if (!s) return NaN;
    if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
    else if (/^-?[1-9]\d{0,2}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    return parseFloat(s);
  }
  const normal = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  const lindo = (s) => String(s || '').trim().replace(/\s+/g, ' ').toLowerCase().replace(/(^|\s)\S/g, (m) => m.toUpperCase());
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const hoy = () => new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const TOL = 0.05;
  const correcta = (q, valor) => {
    if (q.tipo === 'opc') return valor === q.ok;
    const v = leerNumero(valor); if (!isFinite(v)) return false;
    const tol = q.tol !== undefined ? q.tol : TOL;
    return Math.abs(v - q.valor) <= Math.max(Math.abs(q.valor) * tol, q.tolAbs || 1e-9);
  };
  function armar(def, r) {
    const q = def.gen(r, f); q.id = def.id; q.tema = def.tema; q.tipo = def.tipo;
    q.et = q.et || (q.tipo === 'num' ? 'CUENTA' : 'COMPRENSIÓN');
    if (!q.fig && B.figTema && B.figTema[q.tema]) q.fig = B.figTema[q.tema]();
    if (q.tipo === 'opc') { const ord = r.mezclar(q.opciones.map((_, i) => i)); q.opciones = ord.map((i) => q.opciones[i]); q.ok = ord.indexOf(q.ok); }
    return q;
  }
  const respuestaCorrecta = (q) => { if (q.tipo === 'opc') return q.opciones[q.ok]; const v = Math.abs(q.valor); return `${v >= 100 ? f(q.valor, 0) : v >= 10 ? f(q.valor, 1) : v >= 1 ? f(q.valor, 2) : f(q.valor)} ${q.unidad || ''}`; };
  const ETQ = { 'SENCILLA': 'az', 'COMPRENSIÓN': 'vi', 'CUENTA': 'amb', 'CASO REAL': 'ro', 'GENUINA': 've', 'METACOGNITIVA': 've' };
  const etiqueta = (e) => `<span class="etq ${ETQ[e] || ''}">${e}</span>`;

  // ---------- alumno ----------
  let yo = leer('yo_' + B.curso, null);
  const claveAlumno = () => B.curso + '|' + normal(yo.nombre);

  // ---------- envío a la planilla ----------
  function enviar(tipo, extra) {
    if (!yo) return;
    const d = Object.assign({ curso: B.curso, alumno: yo.nombre, lista: yo.lista, clave_alumno: claveAlumno(), tipo, t: Date.now() }, extra || {});
    if (!CFG.URL) { const p = leer('pendientes', []); p.push(d); guardar('pendientes', p.slice(-200)); return; }
    const body = JSON.stringify(d);
    let ok = false;
    try { ok = navigator.sendBeacon && navigator.sendBeacon(CFG.URL, new Blob([body], { type: 'text/plain;charset=utf-8' })); } catch (e) {}
    if (!ok) { try { fetch(CFG.URL, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body }); } catch (e) {} }
  }

  // ---------- piezas de pantalla ----------
  function pantalla(html) { app.innerHTML = html; window.scrollTo(0, 0); }
  function cabecera() { $('#quien').innerHTML = yo ? `<span class="chip">👤 ${esc(yo.nombre)} · N.° ${yo.lista}</span>` : ''; }
  function modal(html, botones) {
    const m = document.createElement('div'); m.id = 'modal';
    m.innerHTML = `<div class="caja">${html}<div class="fila" style="margin-top:16px"></div></div>`;
    const fila = $('.fila', m);
    botones.forEach(([txt, cls, fn]) => { const b = document.createElement('button'); b.className = 'btn ' + (cls || ''); b.textContent = txt; b.onclick = () => { m.remove(); fn && fn(); }; fila.appendChild(b); });
    document.body.appendChild(m);
  }
  const encabezado = (titulo) => `<div class="tarjeta encab"><div class="inst">Instituto Técnico Privado «Ing. Anacleto Tobar» · F-77 · Tucumán</div>
    <div class="tit">${titulo}</div><table class="datos"><tr><td><b>Espacio curricular:</b> ${esc(B.nombre)}</td><td><b>Año:</b> ${esc(B.anio)}</td></tr>
    <tr><td><b>Docente:</b> ${DOCENTE}</td><td><b>Fecha:</b> ${hoy()}</td></tr><tr><td colspan="2"><b>Alumno/a:</b> ${esc(yo.nombre)} · N.° ${yo.lista}</td></tr></table></div>`;
  function consigna(q, n, total, valor) {
    return `<div class="tarjeta preg"><div class="cab-c"><b>Consigna ${n}${total ? ' de ' + total : ''}</b> ${etiqueta(q.et)}<span class="tema">${esc(q.tema)}</span></div>
      ${q.fig ? `<div class="fig">${q.fig}</div>` : ''}<div class="enun">${q.enun}</div>${zonaRespuesta(q, valor)}<div id="dev"></div>`;
  }
  function zonaRespuesta(q, valor) {
    if (q.tipo === 'opc') return `<div class="opciones">${q.opciones.map((o, k) => `<button class="op${valor === k ? ' sel' : ''}" data-k="${k}"><span class="l">${'ABCD'[k]}</span><span>${o}</span></button>`).join('')}</div>`;
    return `<div class="resp"><input class="txt" id="num" inputmode="decimal" autocomplete="off" placeholder="Resultado" value="${valor !== undefined ? esc(valor) : ''}"><span class="u">${q.unidad || ''}</span></div>
      <div class="sub" style="font-size:13px;margin-top:6px">Con coma para los decimales. Se acepta un margen de ${Math.round((q.tol !== undefined ? q.tol : TOL) * 100)} % por el redondeo.</div>`;
  }
  function conectarRespuesta(q, alElegir) {
    if (q.tipo === 'opc') app.querySelectorAll('.op').forEach((b) => b.onclick = () => { app.querySelectorAll('.op').forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); alElegir(+b.dataset.k); });
    else { const n = $('#num'); n.oninput = () => alElegir(n.value); n.onkeydown = (e) => { if (e.key === 'Enter') { const c = $('#comp'); if (c && !c.classList.contains('oculto')) c.click(); } }; }
  }
  function marcarOpciones(q, v, ok, soloMal) {
    if (q.tipo !== 'opc') return;
    app.querySelectorAll('.op').forEach((b) => { const k = +b.dataset.k; if (!soloMal && k === q.ok) b.classList.add('bien'); if (k === v && !ok) b.classList.add('mal'); });
  }

  // ---------- ingreso y menú ----------
  function ingreso() {
    const listas = Array.from({ length: 40 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');
    pantalla(`<h1>Práctica de ${esc(B.nombre)}</h1><p class="sub">${esc(B.anio)} · Docente: ${DOCENTE}. Poné tu nombre como figura en la lista del curso.</p>
      <div class="tarjeta"><label class="campo" for="nom">Nombre y apellido</label><input class="txt" id="nom" autocomplete="name" maxlength="60" placeholder="Ej.: Juan Pérez">
      <label class="campo" for="lis">Número de lista</label><select class="txt" id="lis"><option value="">Elegí tu número</option>${listas}</select>
      <div id="err" class="aviso ro oculto"></div><div style="margin-top:16px"><button class="btn ancho" id="ok">Entrar</button></div></div>`);
    $('#ok').onclick = () => {
      const n = lindo($('#nom').value), l = $('#lis').value;
      if (n.split(' ').length < 2) { $('#err').textContent = 'Poné nombre y apellido.'; $('#err').classList.remove('oculto'); return; }
      if (!l) { $('#err').textContent = 'Elegí tu número de lista.'; $('#err').classList.remove('oculto'); return; }
      yo = { nombre: n, lista: +l }; guardar('yo_' + B.curso, yo); cabecera(); menu();
    };
  }
  function menu() {
    pantalla(`<h1>${esc(B.nombre)}</h1><p class="sub">${esc(B.anio)} · ${esc(yo.nombre)}</p>
      <button class="tarjeta grande" id="m-pra"><span class="ic">📘</span><b>Práctica guiada</b><span>Sin nota. Consignas con circuitos, una pista si te equivocás y la resolución completa. Para preparar el trabajo práctico y el examen.</span></button>
      <button class="tarjeta grande" id="m-tp"><span class="ic">📝</span><b>Trabajo práctico con nota</b><span>Cuando el docente da el código en clase. La nota va a la planilla del curso.</span></button>
      <button class="tarjeta grande" id="m-res"><span class="ic">📒</span><b>Resumen para la carpeta</b><span>Definiciones y fórmulas de todo lo que se pregunta acá. Se copia en la carpeta.</span></button>
      <p class="pie">¿No sos ${esc(yo.nombre)}? <a href="#" id="salir">Cambiar de alumno</a></p>`);
    $('#m-pra').onclick = elegirPractica; $('#m-tp').onclick = pedirCodigo; $('#m-res').onclick = resumen;
    $('#salir').onclick = (e) => { e.preventDefault(); borrar('yo_' + B.curso); yo = null; cabecera(); ingreso(); };
  }

  // ---------- resumen ----------
  function resumen() {
    const figs = B.figTema ? Object.values(B.figTema) : [];
    const secs = B.resumen.map(([t, items, fx], k) => `<div class="tarjeta res-sec"><h2>${k + 1}. ${t}</h2>${B.figResumen && B.figResumen[k] ? `<div class="fig">${B.figResumen[k]()}</div>` : ''}<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>
      ${fx.length ? `<div class="formulas">${fx.map((x) => `<span class="fx">${x}</span>`).join('')}</div>` : ''}</div>`).join('');
    pantalla(`<h1>Resumen para la carpeta</h1><p class="sub">${esc(B.nombre)} · ${esc(B.anio)}. Todo lo que preguntan la práctica y los trabajos sale de acá. Copialo en la carpeta.</p>
      <div class="fila no-imp"><button class="btn sec" id="volver">← Volver</button><button class="btn sec" id="imp">🖨️ Imprimir</button></div>${secs}`);
    $('#volver').onclick = menu; $('#imp').onclick = () => window.print();
  }

  // ---------- práctica guiada (sin nota) ----------
  const TIPOS = { todo: ['Todas', () => true], com: ['Comprensión', (p) => p.tipo === 'opc'], cue: ['Cuentas', (p) => p.tipo === 'num'] };
  function elegirPractica() {
    let tipo = 'todo'; const temas = new Set();
    pantalla(`<h1>Práctica guiada</h1><p class="sub">Cinco consignas por vez. Resolvé en la carpeta, con fórmula, reemplazo y unidad, y poné el resultado.</p>
      <div class="tarjeta"><b>Tipo de consignas</b><div class="nivel">${Object.entries(TIPOS).map(([k, v]) => `<button data-n="${k}">${v[0]}</button>`).join('')}</div>
      <b>Temas</b> <span class="sub" style="font-size:14px">(si no elegís ninguno, entran todos)</span><div class="sel-temas">${B.temas.map((t) => `<button data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div>
      <div class="fila" style="margin-top:12px"><button class="btn sec" id="volver">← Volver</button><button class="btn" id="go">Empezar</button></div></div>`);
    const pintar = () => { app.querySelectorAll('[data-n]').forEach((b) => b.classList.toggle('on', b.dataset.n === tipo)); app.querySelectorAll('[data-t]').forEach((b) => b.classList.toggle('on', temas.has(b.dataset.t))); };
    app.querySelectorAll('[data-n]').forEach((b) => b.onclick = () => { tipo = b.dataset.n; pintar(); });
    app.querySelectorAll('[data-t]').forEach((b) => b.onclick = () => { temas.has(b.dataset.t) ? temas.delete(b.dataset.t) : temas.add(b.dataset.t); pintar(); });
    pintar(); $('#volver').onclick = menu; $('#go').onclick = () => practica(tipo, [...temas]);
  }
  function practica(tipo, temas) {
    const r = rng(Date.now() + yo.nombre);
    let pool = B.preguntas.filter(TIPOS[tipo][1]); if (temas.length) pool = pool.filter((p) => temas.includes(p.tema)); if (!pool.length) pool = B.preguntas;
    const defs = r.mezclar(pool); while (defs.length < 5) defs.push(...r.mezclar(pool));
    const qs = defs.slice(0, 5).map((d) => armar(d, r)), res = [];
    let i = 0;
    function una() {
      const q = qs[i]; let intentos = 0, sel = null;
      pantalla(`<div class="puntitos">${qs.map((_, k) => `<i class="${k < i ? (res[k] ? 'bien' : 'mal') : k === i ? 'act' : ''}">${k + 1}</i>`).join('')}</div>${consigna(q, i + 1, 5)}
        <div class="fila" style="margin-top:14px"><button class="btn" id="comp">Comprobar</button><button class="btn sec oculto" id="sig">${i < 4 ? 'Siguiente consigna →' : 'Ver cómo me fue'}</button></div></div>
        <div class="fila no-imp"><button class="btn sec" id="volver">← Volver al menú</button></div>`);
      conectarRespuesta(q, (v) => { sel = v; });
      $('#volver').onclick = menu;
      $('#comp').onclick = () => {
        const v = q.tipo === 'opc' ? sel : $('#num').value;
        if (v === null || v === '' || v === undefined) { $('#dev').innerHTML = `<div class="devol pista">Elegí o escribí una respuesta.</div>`; return; }
        intentos++;
        if (correcta(q, v)) { res[i] = intentos === 1; marcarOpciones(q, v, true); $('#dev').innerHTML = `<div class="devol bien"><b>✔ Correcto.</b><div class="proc">${q.proc}</div></div>`; fin(); }
        else if (intentos === 1) { if (q.tipo === 'opc') marcarOpciones(q, v, false, true); $('#dev').innerHTML = `<div class="devol pista"><b>Revisalo con esta pista:</b><div class="proc">${q.pista || 'Volvé a leer la consigna y mirá el circuito.'}</div></div>`; }
        else { res[i] = false; marcarOpciones(q, v, false); $('#dev').innerHTML = `<div class="devol mal"><b>Así se resuelve:</b><div class="proc">${q.proc}</div><div class="proc">Respuesta: <b>${respuestaCorrecta(q)}</b></div></div>`; fin(); }
      };
      function fin() { $('#comp').classList.add('oculto'); $('#sig').classList.remove('oculto'); $('#sig').onclick = () => { i++; i < 5 ? una() : final(); }; }
    }
    function final() {
      const bien = res.filter(Boolean).length, flojos = [...new Set(qs.filter((_, k) => !res[k]).map((q) => q.tema))];
      enviar('practica', { tipo_consignas: TIPOS[tipo][0], temas: temas.join(', ') || 'todos', aciertos: bien, total: 5 });
      pantalla(`<h1>Práctica terminada</h1><div class="tarjeta"><p><b>${bien} de 5</b> salieron bien al primer intento.</p>
        ${flojos.length ? `<p>Para repasar en el resumen: <b>${flojos.map(esc).join(', ')}</b>.</p>` : '<p>Salieron todas: estás listo para el trabajo práctico.</p>'}
        <div class="aviso"><b>Para pensar</b> ${etiqueta('METACOGNITIVA')}<br>¿Qué consigna te costó más y por qué? Anotalo en una línea en la carpeta: es lo primero que conviene repasar.</div></div>
        <div class="fila"><button class="btn sec" id="menu">Menú</button><button class="btn" id="otra">Otra práctica</button></div>`);
      $('#menu').onclick = menu; $('#otra').onclick = () => practica(tipo, temas);
    }
    una();
  }

  // ---------- trabajo práctico con nota ----------
  function pedirCodigo() {
    pantalla(`<h1>Trabajo práctico con nota</h1><p class="sub">El docente da el código en clase.</p>
      <div class="tarjeta"><label class="campo" for="cod">Código</label><input class="txt" id="cod" autocomplete="off" autocapitalize="characters" placeholder="Código">
      <div id="err" class="aviso ro oculto"></div><div class="fila" style="margin-top:14px"><button class="btn sec" id="volver">← Volver</button><button class="btn" id="ok">Seguir</button></div></div>`);
    $('#volver').onclick = menu;
    const ir = () => {
      const c = $('#cod').value.trim().toUpperCase(), act = B.actividades.find((a) => a.codigo.toUpperCase() === c);
      if (!act) { $('#err').textContent = 'Ese código no existe. Revisalo con el docente.'; $('#err').classList.remove('oculto'); return; }
      const hecho = leer(`hecho_${B.curso}_${act.id}_${normal(yo.nombre)}`, null);
      if (hecho) return resultado(act, hecho);
      reglas(act);
    };
    $('#ok').onclick = ir; $('#cod').onkeydown = (e) => { if (e.key === 'Enter') ir(); };
  }
  function reglas(act) {
    const enCurso = leer(`tp_${B.curso}_${act.id}_${normal(yo.nombre)}`, null), n = act.opc + act.num;
    pantalla(`${encabezado(esc(act.nombre))}<div class="tarjeta"><b>Criterios de evaluación</b><ul>
      <li>Son <b>${n} consignas</b>, cada una vale un punto. Nota = consignas bien (de 1 a 10). Tiempo: <b>${act.minutos} minutos</b>.</li>
      <li>Las cuentas se resuelven en la <b>carpeta</b>, con fórmula, reemplazo y unidad. Se carga el resultado y se acepta un margen del ${Math.round(TOL * 100)} % por el redondeo. El docente puede pedir la carpeta.</li>
      <li>En las de comprensión se elige la opción correcta.</li>
      <li>Al final hay una consigna para pensar sobre tu trabajo. No lleva nota.</li>
      <li>Podés ir y volver entre las consignas antes de entregar.</li>
      <li><b>No salgas de esta página.</b> Si cambiás de aplicación, abrís otra pestaña o sacás una captura, al docente le llega un aviso con tu nombre.</li></ul>
      ${enCurso ? '<div class="aviso">Ya habías empezado: seguís donde lo dejaste.</div>' : ''}
      <div class="fila" style="margin-top:12px"><button class="btn sec" id="volver">← Volver</button><button class="btn ve" id="go">${enCurso ? 'Seguir' : 'Empezar'}</button></div></div>`);
    $('#volver').onclick = menu;
    $('#go').onclick = () => { pantallaCompleta(); tp(act); };
  }
  function pantallaCompleta() { try { const d = document.documentElement; (d.requestFullscreen || d.webkitRequestFullscreen || (() => {})).call(d); } catch (e) {} }
  function armarTP(act, alumno) {
    const r = rng([B.curso, act.id, normal(alumno.nombre), alumno.lista].join('|'));
    const elegir = (tipo, n) => {
      const porTema = {}; r.mezclar(B.preguntas.filter((p) => p.tipo === tipo)).forEach((p) => (porTema[p.tema] = porTema[p.tema] || []).push(p));
      const temas = r.mezclar(Object.keys(porTema)), out = [];
      while (out.length < n && temas.some((t) => porTema[t].length)) temas.forEach((t) => { if (out.length < n && porTema[t].length) out.push(porTema[t].shift()); });
      return out;
    };
    return [...elegir('opc', act.opc), ...elegir('num', act.num)].map((d) => armar(d, r));
  }
  let vigilancia = null;
  function tp(act) {
    const clave = `tp_${B.curso}_${act.id}_${normal(yo.nombre)}`;
    let est = leer(clave, null);
    const qs = armarTP(act, yo), N = qs.length;
    if (!est) { est = { inicio: Date.now(), resp: {}, i: 0, salidas: 0, fuera: 0, refl: '' }; guardar(clave, est); enviar('inicio', { actividad: act.nombre, total: N }); }
    else enviar('volvio_a_entrar', { actividad: act.nombre, total: N, pregunta: est.i + 1, respondidas: Object.keys(est.resp).length });
    document.body.classList.add('tp-activo');
    const fin = est.inicio + act.minutos * 60000;
    vigilancia = vigilar(act, est, clave, N);
    const respondida = (k) => est.resp[k] !== undefined && est.resp[k] !== '';
    function dibujar() {
      const meta = est.i === N;
      const puntos = `<div class="puntitos">${qs.map((_, k) => `<i data-k="${k}" class="${respondida(k) ? 'hecho' : ''} ${k === est.i ? 'act' : ''}">${k + 1}</i>`).join('')}<i data-k="${N}" class="${est.refl ? 'hecho' : ''} ${meta ? 'act' : ''}">✎</i></div>`;
      const top = `<div class="marcador"><span class="chip amb">📝 ${esc(act.nombre)}</span><span class="chip reloj" id="reloj">⏱️ --:--</span></div>${puntos}`;
      if (meta) {
        pantalla(`${top}<div class="tarjeta preg"><div class="cab-c"><b>Consigna final</b> ${etiqueta('METACOGNITIVA')}</div><div class="enun">¿Qué consigna te costó más y por qué? ¿Qué vas a repasar?</div>
          <textarea class="txt" id="refl" rows="4" maxlength="400" placeholder="Escribilo con tus palabras (no lleva nota)">${esc(est.refl || '')}</textarea>
          <div class="fila" style="margin-top:16px"><button class="btn sec" id="ant">← Anterior</button><button class="btn ve" id="sig">Entregar</button></div></div>`);
        $('#refl').oninput = () => { est.refl = $('#refl').value; guardar(clave, est); };
        $('#ant').onclick = () => { est.i = N - 1; guardar(clave, est); dibujar(); };
        $('#sig').onclick = entregar;
      } else {
        const q = qs[est.i];
        pantalla(`${top}${consigna(q, est.i + 1, N, est.resp[est.i])}
          <div class="fila" style="margin-top:16px"><button class="btn sec" id="ant" ${est.i === 0 ? 'disabled' : ''}>← Anterior</button><button class="btn" id="sig">Siguiente →</button></div></div>
          <button class="btn ro ancho no-imp" id="ent">Entregar el trabajo</button>`);
        conectarRespuesta(q, (v) => { est.resp[est.i] = v; guardar(clave, est); app.querySelectorAll('.puntitos i')[est.i].classList.toggle('hecho', v !== ''); });
        $('#ant').onclick = () => { if (est.i > 0) { est.i--; guardar(clave, est); dibujar(); } };
        $('#sig').onclick = () => { est.i++; guardar(clave, est); dibujar(); };
        $('#ent').onclick = entregar;
      }
      app.querySelectorAll('.puntitos i').forEach((p) => p.onclick = () => { est.i = +p.dataset.k; guardar(clave, est); dibujar(); });
      reloj();
    }
    function reloj() {
      const el = $('#reloj'); if (!el) return;
      const s = Math.max(0, Math.round((fin - Date.now()) / 1000));
      el.textContent = `⏱️ ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; el.classList.toggle('poco', s < 300);
    }
    const tic = setInterval(() => { reloj(); if (Date.now() >= fin) { clearInterval(tic); cerrar(true); } }, 1000);
    function entregar() {
      const faltan = qs.filter((_, k) => !respondida(k)).length;
      modal(`<h2 style="margin-top:0">¿Entregás?</h2><p>${faltan ? `Te ${faltan === 1 ? 'queda 1 consigna' : `quedan ${faltan} consignas`} sin responder.` : 'Respondiste todas las consignas.'} Después de entregar no se puede cambiar.</p>`,
        [['Seguir revisando', 'sec'], ['Entregar', 've', () => cerrar(false)]]);
    }
    function cerrar(porTiempo) {
      clearInterval(tic); if (vigilancia) vigilancia.parar(); vigilancia = null; document.body.classList.remove('tp-activo');
      const det = qs.map((q, k) => ({ ok: correcta(q, est.resp[k]), resp: q.tipo === 'opc' ? (est.resp[k] !== undefined ? q.opciones[est.resp[k]] : '') : (est.resp[k] || ''), correcta: respuestaCorrecta(q) }));
      const aciertos = det.filter((d) => d.ok).length, nota = Math.max(1, Math.round(10 * aciertos / N));
      const hecho = { nota, aciertos, total: N, salidas: est.salidas, porTiempo, det, enun: qs.map((q) => q.enun), proc: qs.map((q) => q.proc), refl: est.refl || '' };
      guardar(`hecho_${B.curso}_${act.id}_${normal(yo.nombre)}`, hecho); borrar(clave);
      enviar('entrega', { actividad: act.nombre, nota, aciertos, total: N, salidas: est.salidas, fuera_s: Math.round(est.fuera), por_tiempo: porTiempo, minutos: Math.round((Date.now() - est.inicio) / 60000),
        respuestas: det.map((d) => (d.ok ? '✔ ' : '✘ ') + d.resp).join(' | '), reflexion: est.refl || '' });
      try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
      resultado(act, hecho);
    }
    dibujar();
  }
  function resultado(act, h) {
    const msg = h.nota >= 9 ? 'Excelente trabajo.' : h.nota >= 7 ? 'Muy buen trabajo.' : h.nota >= 6 ? 'Aprobado. Repasá las consignas que no salieron.' : 'No alcanzó esta vez. Repasá con la práctica guiada las consignas de abajo.';
    pantalla(`<h1>${esc(act.nombre)}</h1><div class="tarjeta" style="text-align:center"><div class="sub">Nota</div><div class="nota">${h.nota}<small> / 10</small></div>
      <p>${h.aciertos} de ${h.total} consignas bien. ${msg}${h.porTiempo ? '<br>Se entregó solo porque se terminó el tiempo.' : ''}</p>
      <p class="sub" style="font-size:14px">La nota ya está en la planilla del curso.${h.salidas ? ` Saliste de la página ${h.salidas} ${h.salidas === 1 ? 'vez' : 'veces'}: el docente lo ve.` : ''}</p></div>
      <div class="tarjeta revision"><h2 style="margin-top:0">Devolución</h2>${h.det.map((d, k) => `<div class="it"><div class="q"><b>${d.ok ? '✔' : '✘'} ${k + 1}.</b> ${h.enun[k]}</div>
      <div class="r">Tu respuesta: ${esc(d.resp || 'sin responder')} · Correcta: <b>${d.correcta}</b></div>${d.ok ? '' : `<div class="r">${h.proc[k]}</div>`}</div>`).join('')}</div>
      <div class="fila"><button class="btn" id="menu">Volver al menú</button></div>`);
    $('#menu').onclick = menu;
  }

  // ---------- vigilancia mientras dura el trabajo ----------
  function vigilar(act, est, clave, N) {
    let tFuera = 0, tBlur = 0, blurT = null, activo = true;
    const datos = (x) => Object.assign({ actividad: act.nombre, pregunta: Math.min(est.i + 1, N), respondidas: Object.keys(est.resp).filter((k) => est.resp[k] !== '').length, total: N, salidas: est.salidas }, x || {});
    const aviso = (tipo, txt) => { est.salidas++; guardar(clave, est); enviar(tipo, datos({ detalle: txt })); };
    function cartel(txt) {
      if (!activo || $('#cartel')) return;
      const c = document.createElement('div'); c.id = 'cartel';
      c.innerHTML = `<div class="caja"><div class="ic">🚨</div><h2>${txt}</h2><p>Al docente le llegó el aviso con tu nombre. Es la vez número <b>${est.salidas}</b>.</p><p class="sub">Seguí con tu trabajo sin salir de la página.</p><button class="btn ancho" id="sigo">Seguir con el trabajo</button></div>`;
      document.body.appendChild(c); $('#sigo').onclick = () => { c.remove(); pantallaCompleta(); };
    }
    const vis = () => {
      if (!activo) return;
      if (document.visibilityState === 'hidden') { tFuera = Date.now(); clearTimeout(blurT); aviso('salida', 'Salió de la página (otra app, otra pestaña o el inicio del celular)'); }
      else if (tFuera) { const s = (Date.now() - tFuera) / 1000; est.fuera += s; guardar(clave, est); enviar('vuelta', datos({ seg: Math.round(s) })); tFuera = 0; cartel('Saliste de la página'); }
    };
    const blur = () => { if (!activo || document.visibilityState === 'hidden') return; tBlur = Date.now(); blurT = setTimeout(() => { if (document.visibilityState !== 'hidden' && !document.hasFocus()) aviso('foco', 'Otra ventana o aplicación quedó encima de la página (captura, Lens, pantalla dividida)'); }, 1200); };
    const focus = () => { clearTimeout(blurT); if (tBlur && Date.now() - tBlur > 1500 && document.visibilityState !== 'hidden') cartel('La página perdió el foco'); tBlur = 0; };
    const fs = () => { if (!activo) return; if (!document.fullscreenElement && !document.webkitFullscreenElement) enviar('pantalla', datos({ detalle: 'Salió de pantalla completa' })); };
    const tecla = (e) => { if (!activo) return; const k = e.key || ''; if (k === 'PrintScreen' || ((e.ctrlKey || e.metaKey) && ['p', 's', 'c', 'u'].includes(k.toLowerCase())) || (e.metaKey && e.shiftKey)) { aviso('tecla', 'Apretó ' + (k === 'PrintScreen' ? 'Imprimir pantalla' : 'un atajo de teclado')); if (k !== 'PrintScreen') e.preventDefault(); } };
    const copiar = (e) => { if (!activo) return; e.preventDefault(); enviar('copiar', datos({ detalle: 'Intentó copiar o pegar' })); };
    const menuCtx = (e) => { if (activo) e.preventDefault(); };
    const cierre = () => { if (activo) enviar('cerro', datos({ detalle: 'Cerró o recargó la página' })); };
    document.addEventListener('visibilitychange', vis); window.addEventListener('blur', blur); window.addEventListener('focus', focus);
    document.addEventListener('fullscreenchange', fs); document.addEventListener('webkitfullscreenchange', fs);
    document.addEventListener('keydown', tecla, true); document.addEventListener('copy', copiar); document.addEventListener('cut', copiar); document.addEventListener('paste', copiar);
    document.addEventListener('contextmenu', menuCtx); window.addEventListener('pagehide', cierre);
    const pulso = setInterval(() => { if (document.visibilityState === 'visible') enviar('pulso', datos()); }, 20000);
    return { parar() { activo = false; clearInterval(pulso); document.removeEventListener('visibilitychange', vis); window.removeEventListener('blur', blur); window.removeEventListener('focus', focus);
      document.removeEventListener('fullscreenchange', fs); document.removeEventListener('webkitfullscreenchange', fs); document.removeEventListener('keydown', tecla, true);
      document.removeEventListener('copy', copiar); document.removeEventListener('cut', copiar); document.removeEventListener('paste', copiar); document.removeEventListener('contextmenu', menuCtx); window.removeEventListener('pagehide', cierre); } };
  }

  // ---------- arranque ----------
  document.title = 'Práctica · ' + B.nombre;
  $('#curso').innerHTML = `${esc(B.nombre)}<small>${esc(B.anio)} · ${DOCENTE}</small>`;
  window.__test = { correcta, leerNumero, armarTP: (act, a) => armarTP(act, a) };
  cabecera();
  if (!yo) ingreso(); else {
    const pend = B.actividades.find((a) => leer(`tp_${B.curso}_${a.id}_${normal(yo.nombre)}`, null));
    if (pend) reglas(pend); else menu();
  }
})();
