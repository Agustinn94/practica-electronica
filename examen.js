// Núcleo compartido por la página del alumno, la del docente, el video y el apunte:
// números al azar por alumno, armado del examen, corrección y resolución paso a paso (fórmulas en LaTeX con KaTeX).
(function () {
  'use strict';
  const T = String.raw;

  // ---------- azar reproducible: el mismo alumno siempre recibe los mismos números ----------
  function hash(s) { let h = 1779033703 ^ s.length; for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; } return () => { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); return (h ^= h >>> 16) >>> 0; }; }
  function rng(semilla) {
    let a = hash(String(semilla))();
    const next = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    return { next, pick: (arr) => arr[Math.floor(next() * arr.length)], mezclar: (arr) => { const b = arr.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; } };
  }

  // ---------- números con coma, en texto y en LaTeX ----------
  const NF = {};
  function f(x, d) {
    const k = d === undefined ? 'a' : 'd' + d;
    NF[k] = NF[k] || new Intl.NumberFormat('es-AR', d === undefined ? { maximumFractionDigits: 4 } : { minimumFractionDigits: d, maximumFractionDigits: d });
    return NF[k].format(x);
  }
  const dAuto = (x) => { const v = Math.abs(x); return v >= 100 ? 0 : v >= 10 ? 1 : v >= 1 ? 2 : v >= 0.1 ? 3 : 4; };
  const N = (x, d) => { const [e, dec] = f(x, d).split(','); return e.replace(/\./g, '\\,') + (dec !== undefined ? '{,}' + dec : ''); };     // 1.000,5 -> 1\,000{,}5
  const U = { 'V': T`\,\mathrm{V}`, 'mV': T`\,\mathrm{mV}`, 'A': T`\,\mathrm{A}`, 'mA': T`\,\mathrm{mA}`, 'µA': T`\,\mu\mathrm{A}`, 'W': T`\,\mathrm{W}`, 'mW': T`\,\mathrm{mW}`,
    'Ω': T`\,\Omega`, 'kΩ': T`\,\mathrm{k}\Omega`, 'MΩ': T`\,\mathrm{M}\Omega`, 'Hz': T`\,\mathrm{Hz}`, 'kHz': T`\,\mathrm{kHz}`, 'MHz': T`\,\mathrm{MHz}`, 'ms': T`\,\mathrm{ms}`,
    'dB': T`\,\mathrm{dB}`, '%': T`\,\%`, '°': T`^\circ`, 'veces': T`\ \text{veces}`, 'celdas': T`\ \text{celdas}`, '': '' };
  const q = (x, u, d) => N(x, d) + (U[u] !== undefined ? U[u] : T`\,\mathrm{${u}}`);      // cantidad con unidad, en LaTeX
  const qt = (x, u, d) => f(x, d) + (u ? (u === '°' ? '°' : ' ' + u) : '');                     // lo mismo en texto (para los dibujos)
  const H = { T, N, q, qt, f, dAuto, U, fig: (n, v) => (window.FIG && window.FIG[n] ? window.FIG[n](v) : '') };

  // ---------- armado ----------
  function armar(def, r) {
    const p = def.gen(r, H); p.id = def.id; p.tema = def.tema; p.tipo = def.tipo;
    p.et = p.et || def.et || (p.tipo === 'num' ? 'CUENTA' : 'COMPRENSIÓN');
    if (!p.fig && def.fig) p.fig = def.fig(H);
    if (p.tipo === 'opc') { const ord = r.mezclar(p.opciones.map((_, i) => i)); p.opciones = ord.map((i) => p.opciones[i]); p.ok = ord.indexOf(p.ok); }
    return p;
  }
  const normal = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  function semillaExamen(B, act, alumno) { return [B.curso, act.id, alumno.lista].join('|'); }
  // examen de un alumno: siempre el mismo para el mismo nombre y número de lista
  function armarExamen(B, act, alumno, semilla) {
    const r = rng(semilla || semillaExamen(B, act, alumno));
    const pool = B.preguntas.filter((p) => !act.temas || act.temas.includes(p.tema));
    const elegir = (tipo, n) => {
      const porTema = {}; r.mezclar(pool.filter((p) => p.tipo === tipo)).forEach((p) => (porTema[p.tema] = porTema[p.tema] || []).push(p));
      const temas = r.mezclar(Object.keys(porTema)), out = [];
      while (out.length < n && temas.some((t) => porTema[t].length)) temas.forEach((t) => { if (out.length < n && porTema[t].length) out.push(porTema[t].shift()); });
      return out;
    };
    let opc;
    if (!act.simulacro) opc = elegir('opc', act.opc);
    else {   // como el examen: una sencilla, una de comprensión, una genuina o de caso real, y el resto de temas distintos
      const ops = r.mezclar(pool.filter((p) => p.tipo === 'opc')); opc = [];
      [['SENCILLA'], ['COMPRENSIÓN'], ['GENUINA', 'CASO REAL']].forEach((ts) => { const d = ops.find((p) => !opc.includes(p) && ts.includes(p.et || 'COMPRENSIÓN')); if (d) opc.push(d); });
      elegir('opc', ops.length).forEach((d) => { if (opc.length < act.opc && !opc.includes(d) && !opc.some((o) => o.tema === d.tema)) opc.push(d); });
      ops.forEach((d) => { if (opc.length < act.opc && !opc.includes(d)) opc.push(d); });
      opc = opc.slice(0, act.opc);
    }
    return [...opc, ...elegir('num', act.num)].map((d) => armar(d, r));
  }

  // ---------- corrección ----------
  function leerNumero(s) {
    s = String(s || '').trim().replace(/\s+/g, '').replace(/[^\d,.\-]/g, '');
    if (!s) return NaN;
    if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
    else if (/^-?[1-9]\d{0,2}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    return parseFloat(s);
  }
  const TOL = 0.05;
  function correcta(p, valor) {
    if (p.tipo === 'opc') return valor === p.ok;
    const v = leerNumero(valor); if (!isFinite(v)) return false;
    const tol = p.tol !== undefined ? p.tol : TOL;
    return Math.abs(v - p.valor) <= Math.max(Math.abs(p.valor) * tol, p.tolAbs || 1e-9);
  }
  const resultadoTeX = (p) => q(p.valor, p.unidad || '', p.dec !== undefined ? p.dec : dAuto(p.valor));
  const respuestaHTML = (p) => p.tipo === 'opc' ? p.opciones[p.ok] : `$${resultadoTeX(p)}$`;

  // ---------- resolución paso a paso ----------
  function resolucionHTML(p) {
    if (p.tipo === 'opc') return `<div class="resol"><div class="paso-r"><span class="pn">✔</span><div><b>Respuesta correcta:</b> ${p.opciones[p.ok]}</div></div>
      <div class="paso-r"><span class="pn">?</span><div><b>Por qué:</b> ${p.explic || ''}</div></div></div>`;
    const pasos = [];
    if (p.datos && p.datos.length) pasos.push(['Datos', p.datos.map((d) => `$${d}$`).join('<span class="sep"> · </span>')]);
    if (p.pide) pasos.push(['Qué piden', p.pide]);
    if (p.formula) pasos.push(['Fórmula', `<div class="fx-caja">$$${p.formula}$$</div>${p.porque ? `<div class="porque">${p.porque}</div>` : ''}`]);
    (p.cuentas || []).forEach((c) => pasos.push([c[0], c[1].map((x) => `$$${x}$$`).join('')]));
    pasos.push(['Resultado', `<div class="res-caja">$$${p.resultado || resultadoTeX(p)}$$</div>${p.cierre ? `<div class="porque">${p.cierre}</div>` : ''}`]);
    return `<div class="resol">${pasos.map(([t, c], k) => `<div class="paso-r"><span class="pn">${k + 1}</span><div><b>${t}</b>${c.startsWith('<div') ? '' : ' '}${c}</div></div>`).join('')}</div>`;
  }
  const pistaHTML = (p) => p.tipo === 'opc' ? (p.pista || 'Volvé a leer la consigna y mirá el dibujo.') :
    `<div>${p.porque || 'Mirá qué datos tenés y buscá la fórmula que los une.'}</div>${p.formula ? `<div class="fx-caja">$$${p.formula}$$</div>` : ''}`;

  // ---------- LaTeX ----------
  function mate(el) {
    if (!el || !window.renderMathInElement) return;
    try { window.renderMathInElement(el, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }], throwOnError: false, strict: 'ignore' }); } catch (e) {}
  }

  window.EX = { T, H, N, q, qt, f, dAuto, rng, hash, normal, armar, armarExamen, semillaExamen, leerNumero, correcta, TOL, resultadoTeX, respuestaHTML, resolucionHTML, pistaHTML, mate };
  window.BANCOS = window.BANCOS || {};
})();
