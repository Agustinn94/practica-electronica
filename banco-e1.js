// Electrónica 1 · 4.° año · 3.er trimestre: LED, fotodiodo, fototransistor, optoacoplador, LDR, panel solar y transistor como llave.
// Valores y fórmulas de las clases 50 y 51 y de los T.P. N.° 7 y 8.
(function () {
  const { T, N, q, qt, fig } = window.EX.H;
  const LEDS = [['rojo', 1.9], ['ámbar', 2.1], ['verde', 3.2], ['azul', 3.2], ['blanco', 3.2]];
  const P = [];
  const num = (o) => P.push(Object.assign({ tipo: 'num' }, o));
  const opc = (o) => P.push(Object.assign({ tipo: 'opc' }, o));

  // =================================================================== LED
  num({ id: 'led_r', tema: 'LED', gen(r) {
    const [col, vf] = r.pick(LEDS), vs = r.pick([5, 9, 12]), i = r.pick([10, 15, 20]), R = (vs - vf) / (i / 1000);
    return { fig: fig('led_serie', { VS: qt(vs, 'V'), R: '?', I: qt(i, 'mA'), LED: 'LED ' + col }),
      enun: T`Una fuente alimenta un LED <b>${col}</b> ($V_F = ${q(vf, 'V')}$) con una resistencia en serie, como en el dibujo. Querés que pase la corriente indicada. ¿Qué resistencia $R_S$ hace falta?`,
      unidad: 'Ω', valor: R, dec: 0,
      datos: [T`V_S = ${q(vs, 'V')}`, T`V_F = ${q(vf, 'V')}`, T`I = ${q(i, 'mA')} = ${q(i / 1000, 'A', 3)}`], pide: T`la resistencia en serie $R_S$`,
      formula: T`R_S = \dfrac{V_S - V_F}{I}`, porque: 'A la resistencia le queda lo que la fuente da menos lo que usa el LED. La corriente va en amper.',
      cuentas: [['Reemplazo', [T`R_S = \dfrac{${q(vs, 'V')} - ${q(vf, 'V')}}{${q(i / 1000, 'A', 3)}} = \dfrac{${q(vs - vf, 'V', 1)}}{${q(i / 1000, 'A', 3)}}`]]], resultado: T`R_S = ${q(R, 'Ω', 0)}` };
  } });
  num({ id: 'led_i', tema: 'LED', gen(r) {
    const [col, vf] = r.pick(LEDS), vs = r.pick([5, 9, 12]), R = r.pick([150, 220, 330, 470, 680]), I = (vs - vf) / R * 1000;
    return { fig: fig('led_serie', { VS: qt(vs, 'V'), R: qt(R, 'Ω'), I: '?', LED: 'LED ' + col }),
      enun: T`Un LED <b>${col}</b> ($V_F = ${q(vf, 'V')}$) está conectado como en el dibujo. ¿Cuántos mA pasan?`,
      unidad: 'mA', valor: I, dec: 2,
      datos: [T`V_S = ${q(vs, 'V')}`, T`V_F = ${q(vf, 'V')}`, T`R_S = ${q(R, 'Ω')}`], pide: T`la corriente $I$, en mA`,
      formula: T`I = \dfrac{V_S - V_F}{R_S}`, porque: 'Es la misma fórmula del LED, despejando la corriente. Sale en amper y se pasa a mA multiplicando por 1000.',
      cuentas: [['Reemplazo', [T`I = \dfrac{${q(vs, 'V')} - ${q(vf, 'V')}}{${q(R, 'Ω')}} = ${q(I / 1000, 'A', 5)}`]], ['A mA', [T`${N(I / 1000, 5)}\,\mathrm{A} \cdot 1000`]]], resultado: T`I = ${q(I, 'mA', 2)}` };
  } });
  num({ id: 'led_pr', tema: 'LED', gen(r) {
    const [col, vf] = r.pick(LEDS), vs = r.pick([9, 12]), i = r.pick([10, 15, 20]), p = (vs - vf) * i;
    return { fig: fig('led_serie', { VS: qt(vs, 'V'), R: '', I: qt(i, 'mA'), LED: 'LED ' + col }),
      enun: T`En el circuito del dibujo el LED es <b>${col}</b> ($V_F = ${q(vf, 'V')}$). ¿Cuánta potencia gasta la <b>resistencia</b>, en mW?`,
      unidad: 'mW', valor: p, dec: 1,
      datos: [T`V_S = ${q(vs, 'V')}`, T`V_F = ${q(vf, 'V')}`, T`I = ${q(i, 'mA')}`], pide: 'la potencia de la resistencia, en mW',
      formula: T`P_R = (V_S - V_F) \cdot I`, porque: 'La tensión de la resistencia es lo que sobra de la fuente. Con la corriente en mA, la potencia sale en mW.',
      cuentas: [['Reemplazo', [T`P_R = (${q(vs, 'V')} - ${q(vf, 'V')}) \cdot ${q(i, 'mA')} = ${q(vs - vf, 'V', 1)} \cdot ${q(i, 'mA')}`]]], resultado: T`P_R = ${q(p, 'mW', 1)}` };
  } });
  num({ id: 'led_pled', tema: 'LED', gen(r) {
    const [col, vf] = r.pick(LEDS), i = r.pick([10, 15, 20]), p = vf * i;
    return { fig: fig('led_serie', { VS: '', R: '', I: qt(i, 'mA'), LED: 'LED ' + col }),
      enun: T`Un LED <b>${col}</b> ($V_F = ${q(vf, 'V')}$) conduce la corriente del dibujo. ¿Cuánta potencia gasta el LED, en mW?`,
      unidad: 'mW', valor: p, dec: 1,
      datos: [T`V_F = ${q(vf, 'V')}`, T`I = ${q(i, 'mA')}`], pide: 'la potencia del LED',
      formula: T`P_{LED} = V_F \cdot I`, porque: 'La potencia es tensión por corriente. Con mA, sale en mW.',
      cuentas: [['Reemplazo', [T`P_{LED} = ${q(vf, 'V')} \cdot ${q(i, 'mA')}`]]], resultado: T`P_{LED} = ${q(p, 'mW', 1)}` };
  } });
  opc({ id: 'led_prende', tema: 'LED', gen() { return { enun: 'Un LED prende cuando…', opciones: [T`está en directa y la fuente le da más que su $V_F$`, 'está en inversa', 'tiene cualquier tensión, sin importar el sentido'], ok: 0,
    explic: T`Tienen que pasar dos cosas: que esté en <b>directa</b> (ánodo al +) y que la fuente supere su $V_F$.` }; } });
  opc({ id: 'led_color', tema: 'LED', et: 'SENCILLA', gen() { return { enun: '¿Qué decide el color de un LED?', opciones: ['el material del chip', 'el color del plástico de afuera', 'la corriente que pasa'], ok: 0,
    explic: 'El color lo pone el <b>material del chip</b>: cada material suelta luz de un color distinto. El plástico solo la deja salir.' }; } });
  opc({ id: 'led_blanco', tema: 'LED', et: 'SENCILLA', gen() { return { enun: 'Un LED blanco por dentro es…', opciones: ['un chip azul con una capa de fósforo amarillo', 'un chip que da luz blanca', 'una lamparita chiquita'], ok: 0,
    explic: 'No hay un chip blanco: es un chip azul tapado con fósforo amarillo. El azul y el amarillo juntos, el ojo los ve blancos.' }; } });
  opc({ id: 'led_rs', tema: 'LED', et: 'SENCILLA', fig: () => fig('led_serie', { VS: '', R: '', I: '', LED: 'LED' }), gen() { return { enun: 'La resistencia en serie con un LED sirve para…', opciones: ['limitar la corriente para que no se queme', 'que dé otro color', 'que la fuente no gaste cuando está apagado'], ok: 0,
    explic: 'Sin resistencia, la corriente sube sin control y el LED se quema. La resistencia fija la corriente.' }; } });
  opc({ id: 'led_quien', tema: 'LED', gen() { return { enun: 'Con una fuente de 9 V y un LED rojo, ¿quién gasta más potencia?', opciones: ['la resistencia', 'el LED', 'los dos lo mismo'], ok: 0,
    explic: T`Pasa la misma corriente por los dos. A la resistencia le quedan $9 - 1{,}9 = 7{,}1\,\mathrm{V}$ y al LED $1{,}9\,\mathrm{V}$: la resistencia gasta casi cuatro veces más.` }; } });

  // =================================================================== Fotodiodo
  num({ id: 'fd_v', tema: 'Fotodiodo', gen(r) {
    const i = r.pick([5, 10, 20, 30, 50]), R = r.pick([47, 100, 220]), v = i * R / 1000;
    return { fig: fig('fotodiodo', { VS: '9 V', R: qt(R, 'kΩ') }),
      enun: T`Con luz, el fotodiodo del dibujo deja pasar $${q(i, 'µA')}$, que pasan también por la resistencia. ¿Qué tensión aparece en la resistencia?`,
      unidad: 'V', valor: v, dec: 2,
      datos: [T`I = ${q(i, 'µA')} = ${N(i)} \cdot 10^{-6}\,\mathrm{A}`, T`R = ${q(R, 'kΩ')} = ${N(R * 1000)}\,\Omega`], pide: 'la tensión en la resistencia',
      formula: T`V = I \cdot R`, porque: 'Es la ley de Ohm. La corriente del fotodiodo es chiquita, por eso se usa una resistencia grande para leerla como tensión.',
      cuentas: [['Reemplazo', [T`V = ${N(i)} \cdot 10^{-6}\,\mathrm{A} \cdot ${N(R * 1000)}\,\Omega`]]], resultado: T`V = ${q(v, 'V', 2)}`, cierre: T`Atajo: $\mu\mathrm{A} \cdot \mathrm{k}\Omega$ da mV: $${N(i)} \cdot ${N(R)} = ${N(i * R)}\,\mathrm{mV}$.` };
  } });
  opc({ id: 'fd_modo', tema: 'Fotodiodo', et: 'SENCILLA', fig: () => fig('fotodiodo', { VS: '', R: '' }), gen() { return { enun: '¿Cómo se conecta un fotodiodo?', opciones: ['en inversa, o sin pila como una celda solar; nunca en directa', 'siempre en directa, como un LED', 'solo con corriente alterna'], ok: 0,
    explic: 'Con pila va en <b>inversa</b> y es rápido (el sensor del control remoto). Sin pila trabaja como <b>celda solar</b>. En directa sería un diodo común y no serviría para medir luz.' }; } });
  opc({ id: 'fd_al_reves', tema: 'Fotodiodo', gen() { return { enun: 'El LED convierte corriente en luz. El fotodiodo…', opciones: ['convierte luz en corriente', 'convierte luz en calor', 'también convierte corriente en luz'], ok: 0,
    explic: 'Es el LED al revés: le entra luz y sale corriente.' }; } });
  opc({ id: 'fd_mismo', tema: 'Fotodiodo', et: 'GENUINA', gen() { return { enun: 'El panel solar de un cargador y el sensor del control remoto de la tele…', opciones: ['son el mismo componente, un fotodiodo, trabajando de dos formas distintas', 'no tienen nada que ver', 'los dos son LDR'], ok: 0,
    explic: 'Los dos son fotodiodos. El panel trabaja sin pila y da energía. El del control trabaja en inversa, con pila, porque necesita ser rápido.' }; } });

  // =================================================================== Fototransistor
  num({ id: 'ft_vsal', tema: 'Fototransistor', et: 'CASO REAL', gen(r) {
    const [vcc, R, i] = r.pick([[5, 1, 2], [5, 2.2, 1.5], [12, 4.7, 1], [12, 2.2, 3], [9, 1, 5], [9, 4.7, 1.2]]), vs = vcc - i * R;
    return { fig: fig('fototransistor', { VCC: qt(vcc, 'V'), R: qt(R, 'kΩ') }),
      enun: T`Con luz, por el fototransistor del dibujo pasan $${q(i, 'mA')}$. ¿Cuánto vale la tensión de salida $V_{sal}$?`,
      unidad: 'V', valor: vs, dec: 2,
      datos: [T`V_{CC} = ${q(vcc, 'V')}`, T`R = ${q(R, 'kΩ')}`, T`I = ${q(i, 'mA')}`], pide: T`la tensión de salida $V_{sal}$`,
      formula: T`V_{sal} = V_{CC} - I \cdot R`, porque: 'La salida es lo que queda de la fuente después de lo que cae en la resistencia. Con mA y kΩ, la caída sale en volt.',
      cuentas: [['Caída en R', [T`V_R = ${q(i, 'mA')} \cdot ${q(R, 'kΩ')} = ${q(i * R, 'V', 2)}`]], ['Salida', [T`V_{sal} = ${q(vcc, 'V')} - ${q(i * R, 'V', 2)}`]]], resultado: T`V_{sal} = ${q(vs, 'V', 2)}`,
      cierre: 'A oscuras no pasa corriente y la salida queda en V<sub>CC</sub>. Con luz, la salida baja.' };
  } });
  opc({ id: 'ft_sens', tema: 'Fototransistor', fig: () => fig('fototransistor', { VCC: '', R: '' }), gen() { return { enun: 'Comparado con el fotodiodo, el fototransistor…', opciones: ['es más sensible, porque además amplifica', 'no necesita luz para funcionar', 'es un LED que mide temperatura'], ok: 0,
    explic: 'La luz hace de corriente de base y el transistor la amplifica: con la misma luz da mucha más corriente que un fotodiodo.' }; } });
  opc({ id: 'ft_oscuro', tema: 'Fototransistor', gen() { return { enun: T`En el circuito del fototransistor con la resistencia arriba, a oscuras la salida $V_{sal}$ queda…`, opciones: [T`en $V_{CC}$, porque no pasa corriente`, 'en 0 V', 'en 0,7 V'], ok: 0,
    explic: T`Sin luz el fototransistor no conduce, no cae tensión en $R$ y la salida queda en $V_{CC}$. Con luz conduce y la salida baja.` }; } });

  // =================================================================== Optoacoplador
  num({ id: 'opto_r', tema: 'Optoacoplador', et: 'CASO REAL', gen(r) {
    const vs = r.pick([5, 9, 12]), i = r.pick([10, 15, 20]), vf = 1.3, R = (vs - vf) / (i / 1000);
    return { fig: fig('led_serie', { VS: qt(vs, 'V'), R: '?', I: qt(i, 'mA'), LED: 'LED infrarrojo' }),
      enun: T`El LED de un optoacoplador es infrarrojo ($V_F = 1{,}3\,\mathrm{V}$). Con la fuente y la corriente del dibujo, ¿qué resistencia le ponés en serie?`,
      unidad: 'Ω', valor: R, dec: 0,
      datos: [T`V_S = ${q(vs, 'V')}`, T`V_F = 1{,}3\,\mathrm{V}`, T`I = ${q(i, 'mA')} = ${q(i / 1000, 'A', 3)}`], pide: T`la resistencia $R_S$`,
      formula: T`R_S = \dfrac{V_S - V_F}{I}`, porque: 'Adentro del optoacoplador hay un LED como cualquier otro: se calcula igual.',
      cuentas: [['Reemplazo', [T`R_S = \dfrac{${q(vs, 'V')} - 1{,}3\,\mathrm{V}}{${q(i / 1000, 'A', 3)}}`]]], resultado: T`R_S = ${q(R, 'Ω', 0)}` };
  } });
  opc({ id: 'opto_para', tema: 'Optoacoplador', fig: () => fig('opto'), gen() { return { enun: '¿Para qué sirve un optoacoplador?', opciones: ['para pasar una señal entre dos circuitos sin conectarlos, usando luz', 'para amplificar audio', 'para medir la temperatura'], ok: 0,
    explic: 'Aísla: los dos circuitos no se tocan eléctricamente. La señal pasa como luz de un lado al otro.' }; } });
  opc({ id: 'opto_adentro', tema: 'Optoacoplador', et: 'SENCILLA', fig: () => fig('opto'), gen() { return { enun: 'Adentro de un optoacoplador hay…', opciones: ['un LED y un fototransistor enfrentados', 'dos resistencias y una pila', 'un LDR y un parlante'], ok: 0,
    explic: 'De un lado un LED (casi siempre infrarrojo) y del otro un fototransistor, en una cápsula cerrada a la luz de afuera.' }; } });
  opc({ id: 'opto_220', tema: 'Optoacoplador', et: 'GENUINA', gen() { return { enun: 'Un Arduino tiene que prender una bomba de 220 V. ¿Por qué conviene poner un optoacoplador en el medio?', opciones: ['para que el Arduino quede aislado y la tensión de 220 V no lo pueda dañar', 'para que la bomba gire más rápido', 'para ahorrar cables'], ok: 0,
    explic: 'El optoacoplador pasa la orden como luz. Si en el lado de 220 V pasa algo, el Arduino no se entera porque los dos lados no están conectados.' }; } });

  // =================================================================== LDR
  num({ id: 'ldr_vx', tema: 'LDR', gen(r) {
    const vcc = r.pick([5, 9, 12]), rp = r.pick([4.7, 10, 22]), rl = r.pick([0.5, 1, 2, 10, 50, 90]), vx = vcc * rl / (rp + rl);
    return { fig: fig('ldr_div', { VCC: qt(vcc, 'V'), RA: qt(rp, 'kΩ'), RB: qt(rl, 'kΩ') }),
      enun: T`En el divisor del dibujo, el pote está arriba y el LDR abajo. ¿Cuánto vale $V_X$?`,
      unidad: 'V', valor: vx, dec: 2,
      datos: [T`V_{CC} = ${q(vcc, 'V')}`, T`R_P = ${q(rp, 'kΩ')}`, T`R_{LDR} = ${q(rl, 'kΩ')}`], pide: T`la tensión del punto X`,
      formula: T`V_X = V_{CC} \cdot \dfrac{R_{abajo}}{R_{arriba} + R_{abajo}}`, porque: 'Es un divisor de tensión: la resistencia de abajo se queda con su parte del total. Los kΩ se simplifican.',
      cuentas: [['Reemplazo', [T`V_X = ${q(vcc, 'V')} \cdot \dfrac{${q(rl, 'kΩ')}}{${q(rp, 'kΩ')} + ${q(rl, 'kΩ')}}`]]], resultado: T`V_X = ${q(vx, 'V', 2)}` };
  } });
  num({ id: 'ldr_veces', tema: 'LDR', gen(r) {
    const ro = r.pick([50, 100, 200]), rl = r.pick([100, 200, 500]), v = ro * 1000 / rl;
    return { fig: fig('ldr_div', { VCC: '', RA: '', RB: '?' }), enun: T`Un LDR tiene $${q(ro, 'kΩ')}$ a oscuras y $${q(rl, 'Ω')}$ con mucha luz. ¿Cuántas veces más chica queda su resistencia con luz?`,
      unidad: 'veces', valor: v, dec: 0,
      datos: [T`R_{oscuro} = ${q(ro, 'kΩ')} = ${N(ro * 1000)}\,\Omega`, T`R_{luz} = ${q(rl, 'Ω')}`], pide: 'cuántas veces más chica es',
      formula: T`\text{veces} = \dfrac{R_{oscuro}}{R_{luz}}`, porque: 'Para comparar, las dos resistencias tienen que estar en la misma unidad (Ω).',
      cuentas: [['Reemplazo', [T`\dfrac{${N(ro * 1000)}\,\Omega}{${q(rl, 'Ω')}}`]]], resultado: T`${N(v, 0)}\ \text{veces}` };
  } });
  opc({ id: 'ldr_luz', tema: 'LDR', et: 'SENCILLA', gen() { return { enun: 'Con más luz, la resistencia de un LDR…', opciones: ['baja', 'sube', 'no cambia'], ok: 0,
    explic: 'La luz suelta electrones en el material, que conduce mejor: <b>más luz, menos resistencia</b>.' }; } });
  opc({ id: 'ldr_noche', tema: 'LDR', fig: () => fig('ldr_div', { VCC: '', RA: '', RB: '' }), gen() { return { enun: T`En el divisor con el LDR abajo, cuando oscurece $V_X$…`, opciones: ['sube', 'baja', 'queda igual'], ok: 0,
    explic: T`De noche la resistencia del LDR crece mucho y se queda con casi toda la tensión: $V_X$ sube.` }; } });
  opc({ id: 'ldr_pote', tema: 'LDR', et: 'CASO REAL', fig: () => fig('ldr_div', { VCC: '', RA: '', RB: '' }), gen() { return { enun: 'La luz de jardín prende muy tarde, con la noche cerrada. Para que prenda antes, al pote de arriba…', opciones: ['le bajás los kΩ', 'le subís los kΩ', 'no lo tocás: hay que cambiar el LED'], ok: 0,
    explic: T`Con menos resistencia arriba, $V_X$ sube antes y pasa los $0{,}7\,\mathrm{V}$ del transistor cuando todavía hay algo de luz.` }; } });

  // =================================================================== Panel solar
  num({ id: 'pan_celda', tema: 'Panel solar', gen(r) {
    const n = r.pick([4, 5, 6, 8, 10]), vc = r.pick([0.4, 0.5]);
    return { fig: fig('panel' + n), enun: T`El panel del dibujo da $${q(n * vc, 'V', 1)}$ al sol. ¿Qué tensión da cada celda?`, unidad: 'V', valor: vc, dec: 1,
      datos: [T`n = ${n}\ \text{celdas en serie}`, T`V_{panel} = ${q(n * vc, 'V', 1)}`], pide: 'la tensión de una celda',
      formula: T`V_{celda} = \dfrac{V_{panel}}{n}`, porque: 'En serie las tensiones se suman: el total se reparte en partes iguales.',
      cuentas: [['Reemplazo', [T`V_{celda} = \dfrac{${q(n * vc, 'V', 1)}}{${n}}`]]], resultado: T`V_{celda} = ${q(vc, 'V', 1)}` };
  } });
  num({ id: 'pan_p', tema: 'Panel solar', et: 'CASO REAL', gen(r) {
    const v = r.pick([1.6, 2, 3, 6]), i = r.pick([2.6, 5, 20, 50, 100]), p = v * i;
    return { fig: fig('panel4'), enun: T`Un panel entrega $${q(v, 'V', 1)}$ y $${q(i, 'mA', 1)}$. ¿Qué potencia entrega, en mW?`, unidad: 'mW', valor: p, dec: 2,
      datos: [T`V = ${q(v, 'V', 1)}`, T`I = ${q(i, 'mA', 1)}`], pide: 'la potencia, en mW',
      formula: T`P = V \cdot I`, porque: 'Potencia es tensión por corriente. Con la corriente en mA, sale en mW.',
      cuentas: [['Reemplazo', [T`P = ${q(v, 'V', 1)} \cdot ${q(i, 'mA', 1)}`]]], resultado: T`P = ${q(p, 'mW', 2)}` };
  } });
  num({ id: 'pan_n', tema: 'Panel solar', gen(r) {
    const [vc, vt] = r.pick([[0.5, 3], [0.5, 6], [0.5, 9], [0.5, 12], [0.4, 2], [0.4, 6], [0.4, 12]]);
    return { fig: fig('panel'), enun: T`Cada celda da $${q(vc, 'V', 1)}$. ¿Cuántas celdas iguales en serie hacen falta para $${q(vt, 'V')}$?`, unidad: 'celdas', valor: vt / vc, dec: 0, tol: 0.001,
      datos: [T`V_{celda} = ${q(vc, 'V', 1)}`, T`V_{panel} = ${q(vt, 'V')}`], pide: T`la cantidad de celdas $n$`,
      formula: T`n = \dfrac{V_{panel}}{V_{celda}}`, porque: 'En serie se suman: hay que ver cuántas veces entra la tensión de una celda en la que querés.',
      cuentas: [['Reemplazo', [T`n = \dfrac{${q(vt, 'V')}}{${q(vc, 'V', 1)}}`]]], resultado: T`n = ${N(vt / vc, 0)}\ \text{celdas}` };
  } });
  opc({ id: 'pan_serie', tema: 'Panel solar', et: 'SENCILLA', fig: () => fig('panel4'), gen() { return { enun: 'Celdas solares conectadas en serie…', opciones: ['suman sus tensiones', 'suman sus corrientes', 'no cambian nada'], ok: 0,
    explic: 'Igual que las pilas de una linterna: en <b>serie</b> se suman las tensiones; en <b>paralelo</b>, las corrientes.' }; } });
  opc({ id: 'pan_paralelo', tema: 'Panel solar', et: 'SENCILLA', gen() { return { enun: 'Celdas solares conectadas en paralelo…', opciones: ['suman sus corrientes', 'suman sus tensiones', 'se anulan entre sí'], ok: 0,
    explic: 'En paralelo todas tienen la misma tensión y se suman las corrientes.' }; } });
  opc({ id: 'pan_es', tema: 'Panel solar', gen() { return { enun: 'Una celda solar se porta como…', opciones: ['una pila chiquita que funciona mientras haya luz', 'una resistencia que se calienta', 'un capacitor que guarda la luz'], ok: 0,
    explic: 'Es un fotodiodo grande sin pila: la luz suelta electrones en la unión PN y aparece una tensión entre sus contactos.' }; } });

  // =================================================================== Transistor como llave
  num({ id: 'tr_ib', tema: 'Transistor', gen(r) {
    const vx = r.pick([3, 5, 6.9, 8.1, 9]), rb = r.pick([22, 33, 47, 68]), ib = (vx - 0.7) / (rb * 1000) * 1e6;
    return { fig: fig('tr_llave', { VCC: '12 V', RC: '470 Ω', RB: qt(rb, 'kΩ'), VX: qt(vx, 'V', 1), BETA: '100' }),
      enun: T`Con los valores del dibujo, ¿cuánto vale la corriente de base $I_B$, en µA?`, unidad: 'µA', valor: ib, dec: 0,
      datos: [T`V_X = ${q(vx, 'V', 1)}`, T`V_{BE} = 0{,}7\,\mathrm{V}`, T`R_B = ${q(rb, 'kΩ')} = ${N(rb * 1000)}\,\Omega`], pide: T`la corriente de base $I_B$`,
      formula: T`I_B = \dfrac{V_X - 0{,}7\,\mathrm{V}}{R_B}`, porque: 'A la base le llegan 0,7 V menos, porque la juntura base-emisor es un diodo. Sale en amper y se pasa a µA multiplicando por 1.000.000.',
      cuentas: [['Reemplazo', [T`I_B = \dfrac{${q(vx, 'V', 1)} - 0{,}7\,\mathrm{V}}{${N(rb * 1000)}\,\Omega} = ${N(ib / 1e6, 6)}\,\mathrm{A}`]]], resultado: T`I_B = ${q(ib, 'µA', 0)}` };
  } });
  num({ id: 'tr_icsat', tema: 'Transistor', et: 'CASO REAL', gen(r) {
    const [col, vf] = r.pick(LEDS), vcc = r.pick([9, 12]), rc = r.pick([220, 330, 470, 560, 680]), ic = (vcc - vf - 0.2) / rc * 1000;
    return { fig: fig('tr_llave', { VCC: qt(vcc, 'V'), RC: qt(rc, 'Ω'), RB: '', VX: '', BETA: '' }),
      enun: T`El transistor del dibujo prende un LED <b>${col}</b> ($V_F = ${q(vf, 'V')}$). ¿Cuánto vale la corriente de saturación $I_{C(sat)}$, en mA?`, unidad: 'mA', valor: ic, dec: 1,
      datos: [T`V_{CC} = ${q(vcc, 'V')}`, T`V_F = ${q(vf, 'V')}`, T`V_{CE(sat)} = 0{,}2\,\mathrm{V}`, T`R_C = ${q(rc, 'Ω')}`], pide: T`la corriente máxima de colector $I_{C(sat)}$`,
      formula: T`I_{C(sat)} = \dfrac{V_{CC} - V_F - 0{,}2\,\mathrm{V}}{R_C}`, porque: 'Saturado, al transistor le quedan 0,2 V. Lo que sobra de la fuente, sacando el LED, queda en R<sub>C</sub>.',
      cuentas: [['Reemplazo', [T`I_{C(sat)} = \dfrac{${q(vcc, 'V')} - ${q(vf, 'V')} - 0{,}2\,\mathrm{V}}{${q(rc, 'Ω')}} = ${N(ic / 1000, 5)}\,\mathrm{A}`]]], resultado: T`I_{C(sat)} = ${q(ic, 'mA', 1)}` };
  } });
  num({ id: 'tr_bib', tema: 'Transistor', gen(r) {
    const b = r.pick([80, 100, 120, 150]), ib = r.pick([50, 100, 150, 200]), ic = b * ib / 1000;
    return { fig: fig('tr_llave', { VCC: '', RC: '', RB: '', VX: '', BETA: qt(b, '') }), enun: T`El transistor del dibujo recibe $I_B = ${q(ib, 'µA')}$. ¿Cuánto vale $\beta \cdot I_B$, en mA?`, unidad: 'mA', valor: ic, dec: 1,
      datos: [T`\beta = ${b}`, T`I_B = ${q(ib, 'µA')}`], pide: T`la corriente $\beta \cdot I_B$, en mA`,
      formula: T`I_C = \beta \cdot I_B`, porque: 'El transistor multiplica la corriente de base por β. De µA a mA se divide por 1000.',
      cuentas: [['Reemplazo', [T`I_C = ${b} \cdot ${q(ib, 'µA')} = ${N(b * ib)}\,\mu\mathrm{A}`]]], resultado: T`I_C = ${q(ic, 'mA', 1)}` };
  } });
  opc({ id: 'tr_07', tema: 'Transistor', et: 'SENCILLA', gen() { return { enun: 'Para que un NPN de silicio conduzca, en la base tiene que haber más de…', opciones: [T`$0{,}7\,\mathrm{V}$`, T`$0{,}2\,\mathrm{V}$`, T`$5\,\mathrm{V}$`], ok: 0,
    explic: 'La juntura base-emisor es un diodo de silicio: conduce a partir de unos 0,7 V.' }; } });
  opc({ id: 'tr_corte', tema: 'Transistor', et: 'SENCILLA', gen() { return { enun: 'En corte, el transistor se porta como…', opciones: ['una llave abierta', 'una llave cerrada', 'un LED'], ok: 0,
    explic: T`Sin corriente de base no pasa corriente de colector: $I_C = 0$, llave abierta. Saturado es la llave cerrada.` }; } });
  opc({ id: 'tr_sat', tema: 'Transistor', gen(r) {
    const b = r.pick([100, 120]), ib = r.pick([150, 200]), ics = r.pick([10, 14.7, 18.3, 25, 30]), sat = b * ib / 1000 > ics;
    return { enun: T`En un transistor, $\beta \cdot I_B = ${q(b * ib / 1000, 'mA', 1)}$ e $I_{C(sat)} = ${q(ics, 'mA', 1)}$. ¿Cómo está el transistor?`, opciones: ['saturado: llave cerrada', 'en zona activa', 'en corte: llave abierta'], ok: sat ? 0 : 1,
      explic: sat ? T`$\beta \cdot I_B$ es más grande que $I_{C(sat)}$: no puede pasar tanto, así que se satura y pasa $I_{C(sat)}$.` : T`$\beta \cdot I_B$ no llega a $I_{C(sat)}$: conduce, pero en zona activa, no del todo cerrado.` };
  } });

  window.BANCOS.e1 = window.BANCO = {
    curso: 'e1', nombre: 'Electrónica 1', anio: '4.° año',
    temas: ['LED', 'Fotodiodo', 'Fototransistor', 'Optoacoplador', 'LDR', 'Panel solar', 'Transistor'],
    preguntas: P,
    actividades: [
      { id: 'sim1', nombre: 'Simulacro de examen 1', codigo: 'SIMU1', minutos: 50, opc: 5, num: 5, fotos: true, simulacro: true, abre: '2026-10-30T07:00:00-03:00', vence: '2026-10-30T12:40:00-03:00', tarde: '3446007388' },
      { id: 'sim2', nombre: 'Simulacro de examen 2', codigo: 'SIMU2', minutos: 50, opc: 5, num: 5, fotos: true, simulacro: true, abre: '2026-11-06T07:00:00-03:00', vence: '2026-11-06T12:40:00-03:00', tarde: '2194967439' },
    ],
    repaso: [
      { tema: 'LED', t: 'El LED', foto: 'fotos/leds.jpg', pie: 'LED de distintos colores y tamaños. La pata más larga es el ánodo (+).', fig: () => fig('led_serie', { VS: '', R: '', I: '', LED: 'LED' }), items: [
        T`Es un diodo que da luz cuando conduce <b>en directa</b> y la fuente supera su $V_F$.`,
        'El color lo pone el <b>material del chip</b>. El LED blanco es un chip azul con una capa de fósforo amarillo.',
        T`$V_F$ típica: infrarrojo $1{,}3\,\mathrm{V}$ · rojo $1{,}9\,\mathrm{V}$ · ámbar $2{,}1\,\mathrm{V}$ · verde, azul y blanco $3{,}2\,\mathrm{V}$. Corriente típica de un LED indicador: 10 a 20 mA.`,
        'Siempre lleva una <b>resistencia en serie</b> que limita la corriente. Sin ella se quema. A la resistencia le queda lo que sobra de la fuente.'],
        fx: [T`R_S = \dfrac{V_S - V_F}{I}`, T`I = \dfrac{V_S - V_F}{R_S}`, T`P_{LED} = V_F \cdot I`, T`P_R = (V_S - V_F) \cdot I`] },
      { tema: 'Fotodiodo', t: 'El fotodiodo', foto: 'fotos/fotodiodo.jpg', pie: 'Un fotodiodo visto de cerca: el cuadrado azul del medio es el chip que recibe la luz.', fig: () => fig('fotodiodo', { VS: '', R: '' }), items: [
        'Le entra luz y sale corriente: es el <b>LED al revés</b>.',
        'Trabaja <b>en inversa</b>, con pila (rápido: el sensor del control remoto), o <b>sin pila</b>, como celda solar. En directa, nunca.',
        'Su corriente es muy chica (µA). Se la hace pasar por una resistencia grande para leerla como tensión.'],
        fx: [T`V = I \cdot R`, T`\mu\mathrm{A} \cdot \mathrm{k}\Omega = \mathrm{mV}`] },
      { tema: 'Fototransistor', t: 'El fototransistor', foto: 'fotos/fototransistor.jpg', pie: 'Fototransistor en cápsula metálica, con una ventanita arriba para que entre la luz.', fig: () => fig('fototransistor', { VCC: '', R: '' }), items: [
        'Es un transistor donde la <b>luz hace de corriente de base</b>. Como amplifica, es <b>más sensible</b> que el fotodiodo.',
        T`Con la resistencia arriba: a oscuras no conduce y la salida queda en $V_{CC}$; con luz conduce y la salida baja.`],
        fx: [T`V_R = I \cdot R`, T`V_{sal} = V_{CC} - I \cdot R`] },
      { tema: 'Optoacoplador', t: 'El optoacoplador', foto: 'fotos/opto.jpg', pie: 'Optoacoplador 4N25: por fuera es un integrado de 6 patas. Abiertos, se ven el LED y el fototransistor enfrentados.', fig: () => fig('opto'), items: [
        'Adentro tiene un <b>LED y un fototransistor enfrentados</b>, en una cápsula cerrada.',
        'Pasa una señal entre dos circuitos <b>sin conectarlos</b>: la señal viaja como luz. Así se protege, por ejemplo, un Arduino de un circuito de 220 V.',
        'Su LED (infrarrojo, 1,3 V) se calcula como cualquier LED.'],
        fx: [T`R_S = \dfrac{V_S - 1{,}3\,\mathrm{V}}{I}`] },
      { tema: 'LDR', t: 'El LDR', foto: 'fotos/ldr.jpg', pie: 'LDR: la pista con forma de víbora es el material que cambia su resistencia con la luz.', fig: () => fig('ldr_div', { VCC: '', RA: '', RB: '' }), items: [
        'Es una resistencia que cambia con la luz: <b>más luz, menos resistencia</b>.',
        'Se usa en un <b>divisor de tensión</b> con un pote para leer la luz.',
        T`Con el LDR abajo, de noche $V_X$ sube. Si le bajás los kΩ al pote de arriba, la luz de jardín prende antes.`],
        fx: [T`V_X = V_{CC} \cdot \dfrac{R_{abajo}}{R_{arriba} + R_{abajo}}`, T`\text{veces} = \dfrac{R_{oscuro}}{R_{luz}}`] },
      { tema: 'Panel solar', t: 'La celda y el panel solar', foto: 'fotos/celda.jpg', pie: 'Celda solar de silicio. Las líneas blancas juntan la corriente; un panel tiene muchas de estas en serie.', fig: () => fig('panel4'), items: [
        'La celda es un fotodiodo grande sin pila: con luz se porta como una <b>pila chiquita</b>.',
        'En <b>serie</b> se suman las tensiones; en <b>paralelo</b>, las corrientes.'],
        fx: [T`V_{panel} = n \cdot V_{celda}`, T`n = \dfrac{V_{panel}}{V_{celda}}`, T`P = V \cdot I`] },
      { tema: 'Transistor', t: 'El transistor como llave', foto: 'fotos/transistores.jpg', pie: 'Transistores BJT de distintos tamaños. El chiquito de plástico negro, de 3 patas, es el que se usa como llave.', fig: () => fig('tr_llave', { VCC: '', RC: '', RB: '', VX: '', BETA: '' }), items: [
        T`NPN de silicio: conduce si en la base hay más de $0{,}7\,\mathrm{V}$.`,
        T`<b>Corte</b>: llave abierta, $I_C = 0$. <b>Saturación</b>: llave cerrada, le quedan $0{,}2\,\mathrm{V}$ y pasa $I_{C(sat)}$.`,
        T`Si $\beta \cdot I_B$ es mayor que $I_{C(sat)}$, está saturado. Si no llega, está en zona activa.`],
        fx: [T`I_B = \dfrac{V_X - 0{,}7\,\mathrm{V}}{R_B}`, T`I_C = \beta \cdot I_B`, T`I_{C(sat)} = \dfrac{V_{CC} - V_F - 0{,}2\,\mathrm{V}}{R_C}`] },
    ],
  };
})();
