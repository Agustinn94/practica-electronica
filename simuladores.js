// Simuladores del repaso: se mueve una barrita y se ve qué pasa. Cada uno usa las mismas fórmulas del apunte.
(function () {
  'use strict';
  const fmt = (x, d) => new Intl.NumberFormat('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(x);
  const rango = (id, txt, min, max, paso, val) => `<label class="sim-r"><span>${txt}: <b id="${id}-v"></b></span><input type="range" id="${id}" min="${min}" max="${max}" step="${paso}" value="${val}"></label>`;
  const lampara = (id) => `<svg viewBox="0 0 80 90" class="sim-lamp"><defs><radialGradient id="${id}-g"><stop offset="0" stop-color="#fff6b0"/><stop offset="1" stop-color="#ffb020" stop-opacity="0"/></radialGradient></defs>
    <circle id="${id}-halo" cx="40" cy="36" r="36" fill="url(#${id}-g)" opacity="0"/><circle cx="40" cy="36" r="20" fill="#fffbe6" stroke="#333" stroke-width="2"/><path id="${id}-fil" d="M30 40 q5 -14 10 0 q5 14 10 0" fill="none" stroke="#777" stroke-width="2.4"/>
    <rect x="31" y="56" width="18" height="16" rx="3" fill="#9aa3ad" stroke="#333" stroke-width="2"/></svg>`;
  const prender = (id, k) => { k = Math.max(0, Math.min(1, k)); const h = document.getElementById(id + '-halo'), fl = document.getElementById(id + '-fil'); if (h) h.setAttribute('opacity', (0.15 + 0.85 * k) * (k > 0.01)); if (fl) fl.setAttribute('stroke', k > 0.01 ? `rgb(255,${Math.round(150 + 80 * k)},40)` : '#777'); };
  const led = (id, color) => `<svg viewBox="0 0 80 90" class="sim-lamp"><defs><radialGradient id="${id}-g"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs>
    <circle id="${id}-halo" cx="40" cy="34" r="36" fill="url(#${id}-g)" opacity="0"/><path d="M26 54 V30 a14 14 0 0 1 28 0 V54 Z" id="${id}-cap" fill="${color}" fill-opacity=".35" stroke="#333" stroke-width="2"/><rect x="22" y="54" width="36" height="6" fill="#ccc" stroke="#333" stroke-width="2"/>
    <line x1="32" y1="60" x2="32" y2="88" stroke="#888" stroke-width="3"/><line x1="48" y1="60" x2="48" y2="82" stroke="#888" stroke-width="3"/></svg>`;
  const prenderLed = (id, k) => { k = Math.max(0, Math.min(1, k)); const h = document.getElementById(id + '-halo'), c = document.getElementById(id + '-cap'); if (h) h.setAttribute('opacity', k); if (c) c.setAttribute('fill-opacity', 0.3 + 0.7 * k); };
  const caja = (titulo, cuerpo) => `<div class="sim"><div class="sim-t">🎛️ Probalo: ${titulo}</div>${cuerpo}</div>`;
  const $ = (id) => document.getElementById(id);
  const al = (ids, fn) => { ids.forEach((i) => { $(i).oninput = fn; }); fn(); };
  const lienzo = (id, h) => `<canvas id="${id}" class="sim-c" width="600" height="${h || 220}"></canvas>`;

  const S = {};

  // ------------------------------------------------------------------ Electrónica 2
  S['MOSFET'] = { html: (p) => caja('el MOSFET como llave', `<div class="sim-g"><div>${rango(p + 'v', 'Tensión de puerta V<sub>GS</sub>', 0, 10, 0.1, 1)}
      <div class="sim-dato">Umbral V<sub>TH</sub> = 2 V · V<sub>DD</sub> = 12 V · lámpara de 24 Ω · R<sub>DS(on)</sub> = 0,05 Ω</div><div class="sim-res" id="${p}r"></div></div>${lampara(p + 'l')}</div>`),
    init: (p) => al([p + 'v'], () => { const v = +$(p + 'v').value, on = v > 2; $(p + 'v-v').textContent = fmt(v, 1) + ' V';
      const i = on ? 12 / (24 + 0.05) : 0; prender(p + 'l', on ? 1 : 0);
      $(p + 'r').innerHTML = on ? `<b class="ok">Conduce</b>: V<sub>GS</sub> supera los 2 V. Pasa I<sub>D</sub> = ${fmt(i, 2)} A y el MOSFET calienta P = I² · R<sub>DS(on)</sub> = ${fmt(i * i * 0.05, 3)} W, casi nada.` : `<b class="no">No conduce</b>: V<sub>GS</sub> no llega al umbral. No hay canal, I<sub>D</sub> = 0.`; }) };

  S['Realimentación'] = { html: (p) => caja('la realimentación negativa', `${rango(p + 'a', 'Ganancia sin realimentar A', 2, 4, 0.01, 3)}${rango(p + 'b', 'β (lo que vuelve)', 0.001, 0.1, 0.001, 0.02)}<div class="sim-res" id="${p}r"></div>`),
    init: (p) => al([p + 'a', p + 'b'], () => { const A = Math.round(Math.pow(10, +$(p + 'a').value)), b = +$(p + 'b').value, D = 1 + b * A, af = A / D;
      $(p + 'a-v').textContent = fmt(A, 0); $(p + 'b-v').textContent = fmt(b, 3);
      $(p + 'r').innerHTML = `D = 1 + β · A = <b>${fmt(D, 2)}</b> · A<sub>f</sub> = A / D = <b>${fmt(af, 2)}</b> · 1/β = ${fmt(1 / b, 1)}<br>${b * A > 10 ? '<span class="ok">βA es mucho mayor que 1: A<sub>f</sub> casi no depende de A. Probá cambiar A: A<sub>f</sub> casi no se mueve.</span>' : '<span class="no">βA no es tan grande: A<sub>f</sub> todavía depende bastante de A.</span>'}`; }) };

  S['Topologías'] = { html: (p) => caja('las cuatro topologías', `<div class="sim-bot"><b>¿Qué mide a la salida?</b> <button data-m="tensión" class="on">tensión</button><button data-m="corriente">corriente</button></div>
      <div class="sim-bot"><b>¿Cómo vuelve a la entrada?</b> <button data-v="en serie" class="on">en serie</button><button data-v="en paralelo">en paralelo</button></div><div class="sim-res" id="${p}r"></div>`),
    init: (p) => { const box = $(p + 'r').closest('.sim'); let m = 'tensión', v = 'en serie';
      const pintar = () => { box.querySelectorAll('[data-m]').forEach((b) => b.classList.toggle('on', b.dataset.m === m)); box.querySelectorAll('[data-v]').forEach((b) => b.classList.toggle('on', b.dataset.v === v));
        const ri = v === 'en serie' ? 'sube (× D)' : 'baja (÷ D)', ro = m === 'tensión' ? 'baja (÷ D)' : 'sube (× D)';
        $(p + 'r').innerHTML = `Realimentación de <b>${m} ${v}</b>: R<sub>i</sub> <b>${ri}</b> y R<sub>o</sub> <b>${ro}</b>.${m === 'tensión' && v === 'en serie' ? ' Es la del operacional no inversor.' : ''}`; };
      box.querySelectorAll('[data-m]').forEach((b) => b.onclick = () => { m = b.dataset.m; pintar(); }); box.querySelectorAll('[data-v]').forEach((b) => b.onclick = () => { v = b.dataset.v; pintar(); }); pintar(); } };

  S['Ancho de banda'] = { html: (p) => caja('el ancho de banda', `${rango(p + 'b', 'β', 0, 0.02, 0.0005, 0.004)}${lienzo(p + 'c', 230)}<div class="sim-res" id="${p}r"></div>`),
    init: (p) => al([p + 'b'], () => { const A = 1000, fl = 100, fh = 10000, b = +$(p + 'b').value, D = 1 + b * A, af = A / D, flf = fl / D, fhf = fh * D;
      $(p + 'b-v').textContent = fmt(b, 4);
      const c = $(p + 'c'), g = c.getContext('2d'), W = c.width, H = c.height; g.clearRect(0, 0, W, H);
      const X = (f) => 30 + (Math.log10(f) - 0) / 7 * (W - 40), Y = (a) => H - 30 - a / A * (H - 50);
      const curva = (G, l, h, col) => { g.beginPath(); for (let i = 0; i <= 300; i++) { const f = Math.pow(10, i / 300 * 7); const a = G / Math.sqrt((1 + (l / f) ** 2) * (1 + (f / h) ** 2)); i ? g.lineTo(X(f), Y(a)) : g.moveTo(X(f), Y(a)); } g.strokeStyle = col; g.lineWidth = 3; g.stroke(); };
      g.strokeStyle = '#999'; g.lineWidth = 1; g.beginPath(); g.moveTo(30, 10); g.lineTo(30, H - 30); g.lineTo(W - 5, H - 30); g.stroke();
      g.fillStyle = '#555'; g.font = '14px sans-serif'; g.fillText('ganancia', 34, 18); g.fillText('frecuencia (log)', W - 120, H - 10);
      curva(A, fl, fh, '#1f4e9b'); curva(af, flf, fhf, '#c0392b');
      g.fillStyle = '#1f4e9b'; g.fillText('sin realimentar', X(fl * 3), Y(A) - 4); g.fillStyle = '#c0392b'; g.fillText('realimentado', X(flf * 3), Math.max(Y(af) - 6, 30));
      $(p + 'r').innerHTML = `A = 1000, f<sub>L</sub> = 100 Hz, f<sub>H</sub> = 10 kHz · D = <b>${fmt(D, 1)}</b> · A<sub>f</sub> = <b>${fmt(af, 0)}</b> · f<sub>Lf</sub> = <b>${fmt(flf, 1)} Hz</b> · f<sub>Hf</sub> = <b>${fmt(fhf / 1000, 1)} kHz</b><br>Control: A · f<sub>H</sub> = ${fmt(A * fh / 1e6, 1)} MHz y A<sub>f</sub> · f<sub>Hf</sub> = ${fmt(af * fhf / 1e6, 1)} MHz: el producto no cambia.`; }) };

  S['Operacional'] = { html: (p) => caja('el operacional no inversor', `${rango(p + '1', 'R<sub>1</sub>', 1, 47, 1, 10)}${rango(p + 'f', 'R<sub>f</sub>', 1, 220, 1, 90)}<div class="sim-res" id="${p}r"></div>`),
    init: (p) => al([p + '1', p + 'f'], () => { const r1 = +$(p + '1').value, rf = +$(p + 'f').value, b = r1 / (r1 + rf), af = 1 + rf / r1;
      $(p + '1-v').textContent = r1 + ' kΩ'; $(p + 'f-v').textContent = rf + ' kΩ';
      $(p + 'r').innerHTML = `β = R<sub>1</sub> / (R<sub>1</sub> + R<sub>f</sub>) = <b>${fmt(b, 4)}</b> · A<sub>f</sub> = 1 + R<sub>f</sub> / R<sub>1</sub> = <b>${fmt(af, 2)}</b> · 1/β = ${fmt(1 / b, 2)}. Si entran 0,1 V, salen <b>${fmt(0.1 * af, 2)} V</b>.`; }) };

  S['TRIAC'] = { html: (p) => caja('el dimmer con TRIAC', `<div class="sim-g"><div>${rango(p + 'a', 'Ángulo de disparo α', 0, 180, 1, 60)}<div class="sim-res" id="${p}r"></div></div>${lampara(p + 'l')}</div>${lienzo(p + 'c', 200)}`),
    init: (p) => al([p + 'a'], () => { const a = +$(p + 'a').value, ar = a * Math.PI / 180, frac = 1 - ar / Math.PI + Math.sin(2 * ar) / (2 * Math.PI), t = a / 180 * 10;
      $(p + 'a-v').textContent = a + '°'; prender(p + 'l', frac);
      const c = $(p + 'c'), g = c.getContext('2d'), W = c.width, H = c.height, Y0 = H / 2; g.clearRect(0, 0, W, H);
      const X = (ms) => 20 + ms / 20 * (W - 40), Y = (v) => Y0 - v * (H / 2 - 24);
      g.strokeStyle = '#999'; g.lineWidth = 1; g.beginPath(); g.moveTo(20, Y0); g.lineTo(W - 20, Y0); g.stroke();
      g.beginPath(); for (let i = 0; i <= 400; i++) { const ms = i / 400 * 20; const v = Math.sin(2 * Math.PI * ms / 20); i ? g.lineTo(X(ms), Y(v)) : g.moveTo(X(ms), Y(v)); } g.setLineDash([6, 5]); g.strokeStyle = '#888'; g.lineWidth = 1.5; g.stroke(); g.setLineDash([]);
      [0, 10].forEach((t0) => { g.beginPath(); g.moveTo(X(t0 + t), Y0); for (let i = 0; i <= 200; i++) { const ms = t0 + t + i / 200 * (10 - t); g.lineTo(X(ms), Y(Math.sin(2 * Math.PI * ms / 20))); } g.lineTo(X(t0 + 10), Y0); g.closePath(); g.fillStyle = 'rgba(245,176,65,.75)'; g.fill(); g.strokeStyle = '#c0392b'; g.lineWidth = 2.5; g.stroke(); });
      g.fillStyle = '#555'; g.font = '14px sans-serif'; g.fillText('0', X(0) - 4, Y0 + 18); g.fillText('10 ms', X(10) - 18, Y0 + 18); g.fillText('20 ms', X(20) - 40, Y0 + 18);
      $(p + 'r').innerHTML = `Se dispara <b>${fmt(t, 2)} ms</b> después del cruce por cero (t = α / 180° · 10 ms). A la lámpara le llega el <b>${fmt(frac * 100, 0)} %</b> de la potencia.`; }) };

  // ------------------------------------------------------------------ Electrónica 1
  const COL = { rojo: [1.9, '#ff3030'], ámbar: [2.1, '#ffaa00'], verde: [3.2, '#22dd55'], azul: [3.2, '#3388ff'], blanco: [3.2, '#ffffff'] };
  S['LED'] = { html: (p) => caja('el LED y su resistencia', `<div class="sim-g"><div><div class="sim-bot"><b>Color:</b> ${Object.keys(COL).map((c, i) => `<button data-c="${c}" class="${i ? '' : 'on'}">${c}</button>`).join('')}</div>
      ${rango(p + 's', 'Fuente V<sub>S</sub>', 3, 12, 0.5, 9)}${rango(p + 'r', 'Resistencia R<sub>S</sub>', 0, 1000, 10, 470)}<div class="sim-res" id="${p}x"></div></div><div id="${p}led"></div></div>`),
    init: (p) => { const box = $(p + 'x').closest('.sim'); let c = 'rojo';
      const calc = () => { const [vf, col] = COL[c], vs = +$(p + 's').value, R = +$(p + 'r').value; $(p + 's-v').textContent = fmt(vs, 1) + ' V'; $(p + 'r-v').textContent = R + ' Ω';
        $(p + 'led').innerHTML = led(p + 'L', col); box.querySelectorAll('[data-c]').forEach((b) => b.classList.toggle('on', b.dataset.c === c));
        if (vs <= vf) { prenderLed(p + 'L', 0); $(p + 'x').innerHTML = `<b class="no">No prende</b>: la fuente (${fmt(vs, 1)} V) no supera la V<sub>F</sub> del LED ${c} (${fmt(vf, 1)} V).`; return; }
        if (R < 20) { prenderLed(p + 'L', 1); $(p + 'x').innerHTML = '<b class="no">¡Se quema!</b> Sin resistencia la corriente no tiene límite.'; return; }
        const i = (vs - vf) / R * 1000; prenderLed(p + 'L', Math.min(1, i / 20));
        $(p + 'x').innerHTML = `I = (V<sub>S</sub> − V<sub>F</sub>) / R<sub>S</sub> = (${fmt(vs, 1)} − ${fmt(vf, 1)}) / ${R} = <b>${fmt(i, 1)} mA</b> · ${i > 30 ? '<b class="no">demasiada corriente: se quema</b>' : i < 2 ? 'muy poca: casi no se ve' : '<span class="ok">bien, entre 2 y 30 mA</span>'}. La resistencia gasta ${fmt((vs - vf) * i, 0)} mW y el LED ${fmt(vf * i, 0)} mW.`; };
      box.querySelectorAll('[data-c]').forEach((b) => b.onclick = () => { c = b.dataset.c; calc(); }); al([p + 's', p + 'r'], calc); } };

  S['Fotodiodo'] = { html: (p) => caja('el fotodiodo', `${rango(p + 'l', 'Luz', 0, 100, 1, 40)}<div class="sim-dato">Fotodiodo en inversa con R = 100 kΩ. Con luz plena da 50 µA.</div><div class="sim-res" id="${p}r"></div>`),
    init: (p) => al([p + 'l'], () => { const l = +$(p + 'l').value, i = 50 * l / 100, v = i * 100 / 1000; $(p + 'l-v').textContent = l + ' %';
      $(p + 'r').innerHTML = `Corriente: <b>${fmt(i, 1)} µA</b> · tensión en la resistencia: V = I · R = <b>${fmt(v, 2)} V</b>. Más luz, más corriente y más tensión.`; }) };

  S['Fototransistor'] = { html: (p) => caja('el fototransistor', `${rango(p + 'l', 'Luz', 0, 100, 1, 50)}<div class="sim-dato">V<sub>CC</sub> = 5 V, R = 2,2 kΩ arriba. Con luz plena pasan 2 mA.</div><div class="sim-res" id="${p}r"></div>`),
    init: (p) => al([p + 'l'], () => { const l = +$(p + 'l').value, i = 2 * l / 100, vs = Math.max(0.2, 5 - i * 2.2); $(p + 'l-v').textContent = l + ' %';
      $(p + 'r').innerHTML = `Corriente: <b>${fmt(i, 2)} mA</b> · V<sub>sal</sub> = V<sub>CC</sub> − I · R = <b>${fmt(vs, 2)} V</b>. ${l < 3 ? 'A oscuras la salida queda en V<sub>CC</sub>.' : 'Con luz conduce y la salida baja.'}`; }) };

  S['Optoacoplador'] = { html: (p) => caja('el optoacoplador', `<div class="sim-g"><div><div class="sim-bot"><b>Entrada (lado del Arduino):</b> <button data-o="0" class="on">apagada</button><button data-o="1">prendida</button></div><div class="sim-res" id="${p}r"></div></div><div id="${p}led"></div></div>`),
    init: (p) => { const box = $(p + 'r').closest('.sim'); const pintar = (on) => { box.querySelectorAll('[data-o]').forEach((b) => b.classList.toggle('on', +b.dataset.o === on)); $(p + 'led').innerHTML = led(p + 'L', '#ff4040'); prenderLed(p + 'L', on ? 0.9 : 0);
      $(p + 'r').innerHTML = on ? 'El LED de adentro (infrarrojo) prende, su luz llega al fototransistor y este <b>conduce</b>: el otro circuito recibe la señal. Los dos lados <b>no se tocan</b>.' : 'El LED está apagado: el fototransistor <b>no conduce</b>. Los dos circuitos siguen aislados.'; };
      box.querySelectorAll('[data-o]').forEach((b) => b.onclick = () => pintar(+b.dataset.o)); pintar(0); } };

  S['LDR'] = { html: (p) => caja('la luz de jardín con LDR', `<div class="sim-g"><div>${rango(p + 'l', 'Luz del día', 0, 100, 1, 70)}${rango(p + 'p', 'Pote de arriba R<sub>P</sub>', 1, 50, 1, 10)}<div class="sim-dato">V<sub>CC</sub> = 5 V, LDR abajo. El transistor prende la lámpara si V<sub>X</sub> pasa 0,7 V.</div><div class="sim-res" id="${p}r"></div></div>${lampara(p + 'b')}</div>`),
    init: (p) => al([p + 'l', p + 'p'], () => { const l = +$(p + 'l').value, rp = +$(p + 'p').value, rl = Math.pow(10, 2 - 3 * l / 100) * 1, vx = 5 * rl / (rp + rl);   // de 100 kΩ (oscuro) a 0,1 kΩ (luz)
      $(p + 'l-v').textContent = l + ' %'; $(p + 'p-v').textContent = rp + ' kΩ'; prender(p + 'b', vx > 0.7 ? 1 : 0);
      $(p + 'r').innerHTML = `LDR = <b>${rl >= 1 ? fmt(rl, 1) + ' kΩ' : fmt(rl * 1000, 0) + ' Ω'}</b> · V<sub>X</sub> = 5 · R<sub>LDR</sub> / (R<sub>P</sub> + R<sub>LDR</sub>) = <b>${fmt(vx, 2)} V</b> → ${vx > 0.7 ? '<b class="ok">la lámpara prende</b>' : 'la lámpara queda apagada'}. Probá bajar los kΩ del pote: prende con más luz.`; }) };

  S['Panel solar'] = { html: (p) => caja('el panel solar', `${rango(p + 'n', 'Celdas en serie', 1, 24, 1, 6)}${rango(p + 'c', 'Tensión de cada celda', 0.4, 0.6, 0.05, 0.5)}<div class="sim-res" id="${p}r"></div><div id="${p}d" class="sim-celdas"></div>`),
    init: (p) => al([p + 'n', p + 'c'], () => { const n = +$(p + 'n').value, vc = +$(p + 'c').value; $(p + 'n-v').textContent = n; $(p + 'c-v').textContent = fmt(vc, 2) + ' V';
      $(p + 'd').innerHTML = Array.from({ length: n }, () => '<i></i>').join('');
      $(p + 'r').innerHTML = `V<sub>panel</sub> = n · V<sub>celda</sub> = ${n} · ${fmt(vc, 2)} = <b>${fmt(n * vc, 2)} V</b>. ${n * vc >= 5 ? 'Alcanza para cargar un celular (5 V).' : 'Todavía no llega a los 5 V de un cargador.'}`; }) };

  S['Transistor'] = { html: (p) => caja('el transistor como llave', `<div class="sim-g"><div>${rango(p + 'x', 'Tensión en la base V<sub>X</sub>', 0, 5, 0.05, 1.5)}<div class="sim-dato">R<sub>B</sub> = 22 kΩ · β = 100 · V<sub>CC</sub> = 5 V · R<sub>C</sub> = 220 Ω · LED rojo</div><div class="sim-res" id="${p}r"></div></div><div id="${p}led"></div></div>`),
    init: (p) => al([p + 'x'], () => { const vx = +$(p + 'x').value, ib = Math.max(0, (vx - 0.7) / 22000) * 1e6, bib = 100 * ib / 1000, ics = (5 - 1.9 - 0.2) / 220 * 1000;
      $(p + 'x-v').textContent = fmt(vx, 2) + ' V'; $(p + 'led').innerHTML = led(p + 'L', '#ff3030');
      const est = vx <= 0.7 ? 'corte' : bib >= ics ? 'sat' : 'act', ic = est === 'corte' ? 0 : Math.min(bib, ics); prenderLed(p + 'L', ic / ics);
      $(p + 'r').innerHTML = `I<sub>B</sub> = <b>${fmt(ib, 0)} µA</b> · β · I<sub>B</sub> = ${fmt(bib, 1)} mA · I<sub>C(sat)</sub> = ${fmt(ics, 1)} mA → ${est === 'corte' ? '<b class="no">corte</b>: menos de 0,7 V en la base, llave abierta.' : est === 'sat' ? '<b class="ok">saturado</b>: llave cerrada, pasa I<sub>C(sat)</sub>.' : '<b>zona activa</b>: conduce pero no del todo, el LED da menos luz.'}`; }) };

  let n = 0;
  window.SIM = { tiene: (t) => !!S[t], html: (t) => { const p = 'sim' + (n++) + '_'; return { p, html: S[t].html(p) }; }, init: (t, p) => S[t].init(p) };
})();
