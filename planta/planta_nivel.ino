// ================================================================
//  PLANTA DE NIVEL · Electrónica Industrial 1 · 6.º año · IAT F-77
//  Lazo de control completo con un solo ESP32:
//    - Elemento primario de medida: sensor de ultrasonido HC-SR04
//    - Controlador: el ESP32 (control todo-nada con histéresis)
//    - Elemento final de control: válvula de pinza con servo SG90
//  La válvula esférica se abre a mano: es el consumo que baja el nivel.
//
//  Celular: red WiFi "Planta-EI1", clave 12345678,
//  y en el navegador se escribe 192.168.4.1 (no hace falta internet).
//  Lic. Gutiérrez
// ================================================================
#define USAR_WIFI 1          // en el simulador Wokwi va 0

#include <WiFi.h>
#include <WebServer.h>
#include <ESP32Servo.h>      // librería "ESP32Servo" de Kevin Harrington
#include <Preferences.h>     // guarda la calibración aunque se corte la luz

// ---------------- PINES (los mismos de la guía) -----------------
#define PIN_TRIG   5         // HC-SR04 TRIG
#define PIN_ECHO  18         // HC-SR04 ECHO, a través del divisor 1 kΩ + 2 kΩ
#define PIN_PINZA 27         // servo de la pinza, cable naranja

// ---------------- CALIBRACIÓN ------------------------------------
// Estos son los valores de fábrica. Se cambian desde el celular
// (tarjeta "Calibración") y quedan guardados en el ESP32.
float DIST_VACIO_CM = 25.0;  // distancia del sensor al fondo, tanque vacío
float DIST_LLENO_CM =  5.0;  // distancia del sensor al agua, tanque lleno
int   PINZA_ABIERTA =  0;    // ángulo que deja pasar el agua
int   PINZA_CERRADA = 70;    // ángulo que aplasta la manguera
int   NIVEL_BAJO    = 30;    // % : abajo de esto la pinza ABRE (llena)
int   NIVEL_ALTO    = 80;    // % : arriba de esto la pinza CIERRA

// ---------------- VARIABLES -------------------------------------
Servo pinza;
Preferences memoria;
float distancia = NAN, nivel = NAN;
bool  pinzaAbierta = false;
bool  modoAuto = true;                 // automático = lazo cerrado
unsigned long finDosis = 0, tMedida = 0, tSerie = 0;

#if USAR_WIFI
WebServer server(80);
#endif

// ---------------- MEDIR -----------------------------------------
float medirDistanciaCm() {
  digitalWrite(PIN_TRIG, LOW);  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH); delayMicroseconds(10);   // orden: "medí ahora"
  digitalWrite(PIN_TRIG, LOW);
  unsigned long t = pulseIn(PIN_ECHO, HIGH, 30000);      // espera el eco (máx 30 ms)
  if (t == 0) return NAN;                                // no volvió eco
  float d = t * 0.0343 / 2.0;                            // el sonido va y vuelve
  if (d < 2.0 || d > 400.0) return NAN;                  // fuera de rango
  return d;
}

float nivelPorciento(float d) {
  if (isnan(d)) return NAN;
  float n = (DIST_VACIO_CM - d) / (DIST_VACIO_CM - DIST_LLENO_CM) * 100.0;
  return constrain(n, 0.0, 100.0);
}

float a_mA(float p) { return 4.0 + 16.0 * p / 100.0; }  // 0 % = 4 mA, 100 % = 20 mA

void cargarCalibracion() {
  memoria.begin("planta", true);
  DIST_VACIO_CM = memoria.getFloat("vacio", DIST_VACIO_CM);
  DIST_LLENO_CM = memoria.getFloat("lleno", DIST_LLENO_CM);
  PINZA_ABIERTA = memoria.getInt("pa", PINZA_ABIERTA);
  PINZA_CERRADA = memoria.getInt("pc", PINZA_CERRADA);
  NIVEL_BAJO    = memoria.getInt("nb", NIVEL_BAJO);
  NIVEL_ALTO    = memoria.getInt("na", NIVEL_ALTO);
  memoria.end();
}

void guardarCalibracion() {
  memoria.begin("planta", false);
  memoria.putFloat("vacio", DIST_VACIO_CM);
  memoria.putFloat("lleno", DIST_LLENO_CM);
  memoria.putInt("pa", PINZA_ABIERTA);
  memoria.putInt("pc", PINZA_CERRADA);
  memoria.putInt("nb", NIVEL_BAJO);
  memoria.putInt("na", NIVEL_ALTO);
  memoria.end();
}

// ---------------- ACTUAR ----------------------------------------
void moverPinza(bool abrir) {
  pinzaAbierta = abrir;
  pinza.write(abrir ? PINZA_ABIERTA : PINZA_CERRADA);
}

// Control todo-nada con histéresis: entre NIVEL_BAJO y NIVEL_ALTO no cambia nada
void controlar() {
  if (!modoAuto || finDosis != 0 || isnan(nivel)) return;
  if (nivel <= NIVEL_BAJO && !pinzaAbierta) moverPinza(true);
  if (nivel >= NIVEL_ALTO &&  pinzaAbierta) moverPinza(false);
}

#if USAR_WIFI
// ---------------- PÁGINA DEL CELULAR ----------------------------
const char PAGINA[] PROGMEM = R"=====(
<!DOCTYPE html><html><head><meta charset='utf-8'>
<meta name='viewport' content='width=device-width,initial-scale=1'>
<title>Planta de nivel</title>
<style>
body{margin:0;background:#0d1b2a;color:#eef4ff;font-family:sans-serif;text-align:center}
h1{font-size:22px;margin:14px 0 2px}.sub{color:#a9bdd6;font-size:13px;margin-bottom:10px}
.c{background:#14263b;border-radius:16px;padding:12px;margin:10px}
.t{font-size:14px;color:#a9bdd6}.v{font-size:54px;font-weight:bold}.m{font-size:15px;color:#22d3ee}
.tq{height:150px;width:90px;margin:8px auto;border:3px solid #60a5fa;border-top:none;border-radius:0 0 12px 12px;position:relative;overflow:hidden}
#agua{position:absolute;bottom:0;width:100%;background:#38bdf8;transition:height .6s}
.lin{position:absolute;left:0;right:0;border-top:2px dashed #ffb020}
.e{display:inline-block;padding:6px 16px;border-radius:20px;font-weight:bold;color:#000;font-size:18px}
.ab{background:#34d399}.ce{background:#f87171}
button{font-size:17px;margin:4px;padding:11px 14px;border:none;border-radius:12px;background:#22d3ee;color:#000;font-weight:bold}
button.s{background:#1b3350;color:#fff}input{width:64px;font-size:17px;border-radius:8px;border:none;padding:6px}
</style></head><body>
<h1>Planta de nivel</h1><div class='sub'>Electrónica Industrial 1 · IAT F-77</div>
<div class='c'><div class='t'>Nivel del tanque</div>
 <div class='tq'><div id='agua' style='height:0'></div><div class='lin' id='la'></div><div class='lin' id='lb'></div></div>
 <div class='v' id='niv'>--</div><div class='m' id='dis'>-- cm</div><div class='m' id='ma'>-- mA</div></div>
<div class='c'><div class='t'>Válvula de pinza (entrada)</div><p><span class='e' id='pin'>--</span></p>
 <button onclick="cmd('pin=1')">Abrir</button><button onclick="cmd('pin=0')">Cerrar</button><br>
 <button onclick="cmd('dosis='+seg.value)">Dosificar</button> <input id='seg' type='number' value='2' min='1' max='30'> s</div>
<div class='c'><div class='t'>Modo</div><p id='mod'>--</p>
 <button onclick="cmd('auto=1')">Automático</button><button class='s' onclick="cmd('auto=0')">Manual</button>
 <div class='m'>Abre al bajar del <span id='nb'></span> % y cierra al llegar al <span id='na'></span> %</div></div>
<div class='c'><div class='t'>Calibración (queda guardada en el ESP32)</div>
 <p class='m'>Tanque vacío: <b id='cv'>--</b> cm · lleno: <b id='cl'>--</b> cm</p>
 <button onclick="cmd('tomar=vacio')">Tomar como VACÍO</button><button onclick="cmd('tomar=lleno')">Tomar como LLENO</button>
 <p class='m'>Pinza abierta: <b id='cpa'>--</b>° · cerrada: <b id='cpc'>--</b>°</p>
 <input id='ang' type='number' value='70'> <button class='s' onclick="cmd('ang='+ang.value)">Probar ángulo</button><br>
 <button class='s' onclick="cmd('pa='+ang.value)">Guardar como ABIERTA</button><button class='s' onclick="cmd('pc='+ang.value)">Guardar como CERRADA</button>
 <p class='m'>Abre al bajar del <input id='inb' type='number'> % y cierra al llegar al <input id='ina' type='number'> %</p>
 <button class='s' onclick="cmd('nb='+inb.value+'&na='+ina.value)">Guardar niveles</button></div>
<script>
function cmd(c){fetch('/cmd?'+c).then(leer);}
async function leer(){try{
 let s=await (await fetch('/estado')).json();
 niv.innerText=(s.nivel===null)?'--':Math.round(s.nivel)+' %';
 agua.style.height=(s.nivel===null?0:s.nivel)+'%';
 dis.innerText=(s.dist===null)?'sin eco':s.dist.toFixed(1)+' cm';
 ma.innerText=(s.nivel===null)?'-- mA':(4+16*s.nivel/100).toFixed(1)+' mA';
 pin.innerText=s.pin?'ABIERTA':'CERRADA'; pin.className='e '+(s.pin?'ab':'ce');
 mod.innerText=s.auto?'AUTOMÁTICO (lazo cerrado)':'MANUAL (lazo abierto)';
 nb.innerText=s.nb; na.innerText=s.na; lb.style.bottom=s.nb+'%'; la.style.bottom=s.na+'%';
 cv.innerText=s.vacio.toFixed(1); cl.innerText=s.lleno.toFixed(1); cpa.innerText=s.pa; cpc.innerText=s.pc;
 if(document.activeElement!==inb)inb.value=s.nb; if(document.activeElement!==ina)ina.value=s.na;
}catch(e){}}
setInterval(leer,1000);leer();
</script></body></html>
)=====";

void enviarEstado() {
  String j = "{\"dist\":" + (isnan(distancia) ? String("null") : String(distancia, 1));
  j += ",\"nivel\":" + (isnan(nivel) ? String("null") : String(nivel, 1));
  j += ",\"pin\":" + String(pinzaAbierta ? "true" : "false");
  j += ",\"auto\":" + String(modoAuto ? "true" : "false");
  j += ",\"nb\":" + String(NIVEL_BAJO) + ",\"na\":" + String(NIVEL_ALTO);
  j += ",\"vacio\":" + String(DIST_VACIO_CM, 1) + ",\"lleno\":" + String(DIST_LLENO_CM, 1);
  j += ",\"pa\":" + String(PINZA_ABIERTA) + ",\"pc\":" + String(PINZA_CERRADA) + "}";
  server.send(200, "application/json", j);
}

void recibirComando() {
  if (server.hasArg("pin"))  { modoAuto = false; finDosis = 0; moverPinza(server.arg("pin") == "1"); }
  if (server.hasArg("auto")) { modoAuto = (server.arg("auto") == "1"); }
  if (server.hasArg("dosis")) {
    int s = constrain(server.arg("dosis").toInt(), 1, 30);
    modoAuto = false;
    moverPinza(true);
    finDosis = millis() + (unsigned long)s * 1000UL;   // después se cierra sola
  }
  if (server.hasArg("ang"))  { modoAuto = false; finDosis = 0; pinza.write(constrain(server.arg("ang").toInt(), 0, 180)); }
  // --- calibración ---
  bool cambio = false;
  if (server.hasArg("tomar") && !isnan(distancia)) {
    if (server.arg("tomar") == "vacio") DIST_VACIO_CM = distancia;
    if (server.arg("tomar") == "lleno") DIST_LLENO_CM = distancia;
    cambio = true;
  }
  if (server.hasArg("pa")) { PINZA_ABIERTA = constrain(server.arg("pa").toInt(), 0, 180); cambio = true; }
  if (server.hasArg("pc")) { PINZA_CERRADA = constrain(server.arg("pc").toInt(), 0, 180); cambio = true; }
  if (server.hasArg("nb") && server.hasArg("na")) {
    int b = constrain(server.arg("nb").toInt(), 0, 100), a = constrain(server.arg("na").toInt(), 0, 100);
    if (b < a) { NIVEL_BAJO = b; NIVEL_ALTO = a; cambio = true; }   // el bajo tiene que ser menor que el alto
  }
  if (DIST_VACIO_CM - DIST_LLENO_CM < 2.0) { DIST_VACIO_CM = DIST_LLENO_CM + 2.0; }  // evita dividir por cero
  if (cambio) guardarCalibracion();
  server.send(200, "text/plain", "ok");
}
#endif

// ---------------- ARRANQUE --------------------------------------
void setup() {
  Serial.begin(115200);
  cargarCalibracion();
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT_PULLDOWN);
  pinza.setPeriodHertz(50);
  pinza.attach(PIN_PINZA, 500, 2400);
  moverPinza(false);

#if USAR_WIFI
  WiFi.softAP("Planta-EI1", "12345678");
  server.on("/", []() { server.send_P(200, "text/html", PAGINA); });
  server.on("/estado", enviarEstado);
  server.on("/cmd", recibirComando);
  server.begin();
  Serial.println("\nCelular: red Planta-EI1, clave 12345678, abrir 192.168.4.1");
#endif
  Serial.println("distancia_cm;nivel_%;pinza");
}

// ---------------- LAZO PRINCIPAL --------------------------------
void loop() {
#if USAR_WIFI
  server.handleClient();
#endif
  unsigned long ahora = millis();

  if (ahora - tMedida >= 200) {                 // mide cinco veces por segundo
    tMedida = ahora;
    distancia = medirDistanciaCm();
    nivel = nivelPorciento(distancia);
    controlar();
  }

  if (finDosis != 0 && (long)(ahora - finDosis) >= 0) {   // terminó la dosis
    finDosis = 0;
    moverPinza(false);
  }

  if (ahora - tSerie >= 1000) {                 // una línea por segundo para la tabla
    tSerie = ahora;
    Serial.print(isnan(distancia) ? String("--") : String(distancia, 1)); Serial.print(';');
    Serial.print(isnan(nivel) ? String("--") : String(nivel, 0));         Serial.print(';');
    Serial.println(pinzaAbierta ? "abierta" : "cerrada");
  }
}
