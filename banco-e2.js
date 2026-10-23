// Electrónica 2 · 5.° año · banco de preguntas del 3.er trimestre (realimentación negativa, MOSFET y TRIAC)
// Fórmulas y valores de los T.P. N° 6 y N° 7 y de la clase del 13/10 (Boylestad, 10.ª ed., caps. 14 y 17).
(function () {
  const P = [];
  const num = (o) => P.push(Object.assign({ tipo: 'num' }, o));
  const opc = (o) => P.push(Object.assign({ tipo: 'opc' }, o));
  const AB = (r) => r.pick([[400, 0.02], [1000, 0.009], [2000, 0.0045], [2000, 0.01], [2500, 0.004], [5000, 0.02], [10000, 0.01], [4000, 0.005]]);

  // ---------- Realimentación negativa ----------
  num({ id: 're_d', tema: 'Realimentación', gen(r, f) {
    const [A, b] = AB(r), D = 1 + b * A;
    return { fig: CIRC.bloques({ a: 'A = ' + f(A), b: 'β = ' + f(b) }), enun: `Un amplificador tiene <b>A = ${f(A)}</b> y se realimenta con <b>β = ${f(b)}</b>. ¿Cuánto vale el factor de realimentación D?`,
      unidad: '', valor: D, pista: 'D = 1 + β · A.', proc: `D = 1 + ${f(b)} · ${f(A)} = 1 + ${f(b * A, 2)} = <b>${f(D, 2)}</b>` };
  } });
  num({ id: 're_af', tema: 'Realimentación', gen(r, f) {
    const [A, b] = AB(r), D = 1 + b * A, Af = A / D;
    return { fig: CIRC.bloques({ a: 'A = ' + f(A), b: 'β = ' + f(b) }), enun: `<b>A = ${f(A)}</b> y <b>β = ${f(b)}</b>. ¿Cuánto vale la ganancia realimentada A<sub>f</sub>?`,
      unidad: '', valor: Af, pista: 'Primero D = 1 + β · A. Después A<sub>f</sub> = A / D.', proc: `D = ${f(D, 2)} · A<sub>f</sub> = ${f(A)} / ${f(D, 2)} = <b>${f(Af, 1)}</b>` };
  } });
  num({ id: 're_pct', tema: 'Realimentación', gen(r, f) {
    const [A, b] = AB(r), p = r.pick([10, 20, 50]), A2 = A * (1 - p / 100);
    const a1 = A / (1 + b * A), a2 = A2 / (1 + b * A2), pc = (a1 - a2) / a1 * 100;
    return { fig: CIRC.bloques({ a: 'A = ' + f(A), b: 'β = ' + f(b) }), enun: `<b>A = ${f(A)}</b>, <b>β = ${f(b)}</b>. Con el calor, A baja un <b>${p} %</b>. ¿Qué porcentaje baja A<sub>f</sub>?`,
      unidad: '%', valor: pc, tol: 0.08, tolAbs: 0.1, pista: 'Calculá A<sub>f</sub> antes y después. % = (viejo − nuevo) / viejo · 100.',
      proc: `Antes: A<sub>f</sub> = ${f(a1, 2)} · Después: A = ${f(A2)}, A<sub>f</sub> = ${f(a2, 2)} · % = (${f(a1, 2)} − ${f(a2, 2)}) / ${f(a1, 2)} · 100 = <b>${f(pc, 2)} %</b>` };
  } });
  num({ id: 're_fh', tema: 'Ancho de banda', gen(r, f) {
    const [A, b] = AB(r), D = 1 + b * A, fh = r.pick([8, 10, 20]);
    return { fig: CIRC.curvas({}), enun: `<b>A = ${f(A)}</b>, <b>β = ${f(b)}</b> y <b>f<sub>H</sub> = ${fh} kHz</b>. ¿Cuánto vale f<sub>Hf</sub>, en kHz?`,
      unidad: 'kHz', valor: fh * D, pista: 'f<sub>Hf</sub> = f<sub>H</sub> · D.', proc: `D = ${f(D, 2)} · f<sub>Hf</sub> = ${fh} kHz · ${f(D, 2)} = <b>${f(fh * D, 1)} kHz</b>` };
  } });
  num({ id: 're_fl', tema: 'Ancho de banda', gen(r, f) {
    const [A, b] = AB(r), D = 1 + b * A, fl = r.pick([50, 90, 100, 110, 200]);
    return { fig: CIRC.curvas({}), enun: `<b>A = ${f(A)}</b>, <b>β = ${f(b)}</b> y <b>f<sub>L</sub> = ${fl} Hz</b>. ¿Cuánto vale f<sub>Lf</sub>, en Hz?`,
      unidad: 'Hz', valor: fl / D, pista: 'f<sub>Lf</sub> = f<sub>L</sub> / D.', proc: `D = ${f(D, 2)} · f<sub>Lf</sub> = ${fl} / ${f(D, 2)} = <b>${f(fl / D, 2)} Hz</b>` };
  } });
  num({ id: 'op_af', tema: 'Operacional', gen(r, f) {
    const r1 = r.pick([1, 2.2, 4.7, 10]), rf = r.pick([10, 22, 47, 99, 100]);
    const af = 1 + rf / r1;
    return { et: 'CASO REAL', fig: CIRC.noInversor({ r1: f(r1) + ' kΩ', rf: f(rf) + ' kΩ' }), enun: `Operacional no inversor con <b>R<sub>1</sub> = ${f(r1)} kΩ</b> y <b>R<sub>f</sub> = ${f(rf)} kΩ</b>. ¿Cuánto vale la ganancia ideal A<sub>f</sub>?`,
      unidad: '', valor: af, pista: 'A<sub>f</sub> = 1 + R<sub>f</sub> / R<sub>1</sub>.', proc: `A<sub>f</sub> = 1 + ${f(rf)} / ${f(r1)} = <b>${f(af, 2)}</b>` };
  } });
  num({ id: 'op_b', tema: 'Operacional', gen(r, f) {
    const r1 = r.pick([1, 2.2, 4.7, 10]), rf = r.pick([22, 47, 99, 100]);
    const b = r1 / (r1 + rf);
    return { fig: CIRC.noInversor({ r1: f(r1) + ' kΩ', rf: f(rf) + ' kΩ' }), enun: `Operacional no inversor con <b>R<sub>1</sub> = ${f(r1)} kΩ</b> y <b>R<sub>f</sub> = ${f(rf)} kΩ</b>. ¿Cuánto vale β?`,
      unidad: '', valor: b, pista: 'β = R<sub>1</sub> / (R<sub>1</sub> + R<sub>f</sub>).', proc: `β = ${f(r1)} / (${f(r1)} + ${f(rf)}) = <b>${f(b, 4)}</b>` };
  } });
  num({ id: 'db', tema: 'Ancho de banda', gen(r, f) {
    const A = r.pick([10, 20, 100, 200, 1000]), db = 20 * Math.log10(A);
    return { fig: CIRC.curvas({}), enun: `Un amplificador tiene una ganancia de <b>${f(A)} veces</b>. ¿Cuánto es en decibeles?`,
      unidad: 'dB', valor: db, pista: 'A<sub>dB</sub> = 20 · log A. Por 10 son 20 dB.', proc: `A<sub>dB</sub> = 20 · log ${f(A)} = <b>${f(db, 1)} dB</b>` };
  } });
  opc({ id: 're_que', tema: 'Realimentación', gen() { return { et: 'SENCILLA', enun: 'Realimentación negativa quiere decir que…', opciones: ['una parte de la salida vuelve y se resta a la entrada', 'una parte de la salida vuelve y se suma a la entrada', 'la salida se desconecta de la entrada'], ok: 0,
    proc: 'Lo que vuelve se resta: si la salida crece de más, se corrige sola.' }; } });
  opc({ id: 're_1b', tema: 'Realimentación', gen() { return { enun: 'Si β · A es mucho mayor que 1, A<sub>f</sub> se parece a…', opciones: ['1/β', 'A', 'β · A'], ok: 0,
    proc: 'A<sub>f</sub> = A / (1 + βA) ≈ A / (βA) = 1/β: la ganancia la fijan dos resistencias.' }; } });
  opc({ id: 're_pierde', tema: 'Realimentación', gen() { return { et: 'SENCILLA', enun: 'Al realimentar negativamente, ¿qué se pierde?', opciones: ['ganancia', 'ancho de banda', 'estabilidad'], ok: 0,
    proc: 'Se pierde ganancia. Se gana estabilidad, menos distorsión y más ancho de banda.' }; } });
  opc({ id: 're_calor', tema: 'Realimentación', gen() { return { et: 'COMPRENSIÓN', enun: '¿Por qué A<sub>f</sub> casi no cambia cuando el transistor se calienta?', opciones: ['porque depende de β, que lo fijan dos resistencias', 'porque el transistor no cambia con el calor', 'porque A nunca cambia'], ok: 0,
    proc: 'A cambia mucho, pero A<sub>f</sub> ≈ 1/β, y β son dos resistencias que no cambian.' }; } });
  opc({ id: 're_pos', tema: 'Realimentación', gen() { return { enun: 'Si lo que vuelve se suma en lugar de restarse…', opciones: ['el circuito oscila, como el chiflido del micrófono', 'amplifica mejor y sin ruido', 'la salida se apaga'], ok: 0,
    proc: 'Es realimentación positiva: crece sin control y el circuito oscila.' }; } });
  opc({ id: 'bw_curva', tema: 'Ancho de banda', gen() { return { enun: 'Al realimentar, la curva de ganancia queda…', opciones: ['más baja y más ancha', 'más alta y más angosta', 'igual'], ok: 0,
    proc: 'La ganancia se divide por D y el ancho de banda se multiplica por D: como plastilina.' }; } });
  opc({ id: 'bw_fh', tema: 'Ancho de banda', gen() { return { enun: 'Al realimentar, la frecuencia de corte superior f<sub>H</sub>…', opciones: ['se multiplica por D', 'se divide por D', 'no cambia'], ok: 0,
    proc: 'f<sub>Hf</sub> = f<sub>H</sub> · D y f<sub>Lf</sub> = f<sub>L</sub> / D.' }; } });
  opc({ id: 're_lazo', tema: 'Realimentación', gen() { return { et: 'SENCILLA', enun: '¿Cómo se llama el producto A · β?', opciones: ['ganancia de lazo', 'ancho de banda', 'factor de ruido'], ok: 0,
    proc: 'A · β es la ganancia de lazo; D = 1 + A · β.' }; } });

  // ---------- MOSFET ----------
  opc({ id: 'mos_th', tema: 'MOSFET', gen(r, f) {
    const vth = r.pick([1, 2, 3]), vgs = r.pick([0.5, 1.5, 2.5, 4, 5]);
    const c = vgs > vth;
    return { fig: CIRC.mosfet({ vgs: 'V<tspan font-size="9">GS</tspan> = ' + f(vgs, 1) + ' V' }), enun: `Un MOSFET canal N tiene <b>V<sub>TH</sub> = ${f(vth)} V</b> y le ponés <b>V<sub>GS</sub> = ${f(vgs, 1)} V</b>. ¿Conduce?`, opciones: ['Sí, conduce', 'No conduce'], ok: c ? 0 : 1,
      proc: c ? 'V<sub>GS</sub> supera V<sub>TH</sub>: el canal se forma y conduce.' : 'V<sub>GS</sub> no llega a V<sub>TH</sub>: no hay canal, no conduce.' };
  } });
  opc({ id: 'mos_ctrl', tema: 'MOSFET', gen() { return { et: 'SENCILLA', enun: 'El MOSFET se controla con…', opciones: ['la tensión en la compuerta, que casi no consume corriente', 'la corriente de base, como el BJT', 'la luz'], ok: 0,
    proc: 'La compuerta está aislada: se maneja con tensión y casi no toma corriente.' }; } });
  num({ id: 'mos_p', tema: 'MOSFET', gen(r, f) {
    const i = r.pick([2, 3, 5, 10]), v = r.pick([0.04, 0.05, 0.1, 0.2]);
    return { et: 'CASO REAL', fig: CIRC.mosfet({ i: i + ' A' }), enun: `Una llave maneja un motor de <b>${i} A</b> y le quedan <b>${f(v, 2)} V</b> encima. ¿Cuánto calienta, en W?`,
      unidad: 'W', valor: v * i, pista: 'P = V · I.', proc: `P = ${f(v, 2)} V · ${i} A = <b>${f(v * i, 2)} W</b>` };
  } });

  // ---------- TRIAC ----------
  num({ id: 'tri_t', tema: 'TRIAC', gen(r, f) {
    const a = r.pick([30, 45, 60, 90, 120, 135, 150]), t = a / 180 * 10;
    return { et: 'CASO REAL', fig: CIRC.alfa({ alfa: a }), enun: `En la red de 50 Hz, un dimmer dispara el TRIAC con <b>α = ${a}°</b>. ¿Cuántos ms después del cruce por cero se dispara?`,
      unidad: 'ms', valor: t, pista: 'Un semiciclo dura 10 ms y equivale a 180°: t = α / 180° · 10 ms.', proc: `t = ${a} / 180 · 10 ms = <b>${f(t, 2)} ms</b>` };
  } });
  opc({ id: 'tri_conduce', tema: 'TRIAC', gen() { return { fig: CIRC.triac(), enun: 'El TRIAC conduce…', opciones: ['en los dos sentidos, después de un pulso en G', 'en un solo sentido, siempre', 'en los dos sentidos, sin necesidad de pulso'], ok: 0,
    proc: 'Es como dos SCR al revés: un pulso en G lo dispara en cada semiciclo.' }; } });
  opc({ id: 'tri_apaga', tema: 'TRIAC', gen() { return { fig: CIRC.triac(), enun: 'El TRIAC se apaga…', opciones: ['solo, en cada cruce por cero, cuando la corriente baja de I<sub>H</sub>', 'cuando le sacás el pulso de G', 'nunca: hay que desenchufarlo'], ok: 0,
    proc: 'En cada cruce por cero la corriente baja de la de mantenimiento y se apaga: hay que volver a dispararlo.' }; } });
  opc({ id: 'tri_alfa', tema: 'TRIAC', gen() { return { fig: CIRC.alfa({ alfa: 120 }), enun: 'En un dimmer, si el disparo llega más tarde (α más grande)…', opciones: ['la lámpara recibe menos potencia y brilla menos', 'brilla más', 'no cambia nada'], ok: 0,
    proc: 'Solo llega a la lámpara el final de cada semiciclo: menos potencia.' }; } });
  opc({ id: 'tri_90', tema: 'TRIAC', gen() { return { fig: CIRC.alfa({ alfa: 90 }), enun: 'Con α = 90°, a la lámpara le llega…', opciones: ['la mitad de la potencia', 'toda la potencia', 'nada'], ok: 0,
    proc: 'Se dispara justo en la mitad de cada semiciclo: llega la mitad.' }; } });
  opc({ id: 'tri_diac', tema: 'TRIAC', gen() { return { fig: CIRC.dimmer(), enun: 'En el dimmer, el DIAC…', opciones: ['dispara al TRIAC cuando el capacitor llega a unos 30 V', 'rectifica la corriente', 'mide la luz del ambiente'], ok: 0,
    proc: 'El capacitor se carga por R; cuando llega a unos 30 V el DIAC conduce y da el pulso en G.' }; } });
  opc({ id: 'tri_semi', tema: 'TRIAC', gen() { return { et: 'SENCILLA', fig: CIRC.triac(), enun: 'En la red de 220 V y 50 Hz, un semiciclo dura…', opciones: ['10 ms', '20 ms', '50 ms'], ok: 0,
    proc: 'Un ciclo dura 1/50 s = 20 ms; medio ciclo, 10 ms.' }; } });
  opc({ id: 'tri_donde', tema: 'TRIAC', gen() { return { et: 'GENUINA', fig: CIRC.dimmer(), enun: '¿Dónde hay un TRIAC?', opciones: ['en el dimmer de la pared y en el gatillo de un taladro', 'en el control remoto de la tele', 'en una pila'], ok: 0,
    proc: 'Regula potencia en alterna: dimmers, taladros y relés de estado sólido.' }; } });

  window.BANCO = {
    curso: 'e2', nombre: 'Electrónica 2', anio: '5.° año',
    temas: ['Realimentación', 'Ancho de banda', 'Operacional', 'MOSFET', 'TRIAC'],
    preguntas: P,
    figResumen: [() => CIRC.bloques({}), () => CIRC.curvas({}), () => CIRC.noInversor({}), () => CIRC.mosfet({}), () => CIRC.dimmer()],
    figTema: { 'Realimentación': () => CIRC.bloques({}), 'Ancho de banda': () => CIRC.curvas({}), 'Operacional': () => CIRC.noInversor({}), 'MOSFET': () => CIRC.mosfet({}), 'TRIAC': () => CIRC.triac() },
    actividades: [
      { id: 'tp8', nombre: 'T.P. N° 8 · Realimentación, MOSFET y TRIAC', codigo: 'LAZO8', minutos: 40, opc: 4, num: 6 },
    ],
    resumen: [
      ['Realimentación negativa', ['Una parte de la salida vuelve por la red β y se <b>resta</b> a la entrada.', 'A · β es la <b>ganancia de lazo</b>. D es el factor de realimentación.',
        'Se pierde ganancia. Se gana <b>estabilidad</b>, menos distorsión y ruido, y más ancho de banda.', 'Si lo que vuelve se suma, el circuito oscila (el chiflido del micrófono).'],
        ['D = 1 + β · A', 'A<sub>f</sub> = A / D', 'si β·A ≫ 1: A<sub>f</sub> ≈ 1/β', '% = (viejo − nuevo) / viejo · 100']],
      ['Ancho de banda', ['La curva realimentada queda más baja y más ancha.', 'Control: A · f<sub>H</sub> = A<sub>f</sub> · f<sub>Hf</sub> (el producto no cambia).'],
        ['f<sub>Hf</sub> = f<sub>H</sub> · D', 'f<sub>Lf</sub> = f<sub>L</sub> / D', 'BW = f<sub>H</sub> − f<sub>L</sub>', 'A<sub>dB</sub> = 20 · log A']],
      ['Operacional no inversor', ['Dos resistencias forman la red β: R<sub>f</sub> lleva parte de la salida a la pata (−) y R<sub>1</sub> va a masa.'],
        ['β = R<sub>1</sub> / (R<sub>1</sub> + R<sub>f</sub>)', 'A<sub>f</sub> = 1 + R<sub>f</sub> / R<sub>1</sub>']],
      ['MOSFET', ['Se controla con la <b>tensión</b> de compuerta (V<sub>GS</sub>); casi no toma corriente.', 'Canal N: conduce si V<sub>GS</sub> &gt; V<sub>TH</sub>.',
        'Como llave le queda muy poca tensión encima: calienta menos que un BJT.'], ['P = V · I']],
      ['TRIAC', ['Llave para corriente alterna: conduce en los <b>dos sentidos</b> después de un pulso en G.', 'Se apaga solo en cada cruce por cero (la corriente baja de I<sub>H</sub>).',
        'Dimmer: R y C cargan hasta que el DIAC dispara al TRIAC. Más α, menos luz. Con α = 90° llega la mitad.', 'Red de 50 Hz: ciclo de 20 ms, semiciclo de 10 ms.'], ['t = α / 180° · 10 ms']],
    ],
  };
})();
