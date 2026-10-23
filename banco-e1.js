// Electrónica 1 · 4.° año · banco de preguntas del 3.er trimestre (luz, LED y transistor como llave)
// Cada pregunta se arma con números distintos para cada alumno. Valores y fórmulas: los de las clases 50, 51 y del práctico del 16/10.
(function () {
  const LEDS = [['rojo', 1.9], ['ámbar', 2.1], ['verde', 3.2], ['azul', 3.2], ['blanco', 3.2]];
  const P = [];
  const num = (o) => P.push(Object.assign({ tipo: 'num' }, o));
  const opc = (o) => P.push(Object.assign({ tipo: 'opc' }, o));

  // ---------- LED ----------
  num({ id: 'led_r', tema: 'LED', gen(r, f) {
    const [col, vf] = r.pick(LEDS), vs = r.pick([5, 9, 12]), i = r.pick([10, 15, 20]);
    const R = (vs - vf) / (i / 1000);
    return { fig: CIRC.serieLED({ vs: f(vs) + ' V', r: 'R = ?', led: col, i: i + ' mA' }), enun: `Una fuente de <b>${f(vs)} V</b> alimenta un LED <b>${col}</b> (V<sub>F</sub> = ${f(vf)} V). Querés que pasen <b>${i} mA</b>. ¿Qué resistencia en serie hace falta?`,
      unidad: 'Ω', valor: R, pista: 'R<sub>S</sub> = (V<sub>S</sub> − V<sub>F</sub>) / I, con la corriente en amper.',
      proc: `R<sub>S</sub> = (V<sub>S</sub> − V<sub>F</sub>) / I = (${f(vs)} − ${f(vf)}) / ${f(i / 1000, 3)} = <b>${f(R, 0)} Ω</b>` };
  } });
  num({ id: 'led_i', tema: 'LED', gen(r, f) {
    const [col, vf] = r.pick(LEDS), vs = r.pick([5, 9, 12]), R = r.pick([150, 220, 330, 470, 680]);
    const I = (vs - vf) / R * 1000;
    return { fig: CIRC.serieLED({ vs: f(vs) + ' V', r: R + ' Ω', led: col, i: 'I = ?' }), enun: `Un LED <b>${col}</b> (V<sub>F</sub> = ${f(vf)} V) está en serie con <b>${R} Ω</b> y una fuente de <b>${f(vs)} V</b>. ¿Cuántos mA pasan?`,
      unidad: 'mA', valor: I, pista: 'I = (V<sub>S</sub> − V<sub>F</sub>) / R<sub>S</sub>. Al final pasá de A a mA (por 1000).',
      proc: `I = (${f(vs)} − ${f(vf)}) / ${R} = ${f(I / 1000, 5)} A = <b>${f(I, 2)} mA</b>` };
  } });
  num({ id: 'led_pr', tema: 'LED', gen(r, f) {
    const [col, vf] = r.pick(LEDS), vs = r.pick([9, 12]), i = r.pick([10, 15, 20]);
    const p = (vs - vf) * i;
    return { fig: CIRC.serieLED({ vs: f(vs) + ' V', led: col, i: i + ' mA' }), enun: `Fuente de <b>${f(vs)} V</b>, LED <b>${col}</b> (V<sub>F</sub> = ${f(vf)} V) y <b>${i} mA</b>. ¿Cuánta potencia gasta la <b>resistencia</b>, en mW?`,
      unidad: 'mW', valor: p, pista: 'P<sub>R</sub> = (V<sub>S</sub> − V<sub>F</sub>) · I. Si ponés la corriente en mA, el resultado sale en mW.',
      proc: `P<sub>R</sub> = (${f(vs)} − ${f(vf)}) · ${i} mA = <b>${f(p, 1)} mW</b>` };
  } });
  num({ id: 'led_pled', tema: 'LED', gen(r, f) {
    const [col, vf] = r.pick(LEDS), i = r.pick([10, 15, 20]);
    const p = vf * i;
    return { fig: CIRC.serieLED({ vs: '', led: col, i: i + ' mA' }), enun: `Un LED <b>${col}</b> (V<sub>F</sub> = ${f(vf)} V) conduce <b>${i} mA</b>. ¿Cuánta potencia gasta el LED, en mW?`,
      unidad: 'mW', valor: p, pista: 'P<sub>LED</sub> = V<sub>F</sub> · I.', proc: `P<sub>LED</sub> = ${f(vf)} · ${i} mA = <b>${f(p, 1)} mW</b>` };
  } });
  opc({ id: 'led_prende', tema: 'LED', gen() { return { enun: 'Un LED prende cuando…', opciones: ['está en directa y la fuente le da más que su V<sub>F</sub>', 'está en inversa', 'tiene cualquier tensión, sin importar el sentido'], ok: 0,
    proc: 'Tienen que pasar dos cosas: que esté en directa y que la fuente supere su V<sub>F</sub>.' }; } });
  opc({ id: 'led_color', tema: 'LED', gen() { return { et: 'SENCILLA', enun: '¿Qué decide el color de un LED?', opciones: ['el material del chip', 'el color del plástico de afuera', 'la corriente que pasa'], ok: 0,
    proc: 'El color lo pone el material del chip: cada material suelta fotones de una energía distinta.' }; } });
  opc({ id: 'led_blanco', tema: 'LED', gen() { return { et: 'SENCILLA', enun: 'Un LED blanco por dentro es…', opciones: ['un chip azul con una capa de fósforo amarillo', 'un chip que emite blanco', 'una lamparita chiquita'], ok: 0,
    proc: 'No existe un chip blanco: azul más el amarillo del fósforo, el ojo lo ve blanco.' }; } });
  opc({ id: 'led_rs', tema: 'LED', gen() { return { et: 'SENCILLA', enun: 'La resistencia en serie con un LED sirve para…', opciones: ['limitar la corriente y que no se queme', 'que prenda de otro color', 'que gaste menos la fuente cuando está apagado'], ok: 0,
    proc: 'Sin resistencia la corriente sube sin control y el LED se quema.' }; } });
  opc({ id: 'led_quien', tema: 'LED', gen() { return { et: 'COMPRENSIÓN', enun: 'Con una fuente de 9 V y un LED rojo, ¿quién gasta más potencia?', opciones: ['la resistencia', 'el LED', 'los dos lo mismo'], ok: 0,
    proc: 'A la resistencia le quedan 7,1 V y al LED 1,9 V, con la misma corriente: la resistencia gasta casi cuatro veces más.' }; } });

  // ---------- Fotodiodo, fototransistor y optoacoplador ----------
  num({ id: 'fd_v', tema: 'Fotodiodo', gen(r, f) {
    const i = r.pick([5, 10, 20, 30, 50]), R = r.pick([47, 100, 220]);
    const v = i * R / 1000;
    return { fig: CIRC.fotodiodo({ r: R + ' kΩ', i: i + ' µA' }), enun: `Un fotodiodo deja pasar <b>${i} µA</b> y esa corriente pasa por una resistencia de <b>${R} kΩ</b>. ¿Qué tensión aparece en la resistencia?`,
      unidad: 'V', valor: v, pista: 'V = I · R. Pasá los µA a A y los kΩ a Ω (o hacé µA · kΩ = mV).',
      proc: `V = ${f(i / 1e6, 6)} A · ${R * 1000} Ω = <b>${f(v, 2)} V</b>` };
  } });
  num({ id: 'opto_r', tema: 'Optoacoplador', gen(r, f) {
    const vs = r.pick([5, 9, 12]), i = r.pick([10, 15, 20]), vf = 1.3;
    const R = (vs - vf) / (i / 1000);
    return { et: 'CASO REAL', fig: CIRC.serieLED({ vs: f(vs) + ' V', r: 'R = ?', led: 'LED infrarrojo', i: i + ' mA' }), enun: `El LED de un optoacoplador es infrarrojo (V<sub>F</sub> = 1,3 V). Con una fuente de <b>${f(vs)} V</b> querés <b>${i} mA</b>. ¿Qué resistencia ponés?`,
      unidad: 'Ω', valor: R, pista: 'Es un LED como cualquier otro: R<sub>S</sub> = (V<sub>S</sub> − V<sub>F</sub>) / I.',
      proc: `R<sub>S</sub> = (${f(vs)} − 1,3) / ${f(i / 1000, 3)} = <b>${f(R, 0)} Ω</b>` };
  } });
  opc({ id: 'fd_modo', tema: 'Fotodiodo', gen() { return { et: 'SENCILLA', enun: 'El fotodiodo trabaja…', opciones: ['en inversa o sin pila, nunca en directa', 'siempre en directa', 'solo con corriente alterna'], ok: 0,
    proc: 'Con pila va en inversa (rápido); sin pila trabaja como celda solar (lento).' }; } });
  opc({ id: 'fd_al_reves', tema: 'Fotodiodo', gen() { return { enun: 'El LED convierte corriente en luz. El fotodiodo…', opciones: ['convierte luz en corriente', 'convierte luz en calor', 'también convierte corriente en luz'], ok: 0,
    proc: 'Es el mismo diodo mirado al revés: le entra luz y sale corriente.' }; } });
  opc({ id: 'fd_mismo', tema: 'Fotodiodo', gen() { return { et: 'GENUINA', enun: 'El panel solar de un cargador y el sensor del control remoto…', opciones: ['son el mismo componente trabajando en modos distintos', 'no tienen nada que ver', 'el control remoto usa un LDR'], ok: 0,
    proc: 'Los dos son fotodiodos: el panel sin pila busca potencia y el del control con pila busca velocidad.' }; } });
  opc({ id: 'ft_sens', tema: 'Fototransistor', gen() { return { enun: 'Comparado con el fotodiodo, el fototransistor…', opciones: ['es más sensible, porque además amplifica', 'no necesita luz para funcionar', 'es un LED que mide temperatura'], ok: 0,
    proc: 'La luz hace de corriente de base y el transistor la amplifica: con poca luz da mucha más corriente.' }; } });
  opc({ id: 'opto_para', tema: 'Optoacoplador', gen() { return { fig: CIRC.opto({}), enun: '¿Para qué sirve un optoacoplador?', opciones: ['para pasar una señal entre dos circuitos sin conectarlos, usando luz', 'para amplificar audio', 'para medir la temperatura'], ok: 0,
    proc: 'Aísla: los dos circuitos no se tocan eléctricamente, la señal viaja como luz.' }; } });
  opc({ id: 'opto_adentro', tema: 'Optoacoplador', gen() { return { fig: CIRC.opto({ lab: '¿qué hay adentro?' }), enun: 'Adentro de un optoacoplador hay…', opciones: ['un LED y un fototransistor enfrentados', 'dos resistencias y una pila', 'un LDR y un parlante'], ok: 0,
    proc: 'De un lado el LED, del otro el fototransistor, en una cápsula cerrada a la luz de afuera.' }; } });

  // ---------- LDR ----------
  num({ id: 'ldr_vx', tema: 'LDR', gen(r, f) {
    const vcc = r.pick([5, 9, 12]), rp = r.pick([4.7, 10, 22]), rl = r.pick([0.5, 1, 2, 10, 50, 90]);
    const vx = vcc * rl / (rp + rl);
    return { fig: CIRC.divisor({ vcc: vcc + ' V', arriba: 'R<tspan font-size="9">P</tspan> = ' + f(rp) + ' kΩ', abajo: 'LDR = ' + f(rl) + ' kΩ', vx: 'V<tspan font-size="9">X</tspan> = ?' }), enun: `Divisor con el pote arriba (<b>R<sub>P</sub> = ${f(rp)} kΩ</b>) y el LDR abajo (<b>R<sub>LDR</sub> = ${f(rl)} kΩ</b>), con <b>V<sub>CC</sub> = ${vcc} V</b>. ¿Cuánto vale V<sub>X</sub>?`,
      unidad: 'V', valor: vx, pista: 'V<sub>X</sub> = V<sub>CC</sub> · R<sub>LDR</sub> / (R<sub>P</sub> + R<sub>LDR</sub>). Los kΩ se simplifican.',
      proc: `V<sub>X</sub> = ${vcc} · ${f(rl)} / (${f(rp)} + ${f(rl)}) = <b>${f(vx, 2)} V</b>` };
  } });
  num({ id: 'ldr_veces', tema: 'LDR', gen(r, f) {
    const ro = r.pick([50, 100, 200]), rl = r.pick([100, 200, 500]);
    const v = ro * 1000 / rl;
    return { fig: CIRC.divisor({ abajo: 'LDR' }), enun: `Un LDR tiene <b>${ro} kΩ</b> a oscuras y <b>${rl} Ω</b> con mucha luz. ¿Cuántas veces más chica queda su resistencia?`,
      unidad: 'veces', valor: v, pista: 'Pasá los dos valores a ohm y dividí el grande por el chico.',
      proc: `${ro * 1000} Ω / ${rl} Ω = <b>${f(v, 0)} veces</b>` };
  } });
  opc({ id: 'ldr_luz', tema: 'LDR', gen() { return { enun: 'Con más luz, la resistencia de un LDR…', opciones: ['baja', 'sube', 'no cambia'], ok: 0,
    proc: 'La luz suelta electrones en el material y conduce mejor: la resistencia baja.' }; } });
  opc({ id: 'ldr_noche', tema: 'LDR', gen() { return { enun: 'Luz de jardín con el LDR abajo: cuando oscurece, V<sub>X</sub>…', opciones: ['sube', 'baja', 'queda igual'], ok: 0,
    proc: 'De noche el LDR se agranda y se queda con casi toda la tensión: X sube.' }; } });
  opc({ id: 'ldr_pote', tema: 'LDR', gen() { return { et: 'CASO REAL', fig: CIRC.llave({}), enun: 'La luz de jardín prende muy tarde, con noche cerrada. Para que prenda antes, al pote…', opciones: ['le bajás los kΩ', 'le subís los kΩ', 'no lo tocás: hay que cambiar el LED'], ok: 0,
    proc: 'Con menos kΩ arriba, V<sub>X</sub> sube antes y pasa los 0,7 V con más luz.' }; } });

  // ---------- Panel solar ----------
  num({ id: 'pan_celda', tema: 'Panel solar', gen(r, f) {
    const n = r.pick([4, 5, 6, 8, 10]), vc = r.pick([0.4, 0.5]);
    return { fig: CIRC.panel({ n: n, lab: f(n * vc, 1) + ' V', celda: '¿cuánto da cada celda?' }), enun: `Un panel tiene <b>${n} celdas en serie</b> y al sol da <b>${f(n * vc, 1)} V</b>. ¿Qué tensión da cada celda?`,
      unidad: 'V', valor: vc, pista: 'En serie las tensiones se suman: repartí el total en partes iguales.',
      proc: `${f(n * vc, 1)} V / ${n} = <b>${f(vc, 1)} V por celda</b>` };
  } });
  num({ id: 'pan_p', tema: 'Panel solar', gen(r, f) {
    const v = r.pick([1.6, 2, 3, 6]), i = r.pick([2.6, 5, 20, 50, 100]);
    const p = v * i;
    return { et: 'CASO REAL', fig: CIRC.panel({ n: 4, lab: f(v, 1) + ' V · ' + f(i, 1) + ' mA' }), enun: `Un panel entrega <b>${f(v, 1)} V</b> y <b>${f(i, 1)} mA</b>. ¿Qué potencia entrega, en mW?`,
      unidad: 'mW', valor: p, pista: 'P = V · I. Con la corriente en mA sale en mW.', proc: `P = ${f(v, 1)} V · ${f(i, 1)} mA = <b>${f(p, 2)} mW</b>` };
  } });
  num({ id: 'pan_n', tema: 'Panel solar', gen(r, f) {
    const [vc, vt] = r.pick([[0.5, 3], [0.5, 6], [0.5, 9], [0.5, 12], [0.4, 2], [0.4, 6], [0.4, 12]]);
    return { fig: CIRC.panel({ n: 6, lab: vt + ' V', celda: f(vc, 1) + ' V por celda' }), enun: `Cada celda da <b>${f(vc, 1)} V</b>. ¿Cuántas celdas iguales en serie hacen falta para <b>${vt} V</b>?`,
      unidad: 'celdas', valor: vt / vc, tol: 0.001, pista: 'Dividí la tensión que querés por la de una celda.', proc: `n = ${vt} V / ${f(vc, 1)} V = <b>${f(vt / vc, 0)} celdas</b>` };
  } });
  opc({ id: 'pan_serie', tema: 'Panel solar', gen() { return { et: 'SENCILLA', enun: 'Celdas solares conectadas en serie…', opciones: ['suman sus tensiones', 'suman sus corrientes', 'no cambian nada'], ok: 0,
    proc: 'Igual que las pilas de una linterna: en serie se suman las tensiones.' }; } });
  opc({ id: 'pan_celda_es', tema: 'Panel solar', gen() { return { enun: 'Una celda solar se porta como…', opciones: ['una pila chiquita que anda mientras haya luz', 'una resistencia que se calienta', 'un capacitor que guarda la luz'], ok: 0,
    proc: 'La luz suelta electrones en la unión PN y aparece una tensión entre sus contactos.' }; } });

  // ---------- Transistor como llave ----------
  num({ id: 'tr_ib', tema: 'Transistor', gen(r, f) {
    const vx = r.pick([3, 5, 6.9, 8.1, 9]), rb = r.pick([22, 33, 47, 68]);
    const ib = (vx - 0.7) / (rb * 1000) * 1e6;
    return { fig: CIRC.llave({ rb: rb + ' kΩ', extra: 'V<tspan font-size="9">X</tspan> = ' + f(vx, 1) + ' V' }), enun: `En la base de un NPN hay <b>V<sub>X</sub> = ${f(vx, 1)} V</b> y una <b>R<sub>B</sub> = ${rb} kΩ</b>. ¿Cuánto vale I<sub>B</sub>, en µA?`,
      unidad: 'µA', valor: ib, pista: 'I<sub>B</sub> = (V<sub>X</sub> − 0,7 V) / R<sub>B</sub>. Al final pasá de A a µA (por 1.000.000).',
      proc: `I<sub>B</sub> = (${f(vx, 1)} − 0,7) / ${rb * 1000} = <b>${f(ib, 0)} µA</b>` };
  } });
  num({ id: 'tr_icsat', tema: 'Transistor', gen(r, f) {
    const [col, vf] = r.pick(LEDS), vcc = r.pick([9, 12]), rc = r.pick([220, 330, 470, 560, 680]);
    const ic = (vcc - vf - 0.2) / rc * 1000;
    return { et: 'CASO REAL', fig: CIRC.llave({ vcc: vcc + ' V', rc: rc + ' Ω', led: col }), enun: `Un NPN prende un LED <b>${col}</b> (V<sub>F</sub> = ${f(vf)} V) con <b>R<sub>C</sub> = ${rc} Ω</b> y <b>V<sub>CC</sub> = ${vcc} V</b>. ¿Cuánto vale I<sub>C(sat)</sub>, en mA?`,
      unidad: 'mA', valor: ic, pista: 'I<sub>C(sat)</sub> = (V<sub>CC</sub> − V<sub>F</sub> − 0,2 V) / R<sub>C</sub>.',
      proc: `I<sub>C(sat)</sub> = (${vcc} − ${f(vf)} − 0,2) / ${rc} = <b>${f(ic, 1)} mA</b>` };
  } });
  num({ id: 'tr_bib', tema: 'Transistor', gen(r, f) {
    const b = r.pick([80, 100, 120, 150]), ib = r.pick([50, 100, 157, 200]);
    const ic = b * ib / 1000;
    return { fig: CIRC.llave({ extra: 'β = ' + b }), enun: `Un transistor con <b>β = ${b}</b> recibe <b>I<sub>B</sub> = ${ib} µA</b>. ¿Cuánto vale β · I<sub>B</sub>, en mA?`,
      unidad: 'mA', valor: ic, pista: 'Multiplicá y pasá de µA a mA (dividido 1000).', proc: `${b} · ${ib} µA = ${b * ib} µA = <b>${f(ic, 1)} mA</b>` };
  } });
  opc({ id: 'tr_07', tema: 'Transistor', gen() { return { et: 'SENCILLA', enun: 'Para que un NPN de silicio conduzca, en la base tiene que haber más de…', opciones: ['0,7 V', '0,2 V', '5 V'], ok: 0,
    proc: 'La juntura base-emisor es un diodo: conduce a partir de unos 0,7 V.' }; } });
  opc({ id: 'tr_corte', tema: 'Transistor', gen() { return { et: 'SENCILLA', enun: 'En corte, el transistor se porta como…', opciones: ['una llave abierta', 'una llave cerrada', 'un LED'], ok: 0,
    proc: 'Sin corriente de base no pasa corriente de colector: llave abierta.' }; } });
  opc({ id: 'tr_sat', tema: 'Transistor', gen(r, f) {
    const b = r.pick([100, 120]), ib = r.pick([150, 200]), ics = r.pick([10, 14.7, 18.3]);
    const sat = b * ib / 1000 > ics;
    return { fig: CIRC.llave({ extra: 'β·I<tspan font-size="9">B</tspan> = ' + f(b * ib / 1000, 1) + ' mA' }), enun: `β · I<sub>B</sub> = ${f(b * ib / 1000, 1)} mA e I<sub>C(sat)</sub> = ${f(ics, 1)} mA. El transistor está…`, opciones: ['saturado: llave cerrada', 'en zona activa', 'en corte: llave abierta'], ok: sat ? 0 : 1,
      proc: sat ? 'β · I<sub>B</sub> es más grande que I<sub>C(sat)</sub>: no puede pasar tanto, se satura y pasa I<sub>C(sat)</sub>.' : 'β · I<sub>B</sub> no llega a I<sub>C(sat)</sub>: conduce, pero en zona activa.' };
  } });

  window.BANCO = {
    curso: 'e1', nombre: 'Electrónica 1', anio: '4.° año',
    temas: ['LED', 'Fotodiodo', 'Fototransistor', 'Optoacoplador', 'LDR', 'Panel solar', 'Transistor'],
    preguntas: P,
    figResumen: [() => CIRC.serieLED({ vs: 'V<tspan font-size="9">S</tspan>' }), () => CIRC.fotodiodo({}), () => CIRC.opto({}), () => CIRC.divisor({ arriba: 'R<tspan font-size="9">P</tspan>', abajo: 'LDR' }), () => CIRC.panel({ n: 4, lab: 'V = n · V celda' }), () => CIRC.llave({})],
    figTema: { 'LED': () => CIRC.serieLED({ vs: '' }), 'Fotodiodo': () => CIRC.fotodiodo({}), 'Fototransistor': () => CIRC.opto({}), 'Optoacoplador': () => CIRC.opto({}), 'LDR': () => CIRC.divisor({}), 'Panel solar': () => CIRC.panel({ n: 4 }), 'Transistor': () => CIRC.llave({}) },
    actividades: [
      { id: 'tp8', nombre: 'T.P. N° 8 · Luz, LED y transistor', codigo: 'LUZ8', minutos: 40, opc: 4, num: 6 },
    ],
    resumen: [
      ['El LED', ['Es un diodo que da luz cuando conduce <b>en directa</b>.', 'El color lo pone el <b>material del chip</b>. El blanco es un chip azul con fósforo amarillo.',
        'V<sub>F</sub> típica: infrarrojo 1,3 V · rojo 1,9 V · ámbar 2,1 V · verde, azul y blanco 3,2 V.', 'Corriente típica de un LED indicador: 10 a 20 mA.'],
        ['R<sub>S</sub> = (V<sub>S</sub> − V<sub>F</sub>) / I', 'P<sub>LED</sub> = V<sub>F</sub> · I', 'P<sub>R</sub> = (V<sub>S</sub> − V<sub>F</sub>) · I']],
      ['El fotodiodo', ['Le entra luz y sale corriente: es el LED al revés.', 'Trabaja <b>en inversa</b> (con pila, rápido: control remoto) o <b>sin pila</b> (lento: celda solar). En directa, nunca.',
        'Su corriente es chiquita (µA): se la pasa por una resistencia grande para leer una tensión.'], ['V = I · R']],
      ['Fototransistor y optoacoplador', ['El <b>fototransistor</b> usa la luz como corriente de base y la amplifica: es más sensible que el fotodiodo.',
        'El <b>optoacoplador</b> tiene un LED y un fototransistor enfrentados: pasa una señal entre dos circuitos <b>sin conectarlos</b>.'], []],
      ['El LDR', ['Es una resistencia que cambia con la luz: <b>más luz, menos resistencia</b>.', 'Se usa en un divisor de tensión con un pote para leer la luz.',
        'Con el LDR abajo, de noche V<sub>X</sub> sube. Bajarle los kΩ al pote hace que prenda antes.'], ['V<sub>X</sub> = V<sub>CC</sub> · R<sub>abajo</sub> / (R<sub>arriba</sub> + R<sub>abajo</sub>)']],
      ['La celda y el panel solar', ['La celda es un diodo grande que con luz se porta como una pila chiquita.', 'En <b>serie</b> se suman las tensiones; en <b>paralelo</b>, las corrientes.'],
        ['V<sub>panel</sub> = n · V<sub>celda</sub>', 'P = V · I']],
      ['El transistor como llave', ['NPN: conduce si V<sub>X</sub> &gt; 0,7 V.', '<b>Corte</b>: llave abierta, I<sub>C</sub> = 0. <b>Saturación</b>: llave cerrada, I<sub>C</sub> = I<sub>C(sat)</sub>.',
        'Si β · I<sub>B</sub> &gt; I<sub>C(sat)</sub>, está saturado.'], ['I<sub>B</sub> = (V<sub>X</sub> − 0,7 V) / R<sub>B</sub>', 'I<sub>C</sub> = β · I<sub>B</sub>', 'I<sub>C(sat)</sub> = (V<sub>CC</sub> − V<sub>F</sub> − 0,2 V) / R<sub>C</sub>']],
    ],
  };
})();
