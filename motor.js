// Página del alumno: repaso, práctica guiada, simulacro con nota (con fecha de vencimiento y fotos de las cuentas) y simulacro libre.
// Sigue los Lineamientos Institucionales de Evaluación del IAT: encabezado, criterios por escrito, consignas numeradas
// y de distinto tipo (sencillas, de comprensión, genuinas y metacognitivas).
(function () {
  'use strict';
  const B = window.BANCO, CFG = window.CONFIG || {}, EX = window.EX;
  const $ = (s, el) => (el || document).querySelector(s);
  const app = $('#app');
  const DOCENTE = 'Lic. Gutiérrez';
  const { f, normal, correcta, mate } = EX;

  // ---------- utilidades ----------
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const leer = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  const borrar = (k) => { try { localStorage.removeItem(k); } catch (e) {} };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const lindo = (s) => String(s || '').trim().replace(/\s+/g, ' ').toLowerCase().replace(/(^|\s)\S/g, (m) => m.toUpperCase());
  const hoy = () => new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const fechaHora = (t) => new Date(t).toLocaleString('es-AR', { weekday: 'long', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/Argentina/Buenos_Aires' }).replace(',', ' a las').replace(/(\d+)-(\d+)/, '$1/$2');
  const hora = (t) => new Date(t).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/Argentina/Buenos_Aires' });
  const ETQ = { 'SENCILLA': 'az', 'COMPRENSIÓN': 'vi', 'CUENTA': 'amb', 'CASO REAL': 'ro', 'GENUINA': 've', 'METACOGNITIVA': 've' };
  const etiqueta = (e) => `<span class="etq ${ETQ[e] || ''}">${e}</span>`;
  const pantalla = (html) => { app.innerHTML = html; window.scrollTo(0, 0); mate(app); };
  const repasoLink = (tema) => `repaso.html?c=${B.curso}#${encodeURIComponent(tema)}`;

  // ---------- alumno ----------
  let yo = leer('yo_' + B.curso, null); if (yo && !yo.codigo) yo = null;
  const claveAlumno = () => B.curso + '|' + yo.lista + '|' + normal(yo.nombre);

  // ---------- envío a la planilla, con cola por si no hay señal ----------
  const COLA = 'cola_' + B.curso;
  function enviar(tipo, extra) {
    if (!yo) return;
    const d = Object.assign({ curso: B.curso, alumno: yo.nombre, lista: yo.lista, codigo: yo.codigo || "", clave_alumno: claveAlumno(), tipo, t: Date.now(), id: Date.now() + '-' + Math.random().toString(36).slice(2, 7) }, extra || {});
    if (tipo === 'pulso') { mandar(d).catch(() => {}); return; }
    const c = leer(COLA, []); c.push(d); guardar(COLA, c.slice(-300)); vaciar();
  }
  function mandar(d) {
    if (!CFG.URL) return Promise.resolve('sin planilla');
    const body = JSON.stringify(d);
    return fetch(CFG.URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body })
      .then((r) => r.text()).then((t) => { if (!/^ok/.test(t)) throw new Error(t); return t; })
      .catch((e) => fetch(CFG.URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body }).then(() => 'ok'));
  }
  let vaciando = false;
  function vaciar() {
    if (vaciando || !CFG.URL) return; const c = leer(COLA, []); if (!c.length) return;
    vaciando = true; const d = c[0];
    mandar(d).then(() => { const c2 = leer(COLA, []).filter((x) => x.id !== d.id); guardar(COLA, c2); vaciando = false; if (c2.length) setTimeout(vaciar, 150); pintarCola(); })
      .catch(() => { vaciando = false; });
  }
  const pendientes = () => leer(COLA, []).filter((x) => x.tipo === 'entrega').length;
  function pintarCola() { const e = $('#cola'); if (e) e.innerHTML = pendientes() ? '⏳ La nota está guardada en este celular y se manda sola apenas haya señal. No borres los datos del navegador.' : '✅ La nota ya llegó a la planilla del docente.'; }
  window.addEventListener('online', vaciar); setInterval(vaciar, 10000); vaciar();

  // ---------- fechas de las actividades con nota ----------
  const ms = (s) => (s ? Date.parse(s) : NaN);
  function estadoAct(act) {
    const a = ms(act.abre), v = ms(act.vence), t = Date.now();
    if (isFinite(a) && t < a) return 'antes';
    if (isFinite(v) && t > v) return 'vencida';
    return 'abierta';
  }
  const hecho = (act) => leer(`hecho_${B.curso}_${act.id}_${yo.lista}_${normal(yo.nombre)}`, null);
  const claveTP = (act) => `tp_${B.curso}_${act.id}_${yo.lista}_${normal(yo.nombre)}`;

  // ---------- piezas de pantalla ----------
  function cabecera() { $('#quien').innerHTML = yo ? `<span class="chip">👤 ${esc(yo.nombre)} · N.° ${yo.lista}</span>` : ''; }
  function modal(html, botones) {
    const m = document.createElement('div'); m.id = 'modal';
    m.innerHTML = `<div class="caja">${html}<div class="fila" style="margin-top:16px"></div></div>`;
    const fila = $('.fila', m);
    botones.forEach(([txt, cls, fn]) => { const b = document.createElement('button'); b.className = 'btn ' + (cls || ''); b.textContent = txt; b.onclick = () => { m.remove(); fn && fn(); }; fila.appendChild(b); });
    document.body.appendChild(m); mate(m);
  }
  function ventana(titulo, cuerpo, cls) {
    const m = document.createElement('div'); m.id = 'modal';
    m.innerHTML = `<div class="caja ventana ${cls || ''}" role="dialog" aria-label="${titulo.replace(/<[^>]+>/g, '')}"><div class="v-cab"><b>${titulo}</b><button class="v-x" aria-label="Cerrar" title="Cerrar">✕</button></div><div class="v-cuerpo">${cuerpo}</div></div>`;
    const cerrar = () => { m.remove(); document.removeEventListener('keydown', esc_); };
    const esc_ = (e) => { if (e.key === 'Escape') cerrar(); };
    m.addEventListener('click', (e) => { if (e.target === m) cerrar(); });
    $('.v-x', m).onclick = cerrar; document.addEventListener('keydown', esc_);
    document.body.appendChild(m); mate(m); return m;
  }
  const esExamen = (a) => /^examen/i.test(a.id);
  const encabezado = (titulo) => `<div class="tarjeta encab"><div class="inst">Instituto Técnico Privado «Ing. Anacleto Tobar» · F-77 · Tucumán</div>
    <div class="tit">${titulo}</div><table class="datos"><tr><td><b>Espacio curricular:</b> ${esc(B.nombre)}</td><td><b>Año:</b> ${esc(B.anio)}</td></tr>
    <tr><td><b>Docente:</b> ${DOCENTE}</td><td><b>Fecha:</b> ${hoy()}</td></tr><tr><td colspan="2"><b>Alumno/a:</b> ${esc(yo.nombre)} · N.° ${yo.lista}</td></tr></table></div>`;
  function consigna(p, n, total, valor) {
    return `<div class="tarjeta preg"><div class="cab-c"><b>Consigna ${n}${total ? ' de ' + total : ''}</b> ${etiqueta(p.et)}<span class="tema">${esc(p.tema)}</span></div>
      ${p.fig ? `<div class="fig">${p.fig}</div>` : ''}<div class="enun">${p.enun}</div>${zonaRespuesta(p, valor)}<div id="dev"></div>`;
  }
  function zonaRespuesta(p, valor) {
    if (p.tipo === 'opc') return `<div class="opciones">${p.opciones.map((o, k) => `<button class="op${valor === k ? ' sel' : ''}" data-k="${k}"><span class="l">${'ABCD'[k]}</span><span>${o}</span></button>`).join('')}</div>`;
    return `<div class="resp"><input class="txt" id="num" inputmode="decimal" autocomplete="off" placeholder="Resultado" value="${valor !== undefined ? esc(valor) : ''}"><span class="u">${esc(p.unidad || '')}</span></div>
      <div class="sub" style="font-size:13px;margin-top:6px">Solo el número, con coma para los decimales${p.unidad ? `, en <b>${esc(p.unidad)}</b>` : ''}. Se acepta un margen del ${Math.round((p.tol !== undefined ? p.tol : EX.TOL) * 100)} % por el redondeo.</div>`;
  }
  function conectarRespuesta(p, alElegir) {
    if (p.tipo === 'opc') app.querySelectorAll('.op').forEach((b) => b.onclick = () => { app.querySelectorAll('.op').forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); alElegir(+b.dataset.k); });
    else { const n = $('#num'); n.oninput = () => alElegir(n.value); }
  }
  function marcarOpciones(p, v, ok, soloMal) {
    if (p.tipo !== 'opc') return;
    app.querySelectorAll('.op').forEach((b) => { const k = +b.dataset.k; if (!soloMal && k === p.ok) b.classList.add('bien'); if (k === v && !ok) b.classList.add('mal'); });
  }

  // ---------- ingreso ----------
  function ingreso() {
    const listas = Array.from({ length: B.listas || 40 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('') + '<option value="40">Prueba del profe</option>';
    pantalla(`<h1>${esc(B.nombre)}</h1><p class="sub">${esc(B.anio)} · Docente: ${DOCENTE}</p>
      <div class="tarjeta"><label class="campo" for="lis">Tu número de lista</label><select class="txt" id="lis"><option value="">Elegí tu número</option>${listas}</select>
      <label class="campo" for="cod">Tu código personal</label><input class="txt" id="cod" inputmode="numeric" autocomplete="off" maxlength="4" placeholder="4 números">
      <div class="aviso" style="margin-top:12px">El código te lo da el profe en un papelito y es <b>solo tuyo</b>. Con él se carga tu nota: no se lo pases a nadie.</div>
      <div id="err" class="aviso ro oculto"></div><div style="margin-top:16px"><button class="btn ancho" id="ok">Entrar</button></div></div>`);
    const err = (t) => { $('#err').innerHTML = t; $('#err').classList.remove('oculto'); };
    const listo = () => { $('#ok').disabled = false; $('#ok').textContent = 'Entrar'; };
    $('#ok').onclick = async () => {
      const l = +$('#lis').value, c = $('#cod').value.replace(/\D/g, '');
      if (!l) return err('Elegí tu número de lista.');
      if (c.length !== 4) return err('El código tiene 4 números.');
      $('#ok').disabled = true; $('#ok').textContent = 'Revisando…';
      try {
        const r = !CFG.URL ? { ok: true, nombre: 'Alumno ' + l } : await fetch(`${CFG.URL}?accion=alumno&curso=${B.curso}&lista=${l}&codigo=${c}`).then((x) => x.json());
        if (!r.ok) { listo(); return err('Ese código no corresponde a ese número de lista. Revisá el papelito o pedíselo al profe.'); }
        yo = { nombre: r.nombre, lista: l, codigo: c }; guardar('yo_' + B.curso, yo); cabecera(); menu();
      } catch (e) { listo(); err('No hay conexión con la planilla. Revisá el wifi o los datos y probá de nuevo.'); }
    };
    $('#cod').onkeydown = (e) => { if (e.key === 'Enter') $('#ok').click(); };
  }

  // ---------- menú ----------
  function bannerActividades() {
    return B.actividades.filter((a) => a.vence).map((a) => {
      const e = estadoAct(a), h = hecho(a);
      if (h) return `<div class="aviso ve"><b>✔ ${esc(a.nombre)}:</b> entregado, nota ${h.nota}.</div>`;
      if (e === 'vencida') return `<div class="aviso ro"><b>${esc(a.nombre)}:</b> venció el ${fechaHora(ms(a.vence))}. Quedó un 1.</div>`;
      if (e === 'antes') return '';
      return `<div class="aviso amb grande-aviso"><b>📝 ${esc(a.nombre)} con nota: hoy hasta las ${hora(ms(a.vence))}.</b><br>${esExamen(a) ? 'Es el examen del trimestre.' : 'La nota se promedia con la del examen.'} Si no lo entregás a tiempo, el sistema pone un 1. <span id="falta-${a.id}"></span></div>`;
    }).join('');
  }
  function menu() {
    const prox = B.actividades.filter((a) => a.vence && estadoAct(a) === 'antes' && !hecho(a)).map((a) => `<i>📅 <b>${esc(a.nombre)}:</b> ${fechaHora(ms(a.abre))}, hasta las ${hora(ms(a.vence))}</i>`).join('');
    pantalla(`<h1>${esc(B.nombre)}</h1><p class="sub">${esc(B.anio)} · ${esc(yo.nombre)}</p>${bannerActividades()}
      <a class="tarjeta grande clase" style="text-decoration:none" href="clase.html?c=${B.curso}"><span class="ic">🎬</span><b>1 · Repaso en diapositivas</b><span>La clase del profe: cada tema con fotos, dibujos, fórmulas y un ejemplo resuelto. <u>Empezá por acá.</u></span></a>
      <button class="tarjeta grande" id="m-pra"><span class="ic">📘</span><b>2 · Práctica guiada</b><span>Elegís un tema y practicás. Sin nota: si te equivocás te da una pista y después la resolución paso a paso.</span></button>
      <button class="tarjeta grande" id="m-lib"><span class="ic">🧪</span><b>3 · Simulacro libre</b><span>Un examen de prueba distinto cada vez, con nota al instante. No cuenta para el trimestre: es para entrenar.</span></button>
      <button class="tarjeta grande con-nota" id="m-tp"><span class="sello">CON NOTA</span><span class="ic">📝</span><b>4 · Simulacro o examen con nota</b><span>Se hace en clase, con el código que da el profe. La nota queda en la planilla.</span>${prox ? `<span class="prox">${prox}</span>` : ''}</button>
      <div class="menu-sep">Para estudiar en casa</div>
      <a class="tarjeta grande" style="text-decoration:none" href="apunte-${B.curso}.pdf" target="_blank" rel="noopener"><span class="ic">📄</span><b>Apunte y hoja de fórmulas (PDF)</b><span>Para imprimir o copiar en la carpeta: teoría, fórmulas y un ejemplo resuelto de cada cuenta.</span></a>
      <a class="tarjeta grande" style="text-decoration:none" href="repaso.html?c=${B.curso}"><span class="ic">📖</span><b>Repaso para leer</b><span>Lo mismo que las diapositivas, en texto corto para el celular, con audio.</span></a>
      <p class="pie">¿No sos ${esc(yo.nombre)}? <a href="#" id="salir">Cambiar de alumno</a></p>`);
    $('#m-pra').onclick = elegirPractica; $('#m-tp').onclick = pedirCodigo;
    $('#m-lib').onclick = () => reglas(libre());
    $('#salir').onclick = (e) => { e.preventDefault(); borrar('yo_' + B.curso); yo = null; cabecera(); ingreso(); };
    contarMenu();
  }
  function contarMenu() {
    clearInterval(contarMenu.t);
    contarMenu.t = setInterval(() => { B.actividades.forEach((a) => { const el = $('#falta-' + a.id); if (!el) return; const s = Math.round((ms(a.vence) - Date.now()) / 1000);
      el.textContent = s > 0 ? `Faltan ${Math.floor(s / 3600)} h ${Math.floor(s % 3600 / 60)} min.` : 'Venció.'; }); }, 1000);
  }
  const libre = () => ({ id: 'libre' + Date.now(), nombre: 'Simulacro libre', minutos: 50, opc: 5, num: 5, simulacro: true, libre: true });

  // ---------- práctica guiada ----------
  function elegirPractica() {
    const temas = new Set();
    pantalla(`<h1>Práctica guiada</h1><p class="sub">Cinco consignas por vez. Resolvé en la carpeta con fórmula, reemplazo y unidad, y poné el resultado.</p>
      <div class="tarjeta"><b>Temas</b> <span class="sub" style="font-size:14px">(si no elegís ninguno, entran todos)</span><div class="sel-temas">${B.temas.map((t) => `<button data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div>
      <div class="fila" style="margin-top:12px"><button class="btn sec" id="volver">← Volver</button><button class="btn" id="go">Empezar</button></div></div>`);
    app.querySelectorAll('[data-t]').forEach((b) => b.onclick = () => { temas.has(b.dataset.t) ? temas.delete(b.dataset.t) : temas.add(b.dataset.t); b.classList.toggle('on', temas.has(b.dataset.t)); });
    $('#volver').onclick = menu; $('#go').onclick = () => practica([...temas]);
  }
  function practica(temas) {
    const r = EX.rng(Date.now() + yo.nombre);
    let pool = B.preguntas; if (temas.length) pool = pool.filter((p) => temas.includes(p.tema));
    const opcs = r.mezclar(pool.filter((p) => p.tipo === 'opc')), nums = r.mezclar(pool.filter((p) => p.tipo === 'num'));
    const defs = r.mezclar([...opcs.slice(0, 2), ...nums.slice(0, 3)]); while (defs.length < 5) defs.push(r.pick(pool));
    const qs = defs.map((d) => EX.armar(d, r)), res = [];
    let i = 0;
    function una() {
      const p = qs[i]; let intentos = 0, sel = null;
      pantalla(`<div class="puntitos">${qs.map((_, k) => `<i class="${k < i ? (res[k] ? 'bien' : 'mal') : k === i ? 'act' : ''}">${k + 1}</i>`).join('')}</div>${consigna(p, i + 1, 5)}
        <div class="fila" style="margin-top:14px"><button class="btn" id="comp">Comprobar</button><button class="btn sec oculto" id="sig">${i < 4 ? 'Siguiente →' : 'Ver cómo me fue'}</button></div></div>
        <div class="fila no-imp"><button class="btn sec" id="volver">← Volver al menú</button></div>`);
      conectarRespuesta(p, (v) => { sel = v; });
      $('#volver').onclick = menu;
      const dev = (cls, html) => { $('#dev').innerHTML = `<div class="devol ${cls}">${html}</div>`; mate($('#dev')); };
      $('#comp').onclick = () => {
        const v = p.tipo === 'opc' ? sel : $('#num').value;
        if (v === null || v === '' || v === undefined) { dev('pista', 'Elegí o escribí una respuesta.'); return; }
        intentos++;
        if (correcta(p, v)) { res[i] = intentos === 1; marcarOpciones(p, v, true); dev('bien', `<b>✔ Correcto.</b>${EX.resolucionHTML(p)}`); fin(); }
        else if (intentos === 1) { if (p.tipo === 'opc') marcarOpciones(p, v, false, true); dev('pista', `<b>Todavía no. Probá de nuevo con esta pista:</b>${EX.pistaHTML(p)}<div style="margin-top:8px">📖 <a href="${repasoLink(p.tema)}" target="_blank">Repasá ${esc(p.tema)}</a></div>`); }
        else { res[i] = false; marcarOpciones(p, v, false); dev('mal', `<b>Así se resuelve:</b>${EX.resolucionHTML(p)}<div style="margin-top:8px">📖 <a href="${repasoLink(p.tema)}" target="_blank">Repasá ${esc(p.tema)}</a></div>`); fin(); }
      };
      function fin() { $('#comp').classList.add('oculto'); $('#sig').classList.remove('oculto'); $('#sig').onclick = () => { i++; i < 5 ? una() : final(); }; }
    }
    function final() {
      const bien = res.filter(Boolean).length, flojos = [...new Set(qs.filter((_, k) => !res[k]).map((p) => p.tema))];
      enviar('practica', { temas: temas.join(', ') || 'todos', aciertos: bien, total: 5 });
      pantalla(`<h1>Práctica terminada</h1><div class="tarjeta"><p><b>${bien} de 5</b> salieron bien al primer intento.</p>
        ${flojos.length ? `<p>Para repasar: ${flojos.map((t) => `<a href="${repasoLink(t)}" target="_blank"><b>${esc(t)}</b></a>`).join(', ')}.</p>` : '<p>Salieron todas: estás listo para el simulacro.</p>'}
        <div class="aviso"><b>Para pensar</b> ${etiqueta('METACOGNITIVA')}<br>¿Qué consigna te costó más y por qué? Anotalo en una línea en la carpeta: es lo primero que conviene repasar.</div></div>
        <div class="fila"><button class="btn sec" id="menu">Menú</button><button class="btn" id="otra">Otra práctica</button></div>`);
      $('#menu').onclick = menu; $('#otra').onclick = () => practica(temas);
    }
    una();
  }

  // ---------- simulacro con nota ----------
  function pedirCodigo() {
    pantalla(`<h1>Simulacro con nota</h1><p class="sub">El docente da el código en clase.</p>
      <div class="tarjeta"><label class="campo" for="cod">Código</label><input class="txt" id="cod" autocomplete="off" autocapitalize="characters" placeholder="Código">
      <div id="err" class="aviso ro oculto"></div><div class="fila" style="margin-top:14px"><button class="btn sec" id="volver">← Volver</button><button class="btn" id="ok">Seguir</button></div></div>`);
    $('#volver').onclick = menu;
    const err = (t) => { $('#err').innerHTML = t; $('#err').classList.remove('oculto'); };
    const ir = () => {
      const c = $('#cod').value.trim().toUpperCase();
      let act = B.actividades.find((a) => a.codigo.toUpperCase() === c), tarde = false;
      if (!act) { act = B.actividades.find((a) => a.tarde && a.tarde === String(EX.hash('tarde|' + c)())); tarde = !!act; }
      if (!act) return err('Ese código no existe. Revisalo con el docente.');
      const h = hecho(act); if (h) return resultado(act, h);
      const e = estadoAct(act);
      if (e === 'antes' && !tarde) return err(`Todavía no empezó. Se habilita el ${fechaHora(ms(act.abre))}.`);
      if (e === 'vencida' && !tarde) { enviar('vencido', { actividad: act.nombre }); return err(`Venció el ${fechaHora(ms(act.vence))}. En la planilla quedó un 1.`); }
      reglas(Object.assign({}, act, { autorizadoTarde: tarde, codTarde: tarde ? c : '' }));
    };
    $('#ok').onclick = ir; $('#cod').onkeydown = (e) => { if (e.key === 'Enter') ir(); };
  }
  function reglas(act) {
    const enCurso = !act.libre && leer(claveTP(act), null), n = act.opc + act.num;
    const vence = act.vence && !act.autorizadoTarde ? ms(act.vence) : NaN;
    pantalla(`${encabezado(esc(act.nombre))}
      ${act.libre ? '' : `<div class="aviso amb grande-aviso"><b>${esExamen(act) ? 'Este es el examen del trimestre. Tiene nota.' : 'Este simulacro tiene nota y se promedia con la del examen.'}</b>${isFinite(vence) ? `<br>Se entrega <b>hoy hasta las ${hora(vence)}</b>. A esa hora se cierra solo y lo que no se entregó queda con 1.` : ''}</div>`}
      <div class="tarjeta"><b>Criterios de evaluación</b><ul>
      <li>Son <b>${n} consignas</b> numeradas, cada una vale un punto. Nota = consignas bien, de 1 a 10. Tiempo: <b>${act.minutos} minutos</b>${isFinite(vence) ? ` (o hasta las ${hora(vence)}, lo que llegue primero)` : ''}.</li>
      <li>Hay consignas <b>sencillas</b>, de <b>comprensión</b>, <b>casos reales</b> y <b>cuentas</b>. Cada alumno tiene sus propios números.</li>
      <li>Las cuentas se resuelven <b>en papel</b>, con fórmula, reemplazo y unidad, como en la carpeta.</li>
      ${act.fotos ? `<li>📷 En cada cuenta, <b>primero sacás una foto</b> de tu resolución y <b>después</b> escribís el resultado. Sin foto no se puede responder. Las fotos le llegan al docente.</li>` : ''}
      <li>Tenés a mano la <b>calculadora</b> y la <b>hoja de fórmulas</b> adentro de la página. No hace falta salir.</li>
      <li>Al final hay una consigna para pensar sobre tu trabajo. No lleva nota.</li>
      ${act.libre ? '<li>Este simulacro <b>no cuenta para la nota</b>: al final ves cómo te fue y la resolución de cada consigna.</li>' : `<li><b>No salgas de esta página.</b> Si salís, cambiás de aplicación, sacás una captura o abrís la búsqueda del celular, suena una alarma y al profe le llega el aviso con tu nombre al instante. <b>Salir a propósito es desaprobar.</b> Si fue sin querer, avisale al profe: volvés y seguís donde estabas. Abrir la cámara con el botón de la foto está permitido.</li>
      <li>Cada uno tiene <b>números distintos</b>: está pensado para que lo resuelvas vos, sin ChatGPT. Si te trabás, <b>preguntale al profe</b>.</li>
      ${act.minimo ? `<li>Tomate tu tiempo: el botón de entregar se habilita a los <b>${act.minimo} minutos</b>, para que revises cada cuenta.</li>` : ''}`}
      </ul>${enCurso ? '<div class="aviso">Ya habías empezado: seguís donde lo dejaste.</div>' : ''}
      <div class="fila" style="margin-top:12px"><button class="btn sec" id="volver">← Volver</button><button class="btn ve" id="go">${enCurso ? 'Seguir' : 'Empezar'}</button></div></div>`);
    $('#volver').onclick = menu;
    $('#go').onclick = () => { prepararSonido(); if (!act.libre) pantallaCompleta(); tp(act); };
  }
  function pantallaCompleta() { try { const d = document.documentElement; (d.requestFullscreen || d.webkitRequestFullscreen || (() => {})).call(d); } catch (e) {} }

  let vigilancia = null;
  function tp(act) {
    const clave = act.libre ? 'tp_libre_' + B.curso : claveTP(act);
    let est = leer(clave, null);
    if (est && act.libre && est.actId !== act.id) est = null;
    const semilla = act.libre ? (est && est.semilla) || ('libre|' + Date.now()) : null;
    const qs = EX.armarExamen(B, act, yo, semilla), N = qs.length;
    if (!est) { est = { actId: act.id, semilla, inicio: Date.now(), resp: {}, i: 0, salidas: 0, fuera: 0, refl: '', fotos: {} }; guardar(clave, est); if (!act.libre) enviar('inicio', { actividad: act.nombre, total: N, tarde: !!act.autorizadoTarde }); }
    else if (!act.libre) enviar('volvio_a_entrar', { actividad: act.nombre, total: N, pregunta: est.i + 1, respondidas: Object.keys(est.resp).length });
    est.fotos = est.fotos || {};
    Object.keys(est.fotos).forEach((k) => { if (est.fotos[k] !== 'subida' && !FOTOS[k]) { delete est.fotos[k]; delete est.resp[k]; } });
    document.body.classList.add('tp-activo');
    const vence = act.vence && !act.autorizadoTarde && !act.libre ? ms(act.vence) : Infinity;
    const fin = Math.min(est.inicio + act.minutos * 60000, vence);
    vigilancia = act.libre ? null : vigilar(act, est, clave, N);
    const pideFoto = (p) => act.fotos && p.tipo === 'num';
    const respondida = (k) => est.resp[k] !== undefined && est.resp[k] !== '' && (!pideFoto(qs[k]) || !!est.fotos[k]);
    const herramientas = `<div class="fila herram no-imp"><button class="btn sec" id="b-calc" type="button">🧮 Calculadora</button><button class="btn sec" id="b-fx" type="button">📒 Fórmulas</button></div>`;
    function dibujar() {
      const meta = est.i === N;
      const puntos = `<div class="puntitos">${qs.map((_, k) => `<i data-k="${k}" class="${respondida(k) ? 'hecho' : ''} ${k === est.i ? 'act' : ''}">${k + 1}</i>`).join('')}<i data-k="${N}" class="${est.refl ? 'hecho' : ''} ${meta ? 'act' : ''}">✎</i></div>`;
      const top = `<div class="marcador"><span class="chip amb">📝 ${esc(act.nombre)}</span><span class="chip reloj" id="reloj">⏱️ --:--</span></div>${puntos}${herramientas}`;
      if (meta) {
        pantalla(`${top}<div class="tarjeta preg"><div class="cab-c"><b>Consigna final</b> ${etiqueta('METACOGNITIVA')}</div><div class="enun">¿Qué consigna te costó más y por qué? ¿Qué vas a repasar antes del examen?</div>
          <textarea class="txt" id="refl" rows="4" maxlength="400" placeholder="Escribilo con tus palabras (no lleva nota)">${esc(est.refl || '')}</textarea>
          <div class="fila" style="margin-top:16px"><button class="btn sec" id="ant">← Anterior</button><button class="btn ve" id="sig">Entregar</button></div></div>`);
        $('#refl').oninput = () => { est.refl = $('#refl').value; guardar(clave, est); };
        $('#ant').onclick = () => { est.i = N - 1; guardar(clave, est); dibujar(); };
        $('#sig').onclick = entregar;
      } else {
        const p = qs[est.i];
        pantalla(`${top}${consigna(p, est.i + 1, N, est.resp[est.i])}
          <div class="fila" style="margin-top:16px"><button class="btn sec" id="ant" ${est.i === 0 ? 'disabled' : ''}>← Anterior</button><button class="btn" id="sig">Siguiente →</button></div></div>
          <button class="btn ro ancho no-imp" id="ent">Entregar el simulacro</button>`);
        conectarRespuesta(p, (v) => { est.resp[est.i] = v; guardar(clave, est); app.querySelectorAll('.puntitos i')[est.i].classList.toggle('hecho', respondida(est.i)); });
        if (pideFoto(p)) zonaFoto(act, est, clave, est.i, () => app.querySelectorAll('.puntitos i')[est.i].classList.toggle('hecho', respondida(est.i)));
        $('#ant').onclick = () => { if (est.i > 0) { est.i--; guardar(clave, est); dibujar(); } };
        $('#sig').onclick = () => { est.i++; guardar(clave, est); dibujar(); };
        $('#ent').onclick = entregar;
      }
      app.querySelectorAll('.puntitos i').forEach((x) => x.onclick = () => { est.i = +x.dataset.k; guardar(clave, est); dibujar(); });
      $('#b-calc').onclick = calculadora; $('#b-fx').onclick = hojaFormulas;
      reloj();
    }
    function reloj() {
      const el = $('#reloj'); if (!el) return;
      const s = Math.max(0, Math.round((fin - Date.now()) / 1000));
      el.textContent = `⏱️ ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; el.classList.toggle('poco', s < 300);
    }
    const tic = setInterval(() => { reloj(); if (Date.now() >= fin) { clearInterval(tic); esperarFotos(est).then(() => cerrar(true)); } }, 1000);
    function entregar() {
      const faltaMin = act.minimo && !act.libre ? Math.ceil(act.minimo - (Date.now() - est.inicio) / 60000) : 0;
      if (faltaMin > 0) { modal(`<h2 style="margin-top:0">Todavía es temprano</h2><p>Revisá cada cuenta con calma: la fórmula, el reemplazo y la unidad. El botón de entregar se habilita en <b>${faltaMin} min</b>.</p>`, [['Seguir revisando', 'sec']]); return; }
      const sinResp = qs.map((p, k) => k).filter((k) => est.resp[k] === undefined || est.resp[k] === '');
      const sinFoto = qs.map((p, k) => k).filter((k) => pideFoto(qs[k]) && !est.fotos[k]);
      const lista = (arr) => arr.map((k) => `<button class="chip ir-a" data-k="${k}">${k + 1}</button>`).join(' ');
      const m = document.createElement('div'); m.id = 'modal';
      m.innerHTML = `<div class="caja"><h2 style="margin-top:0">¿Entregás?</h2>
        ${!sinResp.length && !sinFoto.length ? '<p>✅ Respondiste todas las consignas y están todas las fotos.</p>' : ''}
        ${sinResp.length ? `<p>⚠️ Sin responder: ${lista(sinResp)}</p>` : ''}${sinFoto.length ? `<p>📷 Sin foto: ${lista(sinFoto)}</p>` : ''}
        ${!est.refl ? '<p>✎ La consigna para pensar está vacía (no lleva nota).</p>' : ''}
        <p class="sub" style="font-size:15px">Tocá un número para ir a esa consigna. Después de entregar no se puede cambiar.</p>
        <div class="fila" style="margin-top:12px"><button class="btn sec" id="m-no">Seguir revisando</button><button class="btn ve" id="m-si">Entregar</button></div></div>`;
      document.body.appendChild(m);
      m.querySelectorAll('.ir-a').forEach((b) => b.onclick = () => { m.remove(); est.i = +b.dataset.k; guardar(clave, est); dibujar(); });
      $('#m-no').onclick = () => m.remove();
      $('#m-si').onclick = () => { m.remove(); esperarFotos(est).then(() => cerrar(false)); };
    }
    function cerrar(porTiempo) {
      clearInterval(tic); if (vigilancia) vigilancia.parar(); vigilancia = null; document.body.classList.remove('tp-activo', 'tapado');
      const det = qs.map((p, k) => ({ ok: (!pideFoto(p) || !!est.fotos[k]) && correcta(p, est.resp[k]), resp: p.tipo === 'opc' ? (est.resp[k] !== undefined ? p.opciones[est.resp[k]] : '') : (est.resp[k] || ''), foto: pideFoto(p) ? (est.fotos[k] || 'sin foto') : '' }));
      const aciertos = det.filter((d) => d.ok).length, nota = Math.max(1, Math.round(10 * aciertos / N));
      const nFotos = qs.filter(pideFoto).length, fSub = Object.values(est.fotos).filter((x) => x === 'subida').length;
      const h = { nota, aciertos, total: N, salidas: est.salidas, porTiempo, det, refl: est.refl || '', semilla: est.semilla, t: Date.now() };
      if (!act.libre) guardar(`hecho_${B.curso}_${act.id}_${yo.lista}_${normal(yo.nombre)}`, h);
      borrar(clave); Object.keys(FOTOS).forEach((k) => delete FOTOS[k]);
      const txt = (s) => String(s).replace(/<[^>]+>/g, '').replace(/\$/g, '');
      enviar('entrega', { actividad: act.nombre, libre: !!act.libre, tarde: !!act.autorizadoTarde, codigo_tarde: act.codTarde || '', nota, aciertos, total: N, salidas: est.salidas, fuera_s: Math.round(est.fuera), por_tiempo: porTiempo, minutos: Math.round((Date.now() - est.inicio) / 60000),
        fotos: nFotos ? `${fSub} de ${nFotos} subidas` : '', respuestas: det.map((d, k) => `${k + 1}) ${d.ok ? '✔' : '✘'} ${txt(d.resp) || 'sin responder'}${d.foto && d.foto !== 'subida' ? ' (foto: ' + d.foto + ')' : ''}`).join(' | '), reflexion: est.refl || '' });
      try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
      resultado(act, h, qs);
    }
    dibujar();
  }
  function resultado(act, h, qs) {
    qs = qs || EX.armarExamen(B, act, yo, h.semilla);
    const msg = h.nota >= 9 ? 'Excelente trabajo.' : h.nota >= 7 ? 'Muy buen trabajo.' : h.nota >= 6 ? 'Aprobado. Repasá las consignas que no salieron.' : 'No alcanzó esta vez. Repasá los temas de abajo y hacé la práctica guiada.';
    pantalla(`<h1>${esc(act.nombre)}</h1><div class="tarjeta" style="text-align:center"><div class="sub">Nota</div><div class="nota">${h.nota}<small> / 10</small></div>
      <p>${h.aciertos} de ${h.total} consignas bien. ${msg}${h.porTiempo ? '<br>Se entregó solo porque se terminó el tiempo.' : ''}</p>
      <p class="sub" style="font-size:14px">${act.libre ? 'Es un simulacro libre: no cuenta para la nota.' : '<span id="cola"></span>'}${h.salidas ? ` Saliste de la página ${h.salidas} ${h.salidas === 1 ? 'vez' : 'veces'}: el docente lo ve.` : ''}</p></div>
      <div class="tarjeta revision"><h2 style="margin-top:0">Devolución</h2>${qs.map((p, k) => { const d = h.det[k] || {}; return `<div class="it"><div class="q"><b>${d.ok ? '✔' : '✘'} ${k + 1}.</b> ${p.enun}</div>
        <div class="r">Tu respuesta: ${d.resp ? (p.tipo === 'opc' ? d.resp : esc(d.resp) + ' ' + esc(p.unidad || '')) : 'sin responder'} · Correcta: <b>${EX.respuestaHTML(p)}</b></div>
        ${d.ok ? '' : `<details><summary>Ver la resolución paso a paso</summary>${p.fig ? `<div class="fig">${p.fig}</div>` : ''}${EX.resolucionHTML(p)}<div>📖 <a href="${repasoLink(p.tema)}" target="_blank">Repasá ${esc(p.tema)}</a></div></details>`}</div>`; }).join('')}</div>
      <div class="fila"><button class="btn" id="menu">Volver al menú</button>${act.libre ? '<button class="btn ve" id="otro">Otro simulacro</button>' : ''}</div>`);
    pintarCola();
    $('#menu').onclick = menu;
    if (act.libre) $('#otro').onclick = () => reglas(libre());
  }

  // ---------- calculadora y hoja de fórmulas (para no tener que salir de la página) ----------
  function calculadora() {
    const T = ['7', '8', '9', '÷', '√', '4', '5', '6', '×', 'x²', '1', '2', '3', '−', 'log', '0', ',', '(', ')', '+', 'π', '×10^', '←', 'C', '='];
    const m = ventana('🧮 Calculadora', `<div class="pant"><div id="c-ex"></div><div id="c-res">0</div></div><div class="teclas">${T.map((t) => `<button data-t="${t}" class="${t === '=' ? 'ig' : /[0-9,]/.test(t) ? 'nu' : ''}">${t}</button>`).join('')}</div>`, 'calc');
    let ex = '';
    const pintar = (r) => { $('#c-ex').textContent = ex || ' '; if (r !== undefined) $('#c-res').textContent = r; };
    const evaluar = () => {
      let s = ex.replace(/,/g, '.').replace(/×10\^/g, '*10**').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/π/g, '(Math.PI)').replace(/√\(/g, 'Math.sqrt(').replace(/log\(/g, 'Math.log10(').replace(/²/g, '**2');
      if (!/^[\d.+\-*/()\sMathPIsqrtlog10]*$/.test(s)) return 'Error';
      try { const v = Function('"use strict";return (' + s + ')')(); if (!isFinite(v)) return 'Error'; return f(Math.round(v * 1e9) / 1e9); } catch (e) { return 'Error'; }
    };
    m.querySelectorAll('[data-t]').forEach((b) => b.onclick = () => {
      const t = b.dataset.t;
      if (t === 'C') ex = ''; else if (t === '←') ex = ex.slice(0, -1); else if (t === '=') { const r = evaluar(); pintar(r); if (r !== 'Error') ex = r.replace(/\./g, ''); pintar(); return; }
      else if (t === '√') ex += '√('; else if (t === 'log') ex += 'log('; else if (t === 'x²') ex += '²'; else ex += t;
      pintar(evaluar());
    });
  }
  function hojaFormulas() {
    ventana('📒 Hoja de fórmulas', B.repaso.filter((s) => s.fx && s.fx.length).map((s) => `<div class="hoja-sec"><b>${s.t}</b><div class="formulas">${s.fx.map((x) => `<span class="fx">$${x}$</span>`).join('')}</div></div>`).join(''), 'hoja');
  }

  // ---------- fotos de las cuentas ----------
  const FOTOS = {};
  let camaraDesde = 0;
  const camaraAbierta = () => camaraDesde && Date.now() - camaraDesde < 120000;
  function achicar(file) {
    return new Promise((ok, mal) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => { const M = 1400, k = Math.min(1, M / Math.max(img.width, img.height)); const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); ok(c.toDataURL('image/jpeg', 0.72)); };
      img.onerror = () => { URL.revokeObjectURL(url); mal(new Error('imagen')); };
      img.src = url;
    });
  }
  function subirFoto(act, est, clave, k, intento) {
    if (!FOTOS[k]) return Promise.resolve();
    if (!CFG.URL) { est.fotos[k] = 'subida'; guardar(clave, est); pintarFoto(k, est); return Promise.resolve(); }
    const d = { curso: B.curso, alumno: yo.nombre, lista: yo.lista, codigo: yo.codigo || "", clave_alumno: claveAlumno(), tipo: 'foto', t: Date.now(), actividad: act.nombre, consigna: k + 1, imagen: FOTOS[k].split(',')[1] };
    est.fotos[k] = 'subiendo'; guardar(clave, est); pintarFoto(k, est);
    return fetch(CFG.URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(d) })
      .then((r) => r.text()).then((t) => { if (!/^ok/.test(t)) throw new Error(t); est.fotos[k] = 'subida'; delete FOTOS[k]; guardar(clave, est); pintarFoto(k, est); })
      .catch(() => { est.fotos[k] = 'pendiente'; guardar(clave, est); pintarFoto(k, est); if ((intento || 0) < 10) return new Promise((ok) => setTimeout(ok, 4000)).then(() => subirFoto(act, est, clave, k, (intento || 0) + 1)); });
  }
  function esperarFotos(est) {
    const falta = () => Object.keys(est.fotos || {}).filter((k) => est.fotos[k] !== 'subida' && FOTOS[k]);
    if (!falta().length) return Promise.resolve();
    const m = document.createElement('div'); m.id = 'modal'; m.innerHTML = '<div class="caja"><h2 style="margin-top:0">Subiendo las fotos…</h2><p id="sub-f">No cierres la página.</p></div>'; document.body.appendChild(m);
    const t0 = Date.now();
    return new Promise((ok) => { const iv = setInterval(() => { const fl = falta(); $('#sub-f').textContent = fl.length ? `Faltan ${fl.length}. No cierres la página.` : 'Listo.';
      if (!fl.length || Date.now() - t0 > 45000) { clearInterval(iv); m.remove(); ok(); } }, 700); });
  }
  const ESTADO_FOTO = { subida: '✅ Foto enviada al docente', subiendo: '⏳ Subiendo la foto…', pendiente: '⚠️ Sin señal: se sigue intentando sola' };
  function pintarFoto(k, est) {
    const z = $('#foto-z'); if (!z || +z.dataset.k !== k) return;
    $('#foto-est').textContent = est.fotos[k] ? (ESTADO_FOTO[est.fotos[k]] || '') : 'Todavía no sacaste la foto.';
    const n = $('#num'); if (n) { n.disabled = !est.fotos[k]; n.placeholder = est.fotos[k] ? 'Resultado' : 'Primero sacá la foto'; }
    if (FOTOS[k]) $('#foto-min').innerHTML = `<img src="${FOTOS[k]}" alt="tu foto">`; else if (est.fotos[k] === 'subida') $('#foto-min').innerHTML = '<div class="foto-ok">📄 ✔</div>';
    $('#foto-btn').textContent = est.fotos[k] ? '📷 Sacar otra foto' : '📷 Sacar la foto de tu cuenta';
  }
  function zonaFoto(act, est, clave, k, alCambiar) {
    const resp = $('.resp'); if (!resp) return;
    const z = document.createElement('div'); z.className = 'foto-zona'; z.id = 'foto-z'; z.dataset.k = k;
    z.innerHTML = `<div class="foto-txt"><b>1.</b> Resolvé en el papel con fórmula, reemplazo y unidad. <b>2.</b> Sacale una foto. <b>3.</b> Escribí el resultado.</div>
      <div class="foto-fila"><div id="foto-min" class="foto-min"></div><div style="flex:1"><button class="btn sec ancho" id="foto-btn" type="button"></button><div class="sub" id="foto-est" style="font-size:14px;margin-top:6px"></div></div></div>
      <input type="file" id="foto-in" accept="image/*" capture="environment" style="display:none">`;
    resp.parentNode.insertBefore(z, resp);
    $('#foto-btn').onclick = () => { camaraDesde = Date.now(); if (!act.libre) enviar('camara', { actividad: act.nombre, pregunta: k + 1 }); $('#foto-in').click(); };
    $('#foto-in').onchange = (e) => { const fl = e.target.files && e.target.files[0]; setTimeout(() => { camaraDesde = 0; }, 2500); if (!fl) return;
      $('#foto-est').textContent = 'Preparando la foto…';
      achicar(fl).then((u) => { FOTOS[k] = u; est.fotos[k] = 'pendiente'; guardar(clave, est); pintarFoto(k, est); alCambiar && alCambiar(); subirFoto(act, est, clave, k); })
        .catch(() => { $('#foto-est').textContent = 'No se pudo leer la foto. Probá de nuevo.'; }); };
    pintarFoto(k, est);
  }

  // ---------- alarma ----------
  let ac = null;
  function prepararSonido() { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) {} }
  function alarma() {
    try { navigator.vibrate && navigator.vibrate([400, 150, 400, 150, 400]); } catch (e) {}
    if (!ac) return;
    try {
      if (ac.state === 'suspended') ac.resume();
      const t0 = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
      o.type = 'square'; o.connect(g).connect(ac.destination); g.gain.value = 0.25;
      for (let i = 0; i < 6; i++) { o.frequency.setValueAtTime(i % 2 ? 620 : 1040, t0 + i * 0.35); }
      o.start(t0); o.stop(t0 + 2.1);
    } catch (e) {}
  }

  // ---------- vigilancia mientras dura el simulacro ----------
  function vigilar(act, est, clave, N) {
    let tFuera = 0, blurT = null, activo = true, tCam = 0;
    const datos = (x) => Object.assign({ actividad: act.nombre, pregunta: Math.min(est.i + 1, N), respondidas: Object.keys(est.resp).filter((k) => est.resp[k] !== '').length, total: N, salidas: est.salidas }, x || {});
    const aviso = (tipo, txt) => { est.salidas++; guardar(clave, est); enviar(tipo, datos({ detalle: txt })); };
    const tapar = () => document.body.classList.add('tapado');
    function cartel(txt) {
      tapar(); alarma();
      if (!activo || $('#cartel')) return;
      const c = document.createElement('div'); c.id = 'cartel';
      c.innerHTML = `<div class="caja"><div class="ic">🚨</div><h2>${txt}</h2><p>Al docente le llegó el aviso con tu nombre. Es la vez número <b>${est.salidas}</b>.</p><p class="sub">Si fue sin querer, tocá el botón y seguí: tus respuestas están guardadas.</p><button class="btn ancho" id="sigo">Seguir donde estaba</button></div>`;
      document.body.appendChild(c); $('#sigo').onclick = () => { c.remove(); document.body.classList.remove('tapado'); pantallaCompleta(); };
    }
    const vis = () => {
      if (!activo) return;
      if (document.visibilityState === 'hidden') { clearTimeout(blurT); if (camaraAbierta()) { tCam = Date.now(); return; } tapar(); tFuera = Date.now(); aviso('salida', 'Salió de la página (otra app, otra pestaña o el inicio del celular)'); }
      else if (tCam) { const s = (Date.now() - tCam) / 1000; tCam = 0; if (s > 120) { est.salidas++; est.fuera += s; guardar(clave, est); enviar('salida', datos({ detalle: 'Con la cámara abierta estuvo ' + Math.round(s) + ' s afuera' })); cartel('Estuviste mucho tiempo afuera'); } }
      else if (tFuera) { const s = (Date.now() - tFuera) / 1000; est.fuera += s; guardar(clave, est); enviar('vuelta', datos({ seg: Math.round(s) })); tFuera = 0; cartel('Saliste de la página'); }
    };
    // la búsqueda del celular (botón del medio), Lens, una notificación o una captura hacen que la página pierda el foco
    const blur = () => { if (!activo || document.visibilityState === 'hidden' || camaraAbierta()) return; tapar();
      blurT = setTimeout(() => {
        if (document.hasFocus() || camaraAbierta()) { if (!$('#cartel')) document.body.classList.remove('tapado'); return; }   // fue un parpadeo: se destapa sola
        if (document.visibilityState !== 'hidden') { aviso('foco', 'La página perdió el foco: búsqueda del celular, Lens, captura o pantalla dividida'); cartel('La página perdió el foco'); } }, 350); };
    const toque = () => { if (!$('#cartel') && document.hasFocus()) document.body.classList.remove('tapado'); };
    const focus = () => { if (!$('#cartel')) document.body.classList.remove('tapado'); clearTimeout(blurT); };
    const fs = () => { if (!activo || camaraAbierta()) return; if (!document.fullscreenElement && !document.webkitFullscreenElement) enviar('pantalla', datos({ detalle: 'Salió de pantalla completa' })); };
    const tecla = (e) => { if (!activo) return; const k = e.key || ''; if (k === 'PrintScreen' || ((e.ctrlKey || e.metaKey) && ['p', 's', 'c', 'u', 'v'].includes(k.toLowerCase())) || (e.metaKey && e.shiftKey)) { aviso('tecla', 'Apretó ' + (k === 'PrintScreen' ? 'Imprimir pantalla' : 'un atajo de teclado')); e.preventDefault(); cartel('Eso no está permitido'); } };
    const copiar = (e) => { if (!activo) return; if (e.target && e.target.id === 'refl' && e.type !== 'paste') return; e.preventDefault(); enviar('copiar', datos({ detalle: 'Intentó copiar o pegar' })); };
    const menuCtx = (e) => { if (activo) e.preventDefault(); };
    const cierre = () => { if (activo && !camaraAbierta()) enviar('cerro', datos({ detalle: 'Cerró o recargó la página' })); };
    document.addEventListener('visibilitychange', vis); window.addEventListener('blur', blur); window.addEventListener('focus', focus);
    document.addEventListener('fullscreenchange', fs); document.addEventListener('webkitfullscreenchange', fs);
    document.addEventListener('keydown', tecla, true); document.addEventListener('copy', copiar); document.addEventListener('cut', copiar); document.addEventListener('paste', copiar);
    document.addEventListener('contextmenu', menuCtx); window.addEventListener('pagehide', cierre); document.addEventListener('pointerdown', toque, true);
    const pulso = setInterval(() => { if (document.visibilityState === 'visible') enviar('pulso', datos()); }, 20000);
    return { parar() { activo = false; clearInterval(pulso); clearTimeout(blurT); document.removeEventListener('visibilitychange', vis); window.removeEventListener('blur', blur); window.removeEventListener('focus', focus);
      document.removeEventListener('fullscreenchange', fs); document.removeEventListener('webkitfullscreenchange', fs); document.removeEventListener('keydown', tecla, true);
      document.removeEventListener('copy', copiar); document.removeEventListener('cut', copiar); document.removeEventListener('paste', copiar); document.removeEventListener('contextmenu', menuCtx); window.removeEventListener('pagehide', cierre); document.removeEventListener('pointerdown', toque, true); } };
  }

  // ---------- arranque ----------
  document.title = 'Práctica · ' + B.nombre;
  $('#curso').innerHTML = `${esc(B.nombre)}<small>${esc(B.anio)} · ${DOCENTE}</small>`;
  window.__test = { banco: B };
  cabecera();
  if (!yo) ingreso(); else {
    const pend = B.actividades.find((a) => leer(claveTP(a), null) && !hecho(a));
    if (pend && estadoAct(pend) !== 'antes') reglas(pend); else menu();
  }
})();
