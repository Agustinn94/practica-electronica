// Electrónica 2 · 5.° año · desde el MOSFET hasta el TRIAC (clases 52 a la del 23/10).
// Fórmulas y valores de las clases y de los T.P. N.° 6 y 7. Figuras y notación del Boylestad, 10.ª ed. (caps. 6, 14 y 17).
(function () {
  const { T, N, q, qt, fig } = window.EX.H;
  const P = [];
  const num = (o) => P.push(Object.assign({ tipo: 'num' }, o));
  const opc = (o) => P.push(Object.assign({ tipo: 'opc' }, o));
  const AB = (r) => r.pick([[400, 0.02], [500, 0.02], [1000, 0.009], [2000, 0.0045], [2000, 0.01], [2500, 0.004], [5000, 0.02], [10000, 0.01], [1000, 0.05]]);

  // =================================================================== MOSFET
  num({ id: 'mos_id', tema: 'MOSFET', et: 'CASO REAL', gen(r) {
    const v = r.pick([12, 24]), R = r.pick([6, 8, 12, 24, 48]), i = v / R;
    return { fig: fig('mos_lampara', { VDD: qt(v, 'V'), RL: qt(R, 'Ω'), VGS: '10 V' }),
      enun: T`El MOSFET del dibujo está encendido y trabaja como <b>llave cerrada</b>: entre D y S queda casi $0\,\mathrm{V}$. ¿Cuánta corriente $I_D$ pasa por la lámpara?`,
      unidad: 'A', valor: i,
      datos: [T`V_{DD} = ${q(v, 'V')}`, T`R_L = ${q(R, 'Ω')}`, T`V_{DS} \approx 0`], pide: T`la corriente $I_D$ que pasa por la lámpara`,
      formula: T`I_D = \dfrac{V_{DD}}{R_L}`, porque: 'Con la llave cerrada toda la tensión de la fuente queda en la lámpara, y se usa la ley de Ohm.',
      cuentas: [['Reemplazo', [T`I_D = \dfrac{${q(v, 'V')}}{${q(R, 'Ω')}}`]]], resultado: T`I_D = ${q(i, 'A', 2)}` };
  } });
  num({ id: 'mos_vds', tema: 'MOSFET', gen(r) {
    const i = r.pick([2, 4, 5, 8, 10]), ron = r.pick([0.01, 0.02, 0.05]), v = i * ron;
    return { fig: fig('mos_motor', { VDD: '12 V', IM: qt(i, 'A'), VGS: '10 V' }),
      enun: T`La hoja de datos del MOSFET dice $R_{DS(on)} = ${q(ron, 'Ω', 2)}$. Por el motor del dibujo pasa la corriente indicada. ¿Cuánta tensión $V_{DS}$ le queda encima al MOSFET?`,
      unidad: 'V', valor: v, dec: 2,
      datos: [T`I_D = ${q(i, 'A')}`, T`R_{DS(on)} = ${q(ron, 'Ω', 2)}`], pide: T`la tensión $V_{DS}$ entre drenador y surtidor`,
      formula: T`V_{DS} = I_D \cdot R_{DS(on)}`, porque: 'Encendido, el MOSFET se porta como una resistencia muy chica: la R<sub>DS(on)</sub>. Es la ley de Ohm.',
      cuentas: [['Reemplazo', [T`V_{DS} = ${q(i, 'A')} \cdot ${q(ron, 'Ω', 2)}`]]], resultado: T`V_{DS} = ${q(v, 'V', 2)}` };
  } });
  num({ id: 'mos_pon', tema: 'MOSFET', gen(r) {
    const i = r.pick([2, 3, 4, 5, 6]), ron = r.pick([0.02, 0.05, 0.1]), p = i * i * ron;
    return { fig: fig('mos_motor', { VDD: '24 V', IM: qt(i, 'A'), VGS: '10 V' }),
      enun: T`El MOSFET del dibujo tiene $R_{DS(on)} = ${q(ron, 'Ω', 2)}$ y por el motor pasa la corriente indicada. ¿Cuánto calienta el MOSFET?`,
      unidad: 'W', valor: p, dec: 2,
      datos: [T`I_D = ${q(i, 'A')}`, T`R_{DS(on)} = ${q(ron, 'Ω', 2)}`], pide: 'la potencia que se pierde en calor en el MOSFET',
      formula: T`P = I_D^{\,2} \cdot R_{DS(on)}`, porque: 'Es la potencia en una resistencia: corriente al cuadrado por resistencia.',
      cuentas: [['Reemplazo', [T`P = (${q(i, 'A')})^2 \cdot ${q(ron, 'Ω', 2)} = ${N(i * i)}\,\mathrm{A^2} \cdot ${q(ron, 'Ω', 2)}`]]], resultado: T`P = ${q(p, 'W', 2)}` };
  } });
  num({ id: 'mos_bjt', tema: 'MOSFET', et: 'CASO REAL', gen(r) {
    const i = r.pick([5, 8, 10]), vm = r.pick([0.04, 0.05]), pb = 0.2 * i, pm = vm * i;
    return { fig: fig('mos_motor', { VDD: '12 V', IM: qt(i, 'A'), VGS: '10 V' }),
      enun: T`Una llave maneja un motor de $${q(i, 'A')}$. Si la llave es un BJT saturado le quedan $0{,}2\,\mathrm{V}$ encima; si es un MOSFET le quedan $${q(vm, 'V', 2)}$. ¿Cuántos watts <b>menos</b> calienta el MOSFET?`,
      unidad: 'W', valor: pb - pm, dec: 2,
      datos: [T`I = ${q(i, 'A')}`, T`V_{BJT} = 0{,}2\,\mathrm{V}`, T`V_{MOS} = ${q(vm, 'V', 2)}`], pide: 'la diferencia de calor entre las dos llaves',
      formula: T`P = V \cdot I`, porque: 'Cada llave calienta la tensión que le queda encima por la corriente que pasa. Se calculan las dos y se restan.',
      cuentas: [['BJT', [T`P_{BJT} = 0{,}2\,\mathrm{V} \cdot ${q(i, 'A')} = ${q(pb, 'W', 1)}`]], ['MOSFET', [T`P_{MOS} = ${q(vm, 'V', 2)} \cdot ${q(i, 'A')} = ${q(pm, 'W', 2)}`]],
        ['Diferencia', [T`\Delta P = ${q(pb, 'W', 1)} - ${q(pm, 'W', 2)}`]]],
      resultado: T`\Delta P = ${q(pb - pm, 'W', 2)}`, cierre: 'Por eso las fuentes y los controles de motor usan MOSFET: calientan mucho menos.' };
  } });
  opc({ id: 'mos_th', tema: 'MOSFET', gen(r) {
    const vth = r.pick([1, 2, 3]), vgs = r.pick([0.5, 1.5, 2.5, 4, 5]), c = vgs > vth;
    return { fig: fig('mos_resistencia', { VDD: '12 V', RL: '100 Ω', VGS: qt(vgs, 'V', 1) }), enun: T`Un MOSFET canal n tiene $V_{TH} = ${q(vth, 'V')}$ y le ponés la $V_{GS}$ del dibujo. ¿Conduce?`,
      opciones: [T`Sí: $V_{GS}$ es mayor que $V_{TH}$`, T`No: $V_{GS}$ no llega a $V_{TH}$`], ok: c ? 0 : 1,
      explic: c ? T`$${q(vgs, 'V', 1)} > ${q(vth, 'V')}$: la tensión de puerta supera el umbral, se forma el canal y conduce.` : T`$${q(vgs, 'V', 1)} < ${q(vth, 'V')}$: no alcanza el umbral, no se forma el canal y no conduce.` };
  } });
  opc({ id: 'mos_ctrl', tema: 'MOSFET', et: 'SENCILLA', gen() { return { enun: '¿Qué controla al MOSFET?', opciones: [T`la tensión entre puerta y surtidor, $V_{GS}$`, 'la corriente de base, como en el BJT', 'la luz que le llega'], ok: 0,
    explic: T`Al MOSFET lo manda la <b>tensión</b> $V_{GS}$. No hace falta inyectarle corriente, como en la base del BJT.` }; } });
  opc({ id: 'mos_patas', tema: 'MOSFET', et: 'SENCILLA', fig: () => fig('mos_simbolo'), gen() { return { enun: 'Las tres patas del MOSFET se llaman…', opciones: ['puerta (G), drenador (D) y surtidor (S)', 'base, colector y emisor', 'ánodo, cátodo y puerta'], ok: 0,
    explic: 'G, D y S vienen del inglés gate, drain y source: puerta, drenador y surtidor. Base, colector y emisor son las del BJT.' }; } });
  opc({ id: 'mos_oxido', tema: 'MOSFET', gen() { return { enun: '¿Por qué la corriente que entra por la puerta del MOSFET es casi cero?', opciones: ['porque una capa de óxido, que es aislante, separa la puerta del canal', 'porque la puerta está conectada a masa', 'porque el MOSFET trabaja con muy poca tensión'], ok: 0,
    explic: 'MOS quiere decir metal, óxido y semiconductor. El óxido es una capa finita de vidrio entre la puerta y el canal: no deja pasar corriente.' }; } });
  opc({ id: 'mos_campo', tema: 'MOSFET', gen() { return { enun: 'Si la puerta está aislada, ¿cómo hace para controlar la corriente del canal?', opciones: ['con el campo eléctrico, que atrae portadores sin que circule corriente', 'con una corriente muy chiquita que salta el óxido', 'calentando el canal'], ok: 0,
    explic: 'La tensión de puerta crea un campo eléctrico que forma el canal. Por eso se llama transistor de <b>efecto de campo</b> (FET).' }; } });
  opc({ id: 'mos_celu', tema: 'MOSFET', et: 'GENUINA', gen() { return { enun: 'En la plaqueta de un celular casi todas las llaves son MOSFET. ¿Por qué no usan BJT?', opciones: ['porque el MOSFET se maneja con tensión y casi no gasta corriente para estar encendido', 'porque el MOSFET aguanta cualquier tensión', 'porque el BJT no puede trabajar como llave'], ok: 0,
    explic: 'Al BJT hay que darle corriente de base todo el tiempo. El MOSFET solo necesita tensión en la puerta, así que la batería dura más y la pata de un micro lo puede manejar directo.' }; } });
  opc({ id: 'mos_ron', tema: 'MOSFET', gen() { return { enun: T`Dos MOSFET distintos manejan el mismo motor. ¿Cuál calienta menos?`, opciones: [T`el de $R_{DS(on)}$ más chica`, T`el de $R_{DS(on)}$ más grande`, 'los dos igual, porque pasa la misma corriente'], ok: 0,
    explic: T`$P = I_D^{\,2} \cdot R_{DS(on)}$: con la misma corriente, menos resistencia es menos calor.` }; } });

  // =================================================================== Realimentación negativa
  num({ id: 're_d', tema: 'Realimentación', gen(r) {
    const [A, b] = AB(r), D = 1 + b * A;
    return { fig: fig('bloques', { A: qt(A, ''), B: qt(b, '') }), enun: T`Un amplificador con la ganancia $A$ del dibujo se realimenta con el $\beta$ indicado. ¿Cuánto vale el factor de realimentación $D$?`,
      unidad: '', valor: D, dec: 2,
      datos: [T`A = ${N(A)}`, T`\beta = ${N(b)}`], pide: T`el factor de realimentación $D$`,
      formula: T`D = 1 + \beta \cdot A`, porque: 'D dice por cuánto se divide la ganancia y por cuánto se multiplica el ancho de banda.',
      cuentas: [['Reemplazo', [T`D = 1 + ${N(b)} \cdot ${N(A)} = 1 + ${N(b * A, 2)}`]]], resultado: T`D = ${N(D, 2)}` };
  } });
  num({ id: 're_af', tema: 'Realimentación', gen(r) {
    const [A, b] = AB(r), D = 1 + b * A, Af = A / D;
    return { fig: fig('bloques', { A: qt(A, ''), B: qt(b, '') }), enun: T`Con los valores del dibujo, ¿cuánto vale la ganancia realimentada $A_f$?`,
      unidad: '', valor: Af, dec: 2,
      datos: [T`A = ${N(A)}`, T`\beta = ${N(b)}`], pide: T`la ganancia realimentada $A_f$`,
      formula: T`A_f = \dfrac{A}{D} \qquad D = 1 + \beta \cdot A`, porque: 'Hacen falta dos pasos: primero D y después se divide la ganancia por D.',
      cuentas: [['Primero D', [T`D = 1 + ${N(b)} \cdot ${N(A)} = ${N(D, 2)}`]], ['Después A<sub>f</sub>', [T`A_f = \dfrac{${N(A)}}{${N(D, 2)}}`]]], resultado: T`A_f = ${N(Af, 2)}` };
  } });
  num({ id: 're_pct', tema: 'Realimentación', et: 'CASO REAL', gen(r) {
    const [A, b] = AB(r), p = r.pick([10, 20, 50]), A2 = A * (1 - p / 100);
    const a1 = A / (1 + b * A), a2 = A2 / (1 + b * A2), pc = (a1 - a2) / a1 * 100;
    return { fig: fig('bloques', { A: qt(A, ''), B: qt(b, '') }), enun: T`Con el calor, la ganancia $A$ del dibujo baja un <b>${p} %</b>. ¿Qué porcentaje baja la ganancia realimentada $A_f$?`,
      unidad: '%', valor: pc, dec: 2, tol: 0.08, tolAbs: 0.1,
      datos: [T`A = ${N(A)}`, T`\beta = ${N(b)}`, T`A' = ${N(A2)}\ \ (\text{bajó } ${p}\,\%)`], pide: T`cuánto cambia $A_f$, en porcentaje`,
      formula: T`\%\ = \dfrac{A_{f\,\text{antes}} - A_{f\,\text{después}}}{A_{f\,\text{antes}}} \cdot 100`, porque: 'Se calcula A<sub>f</sub> con la ganancia de antes y con la de después, y se compara.',
      cuentas: [['Antes', [T`A_f = \dfrac{${N(A)}}{1 + ${N(b)} \cdot ${N(A)}} = ${N(a1, 3)}`]], ['Después', [T`A_f' = \dfrac{${N(A2)}}{1 + ${N(b)} \cdot ${N(A2)}} = ${N(a2, 3)}`]],
        ['Porcentaje', [T`\%\ = \dfrac{${N(a1, 3)} - ${N(a2, 3)}}{${N(a1, 3)}} \cdot 100`]]],
      resultado: T`A_f \text{ baja } ${q(pc, '%', 2)}`, cierre: `A bajó ${p} % y A<sub>f</sub> casi no se movió: eso es la estabilidad que da la realimentación.` };
  } });
  num({ id: 're_beta', tema: 'Realimentación', gen(r) {
    const af = r.pick([10, 20, 25, 50, 100]), b = 1 / af;
    return { fig: fig('bloques', { A: 'muy grande', B: '?' }), enun: T`Un amplificador tiene una ganancia $A$ enorme ($\beta A \gg 1$). Querés que la ganancia realimentada sea $A_f = ${af}$. ¿Qué $\beta$ tenés que poner?`,
      unidad: '', valor: b, dec: 3,
      datos: [T`A_f = ${af}`, T`\beta A \gg 1`], pide: T`el valor de $\beta$`,
      formula: T`A_f \approx \dfrac{1}{\beta} \;\Rightarrow\; \beta = \dfrac{1}{A_f}`, porque: 'Si βA es mucho mayor que 1, la ganancia realimentada depende solo de β.',
      cuentas: [['Reemplazo', [T`\beta = \dfrac{1}{${af}}`]]], resultado: T`\beta = ${N(b, 3)}` };
  } });
  opc({ id: 're_que', tema: 'Realimentación', et: 'SENCILLA', fig: () => fig('bloques', { A: '', B: '' }), gen() { return { enun: 'Realimentación negativa quiere decir que…', opciones: ['una parte de la salida vuelve y se resta a la entrada', 'una parte de la salida vuelve y se suma a la entrada', 'la salida se desconecta de la entrada'], ok: 0,
    explic: 'La red β toma un pedacito de la salida y lo resta en la entrada. Si la salida crece de más, la corrección es más grande: el amplificador se corrige solo.' }; } });
  opc({ id: 're_lazo', tema: 'Realimentación', et: 'SENCILLA', gen() { return { enun: T`En $D = 1 + \beta \cdot A$, ¿qué es $\beta$?`, opciones: ['la parte de la salida que vuelve a la entrada', 'la ganancia del amplificador solo', 'la ganancia del transistor'], ok: 0,
    explic: T`$\beta$ es qué parte de la salida vuelve a la entrada. $A$ es la ganancia sin realimentar y $\beta A$ es la ganancia de lazo.` }; } });
  opc({ id: 're_1b', tema: 'Realimentación', gen() { return { enun: T`Si $\beta \cdot A$ es mucho mayor que 1, $A_f$ se parece a…`, opciones: [T`$1/\beta$`, T`$A$`, T`$\beta \cdot A$`], ok: 0,
    explic: T`$A_f = \dfrac{A}{1 + \beta A} \approx \dfrac{A}{\beta A} = \dfrac{1}{\beta}$. La ganancia la fijan dos resistencias, no el transistor.` }; } });
  opc({ id: 're_pierde', tema: 'Realimentación', et: 'SENCILLA', gen() { return { enun: 'Al realimentar negativamente un amplificador, ¿qué se pierde?', opciones: ['ganancia', 'ancho de banda', 'estabilidad'], ok: 0,
    explic: 'Se pierde ganancia (se divide por D). A cambio se gana estabilidad, menos distorsión y ruido, y más ancho de banda.' }; } });
  opc({ id: 're_calor', tema: 'Realimentación', gen() { return { enun: T`¿Por qué $A_f$ casi no cambia cuando el transistor se calienta?`, opciones: [T`porque depende casi solo de $\beta$, que la fijan dos resistencias`, 'porque el calor no afecta a los transistores', 'porque la realimentación enfría el circuito'], ok: 0,
    explic: T`El calor cambia $A$, pero $A_f \approx 1/\beta$ y $\beta$ la ponen resistencias que no cambian. Por eso el amplificador realimentado es estable.` }; } });
  opc({ id: 're_pos', tema: 'Realimentación', et: 'GENUINA', gen() { return { enun: 'Acercás el micrófono al parlante y aparece un chiflido fuerte. ¿Qué pasó?', opciones: ['lo que vuelve se suma a la entrada en lugar de restarse, y el circuito oscila', 'el amplificador se quedó sin ganancia', 'el parlante se rompió'], ok: 0,
    explic: 'Es realimentación <b>positiva</b>: lo que sale del parlante entra otra vez al micrófono y se suma. Cada vuelta es más fuerte y el sistema oscila.' }; } });

  // =================================================================== Topologías
  num({ id: 'topo_rif', tema: 'Topologías', gen(r) {
    const ri = r.pick([10, 20, 50]), D = r.pick([5, 9, 11, 21]);
    return { enun: T`Un amplificador con realimentación de <b>tensión en serie</b> tiene $R_i = ${q(ri, 'kΩ')}$ y $D = ${D}$. ¿Cuánto vale la resistencia de entrada realimentada $R_{if}$, en $\mathrm{k}\Omega$?`,
      unidad: 'kΩ', valor: ri * D, dec: 0,
      datos: [T`R_i = ${q(ri, 'kΩ')}`, T`D = ${D}`, '\\text{vuelve en serie}'], pide: T`$R_{if}$`,
      formula: T`R_{if} = R_i \cdot D`, porque: 'Cuando la realimentación vuelve en serie con la entrada, la resistencia de entrada sube: se multiplica por D.',
      cuentas: [['Reemplazo', [T`R_{if} = ${q(ri, 'kΩ')} \cdot ${D}`]]], resultado: T`R_{if} = ${q(ri * D, 'kΩ', 0)}` };
  } });
  num({ id: 'topo_rof', tema: 'Topologías', gen(r) {
    const ro = r.pick([500, 900, 1200, 1800]), D = r.pick([5, 9, 10, 20]);
    return { enun: T`El mismo tipo de amplificador (mide <b>tensión</b> a la salida) tiene $R_o = ${q(ro, 'Ω')}$ y $D = ${D}$. ¿Cuánto vale la resistencia de salida realimentada $R_{of}$?`,
      unidad: 'Ω', valor: ro / D, dec: 1,
      datos: [T`R_o = ${q(ro, 'Ω')}`, T`D = ${D}`, '\\text{mide tensión}'], pide: T`$R_{of}$`,
      formula: T`R_{of} = \dfrac{R_o}{D}`, porque: 'Cuando se mide tensión a la salida, la resistencia de salida baja: se divide por D.',
      cuentas: [['Reemplazo', [T`R_{of} = \dfrac{${q(ro, 'Ω')}}{${D}}`]]], resultado: T`R_{of} = ${q(ro / D, 'Ω', 1)}` };
  } });
  opc({ id: 'topo_nombre', tema: 'Topologías', et: 'SENCILLA', gen() { return { enun: 'El nombre de cada topología de realimentación sale de dos preguntas. ¿Cuáles?', opciones: ['qué se mide a la salida (tensión o corriente) y cómo vuelve a la entrada (en serie o en paralelo)', 'cuánta ganancia tiene y cuánto ancho de banda', 'qué transistor usa y con qué fuente se alimenta'], ok: 0,
    explic: 'Mide tensión o corriente, y vuelve en serie o en paralelo. Con esas dos respuestas salen las cuatro topologías.' }; } });
  opc({ id: 'topo_ri', tema: 'Topologías', gen() { return { enun: T`Si la señal realimentada vuelve <b>en serie</b> con la entrada, la resistencia de entrada $R_i$…`, opciones: ['sube', 'baja', 'no cambia'], ok: 0,
    explic: 'Regla corta: vuelve en serie, R<sub>i</sub> sube. Vuelve en paralelo, R<sub>i</sub> baja.' }; } });
  opc({ id: 'topo_ro', tema: 'Topologías', gen() { return { enun: T`Si la realimentación <b>mide tensión</b> a la salida, la resistencia de salida $R_o$…`, opciones: ['baja', 'sube', 'no cambia'], ok: 0,
    explic: 'Regla corta: mide tensión, R<sub>o</sub> baja. Mide corriente, R<sub>o</sub> sube.' }; } });
  opc({ id: 'topo_op', tema: 'Topologías', et: 'CASO REAL', fig: () => fig('no_inversor', { R1: '', RF: '' }), gen() { return { enun: 'El operacional no inversor mide tensión a la salida y la devuelve en serie con la entrada. ¿Cómo quedan sus resistencias?', opciones: [T`$R_i$ alta y $R_o$ baja`, T`$R_i$ baja y $R_o$ alta`, T`las dos bajas`], ok: 0,
    explic: 'Vuelve en serie: R<sub>i</sub> sube. Mide tensión: R<sub>o</sub> baja. Es la combinación que todos quieren: por eso es la topología más usada.' }; } });

  // =================================================================== Ancho de banda
  num({ id: 'bw_fh', tema: 'Ancho de banda', gen(r) {
    const [A, b] = AB(r), D = 1 + b * A, fh = r.pick([8, 10, 20, 30]);
    return { fig: fig('curvas'), enun: T`Un amplificador tiene $A = ${N(A)}$, $\beta = ${N(b)}$ y frecuencia de corte superior $f_H = ${q(fh, 'kHz')}$. ¿Cuánto vale $f_{Hf}$ al realimentar, en kHz?`,
      unidad: 'kHz', valor: fh * D, dec: 1,
      datos: [T`A = ${N(A)}`, T`\beta = ${N(b)}`, T`f_H = ${q(fh, 'kHz')}`], pide: T`la nueva frecuencia de corte superior $f_{Hf}$`,
      formula: T`f_{Hf} = f_H \cdot D \qquad D = 1 + \beta A`, porque: 'La ganancia se divide por D y la frecuencia de corte superior se multiplica por D.',
      cuentas: [['Primero D', [T`D = 1 + ${N(b)} \cdot ${N(A)} = ${N(D, 2)}`]], ['Después f<sub>Hf</sub>', [T`f_{Hf} = ${q(fh, 'kHz')} \cdot ${N(D, 2)}`]]], resultado: T`f_{Hf} = ${q(fh * D, 'kHz', 1)}` };
  } });
  num({ id: 'bw_fl', tema: 'Ancho de banda', gen(r) {
    const [A, b] = AB(r), D = 1 + b * A, fl = r.pick([50, 90, 100, 120, 200]);
    return { fig: fig('curvas'), enun: T`Un amplificador tiene $A = ${N(A)}$, $\beta = ${N(b)}$ y frecuencia de corte inferior $f_L = ${q(fl, 'Hz')}$. ¿Cuánto vale $f_{Lf}$ al realimentar, en Hz?`,
      unidad: 'Hz', valor: fl / D, dec: 2,
      datos: [T`A = ${N(A)}`, T`\beta = ${N(b)}`, T`f_L = ${q(fl, 'Hz')}`], pide: T`la nueva frecuencia de corte inferior $f_{Lf}$`,
      formula: T`f_{Lf} = \dfrac{f_L}{D} \qquad D = 1 + \beta A`, porque: 'La frecuencia de corte inferior baja: se divide por D. Así la banda se abre para los dos lados.',
      cuentas: [['Primero D', [T`D = 1 + ${N(b)} \cdot ${N(A)} = ${N(D, 2)}`]], ['Después f<sub>Lf</sub>', [T`f_{Lf} = \dfrac{${q(fl, 'Hz')}}{${N(D, 2)}}`]]], resultado: T`f_{Lf} = ${q(fl / D, 'Hz', 2)}` };
  } });
  num({ id: 'bw_bwf', tema: 'Ancho de banda', gen(r) {
    const [A, b] = r.pick([[1000, 0.05], [500, 0.02], [1000, 0.02], [2000, 0.01], [400, 0.02]]), bw = r.pick([10, 20, 30]), D = 1 + b * A;
    return { fig: fig('curvas'), enun: T`Un amplificador con $A = ${N(A)}$ y ancho de banda $BW = ${q(bw, 'kHz')}$ se realimenta con $\beta = ${N(b)}$. ¿Cuánto vale el ancho de banda realimentado $BW_f$, en kHz?`,
      unidad: 'kHz', valor: bw * D, dec: 0,
      datos: [T`A = ${N(A)}`, T`BW = ${q(bw, 'kHz')}`, T`\beta = ${N(b)}`], pide: T`el ancho de banda realimentado $BW_f$`,
      formula: T`BW_f = BW \cdot D \qquad D = 1 + \beta A`, porque: 'Lo que se pierde de ganancia se gana en ancho de banda: el ancho de banda se multiplica por D.',
      cuentas: [['Primero D', [T`D = 1 + ${N(b)} \cdot ${N(A)} = ${N(D, 2)}`]], ['Después BW<sub>f</sub>', [T`BW_f = ${q(bw, 'kHz')} \cdot ${N(D, 2)}`]]],
      resultado: T`BW_f = ${q(bw * D, 'kHz', 0)}`, cierre: T`Control: $A \cdot BW = ${N(A)} \cdot ${q(bw, 'kHz')}$ da lo mismo que $A_f \cdot BW_f$. El producto no cambia.` };
  } });
  num({ id: 'bw_gbw', tema: 'Ancho de banda', et: 'CASO REAL', gen(r) {
    const gbw = r.pick([1, 3, 10]), af = r.pick([10, 20, 50, 100]), bw = gbw * 1000 / af;
    return { enun: T`La hoja de datos de un operacional dice $GBW = ${q(gbw, 'MHz')}$ (producto ganancia por ancho de banda). Si lo armás con ganancia $A_f = ${af}$, ¿qué ancho de banda te queda, en kHz?`,
      unidad: 'kHz', valor: bw, dec: 0,
      datos: [T`GBW = ${q(gbw, 'MHz')} = ${N(gbw * 1000)}\,\mathrm{kHz}`, T`A_f = ${af}`], pide: 'el ancho de banda con esa ganancia',
      formula: T`BW = \dfrac{GBW}{A_f}`, porque: 'El producto ganancia por ancho de banda es fijo: si pedís más ganancia, te queda menos ancho de banda.',
      cuentas: [['Reemplazo', [T`BW = \dfrac{${N(gbw * 1000)}\,\mathrm{kHz}}{${af}}`]]], resultado: T`BW = ${q(bw, 'kHz', 0)}` };
  } });
  num({ id: 'bw_db', tema: 'Ancho de banda', gen(r) {
    const A = r.pick([10, 20, 100, 200, 1000]), db = 20 * Math.log10(A);
    return { enun: T`Un amplificador tiene una ganancia de $${N(A)}$ veces. ¿Cuánto es en decibeles?`, unidad: 'dB', valor: db, dec: 1,
      datos: [T`A = ${N(A)}`], pide: 'la ganancia en decibeles',
      formula: T`A_{dB} = 20 \cdot \log A`, porque: 'Así se pasa una ganancia de veces a decibeles. Cada vez que se multiplica por 10, se suman 20 dB.',
      cuentas: [['Reemplazo', [T`A_{dB} = 20 \cdot \log ${N(A)} = 20 \cdot ${N(Math.log10(A), 3)}`]]], resultado: T`A_{dB} = ${q(db, 'dB', 1)}` };
  } });
  opc({ id: 'bw_curva', tema: 'Ancho de banda', fig: () => fig('curvas'), gen() { return { enun: 'Al realimentar, la curva de ganancia queda…', opciones: ['más baja y más ancha', 'más alta y más angosta', 'igual'], ok: 0,
    explic: 'La ganancia se divide por D (más baja) y el ancho de banda se multiplica por D (más ancha).' }; } });
  opc({ id: 'bw_fhq', tema: 'Ancho de banda', gen() { return { enun: T`Al realimentar, la frecuencia de corte superior $f_H$…`, opciones: [T`se multiplica por $D$`, T`se divide por $D$`, 'no cambia'], ok: 0,
    explic: T`$f_{Hf} = f_H \cdot D$ sube, y $f_{Lf} = f_L / D$ baja. La banda se abre para los dos lados.` }; } });
  opc({ id: 'bw_3db', tema: 'Ancho de banda', et: 'SENCILLA', gen() { return { enun: 'Las frecuencias de corte se toman en el punto donde la ganancia…', opciones: ['cayó al 70 % de la meseta (3 dB menos)', 'llega a cero', 'es la mitad de la entrada'], ok: 0,
    explic: 'En la frecuencia de corte la ganancia cayó 3 dB, que es el 70 % del valor de la meseta. Ahí empieza y termina el ancho de banda.' }; } });
  opc({ id: 'bw_prod', tema: 'Ancho de banda', gen() { return { enun: 'Al realimentar perdemos ganancia. ¿Qué pasa con esa ganancia que se pierde?', opciones: ['se convierte en ancho de banda: el producto ganancia por ancho de banda no cambia', 'se pierde en calor', 'vuelve a la fuente'], ok: 0,
    explic: T`$A \cdot BW = A_f \cdot BW_f$. Es el mismo producto: la ganancia que se pierde se gana en ancho de banda.` }; } });

  // =================================================================== Operacional no inversor
  num({ id: 'op_af', tema: 'Operacional', et: 'CASO REAL', gen(r) {
    const r1 = r.pick([1, 2.2, 4.7, 10]), rf = r.pick([10, 22, 47, 100]), af = 1 + rf / r1;
    return { fig: fig('no_inversor', { R1: qt(r1, 'kΩ'), RF: qt(rf, 'kΩ') }), enun: T`Con las resistencias del dibujo, ¿cuánto vale la ganancia $A_f$ del operacional no inversor?`, unidad: '', valor: af, dec: 2,
      datos: [T`R_1 = ${q(r1, 'kΩ')}`, T`R_f = ${q(rf, 'kΩ')}`], pide: T`la ganancia $A_f$`,
      formula: T`A_f = 1 + \dfrac{R_f}{R_1}`, porque: 'En el no inversor la ganancia la fijan las dos resistencias de la red β. Los kΩ se simplifican.',
      cuentas: [['Reemplazo', [T`A_f = 1 + \dfrac{${q(rf, 'kΩ')}}{${q(r1, 'kΩ')}} = 1 + ${N(rf / r1, 3)}`]]], resultado: T`A_f = ${N(af, 2)}` };
  } });
  num({ id: 'op_b', tema: 'Operacional', gen(r) {
    const r1 = r.pick([1, 2.2, 4.7, 10]), rf = r.pick([22, 47, 100]), b = r1 / (r1 + rf);
    return { fig: fig('no_inversor', { R1: qt(r1, 'kΩ'), RF: qt(rf, 'kΩ') }), enun: T`Con las resistencias del dibujo, ¿cuánto vale $\beta$, la parte de la salida que vuelve a la entrada?`, unidad: '', valor: b, dec: 4, tol: 0.03,
      datos: [T`R_1 = ${q(r1, 'kΩ')}`, T`R_f = ${q(rf, 'kΩ')}`], pide: T`$\beta$`,
      formula: T`\beta = \dfrac{R_1}{R_1 + R_f}`, porque: 'R<sub>f</sub> y R<sub>1</sub> forman un divisor de tensión: β es la parte de la salida que llega a la pata (−).',
      cuentas: [['Reemplazo', [T`\beta = \dfrac{${q(r1, 'kΩ')}}{${q(r1, 'kΩ')} + ${q(rf, 'kΩ')}}`]]], resultado: T`\beta = ${N(b, 4)}`, cierre: T`Control: $1/\beta = ${N(1 / b, 2)}$, que es la ganancia $A_f$ del mismo circuito.` };
  } });
  opc({ id: 'op_rf', tema: 'Operacional', fig: () => fig('no_inversor', { R1: '', RF: '' }), gen() { return { enun: T`En el operacional no inversor, ¿qué hace $R_f$?`, opciones: ['lleva una parte de la salida de vuelta a la entrada (−)', 'limita la corriente de la fuente', 'conecta la entrada (+) a masa'], ok: 0,
    explic: T`$R_f$ y $R_1$ son la red $\beta$: un divisor que devuelve una parte de la salida a la pata (−). Ahí se resta y aparece la realimentación negativa.` }; } });

  // =================================================================== TRIAC
  num({ id: 'tri_t', tema: 'TRIAC', et: 'CASO REAL', gen(r) {
    const a = r.pick([30, 45, 60, 90, 120, 135, 150]), t = a / 180 * 10;
    return { fig: fig('alfa' + a), enun: T`En la red de $50\,\mathrm{Hz}$, un dimmer dispara el TRIAC con el ángulo $\alpha$ del dibujo. ¿Cuántos milisegundos después del cruce por cero se dispara?`, unidad: 'ms', valor: t, dec: 2,
      datos: [T`\alpha = ${a}^\circ`, T`f = 50\,\mathrm{Hz}`, T`\text{semiciclo} = 10\,\mathrm{ms} = 180^\circ`], pide: 'el tiempo de disparo después del cruce por cero',
      formula: T`t = \dfrac{\alpha}{180^\circ} \cdot 10\,\mathrm{ms}`, porque: 'Un semiciclo de la red dura 10 ms y equivale a 180°. Es una regla de tres.',
      cuentas: [['Reemplazo', [T`t = \dfrac{${a}^\circ}{180^\circ} \cdot 10\,\mathrm{ms}`]]], resultado: T`t = ${q(t, 'ms', 2)}` };
  } });
  num({ id: 'tri_alfa', tema: 'TRIAC', gen(r) {
    const t = r.pick([2, 2.5, 4, 5, 6, 7.5, 8]), a = t / 10 * 180;
    return { fig: fig('alfa'), enun: T`En la red de $50\,\mathrm{Hz}$, el TRIAC se dispara $${q(t, 'ms', 1)}$ después del cruce por cero. ¿Cuánto vale el ángulo de disparo $\alpha$, en grados?`, unidad: '°', valor: a, dec: 0,
      datos: [T`t = ${q(t, 'ms', 1)}`, T`\text{semiciclo} = 10\,\mathrm{ms} = 180^\circ`], pide: T`el ángulo de disparo $\alpha$`,
      formula: T`\alpha = \dfrac{t}{10\,\mathrm{ms}} \cdot 180^\circ`, porque: 'Es la misma regla de tres al revés: 10 ms son 180°.',
      cuentas: [['Reemplazo', [T`\alpha = \dfrac{${q(t, 'ms', 1)}}{10\,\mathrm{ms}} \cdot 180^\circ`]]], resultado: T`\alpha = ${q(a, '°', 0)}` };
  } });
  opc({ id: 'tri_patas', tema: 'TRIAC', et: 'SENCILLA', fig: () => fig('triac_simbolo'), gen() { return { enun: 'Las tres patas del TRIAC son…', opciones: ['MT1, MT2 y la puerta G', 'drenador, surtidor y puerta', 'ánodo, cátodo y base'], ok: 0,
    explic: 'MT1 y MT2 son los terminales principales, por donde pasa la corriente de la carga. G es la puerta, por donde entra el pulso de disparo.' }; } });
  opc({ id: 'tri_conduce', tema: 'TRIAC', fig: () => fig('triac_simbolo'), gen() { return { enun: 'El TRIAC conduce…', opciones: ['en los dos sentidos, después de recibir un pulso en la puerta', 'en un solo sentido, siempre', 'en los dos sentidos, sin necesidad de pulso'], ok: 0,
    explic: 'Es una llave para corriente alterna: conduce en los dos semiciclos, pero solo después del pulso en G.' }; } });
  opc({ id: 'tri_apaga', tema: 'TRIAC', gen() { return { enun: 'Una vez disparado, ¿cuándo se apaga el TRIAC?', opciones: ['solo, en cada cruce por cero, cuando la corriente baja de la de mantenimiento', 'cuando se le saca el pulso de la puerta', 'nunca, hay que desenchufarlo'], ok: 0,
    explic: T`Sacar el pulso no lo apaga. Se apaga solo cuando la corriente baja de $I_H$, la corriente de mantenimiento, y eso pasa en cada cruce por cero.` }; } });
  opc({ id: 'tri_alfaluz', tema: 'TRIAC', fig: () => fig('alfa120'), gen() { return { enun: T`En un dimmer, si el disparo llega más tarde ($\alpha$ más grande), la lámpara…`, opciones: ['da menos luz', 'da más luz', 'queda igual'], ok: 0,
    explic: 'Con α más grande el TRIAC conduce menos parte de cada semiciclo: le llega menos energía a la lámpara y da menos luz.' }; } });
  opc({ id: 'tri_90', tema: 'TRIAC', fig: () => fig('alfa90'), gen() { return { enun: T`Con $\alpha = 90^\circ$, ¿cuánta potencia le llega a una lámpara?`, opciones: ['la mitad', 'toda', 'nada'], ok: 0,
    explic: 'Con 90° el TRIAC conduce la segunda mitad de cada semiciclo. Con una carga como una lámpara, le llega la mitad de la potencia.' }; } });
  opc({ id: 'tri_diac', tema: 'TRIAC', fig: () => fig('dimmer'), gen() { return { enun: 'En el dimmer del dibujo, ¿qué hace el DIAC?', opciones: ['dispara al TRIAC cuando el capacitor llega a su tensión de disparo', 'guarda energía como una pila', 'limita la corriente de la lámpara'], ok: 0,
    explic: 'El pote y el capacitor se cargan. Cuando el capacitor llega a la tensión del DIAC, el DIAC conduce y le da el pulso a la puerta del TRIAC. Moviendo el pote cambia α.' }; } });
  opc({ id: 'tri_semi', tema: 'TRIAC', et: 'SENCILLA', gen() { return { enun: 'En la red de 220 V y 50 Hz, ¿cuánto dura un semiciclo?', opciones: ['10 ms', '20 ms', '50 ms'], ok: 0,
    explic: T`Un ciclo dura $\dfrac{1}{50\,\mathrm{Hz}} = 20\,\mathrm{ms}$. Medio ciclo son 10 ms, que equivalen a 180°.` }; } });
  opc({ id: 'tri_donde', tema: 'TRIAC', et: 'GENUINA', gen() { return { enun: '¿En cuál de estos aparatos de tu casa es más probable encontrar un TRIAC?', opciones: ['en el regulador de velocidad de un ventilador de techo', 'en el cargador del celular', 'en el control remoto de la tele'], ok: 0,
    explic: 'El TRIAC regula potencia en corriente alterna de 220 V: dimmers, reguladores de ventiladores, taladros. El cargador y el control trabajan en continua.' }; } });

  window.BANCOS.e2 = window.BANCO = {
    curso: 'e2', nombre: 'Electrónica 2', anio: '5.° año',
    temas: ['MOSFET', 'Realimentación', 'Topologías', 'Ancho de banda', 'Operacional', 'TRIAC'],
    preguntas: P,
    actividades: [
      { id: 'sim1', nombre: 'Simulacro de examen 1', codigo: 'SIMU1', minutos: 50, opc: 5, num: 5, fotos: true, simulacro: true, abre: '2026-10-30T07:00:00-03:00', vence: '2026-10-30T11:10:00-03:00', tarde: '3446007388' },
      { id: 'sim2', nombre: 'Simulacro de examen 2', codigo: 'SIMU2', minutos: 50, opc: 5, num: 5, fotos: true, simulacro: true, abre: '2026-11-06T07:00:00-03:00', vence: '2026-11-06T11:10:00-03:00', tarde: '2194967439' },
    ],
    // ---------- repaso: todo lo que se pregunta sale de acá ----------
    repaso: [
      { tema: 'MOSFET', t: 'El MOSFET', foto: 'fotos/mosfet.jpg', pie: 'MOSFET de potencia IRFZ44N (encapsulado TO-220). Mirándolo de frente, las patas son G, D y S.', fig: () => fig('mos_simbolo'), items: [
        'MOSFET quiere decir <b>metal, óxido y semiconductor</b>. Tiene tres patas: <b>puerta (G)</b>, <b>drenador (D)</b> y <b>surtidor (S)</b>.',
        T`Lo controla la <b>tensión</b> entre puerta y surtidor, $V_{GS}$. Canal n: conduce si $V_{GS} > V_{TH}$, la tensión de umbral.`,
        'Entre la puerta y el canal hay una capa de <b>óxido</b>, que es aislante: por la puerta casi no entra corriente. Controla con el <b>campo eléctrico</b> (por eso es un transistor de efecto de campo).',
        T`Encendido es una resistencia muy chica, $R_{DS(on)}$, de milésimas de ohm. Como llave cerrada, toda la tensión queda en la carga.`,
        'Comparado con el BJT: un BJT saturado deja 0,2 V encima, un MOSFET centésimas de volt. Con la misma corriente, el MOSFET <b>calienta mucho menos</b>. Por eso lo usan los celulares, las fuentes y los controles de motor.'],
        fx: [T`V_{GS} > V_{TH} \Rightarrow \text{conduce}`, T`I_D = \dfrac{V_{DD}}{R_L}`, T`V_{DS} = I_D \cdot R_{DS(on)}`, T`P = I_D^{\,2} \cdot R_{DS(on)}`, T`P = V \cdot I`] },
      { tema: 'Realimentación', t: 'Realimentación negativa', fig: () => fig('bloques', { A: '', B: '' }), items: [
        T`Una parte de la salida vuelve por la red $\beta$ y se <b>resta</b> a la entrada. Si la salida crece de más, la corrección también crece: el amplificador se corrige solo.`,
        T`$A$ es la ganancia sin realimentar, $\beta$ la parte de la salida que vuelve y $\beta A$ la <b>ganancia de lazo</b>. $D = 1 + \beta A$ es el factor de realimentación.`,
        T`Se <b>pierde ganancia</b> (se divide por $D$). Se gana <b>estabilidad</b>, menos distorsión y ruido, y más ancho de banda.`,
        T`Si $\beta A \gg 1$, entonces $A_f \approx 1/\beta$: la ganancia la fijan dos resistencias y casi no cambia con el calor.`,
        'Si lo que vuelve se <b>suma</b> (realimentación positiva), el circuito oscila: es el chiflido del micrófono cerca del parlante.'],
        fx: [T`D = 1 + \beta \cdot A`, T`A_f = \dfrac{A}{D}`, T`\beta A \gg 1 \Rightarrow A_f \approx \dfrac{1}{\beta}`, T`\% = \dfrac{\text{antes} - \text{después}}{\text{antes}} \cdot 100`] },
      { tema: 'Topologías', t: 'Las cuatro topologías', tabla: [['mide', 'vuelve', T`$R_i$`, T`$R_o$`, 'nombre en el libro'], ['tensión', 'en serie', 'sube', 'baja', 'tensión en serie (el operacional no inversor)'], ['tensión', 'en paralelo', 'baja', 'baja', 'tensión en paralelo'], ['corriente', 'en serie', 'sube', 'sube', 'corriente en serie'], ['corriente', 'en paralelo', 'baja', 'sube', 'corriente en paralelo']], items: [
        'El nombre sale de dos preguntas: <b>qué se mide a la salida</b> (tensión o corriente) y <b>cómo vuelve a la entrada</b> (en serie o en paralelo).',
        T`Regla corta: <b>mide tensión</b> → $R_o$ baja. <b>Mide corriente</b> → $R_o$ sube. <b>Vuelve en serie</b> → $R_i$ sube. <b>Vuelve en paralelo</b> → $R_i$ baja.`,
        T`Lo que sube se multiplica por $D$ y lo que baja se divide por $D$.`],
        fx: [T`R_{if} = R_i \cdot D \ \ (\text{serie})`, T`R_{of} = \dfrac{R_o}{D} \ \ (\text{mide tensión})`] },
      { tema: 'Ancho de banda', t: 'Ancho de banda', fig: () => fig('curvas'), items: [
        'El ancho de banda va de la frecuencia de corte inferior a la superior. Las frecuencias de corte se toman donde la ganancia cayó <b>3 dB</b>, al 70 % de la meseta.',
        T`Al realimentar, la curva queda <b>más baja y más ancha</b>: $f_H$ se multiplica por $D$ y $f_L$ se divide por $D$.`,
        T`La ganancia que se pierde se convierte en ancho de banda: el producto $A \cdot BW$ <b>no cambia</b>. En las hojas de datos figura como GBW.`],
        fx: [T`f_{Hf} = f_H \cdot D`, T`f_{Lf} = \dfrac{f_L}{D}`, T`BW_f = BW \cdot D`, T`A \cdot BW = A_f \cdot BW_f`, T`BW = \dfrac{GBW}{A_f}`, T`A_{dB} = 20 \cdot \log A`] },
      { tema: 'Operacional', t: 'El operacional no inversor', foto: 'fotos/opamp.jpg', pie: 'Operacional µA741 en cápsula metálica. Adentro tiene decenas de transistores.', fig: () => fig('no_inversor', { R1: '', RF: '' }), items: [
        T`La señal entra por la pata (+). $R_f$ y $R_1$ forman la red $\beta$: un divisor que devuelve parte de la salida a la pata (−).`,
        T`Es realimentación de <b>tensión en serie</b>: $R_i$ alta y $R_o$ baja. La ganancia la fijan solo las dos resistencias.`],
        fx: [T`\beta = \dfrac{R_1}{R_1 + R_f}`, T`A_f = 1 + \dfrac{R_f}{R_1} = \dfrac{1}{\beta}`] },
      { tema: 'TRIAC', t: 'El TRIAC y el dimmer', foto3: 'fotos/triac.jpg', pie3: 'Un TRIAC de verdad (BTA08, encapsulado TO-220) en la plaqueta de un equipo industrial. Las tres patas son MT1, MT2 y G.', foto2: 'fotos/diac.jpg', pie2: 'Un DIAC: parece un diodo chiquito, pero conduce en los dos sentidos cuando llega a su tensión de disparo.', foto: 'fotos/dimmer_placa.jpg', pie: 'Un dimmer armado en una plaqueta: el pote, el capacitor, el DIAC y el TRIAC, con la lámpara que regula.', fig: () => fig('dimmer'), fig2: () => fig('alfa'), items: [
        'El TRIAC es una <b>llave para corriente alterna</b>. Tiene tres patas: <b>MT1, MT2 y la puerta G</b>. Conduce en los <b>dos sentidos</b>, después de un pulso en G.',
        T`Se <b>apaga solo</b> en cada cruce por cero, cuando la corriente baja de $I_H$. Sacar el pulso no lo apaga.`,
        'En el dimmer, el pote y el capacitor se cargan hasta que el <b>DIAC</b> conduce y dispara al TRIAC. Moviendo el pote cambia el ángulo de disparo α.',
        T`Más $\alpha$, el disparo llega más tarde y la lámpara da <b>menos luz</b>. Con $\alpha = 90^\circ$ le llega la mitad de la potencia.`,
        'Red de 50 Hz: un ciclo dura 20 ms y un semiciclo 10 ms, que son 180°. Se usa en dimmers, reguladores de ventilador y taladros.'],
        fx: [T`t = \dfrac{\alpha}{180^\circ} \cdot 10\,\mathrm{ms}`, T`\alpha = \dfrac{t}{10\,\mathrm{ms}} \cdot 180^\circ`, T`T = \dfrac{1}{f} = 20\,\mathrm{ms}`] },
    ],
  };
})();
