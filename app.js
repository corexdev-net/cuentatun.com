/* Cuentatún · Enciclopedia — artículos, canción con letra y minijuegos.
   Sin cookies, sin analítica, sin recursos externos. Regla de oro: lo que se dice es lo que se ve. */
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const C = { marino: "#1B2A6B", coral: "#FF5A4E", sol: "#FFC21A", turquesa: "#14B8B0", violeta: "#8E6CF0",
            rosa: "#FF6FAE", naranja: "#FF8A1F", azul: "#3D8BFF" };
const art = $("#articulo");
const azar = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const html = (s) => { const t = document.createElement("template"); t.innerHTML = s.trim(); return t.content; };
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

/* ================= audio ================= */
const NUM = ["", "n_uno", "n_dos", "n_tres", "n_cuatro", "n_cinco"];
const PALABRA = ["", "uno", "dos", "tres", "cuatro", "cinco"];
const audios = {};
let turno = 0, ctx = null;
function sonar(id) {
  const a = audios[id] || (audios[id] = new Audio(`audio/${id}.mp3`));
  return new Promise((listo) => {
    let hecho = false; const fin = () => { if (!hecho) { hecho = true; listo(); } };
    a.onended = fin; a.onerror = fin; a.currentTime = 0;
    const p = a.play(); if (p) p.catch(fin);
    setTimeout(fin, 7000);
  });
}
function callar() { turno++; for (const a of Object.values(audios)) { a.pause(); } }
async function decir(...ids) {           // dice varias frases en orden; una nueva orden interrumpe la anterior
  callar(); const mio = turno;
  for (const id of ids) { if (mio !== turno) return false; await sonar(id); }
  return mio === turno;
}
function tono(notas, dur = 0.18, tipo = "sine", vol = 0.12) {   // efectos de sonido sintetizados
  if (!ctx) return;
  const t0 = ctx.currentTime;
  notas.forEach((f, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo; o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
    const t = t0 + i * dur * 0.6; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 2); o.start(t); o.stop(t + dur * 2.2);
  });
}
const sfx = { ding: () => tono([1318, 1760], 0.12), pop: () => tono([520, 880], 0.06, "triangle", 0.18),
              bien: () => tono([1046, 1318, 1568, 2093], 0.12), click: () => tono([880], 0.04, "square", 0.04) };

/* ================= confeti ================= */
function confeti(n = 90) {
  const caja = $("#confeti"), cols = Object.values(C);
  for (let i = 0; i < n; i++) {
    const p = document.createElement("i");
    p.style.left = Math.random() * 100 + "vw"; p.style.background = cols[i % cols.length];
    p.style.animationDelay = Math.random() * 0.5 + "s"; p.style.animationDuration = 1.2 + Math.random() * 0.9 + "s";
    caja.appendChild(p); setTimeout(() => p.remove(), 2800);
  }
}

/* ================= datos ================= */
const PERSONAJES = [
  { id: "uno", s: "1", nombre: "Uno", color: C.turquesa, listo: true },
  { id: "a", s: "A", nombre: "La A", color: C.coral }, { id: "dos", s: "2", nombre: "Dos", color: C.naranja },
  { id: "e", s: "E", nombre: "La E", color: C.rosa }, { id: "tres", s: "3", nombre: "Tres", color: C.sol },
  { id: "i", s: "I", nombre: "La I", color: C.violeta }, { id: "cuatro", s: "4", nombre: "Cuatro", color: C.azul },
  { id: "o", s: "O", nombre: "La O", color: C.coral }, { id: "cinco", s: "5", nombre: "Cinco", color: C.turquesa },
  { id: "u", s: "U", nombre: "La U", color: C.naranja },
];
const JUEGOS = [
  { id: "puntitos", nombre: "Cuenta los puntitos", arte: "●●●", color: C.sol },
  { id: "cuantos", nombre: "¿Cuántos hay?", arte: "¿3?", color: C.coral },
  { id: "trazo", nombre: "Traza el 1", arte: "1", color: C.turquesa },
  { id: "globos", nombre: "Revienta globos", arte: "🎈", color: C.violeta },
];

/* ================= índice y navegación ================= */
function construirIndice() {
  const pto = (s, col) => `<span class="pto" style="background:${col}">${s}</span>`;
  let h = `<li><a href="#inicio">${pto("★", C.coral)}Bienvenida</a></li><li class="grupo">Personajes</li>`;
  for (const p of PERSONAJES)
    h += p.listo ? `<li><a href="#personaje/${p.id}">${pto(p.s, p.color)}${p.nombre}</a></li>`
                 : `<li><a class="bloqueado" href="#personajes">${pto("?", "#9aa0b8")}${p.nombre} · pronto</a></li>`;
  h += `<li class="grupo">Episodios</li><li><a href="#episodio/1">${pto("1", C.turquesa)}¡Llega el Uno!</a></li>`;
  h += `<li class="grupo">Canciones</li><li><a href="#cancion/uno">${pto("♪", C.violeta)}La canción del Uno</a></li>`;
  h += `<li class="grupo">Juegos</li>` + JUEGOS.map((j) => `<li><a href="#juego/${j.id}">${pto("▶", j.color)}${j.nombre}</a></li>`).join("");
  h += `<li class="grupo">Familias</li><li><a href="#papas">${pto("i", C.azul)}Para mamás y papás</a></li>`;
  $("#indice").innerHTML = h;
}
let limpiarJuego = null;
function ir() {
  const ruta = location.hash.slice(1) || "inicio";
  if (limpiarJuego) { limpiarJuego(); limpiarJuego = null; }
  callar();
  const vista = VISTAS[ruta] || VISTAS.inicio;
  art.innerHTML = ""; art.style.animation = "none"; art.offsetWidth; art.style.animation = ""; vista();
  const sec = ruta.split("/")[0].replace(/^(personaje|episodio|cancion|juego)$/, (m) => ({ personaje: "personajes", episodio: "episodios", cancion: "canciones", juego: "juegos" }[m]));
  document.querySelectorAll(".nav-principal a").forEach((a) => a.classList.toggle("activo", a.dataset.sec === sec));
  document.querySelectorAll("#indice a").forEach((a) => a.classList.toggle("activo", a.getAttribute("href") === "#" + ruta));
  const t = art.querySelector("h1"); document.title = (t ? t.textContent + " · " : "") + "Cuentatún";
  window.scrollTo({ top: 0, behavior: "instant" });
}

/* ================= artículos ================= */
const VISTAS = {
  inicio() {
    art.append(html(`
      <span class="rubro" style="background:#FF5A4E">Bienvenida</span>
      <h1>¡Bienvenidos a Cuentatún!</h1>
      <p class="bajada">El lugar donde viven los números y las letras. Explora a los personajes, escucha sus canciones y juega con ellos.</p>
      <div class="medios"><button class="boton" data-decir="bienvenida">🔊 Escuchar</button></div>
      <div class="mosaico">
        <a class="ficha-mini" href="#personaje/uno"><span class="circulo" style="background:${C.turquesa}">1</span>Conoce a Uno<small>Nuestro primer amigo</small></a>
        <a class="ficha-mini" href="#juegos"><span class="circulo" style="background:${C.naranja}">▶</span>Juegos<small>Contar, trazar y jugar</small></a>
        <a class="ficha-mini" href="#cancion/uno"><span class="circulo" style="background:${C.violeta}">♪</span>Canciones<small>¡A cantar!</small></a>
        <a class="ficha-mini" href="#episodio/1"><span class="circulo" style="background:${C.coral}">★</span>Episodios<small>Temporada 1</small></a>
      </div>`));
  },

  personajes() {
    art.append(html(`<span class="rubro">Personajes</span><h1>Los amigos de Cuentatún</h1>
      <p class="bajada">Cada número tiene forma de número y lleva en la pancita tantos puntitos dorados como vale. En cada episodio llega un amigo nuevo.</p>
      <div class="mosaico">${PERSONAJES.map((p) => p.listo
        ? `<a class="ficha-mini" href="#personaje/${p.id}"><span class="circulo" style="background:${p.color}">${p.s}</span>${p.nombre}<small>¡Ya llegó!</small></a>`
        : `<div class="ficha-mini bloqueado"><span class="circulo">?</span>${p.nombre}<small>Próximamente</small></div>`).join("")}</div>`));
  },

  "personaje/uno"() {
    art.append(html(`
      <div class="art-con-ficha"><div>
        <span class="rubro">Personaje · Número</span>
        <h1>Uno</h1>
        <p class="bajada">Uno es el primer amigo de Cuentatún. Es curioso, alegre y muy valiente, porque fue el primero en llegar.</p>
        <div class="medios">
          <button class="boton" data-decir="u_hola">🔊 Escuchar a Uno</button>
          <button class="boton" data-decir="u_puntito">🔊 ¿Qué tiene en su pancita?</button>
        </div>
        <h2>¿Cómo llegó a Cuentatún?</h2>
        <p>Un día, un puntito dorado brilló en el cielo, cayó al prado con un “¡pum!” y… ¡se dibujó un 1! Así nació Uno, con su puntito en la pancita.</p>
        <h2>Así se escribe el uno</h2>
        <p>Una rayita que sube un poquito… ¡y una raya que baja derechito!</p>
        <svg id="demo-trazo" viewBox="0 0 280 320" style="width:170px;background:#fff;border:2px solid ${C.marino}">
          <path d="M60 120 C87 93 111 51 135 48 C159 45 138 165 138 292" fill="none" stroke="#E4ECF5" stroke-width="30" stroke-linecap="round"/>
          <path id="demo-tinta" d="M60 120 C87 93 111 51 135 48 C159 45 138 165 138 292" fill="none" stroke="${C.turquesa}" stroke-width="30" stroke-linecap="round"/>
          <circle cx="60" cy="120" r="12" fill="#6BDB6B"/>
        </svg>
        <div class="medios"><button class="boton" id="ver-trazo">▶ Ver cómo se escribe</button><a class="boton" href="#juego/trazo">✏️ ¡Trázalo tú!</a></div>
        <h2>Le gusta…</h2>
        <p>Buscar cosas de las que hay <b>solo una</b>: un sol, un árbol, un globo… ¡y una manzana!</p>
        <div class="medios"><a class="boton" href="#juego/puntitos">▶ Jugar a contar</a><a class="boton" href="#cancion/uno">♪ Su canción</a></div>
      </div>
      <aside class="ficha">
        <div class="ficha-titulo">Uno</div>
        <div class="ficha-img"><img src="img/uno.png" alt="Uno, un 1 turquesa con carita feliz y un puntito dorado en la pancita" width="620" height="730"></div>
        <table>
          <tr><th>Es el número</th><td><b style="font-size:20px">1</b> (uno)</td></tr>
          <tr><th>Puntitos</th><td><span class="puntito"></span> uno</td></tr>
          <tr><th>Color</th><td>Turquesa</td></tr>
          <tr><th>Vive en</th><td>El prado de Cuentatún</td></tr>
          <tr><th>Su frase</th><td>“¡Yo tengo un puntito!”</td></tr>
          <tr><th>Episodio</th><td><a href="#episodio/1">¡Llega el Uno!</a></td></tr>
        </table>
      </aside></div>`));
    const tinta = $("#demo-tinta"), L = tinta.getTotalLength();
    tinta.style.strokeDasharray = L; tinta.style.strokeDashoffset = 0;
    $("#ver-trazo").onclick = () => {
      tinta.style.transition = "none"; tinta.style.strokeDashoffset = L; tinta.getBoundingClientRect();
      tinta.style.transition = "stroke-dashoffset 2.4s linear"; tinta.style.strokeDashoffset = 0; sfx.ding();
    };
  },

  episodios() {
    art.append(html(`<span class="rubro">Episodios</span><h1>Temporada 1</h1>
      <p class="bajada">Los números del 1 al 5 y las vocales A, E, I, O, U. Cada episodio repasa a todos los amigos anteriores.</p>
      <div class="mosaico">${PERSONAJES.map((p, i) => p.listo
        ? `<a class="ficha-mini" href="#episodio/1"><span class="circulo" style="background:${p.color}">${p.s}</span>Episodio ${i + 1}<small>¡Llega el Uno!</small></a>`
        : `<div class="ficha-mini bloqueado"><span class="circulo">${p.s}</span>Episodio ${i + 1}<small>Próximamente</small></div>`).join("")}</div>`));
  },

  "episodio/1"() {
    art.append(html(`<span class="rubro">Episodio 1 · Temporada 1</span><h1>¡Llega el Uno!</h1>
      <p class="bajada">Un puntito brillante cae del cielo… ¡y se dibuja un 1! Conoce a Uno, aprende cómo se escribe, busca cosas de las que hay solo una y canta su canción.</p>
      <img class="marco-img" src="img/miniatura_ep01.jpg" alt="Miniatura del episodio ¡Llega el Uno!" width="1280" height="720" style="max-width:640px">
      <div class="medios"><a class="boton" href="https://www.youtube.com/@Cuentatun" rel="noopener">▶ Ver en YouTube</a></div>
      <h2>Qué aprendemos</h2>
      <ul><li>El número <b>1</b> y la palabra <b>“uno”</b>.</li><li>Cómo se escribe el 1 (¡trázalo en el aire con tu dedito!).</li>
      <li>Contar: <b>un</b> sol, <b>un</b> árbol, <b>un</b> globo y <b>una</b> manzana.</li></ul>
      <h2>Para seguir jugando</h2>
      <div class="medios"><a class="boton" href="#juego/trazo">✏️ Traza el 1</a><a class="boton" href="#juego/cuantos">🍎 ¿Cuántos hay?</a></div>`));
  },

  canciones() {
    art.append(html(`<span class="rubro">Canciones</span><h1>Canciones de Cuentatún</h1>
      <div class="mosaico"><a class="ficha-mini" href="#cancion/uno"><span class="circulo" style="background:${C.violeta}">♪</span>La canción del Uno<small>Episodio 1</small></a>
      <div class="ficha-mini bloqueado"><span class="circulo">♪</span>La canción de la A<small>Próximamente</small></div></div>`));
  },

  "cancion/uno"() {
    const LETRA = [
      [8.6, "Uno, uno, tengo un puntito"], [12.8, "Uno, uno, derechito y bonito"],
      [18.46, 'Un <b class="palabra" data-t="19.42">sol</b>, un <b class="palabra" data-t="20.44">árbol</b>, un <b class="palabra" data-t="21.54">globo</b> también'],
      [22.92, "¡Uno, uno, lo cuento muy bien!"],
    ];
    art.append(html(`<span class="rubro">Canción · Episodio 1</span><h1>La canción del Uno</h1>
      <p class="bajada">¡Canta con Uno! La letra se ilumina mientras suena.</p>
      <audio id="cancion" controls preload="none" src="audio/cancion_del_uno.m4a"></audio>
      <div class="karaoke" id="letra">${LETRA.map(([t, l]) => `<div data-t="${t}">${l}</div>`).join("")}</div>`));
    const au = $("#cancion"), lineas = [...art.querySelectorAll("#letra > div")], palabras = [...art.querySelectorAll(".palabra")];
    au.addEventListener("play", () => callar());
    au.addEventListener("timeupdate", () => {
      const t = au.currentTime;
      lineas.forEach((d, i) => d.classList.toggle("ahora", t >= +d.dataset.t && (i === lineas.length - 1 ? t < 32 : t < +lineas[i + 1].dataset.t)));
      palabras.forEach((p) => p.classList.toggle("ahora", t >= +p.dataset.t && t < +p.dataset.t + 0.9));
    });
    limpiarJuego = () => au.pause();
  },

  juegos() {
    art.append(html(`<span class="rubro">Juegos</span><h1>¿A qué quieres jugar?</h1>
      <p class="bajada">Juegos para contar y trazar. Todos hablan, así que no hace falta saber leer.</p>
      <div class="mosaico">${JUEGOS.map((j) => `<a class="ficha-mini tarjeta-juego" href="#juego/${j.id}"><div class="arte" style="background:${j.color}">${j.arte}</div><span>${j.nombre}</span></a>`).join("")}</div>`));
    decir("elige");
  },

  papas() {
    art.append(html(`<span class="rubro">Para mamás, papás y maestros</span><h1>Sobre Cuentatún</h1>
      <p class="bajada">Caricaturas y juegos educativos en español para niños de 2 a 5 años.</p>
      <h2>Lo que cuidamos</h2>
      <ul>
        <li><b>Lo que se dice, se ve.</b> Si decimos “tres”, en pantalla hay exactamente tres. Así se aprende a contar sin confusiones.</li>
        <li><b>Tranquilo y sin sustos.</b> Ritmo pausado, colores alegres, canciones originales.</li>
        <li><b>Hecho para niños.</b> Nuestro canal de YouTube está marcado como contenido infantil: sin comentarios ni anuncios personalizados.</li>
        <li><b>Sin datos.</b> Esta enciclopedia no usa cookies ni rastreadores y no pide ningún dato. <a href="privacidad.html">Aviso de privacidad</a>.</li>
      </ul>
      <h2>Consejos para verlo juntos</h2>
      <ul>
        <li>Cuenten en voz alta y tracen los números en el aire con el dedito.</li>
        <li>Busquen en casa cosas “de las que hay solo una”, como hace Uno.</li>
        <li>A esta edad se recomienda poco tiempo de pantalla al día; mejor ratos cortos y acompañados.</li>
      </ul>
      <h2>Contacto</h2>
      <p><a href="mailto:cuentatun.com@gmail.com">cuentatun.com@gmail.com</a> · Por favor, no nos envíen datos ni fotos de niños.</p>
      <p class="aviso">Cuentatún es un desarrollo de CorexDev. Personajes, música y canciones originales.</p>`));
  },

  "juego/puntitos": () => juegoPuntitos(),
  "juego/cuantos": () => juegoCuantos(),
  "juego/trazo": () => juegoTrazo(),
  "juego/globos": () => juegoGlobos(),
};

/* ================= utilidades de juego ================= */
const SVGNS = "http://www.w3.org/2000/svg";
function svgEl(tag, attrs = {}, padre) {
  const e = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (padre) padre.appendChild(e);
  return e;
}
function montarJuego(titulo, instruccion) {
  art.append(html(`<div class="juego">
    <div class="juego-cabeza"><h1>${titulo}</h1><span class="pastilla" id="marcador"></span>
      <button class="boton" id="repetir">🔊 Escuchar</button><button class="boton" id="otra">↻ Otra vez</button></div>
    <div class="escenario" id="escenario"><img class="ayudante" src="img/uno.png" alt=""></div></div>`));
  $("#repetir").onclick = () => decir(instruccion);
  return { esc: $("#escenario"), marcador: $("#marcador"), otra: $("#otra") };
}
function numeroGrande(esc, n, color = C.turquesa) {
  const d = document.createElement("div"); d.className = "numero-grande";
  d.innerHTML = `<span style="color:${color}">${n}</span>`; esc.appendChild(d); return d;
}
function degradadoPuntito(svg) {
  const defs = svgEl("defs", {}, svg), g = svgEl("radialGradient", { id: "dorado", cx: "35%", cy: "35%", r: "70%" }, defs);
  [["0%", "#FFF3B8"], ["45%", "#FFC83A"], ["100%", "#E0A000"]].forEach(([o, c]) => svgEl("stop", { offset: o, "stop-color": c }, g));
}

/* --- 1. Cuenta los puntitos: tocas cada puntito y se cuenta en voz alta --- */
const DISPOSICION = { 1: [[0, 0]], 2: [[-1, 0], [1, 0]], 3: [[-1.2, 0.6], [0, -0.1], [1.2, -0.8]],
  4: [[-1, -0.6], [1, -0.6], [-1, 0.6], [1, 0.6]], 5: [[-1.2, -0.7], [1.2, -0.7], [0, 0], [-1.2, 0.7], [1.2, 0.7]] };
function juegoPuntitos() {
  const { esc, marcador, otra } = montarJuego("Cuenta los puntitos", "j_puntitos");
  let n = 0, ultimo = 0;
  function ronda() {
    esc.querySelectorAll("svg, .numero-grande").forEach((e) => e.remove());
    do { n = azar(1, 5); } while (n === ultimo); ultimo = n;
    let contados = 0; marcador.textContent = "0";
    const svg = svgEl("svg", { viewBox: "0 0 600 400" }); esc.prepend(svg); degradadoPuntito(svg);
    for (const [x, y] of DISPOSICION[n]) {
      const g = svgEl("g", { transform: `translate(${300 + x * 120} ${175 + y * 100})`, style: "cursor:pointer" }, svg);
      svgEl("circle", { r: 60, fill: "transparent" }, g);                     // área de toque más grande
      const c = svgEl("circle", { r: 46, fill: "url(#dorado)", stroke: "#fff", "stroke-width": 6 }, g);
      const t = svgEl("text", { "text-anchor": "middle", dy: 18, "font-size": 52, "font-family": "Fredoka", fill: "#fff" }, g);
      g.addEventListener("pointerdown", async () => {
        if (g.dataset.ok) return; g.dataset.ok = 1; contados++;
        c.setAttribute("fill", C.turquesa); t.textContent = contados; marcador.textContent = contados; sfx.pop();
        const mio = contados;
        const siguio = await decir(NUM[mio]);
        if (siguio && mio === n) { sfx.bien(); numeroGrande(esc, n); confeti(); await decir("muybien"); setTimeout(ronda, 1800); }
      });
    }
    decir("j_puntitos");
  }
  otra.onclick = ronda; ronda();
}

/* --- 2. ¿Cuántos hay?: cuenta las manzanas y toca el número --- */
function manzana(svg, x, y) {
  const g = svgEl("g", { transform: `translate(${x} ${y})` }, svg);
  svgEl("ellipse", { cx: 0, cy: 34, rx: 34, ry: 7, fill: "rgba(0,0,0,.15)" }, g);
  svgEl("path", { d: "M0 -26 C-26 -40 -46 -14 -40 8 C-34 30 -14 38 0 30 C14 38 34 30 40 8 C46 -14 26 -40 0 -26Z", fill: "#E0262E" }, g);
  svgEl("ellipse", { cx: -16, cy: -8, rx: 7, ry: 12, fill: "#fff", opacity: 0.45 }, g);
  svgEl("path", { d: "M0 -26 L4 -44", stroke: "#6B3E1E", "stroke-width": 5, "stroke-linecap": "round" }, g);
  svgEl("path", { d: "M5 -38 C16 -52 30 -44 30 -40 C22 -34 12 -34 5 -38Z", fill: "#3DAA3A" }, g);
  return g;
}
function juegoCuantos() {
  const { esc, marcador, otra } = montarJuego("¿Cuántos hay?", "j_cuantos");
  let aciertos = 0, ultimo = 0;
  function ronda(primera) {
    esc.querySelectorAll("svg, .numero-grande, .opciones").forEach((e) => e.remove());
    const max = aciertos >= 3 ? 5 : 3; let n;
    do { n = azar(1, max); } while (n === ultimo); ultimo = n;
    marcador.textContent = "⭐ " + aciertos;
    const svg = svgEl("svg", { viewBox: "0 0 600 300", style: "height:300px" }); esc.prepend(svg);
    const paso = 100, x0 = 300 - ((n - 1) * paso) / 2, frutas = [];
    for (let i = 0; i < n; i++) frutas.push(manzana(svg, x0 + i * paso, 200));
    const ops = new Set([n]); while (ops.size < 3) ops.add(azar(1, 5));
    const cols = [C.coral, C.azul, C.violeta, C.naranja, C.turquesa];
    const caja = document.createElement("div"); caja.className = "opciones"; caja.style.margin = "4px 0 18px";
    [...ops].sort(() => Math.random() - 0.5).forEach((v, i) => {
      const b = document.createElement("button"); b.className = "opcion"; b.textContent = v; b.style.background = cols[i];
      b.setAttribute("aria-label", PALABRA[v]);
      b.onclick = async () => {
        if (v !== n) { b.classList.remove("mal"); void b.offsetWidth; b.classList.add("mal"); tono([300, 250], 0.12, "sine", 0.08); decir("otravez"); return; }
        caja.style.pointerEvents = "none"; aciertos++; marcador.textContent = "⭐ " + aciertos;
        callar(); const mio = turno;
        for (let k = 0; k < n; k++) {                 // cuenta una por una: lo que se dice es lo que se ve
          frutas[k].style.transformBox = "fill-box"; frutas[k].style.transformOrigin = "center";
          frutas[k].animate([{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }], { duration: 420 });
          await sonar(NUM[k + 1]); if (mio !== turno) return;
        }
        sfx.bien(); confeti(); await sonar("muybien"); if (mio !== turno) return;
        setTimeout(() => ronda(), 900);
      };
      caja.appendChild(b);
    });
    esc.appendChild(caja);
    decir(primera === true ? "j_cuantos" : "cuantos");
  }
  otra.onclick = () => ronda(); ronda(true);
}

/* --- 3. Traza el 1: sigue el camino con el dedito, como en el episodio --- */
function juegoTrazo() {
  const { esc, marcador, otra } = montarJuego("Traza el 1", "j_trazo");
  const D = "M60 120 C87 93 111 51 135 48 C159 45 138 165 138 292";
  function ronda() {
    esc.querySelectorAll("svg").forEach((e) => e.remove());
    marcador.textContent = "0%";
    const svg = svgEl("svg", { viewBox: "0 0 280 320", style: "height:440px;max-height:62vh;margin:0 auto" }); esc.prepend(svg);
    svgEl("path", { d: D, fill: "none", stroke: "#fff", "stroke-opacity": 0.85, "stroke-width": 44, "stroke-linecap": "round" }, svg);
    svgEl("path", { d: D, fill: "none", stroke: "#B8C4D8", "stroke-width": 4, "stroke-dasharray": "2 12", "stroke-linecap": "round" }, svg);
    const tinta = svgEl("path", { d: D, fill: "none", stroke: C.turquesa, "stroke-width": 36, "stroke-linecap": "round" }, svg);
    const L = tinta.getTotalLength(); tinta.style.strokeDasharray = L; tinta.style.strokeDashoffset = L;
    svgEl("circle", { cx: 60, cy: 120, r: 16, fill: "#6BDB6B", stroke: "#fff", "stroke-width": 4 }, svg);
    svgEl("path", { d: "M44 96 l-14 -6 m14 6 l-6 -14", stroke: "#2E8B2E", "stroke-width": 5, "stroke-linecap": "round" }, svg);
    const estrella = svgEl("circle", { cx: 60, cy: 120, r: 12, fill: "#FFE27A", stroke: "#fff", "stroke-width": 3 }, svg);
    const N = 240, pts = []; for (let i = 0; i <= N; i++) { const p = tinta.getPointAtLength((L * i) / N); pts.push([p.x, p.y]); }
    let idx = 0, activo = false, listo = false;
    const aSvg = (ev) => { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    function mover(ev) {
      if (!activo || listo) return;
      const q = aSvg(ev); let mejor = idx, dist = 1e9;
      for (let j = idx; j <= Math.min(N, idx + 30); j++) { const d = Math.hypot(pts[j][0] - q.x, pts[j][1] - q.y); if (d < dist) { dist = d; mejor = j; } }
      if (dist < 34 && mejor > idx) {
        idx = mejor; tinta.style.strokeDashoffset = L * (1 - idx / N);
        estrella.setAttribute("cx", pts[idx][0]); estrella.setAttribute("cy", pts[idx][1]);
        marcador.textContent = Math.round((idx / N) * 100) + "%";
        if (idx % 24 === 0) tono([1200 + idx * 3], 0.05, "sine", 0.05);
        if (idx >= N - 4) terminar();
      }
    }
    async function terminar() {
      listo = true; marcador.textContent = "100%"; tinta.style.strokeDashoffset = 0; sfx.bien(); confeti();
      numeroGrande(esc, "1").style.opacity = 0;
      await decir("muybien", "u_yupi");
    }
    svg.addEventListener("pointerdown", (ev) => { activo = true; svg.setPointerCapture(ev.pointerId); mover(ev); });
    svg.addEventListener("pointermove", mover);
    svg.addEventListener("pointerup", () => { activo = false; });
    decir("j_trazo");
  }
  otra.onclick = ronda; ronda();
}

/* --- 4. Revienta globos: cada globo que revientas se cuenta --- */
function juegoGlobos() {
  const { esc, marcador, otra } = montarJuego("Revienta globos", "j_globos");
  let raf = 0;
  function ronda() {
    cancelAnimationFrame(raf);
    esc.querySelectorAll("svg, .numero-grande").forEach((e) => e.remove());
    const TOTAL = 5; let cuenta = 0;
    const svg = svgEl("svg", { viewBox: "0 0 600 440", preserveAspectRatio: "xMidYMid slice", style: "position:absolute;inset:0" }); esc.prepend(svg);
    // contador visible: 5 círculos que se llenan (lo que se dice es lo que se ve)
    const cont = svgEl("g", { transform: "translate(24 28)" }, svg), marcas = [];
    for (let i = 0; i < TOTAL; i++) marcas.push(svgEl("circle", { cx: i * 34, cy: 0, r: 13, fill: "#fff", stroke: C.marino, "stroke-width": 3 }, cont));
    marcador.textContent = "0";
    const cols = [C.coral, C.sol, C.turquesa, C.violeta, C.azul], globos = [];
    for (let i = 0; i < TOTAL; i++) {
      const g = svgEl("g", { class: "globo" }, svg);
      svgEl("path", { d: "M0 44 q-8 30 4 60", stroke: "#fff", "stroke-width": 2, fill: "none" }, g);
      svgEl("ellipse", { cx: 0, cy: 0, rx: 38, ry: 46, fill: cols[i], stroke: "#fff", "stroke-width": 3 }, g);
      svgEl("ellipse", { cx: -12, cy: -16, rx: 8, ry: 14, fill: "#fff", opacity: 0.5 }, g);
      svgEl("path", { d: "M-7 46 L7 46 L0 38Z", fill: cols[i] }, g);
      const b = { g, x: 70 + i * 115, y: 470 + i * 70, v: 0.55 + Math.random() * 0.35, fase: Math.random() * 6, vivo: true };
      g.addEventListener("pointerdown", async () => {
        if (!b.vivo) return; b.vivo = false; sfx.pop(); cuenta++;
        g.classList.add("pop"); marcas[cuenta - 1].setAttribute("fill", C.sol); marcador.textContent = cuenta;
        const mio = cuenta, siguio = await decir(NUM[mio]);
        if (siguio && mio === TOTAL) { sfx.bien(); numeroGrande(esc, TOTAL, C.violeta); confeti(); await decir("muybien"); }
      });
      globos.push(b);
    }
    let t = 0;
    (function paso() {
      t += 1;
      for (const b of globos) {
        if (!b.vivo) continue;
        b.y -= b.v; if (b.y < -80) b.y = 480;           // si se escapa, vuelve a salir por abajo
        b.g.setAttribute("transform", `translate(${b.x + Math.sin(t / 40 + b.fase) * 14} ${b.y})`);
      }
      raf = requestAnimationFrame(paso);
    })();
    decir("j_globos");
  }
  otra.onclick = ronda; ronda();
  limpiarJuego = () => cancelAnimationFrame(raf);
}

/* ================= arranque ================= */
document.addEventListener("click", (ev) => {
  const b = ev.target.closest("[data-decir]"); if (b) { decir(b.dataset.decir); }
  if (ev.target.closest("a, button")) sfx.click();
});
$("#entrar").onclick = () => {
  try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
  $("#arranque").classList.add("fuera"); setTimeout(() => $("#arranque").remove(), 600);
  sfx.bien(); if (!location.hash || location.hash === "#inicio") decir("bienvenida");
};
construirIndice(); window.addEventListener("hashchange", ir); ir();
