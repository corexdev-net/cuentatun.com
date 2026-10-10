/* Cuentatún — sitio oficial: portada, personajes, canciones, episodios y minijuegos.
   Sin cookies, sin analítica, sin recursos externos. Regla de oro: lo que se dice es lo que se ve. */
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const C = { marino: "#1B2A6B", coral: "#FF5A4E", sol: "#FFC21A", turquesa: "#14B8B0", violeta: "#8E6CF0",
            rosa: "#FF6FAE", naranja: "#FF8A1F", azul: "#3D8BFF" };
const art = $("#articulo");
const YT = "https://www.youtube.com/@Cuentatun";
const SEGUIR = "https://www.youtube.com/@Cuentatun?sub_confirmation=1";   // abre YouTube con la ventana de "Suscribirse"
const EP1 = "-1qzkLmKuIw";                          // episodio 1 en YouTube
const YT_EP1 = `https://youtu.be/${EP1}`;
const azar = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const html = (s) => { const t = document.createElement("template"); t.innerHTML = s.trim(); return t.content; };

/* ================= íconos ================= */
const I = {
  altavoz: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4zM16 8.5a5 5 0 0 1 0 7M18.6 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M4 9h4l5-4v14l-5-4H4z"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  lapiz: '<svg viewBox="0 0 24 24"><path d="m4 17.3 10.6-10.6 3.7 3.7L7.7 21H4zM16 5.3l1.8-1.8a1.3 1.3 0 0 1 1.8 0l1.9 1.9a1.3 1.3 0 0 1 0 1.8L19.7 9z"/></svg>',
  repetir: '<svg viewBox="0 0 24 24"><path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/></svg>',
  nota: '<svg viewBox="0 0 24 24"><path d="M9 17.5V5.2l11-2.2v12.2a3.3 3.3 0 1 1-2-3V6.4l-7 1.4v9.9a3.3 3.3 0 1 1-2-.2z"/></svg>',
  yt: '<svg viewBox="0 0 24 24"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.8 15.1V8.9l5.7 3.1Z"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.4 14.4-4.2-4.2 1.4-1.4 2.8 2.8 6-6 1.4 1.4z"/></svg>',
  ojo: '<svg viewBox="0 0 24 24"><path d="M12 5C6 5 2 12 2 12s4 7 10 7 10-7 10-7-4-7-10-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/></svg>',
  hoja: '<svg viewBox="0 0 24 24"><path d="M20 4S8 3 5 11c-1.6 4.3 1 8 1 8s3.8 1.8 7.6-.4C20 15 20 4 20 4zM5 21l8-9" stroke="#fff" stroke-width="0"/></svg>',
  corazon: '<svg viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3.1A4.6 4.6 0 0 1 20 10c0 5.8-8 11-8 11z"/></svg>',
  escudo: '<svg viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3.4 9.5 8 11 4.6-1.5 8-6 8-11V5z"/></svg>',
};
const boton = (txt, ico, attrs = "", clase = "") => `<button class="boton ${clase}" ${attrs}>${I[ico] || ""}${txt}</button>`;
const enlace = (txt, ico, href, clase = "") => `<a class="boton ${clase}" href="${href}"${href.startsWith("http") ? ' rel="noopener"' : ""}>${I[ico] || ""}${txt}</a>`;

/* ================= audio ================= */
const NUM = ["", "n_uno", "n_dos", "n_tres", "n_cuatro", "n_cinco"];
const PALABRA = ["", "uno", "dos", "tres", "cuatro", "cinco"];
const audios = {};
let turno = 0, ctx = null;
function sonar(id) {
  if (window.MUDO) return Promise.resolve();
  const a = audios[id] || (audios[id] = new Audio(`audio/${id}.mp3`));
  return new Promise((listo) => {
    let hecho = false; const fin = () => { if (!hecho) { hecho = true; listo(); } };
    a.onended = fin; a.onerror = fin; a.currentTime = 0;
    const p = a.play(); if (p) p.catch(fin);
    setTimeout(fin, 7000);
  });
}
function callar() { turno++; for (const a of Object.values(audios)) a.pause(); }
async function decir(...ids) {           // dice varias frases en orden; una nueva orden interrumpe la anterior
  callar(); const mio = turno;
  for (const id of ids) { if (mio !== turno) return false; await sonar(id); }
  return mio === turno;
}
function tono(notas, dur = 0.18, tipo = "sine", vol = 0.12) {
  if (window.MUDO) return;
  if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; } }
  const t0 = ctx.currentTime;
  notas.forEach((f, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo; o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
    const t = t0 + i * dur * 0.6; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 2); o.start(t); o.stop(t + dur * 2.2);
  });
}
const sfx = { ding: () => tono([1318, 1760], 0.12), pop: () => tono([520, 880], 0.06, "triangle", 0.18),
              bien: () => tono([1046, 1318, 1568, 2093], 0.12) };

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
  { id: "uno", s: "1", nombre: "Uno", color: C.turquesa, fondo: "#DDF6F4", listo: true, lema: "¡Yo tengo un puntito!", img: "img/uno.png" },
  { id: "a", s: "A", nombre: "La A", color: C.coral, fondo: "#FFE0DC", listo: true, lema: "¡Yo hago aaa!", img: "img/a.png" }, { id: "dos", s: "2", nombre: "Dos", color: C.naranja, fondo: "#FFE6CF", listo: true, lema: "¡Me encanta hacer todo en pareja!", img: "img/dos.png" },
  { id: "e", s: "E", nombre: "La E", color: C.rosa, fondo: "#FFE1EF", listo: true, lema: "¡Yo hago eee!", img: "img/e.png" },
  { id: "tres", s: "3", nombre: "Tres", color: "#E0A100", fondo: "#FFF1C7", listo: true, lema: "¡Me encantan las aventuras!", img: "img/tres.png" },
  { id: "i", s: "I", nombre: "La I", color: C.violeta, fondo: "#ECE4FF", listo: true, lema: "¡Yo hago iii!", img: "img/i.png" },
  { id: "cuatro", s: "4", nombre: "Cuatro", color: C.azul },
  { id: "o", s: "O", nombre: "La O", color: "#FF9E7A" }, { id: "cinco", s: "5", nombre: "Cinco", color: "#44CC55" },
  { id: "u", s: "U", nombre: "La U", color: "#C757E8" },
];
const ILUS = {   // ilustraciones propias de cada juego
  puntitos: `<svg viewBox="0 0 120 90"><defs><radialGradient id="dg" cx="35%" cy="35%" r="70%"><stop offset="0" stop-color="#FFF3B8"/><stop offset=".45" stop-color="#FFC83A"/><stop offset="1" stop-color="#E0A000"/></radialGradient></defs>
    ${[[30, 30], [90, 30], [60, 48], [30, 66], [90, 66]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="13" fill="${i < 2 ? "#14B8B0" : "url(#dg)"}" stroke="#fff" stroke-width="3"/>${i < 2 ? `<text x="${x}" y="${y + 5}" text-anchor="middle" font-size="14" font-family="Fredoka" fill="#fff">${i + 1}</text>` : ""}`).join("")}</svg>`,
  cuantos: `<svg viewBox="0 0 120 90">${[28, 60, 92].map((x) => `<g transform="translate(${x} 40) scale(.55)"><path d="M0 -26 C-26 -40 -46 -14 -40 8 C-34 30 -14 38 0 30 C14 38 34 30 40 8 C46 -14 26 -40 0 -26Z" fill="#E0262E"/><path d="M5 -38 C16 -52 30 -44 30 -40 C22 -34 12 -34 5 -38Z" fill="#3DAA3A"/></g>`).join("")}
    <rect x="44" y="62" width="32" height="24" rx="8" fill="#fff"/><text x="60" y="81" text-anchor="middle" font-size="20" font-family="Fredoka" fill="#FF5A4E">3</text></svg>`,
  trazo: `<svg viewBox="0 0 120 90"><path d="M48 34 C54 28 60 20 65 19 C70 18 66 44 66 76" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".7"/>
    <path d="M48 34 C54 28 60 20 65 19 C70 18 66 40 66 52" fill="none" stroke="#1B2A6B" stroke-width="10" stroke-linecap="round"/><circle cx="66" cy="54" r="6" fill="#FFE27A" stroke="#fff" stroke-width="2"/></svg>`,
  globos: `<svg viewBox="0 0 120 90">${[[34, 38, "#FF5A4E"], [60, 30, "#FFC21A"], [86, 40, "#3D8BFF"]].map(([x, y, c]) => `<path d="M${x} ${y + 16} q-3 12 2 26" stroke="#fff" stroke-width="1.5" fill="none"/><ellipse cx="${x}" cy="${y}" rx="13" ry="16" fill="${c}" stroke="#fff" stroke-width="2.5"/><ellipse cx="${x - 4}" cy="${y - 6}" rx="3" ry="5" fill="#fff" opacity=".5"/>`).join("")}</svg>`,
};
ILUS.busca = `<svg viewBox="0 0 120 90">${[["3", 30, "#FF8A1F"], ["1", 60, "#14B8B0"], ["5", 90, "#8E6CF0"]].map(([n, x, c]) => `<rect x="${x - 15}" y="30" width="30" height="30" rx="8" fill="${c}" stroke="#fff" stroke-width="2.5"/><text x="${x}" y="53" text-anchor="middle" font-size="22" font-family="Fredoka" fill="#fff">${n}</text>`).join("")}<circle cx="72" cy="30" r="7" fill="#FFC21A" stroke="#fff" stroke-width="2"/></svg>`;
ILUS.donde = `<svg viewBox="0 0 120 90"><ellipse cx="32" cy="64" rx="24" ry="6" fill="#fff"/><ellipse cx="88" cy="64" rx="24" ry="6" fill="#fff"/><g transform="translate(32 50) scale(.42)"><path d="M0 -26 C-26 -40 -46 -14 -40 8 C-34 30 -14 38 0 30 C14 38 34 30 40 8 C46 -14 26 -40 0 -26Z" fill="#E0262E"/></g>${[76, 88, 100].map((x) => `<g transform="translate(${x} 52) scale(.3)"><path d="M0 -26 C-26 -40 -46 -14 -40 8 C-34 30 -14 38 0 30 C14 38 34 30 40 8 C46 -14 26 -40 0 -26Z" fill="#E0262E"/></g>`).join("")}<text x="32" y="26" text-anchor="middle" font-size="18" font-family="Fredoka" fill="#14B8B0">1</text></svg>`;
ILUS.memoria = `<svg viewBox="0 0 120 90"><rect x="16" y="20" width="26" height="34" rx="6" fill="#14B8B0" stroke="#fff" stroke-width="2.5"/><circle cx="29" cy="37" r="5" fill="#FFC83A"/><rect x="47" y="20" width="26" height="34" rx="6" fill="#fff" stroke="#14B8B0" stroke-width="2.5"/><polygon points="60,28 62.5,34 69,34 64,38 66,44 60,40 54,44 56,38 51,34 57.5,34" fill="#FFC21A"/><rect x="78" y="20" width="26" height="34" rx="6" fill="#14B8B0" stroke="#fff" stroke-width="2.5"/><circle cx="91" cy="37" r="5" fill="#FFC83A"/></svg>`;
ILUS.colorea = `<svg viewBox="0 0 120 90"><path d="M44 34 C50 28 56 20 61 19 C66 18 62 44 62 70" fill="none" stroke="#1B2A6B" stroke-width="14" stroke-linecap="round"/><path d="M44 34 C50 28 56 20 61 19 C66 18 62 44 62 70" fill="none" stroke="#FF6FAE" stroke-width="9" stroke-linecap="round"/><g transform="translate(86 44) rotate(35)"><rect x="-4" y="-22" width="8" height="30" rx="3" fill="#8B5A2B"/><path d="M-6 8 h12 v6 q-6 10 -12 0z" fill="#FF5A4E"/></g></svg>`;
ILUS.rompe = `<svg viewBox="0 0 120 90"><rect x="34" y="14" width="26" height="30" rx="5" fill="#14B8B0" stroke="#fff" stroke-width="2.5"/><rect x="62" y="14" width="26" height="30" rx="5" fill="#14B8B0" stroke="#fff" stroke-width="2.5" transform="rotate(8 75 29)"/><rect x="34" y="46" width="26" height="30" rx="5" fill="#14B8B0" stroke="#fff" stroke-width="2.5"/><rect x="64" y="50" width="26" height="30" rx="5" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="4 3"/><circle cx="47" cy="58" r="4" fill="#FFC83A"/></svg>`;
const JUEGOS = [
  { id: "quien", nombre: "¿Quién habla?", desc: "Escucha la voz y toca al amigo que habla.", c: "#BFE6FF", amigo: "tito", nuevo: true },
  { id: "zanahorias", nombre: "Cuenta con Tito", desc: "Cuenta las zanahorias de Tito.", c: "#FFE0C2", amigo: "tito", nuevo: true },
  { id: "memoria-amigos", nombre: "Memoria de amigos", desc: "Encuentra a los amigos iguales.", c: "#FFE1EF", amigo: "mimi", nuevo: true },
  { id: "colores", nombre: "Colores con Mamá Coneja", desc: "Naranja, morado y amarillo de Día de Muertos.", c: "#FFE6C7", amigo: "mama", nuevo: true },
  { id: "rompe-amigos", nombre: "Arma a Tito y sus amigos", desc: "Arrastra las piezas del rompecabezas.", c: "#E2F5E3", amigo: "bruno", nuevo: true },
  { id: "puntitos", nombre: "Cuenta los puntitos", desc: "Toca cada puntito y cuéntalos en voz alta.", c: "#FFE9A6" },
  { id: "cuantos", nombre: "¿Cuántos hay?", desc: "Cuenta y elige el número correcto.", c: "#FFD3CF" },
  { id: "trazo", nombre: "Traza el 1", desc: "Sigue el camino con tu dedito.", c: "#C9F0EC" },
  { id: "globos", nombre: "Revienta globos", desc: "Revienta los globos y cuéntalos.", c: "#DCD2FF" },
  { id: "busca", nombre: "Encuentra el 1", desc: "Busca todos los unos escondidos.", c: "#CFE3FF" },
  { id: "donde", nombre: "¿Dónde hay uno?", desc: "Toca el grupo que tiene solo uno.", c: "#FFE0C2" },
  { id: "memoria", nombre: "Memoria", desc: "Voltea las tarjetas y encuentra parejas.", c: "#D6F2D0" },
  { id: "colorea", nombre: "Colorea", desc: "Pinta a Uno y el prado con tus colores.", c: "#FFD6EA" },
  { id: "rompe", nombre: "Arma a Uno", desc: "Arrastra las piezas del rompecabezas.", c: "#E4DAFF" },
];
const EPISODIOS = [
  { n: 1, yt: EP1, titulo: "¡Llega el Uno!", img: "img/miniatura_ep01.jpg",
    resumen: "Un puntito brillante cae del cielo… ¡y se dibuja un 1! Conoce a Uno, aprende cómo se escribe, busca cosas de las que hay solo una y canta su canción.",
    aprende: ["El número <b>1</b> y la palabra <b>“uno”</b>", "Cómo se escribe el 1 (¡trázalo en el aire con tu dedito!)", "Contar: <b>un</b> sol, <b>un</b> árbol, <b>un</b> globo y <b>una</b> manzana"],
    juegos: [["Traza el 1", "lapiz", "#juego/trazo"], ["¿Cuántos hay?", "play", "#juego/cuantos"], ["La canción del Uno", "nota", "#cancion/uno"]] },
  { n: 2, yt: "zFOdb2WL7BM", titulo: "¡Llega la A!", img: "img/miniatura_ep02.jpg",
    resumen: "La montañita del cielo baja al prado… ¡y se dibuja la A! Aprendemos cómo suena, cómo se escribe y buscamos cosas que empiezan con A: árbol, abeja y avión.",
    aprende: ["La letra <b>A</b> y su sonido: <b>¡aaa!</b>", "Cómo se escribe la A: sube, baja ¡y una rayita en medio!", "Palabras con A: <b>á</b>rbol, <b>a</b>beja, <b>a</b>vión", "Repaso: el número 1"],
    juegos: [["La canción de la A", "nota", "#cancion/a"], ["Conoce a la A", "play", "#personaje/a"]] },
  { n: 3, yt: "h3kX3u8lR64", titulo: "¡Llega Dos!", img: "img/miniatura_ep03.jpg",
    resumen: "Un amigo nuevo con dos puntitos dorados cae del cielo… ¡y se dibuja un 2! Contamos sus puntitos, aprendemos a escribir el 2 y contamos zapatos, pajaritos y manzanas.",
    aprende: ["El número <b>2</b> y la palabra <b>“dos”</b>", "Contar hasta dos: <b>uno, dos</b>", "Cómo se escribe el 2: curvita, bajamos en diagonal ¡y una rayita!", "Repaso: Uno y la A"],
    juegos: [["La canción de Dos", "nota", "#cancion/dos"], ["Conoce a Dos", "play", "#personaje/dos"], ["¿Cuántos hay?", "play", "#juego/cuantos"]] },
  { n: 4, yt: "BjcVB_g2LTE", titulo: "¡Llega la E!", img: "img/miniatura_ep04.jpg",
    resumen: "Una letra con tres rayitas y una estrellita baja del cielo… ¡y se dibuja la E! Aprendemos cómo suena, cómo se escribe y buscamos cosas que empiezan con E: estrella, elefante y escalera.",
    aprende: ["La letra <b>E</b> y su sonido: <b>¡eee!</b>", "Cómo se escribe la E: una raya hacia abajo y tres rayitas", "Palabras con E: <b>e</b>strella, <b>e</b>lefante, <b>e</b>scalera", "Repaso: Uno, la A y Dos"],
    juegos: [["La canción de la E", "nota", "#cancion/e"], ["Conoce a la E", "play", "#personaje/e"]] },
  { n: 5, yt: "hO9z5ShcEfc", titulo: "¡Llega Tres!", img: "img/miniatura_ep05.jpg",
    resumen: "Llega un amigo valiente con tres puntitos dorados: ¡Tres! Contamos sus puntitos, aprendemos a escribir el 3 y contamos mariposas, flores y piedritas del camino.",
    aprende: ["El número <b>3</b> y la palabra <b>“tres”</b>", "Contar hasta tres: <b>uno, dos, tres</b>", "Cómo se escribe el 3: una pancita arriba y otra abajo", "Repaso: Uno, la A, Dos y la E"],
    juegos: [["La canción de Tres", "nota", "#cancion/tres"], ["Conoce a Tres", "play", "#personaje/tres"], ["Cuenta los puntitos", "play", "#juego/puntitos"]] },
  { n: 6, yt: "-hz4-ekHU1Y", titulo: "¡Llega la I!", img: "img/miniatura_ep06.jpg",
    resumen: "Una amiga alta y flaquita llega a Cuentatún: ¡la I! Aprendemos cómo suena, cómo se escribe y buscamos cosas que empiezan con I: iguana, isla e iglú.",
    aprende: ["La letra <b>I</b> y su sonido: <b>¡iii!</b>", "Cómo se escribe la I: ¡una raya derechita hacia abajo!", "Palabras con I: <b>i</b>guana, <b>i</b>sla, <b>i</b>glú", "Repaso: Uno, la A, Dos, la E y Tres"],
    juegos: [["La canción de la I", "nota", "#cancion/i"], ["Conoce a la I", "play", "#personaje/i"]] },
  { n: 7, yt: "KP4wOvTfX14", titulo: "¡Llega Cuatro!", img: "img/miniatura_ep07.jpg",
    resumen: "Llega un amigo nuevo con cuatro puntitos dorados: ¡Cuatro! Contamos sus puntitos, aprendemos cómo se escribe el 4 y contamos ruedas, estrellas y manzanas.",
    aprende: ["El número <b>4</b> y la palabra <b>“cuatro”</b>", "Contar hasta cuatro: <b>uno, dos, tres, cuatro</b>", "Cómo se escribe el 4 (¡trázalo con tu dedito!)", "Repaso: Uno, la A, Dos, la E, Tres y la I"],
    juegos: [["¿Cuántos hay?", "play", "#juego/cuantos"], ["Cuenta los puntitos", "play", "#juego/puntitos"]] },
  { n: 8, yt: "SYqPgsZma7s", titulo: "¡Llega la O!", img: "img/miniatura_ep08.jpg",
    resumen: "Una amiga redondita llega a Cuentatún: ¡la O! Aprendemos cómo suena, cómo se escribe y buscamos cosas que empiezan con O: oso, oveja y ola.",
    aprende: ["La letra <b>O</b> y su sonido: <b>¡ooo!</b>", "Cómo se escribe la O (¡trázala con tu dedito!)", "Palabras con O: <b>o</b>so, <b>o</b>veja, <b>o</b>la", "Repaso: Uno, la A, Dos, la E, Tres, la I y Cuatro"],
    juegos: [["Memoria", "play", "#juego/memoria"], ["Colorea", "lapiz", "#juego/colorea"]] },
  { n: 9, yt: "hC8bDTWCG54", titulo: "¡Llega Cinco!", img: "img/miniatura_ep09.jpg",
    resumen: "Llega un amigo nuevo con cinco puntitos dorados: ¡Cinco! Contamos sus puntitos, aprendemos cómo se escribe el 5 y contamos dedos, estrellas y globos.",
    aprende: ["El número <b>5</b> y la palabra <b>“cinco”</b>", "Contar hasta cinco: <b>uno, dos, tres, cuatro, cinco</b>", "Cómo se escribe el 5 (¡trázalo con tu dedito!)", "Repaso: Uno, la A, Dos, la E, Tres, la I, Cuatro y la O"],
    juegos: [["Revienta globos", "play", "#juego/globos"], ["¿Cuántos hay?", "play", "#juego/cuantos"]] },
  { n: 10, yt: "eaQSsTthoa0", titulo: "¡Llega la U!", img: "img/miniatura_ep10.jpg",
    resumen: "Llega una amiga nueva: ¡la U! Aprendemos cómo suena, cómo se escribe y buscamos cosas que empiezan con U: uvas, unicornio y uno.",
    aprende: ["La letra <b>U</b> y su sonido: <b>¡uuu!</b>", "Cómo se escribe la U (¡trázala con tu dedito!)", "Palabras con U: <b>u</b>vas, <b>u</b>nicornio, <b>u</b>no", "Repaso: todos los amigos de la temporada 1"],
    juegos: [["Memoria", "play", "#juego/memoria"], ["Colorea", "lapiz", "#juego/colorea"]] },
];
// Nueva temporada «Aprende con Tito y sus amigos» (estilo película)
const NUEVA = [
  { n: "tito-1", etq: "Nueva temporada · Episodio 1", yt: "6kjPfU3biD4", titulo: "¡El número 1! con Tito", img: "img/miniatura_tito01.jpg",
    resumen: "Tito, el conejito del Bosque de Cuentatún, nos enseña el número uno: cómo se escribe, a buscar cosas de las que hay solo una y conocemos a su amiga Mimi. ¡Y cantamos la canción del uno!",
    aprende: ["El número <b>1</b> y la palabra <b>“uno”</b>", "Cómo se escribe el 1: una rayita que sube y una raya larga hacia abajo", "Contar: <b>un</b> sol, <b>una</b> manzana, <b>una</b> mariposa"],
    juegos: [["Traza el 1", "lapiz", "#juego/trazo"], ["¿Dónde hay uno?", "play", "#juego/donde"], ["Encuentra el 1", "play", "#juego/busca"]] },
  { n: "mimi-a", etq: "Nueva temporada · Episodio 2", yt: "q8N0-s2wVHk", titulo: "¡La letra A! con Mimi", img: "img/miniatura_mimi_a.jpg",
    resumen: "Mimi, la ovejita del Bosque de Cuentatún, nos enseña la letra A: cómo suena, cómo se escribe y buscamos cosas que empiezan con A: abeja, árbol y avión. ¡Y cantamos con Tito!",
    aprende: ["La letra <b>A</b> y su sonido: <b>¡aaa!</b>", "Cómo se escribe la A (¡dibújala en el aire con tu dedito!)", "Palabras con A: <b>a</b>beja, <b>á</b>rbol, <b>a</b>vión"],
    juegos: [["Memoria", "play", "#juego/memoria"], ["Colorea", "lapiz", "#juego/colorea"]] },
  { n: "tito-2", etq: "Nueva temporada · Episodio 3", yt: "iHqDElsQmg0", titulo: "¡El número 2! con Tito", img: "img/miniatura_tito02.jpg",
    resumen: "Tito nos enseña el número dos: cómo se escribe, contamos dos zapatos, dos pajaritos y dos manzanas, y llega Bruno. ¡Somos dos amigos! Y cantamos la canción del dos.",
    aprende: ["El número <b>2</b> y la palabra <b>“dos”</b>", "Cómo se escribe el 2 (¡dibújalo en el aire con tu dedito!)", "Contar hasta dos: <b>uno, dos</b>"],
    juegos: [["¿Cuántos hay?", "play", "#juego/cuantos"], ["Cuenta los puntitos", "play", "#juego/puntitos"]] },
  { n: "mimi-e", etq: "Nueva temporada · Episodio 4", yt: "ZfioQ_CEr1Y", titulo: "¡La letra E! con Mimi", img: "img/miniatura_mimi_e.jpg",
    resumen: "Mimi nos enseña la letra E: cómo suena, cómo se escribe y buscamos cosas que empiezan con E: estrella, elefante y escalera. ¡Y llega Tula a cantar con nosotros!",
    aprende: ["La letra <b>E</b> y su sonido: <b>¡eee!</b>", "Cómo se escribe la E (¡dibújala en el aire con tu dedito!)", "Palabras con E: <b>e</b>strella, <b>e</b>lefante, <b>e</b>scalera"],
    juegos: [["Memoria", "play", "#juego/memoria"], ["Colorea", "lapiz", "#juego/colorea"]] },
  { n: "tito-3", etq: "Nueva temporada · Episodio 5", yt: "O0795qJCcIc", titulo: "¡El número 3! con Tito", img: "img/miniatura_n03.jpg",
    resumen: "Tito nos enseña el número tres: cómo se escribe y contamos tres mariposas, tres pelotas, tres piedritas. ¡Y cantamos con sus amigos!",
    aprende: ["El número <b>3</b> y la palabra <b>“tres”</b>", "Cómo se escribe el 3 (¡dibújalo en el aire con tu dedito!)", "Contar hasta tres"],
    juegos: [["¿Cuántos hay?", "play", "#juego/cuantos"], ["Cuenta los puntitos", "play", "#juego/puntitos"]] },
  { n: "mimi-i", etq: "Nueva temporada · Episodio 6", yt: "T1ZNRQ3hz9s", titulo: "¡La letra I! con Mimi", img: "img/miniatura_i06.jpg",
    resumen: "Mimi nos enseña la letra I: cómo suena, cómo se escribe y buscamos cosas que empiezan con I: iguana, isla, iglú.",
    aprende: ["La letra <b>I</b> y su sonido: <b>¡Iii!</b>", "Cómo se escribe la I (¡dibújala en el aire con tu dedito!)", "Palabras con I: iguana, isla, iglú"],
    juegos: [["Memoria", "play", "#juego/memoria"], ["Colorea", "lapiz", "#juego/colorea"]] },
  { n: "tito-4", etq: "Nueva temporada · Episodio 7", yt: "hgDAUHsAGm4", titulo: "¡El número 4! con Tito", img: "img/miniatura_n04.jpg",
    resumen: "Tito nos enseña el número cuatro: cómo se escribe y contamos cuatro ruedas, cuatro estrellas, cuatro manzanas. ¡Y cantamos con sus amigos!",
    aprende: ["El número <b>4</b> y la palabra <b>“cuatro”</b>", "Cómo se escribe el 4 (¡dibújalo en el aire con tu dedito!)", "Contar hasta cuatro"],
    juegos: [["¿Cuántos hay?", "play", "#juego/cuantos"], ["Cuenta los puntitos", "play", "#juego/puntitos"]] },
  { n: "mimi-o", etq: "Nueva temporada · Episodio 8", yt: "ReGbuQ-wxaw", titulo: "¡La letra O! con Mimi", img: "img/miniatura_o08.jpg",
    resumen: "Mimi nos enseña la letra O: cómo suena, cómo se escribe y buscamos cosas que empiezan con O: oso, oveja, ola.",
    aprende: ["La letra <b>O</b> y su sonido: <b>¡Ooo!</b>", "Cómo se escribe la O (¡dibújala en el aire con tu dedito!)", "Palabras con O: oso, oveja, ola"],
    juegos: [["Memoria", "play", "#juego/memoria"], ["Colorea", "lapiz", "#juego/colorea"]] },
  { n: "tito-5", etq: "Nueva temporada · Episodio 9", yt: "Lt3JAlFncy4", titulo: "¡El número 5! con Tito", img: "img/miniatura_n05.jpg",
    resumen: "Tito nos enseña el número cinco: cómo se escribe y contamos cinco globos, cinco estrellas, cinco galletas. ¡Y cantamos con sus amigos!",
    aprende: ["El número <b>5</b> y la palabra <b>“cinco”</b>", "Cómo se escribe el 5 (¡dibújalo en el aire con tu dedito!)", "Contar hasta cinco"],
    juegos: [["¿Cuántos hay?", "play", "#juego/cuantos"], ["Cuenta los puntitos", "play", "#juego/puntitos"]] },
  { n: "mimi-u", etq: "Nueva temporada · Episodio 10", yt: "tceptlu3skE", titulo: "¡La letra U! con Mimi", img: "img/miniatura_u10.jpg",
    resumen: "Mimi nos enseña la letra U: cómo suena, cómo se escribe y buscamos cosas que empiezan con U: uvas, unicornio, uno.",
    aprende: ["La letra <b>U</b> y su sonido: <b>¡Uuu!</b>", "Cómo se escribe la U (¡dibújala en el aire con tu dedito!)", "Palabras con U: uvas, unicornio, uno"],
    juegos: [["Memoria", "play", "#juego/memoria"], ["Colorea", "lapiz", "#juego/colorea"]] },
];
const ULTIMO = NUEVA[NUEVA.length - 1];
const AMIGOS = [
  { id: "tito", nombre: "Tito", quien: "Conejito", color: C.turquesa, fondo: "#DDF6F4", lema: "Curioso y rápido. ¡Nos enseña los números!" },
  { id: "mimi", nombre: "Mimi", quien: "Ovejita", color: C.rosa, fondo: "#FFE1EF", lema: "Dulce y tímida. ¡Nos enseña las letras!" },
  { id: "tula", nombre: "Tula", quien: "Tortuguita", color: "#44AA55", fondo: "#E2F5E3", lema: "Paciente y sabia, con sus lentes redondos." },
  { id: "bruno", nombre: "Bruno", quien: "Osito", color: C.naranja, fondo: "#FFE6CF", lema: "Bromista y comelón, con su gorra azul." },
];
const MUERTOS = [
  { n: "muertos-1", etq: "Día de Muertos · Episodio 1", yt: "DQnm6P8MTvY", titulo: "¡Ya viene el Día de Muertos!", img: "img/miniatura_m01.jpg",
    resumen: "Tito y Mamá Coneja van al mercado del pueblito a preparar el Día de Muertos y aprenden los colores: el naranja del cempasúchil, el morado del papel picado y el amarillo de las velitas.",
    aprende: ["Los colores <b>naranja</b>, <b>morado</b> y <b>amarillo</b>", "Qué es el Día de Muertos: recordar con cariño", "La canción de los colores"],
    juegos: [["Colorea", "lapiz", "#juego/colorea"], ["Memoria", "play", "#juego/memoria"]] },
];
const CUENTOS = [
  { n: "cuento-1", etq: "Cuento para dormir", yt: "pw3RSGPaFYg", titulo: "Tito y las estrellitas de la noche", img: "img/miniatura_c01.jpg",
    resumen: "Tito descubre que la noche está llena de estrellitas amigas y aprende a dormir solito sin miedo a la oscuridad.",
    aprende: ["Dormir solito sin miedo", "La noche y las estrellas", "Un cuento tranquilo para antes de dormir"],
    juegos: [["Colorea", "lapiz", "#juego/colorea"], ["Memoria", "play", "#juego/memoria"]] },
];
const tarjetaAmigo = (p) => `<a class="personaje" href="#episodios"><span class="insignia">${p.quien}</span><div class="foto" style="--c:${p.fondo}"><img src="img/amigo_${p.id}.png" alt="${p.nombre}" width="420" height="420" loading="lazy"></div><h3>${p.nombre}</h3><small>${p.lema}</small></a>`;
const tarjetaEp = (e) => `<a class="juego-tarjeta" href="#episodio/${e.n}"><img src="${e.img}" alt="" width="1280" height="720" style="aspect-ratio:16/9;object-fit:cover"><div class="txt"><h3>${e.titulo}</h3></div></a>`;
const CANCIONES = {
  uno: { titulo: "La canción del Uno", ep: 1, audio: "audio/cancion_del_uno.m4a", fin: 32, letra: [
    [8.6, "Uno, uno, tengo un puntito"], [12.8, "Uno, uno, derechito y bonito"],
    [18.46, 'Un <b class="palabra" data-t="19.42">sol</b>, un <b class="palabra" data-t="20.44">árbol</b>, un <b class="palabra" data-t="21.54">globo</b> también'],
    [22.92, "¡Uno, uno, lo cuento muy bien!"]] },
  a: { titulo: "La canción de la A", ep: 2, audio: "audio/cancion_de_la_a.m4a", fin: 26, letra: [
    [5.94, "A, a, a, la A ya llegó"], [8.64, "con forma de montaña, ¡qué bonita salió!"],
    [13.66, '<b class="palabra" data-t="13.66">Abeja</b>, <b class="palabra" data-t="16.6">árbol</b> y <b class="palabra" data-t="17.96">avión</b>'],
    [19.9, "¡A, a, a, qué bonita canción!"]] },
  dos: { titulo: "La canción de Dos", ep: 3, audio: "audio/cancion_del_dos.m4a", fin: 25.9, letra: [
    [3.92, "Dos, dos, dos, el número dos llegó,"], [8.54, "con dos puntitos, ¡qué bonito salió!"],
    [13.62, 'Dos <b class="palabra" data-t="14.76">zapatos</b>, dos <b class="palabra" data-t="17.18">pajaritos</b>,'],
    [18.46, "¡dos, dos, dos, cuéntalos conmigo!"]] },
  e: { titulo: "La canción de la E", ep: 4, audio: "audio/cancion_e.m4a", fin: 24.6, letra: [
    [3.72, "E, e, e, la E ya llegó,"], [8.48, "con sus tres rayitas, ¡qué bonita salió!"],
    [13.54, '<b class="palabra" data-t="13.54">Estrella</b>, <b class="palabra" data-t="16.3">elefante</b> y <b class="palabra" data-t="17.56">escalera</b>,'],
    [18.46, "¡E, e, e, canta la E entera!"]] },
  tres: { titulo: "La canción de Tres", ep: 5, audio: "audio/cancion_tres.m4a", fin: 29.4, letra: [
    [9.2, "Tres, tres, tres, el número tres llegó,"], [13.84, "con tres puntitos, ¡qué valiente salió!"],
    [19.12, 'Tres <b class="palabra" data-t="19.74">mariposas</b>, tres <b class="palabra" data-t="22.64">flores</b>,'],
    [23.92, "¡tres, tres, tres, de muchos colores!"]] },
  i: { titulo: "La canción de la I", ep: 6, audio: "audio/cancion_i.m4a", fin: 24.84, letra: [
    [4.18, "I, i, i, la I ya llegó,"], [8.92, "alta y flaquita, ¡qué bonita salió!"],
    [13.88, '<b class="palabra" data-t="13.88">Iguana</b>, <b class="palabra" data-t="15.72">isla</b> y un <b class="palabra" data-t="17.47">iglú</b>,'],
    [18.56, "¡i, i, i, canta tú!"]] },
};
// fichas de los amigos nuevos (la de Uno y la de la A están escritas a mano más abajo)
const FICHAS = {
  dos: { tipo: "Número", bajada: "El tercer amigo de Cuentatún: juguetón y le encanta hacer todo en pareja.", ep: 3,
    voces: [["Escuchar a Dos", "d_hola"], ["Contar sus puntitos", "d_puntitos"]],
    llego: "Dos puntitos dorados brillaban en el cielo. Se juntaron en una estrellita que cayó al prado… ¡y se dibujó un 2!",
    escribe: "Hacemos una curvita… bajamos en diagonal… ¡y una rayita derechita!",
    gusta: "Las cosas que vienen en pareja: <b>dos</b> zapatos, <b>dos</b> pajaritos y <b>dos</b> manzanas.",
    filas: [["Es el número", '<b style="font-size:20px">2</b> (dos)'], ["Puntitos", '<span class="puntito"></span><span class="puntito"></span> dos'], ["Color", "Naranja"], ["Su frase", "“¡Me encanta hacer todo en pareja!”"]] },
  e: { tipo: "Vocal", bajada: "Alegre y brillante: le encanta mirar las estrellas.", ep: 4,
    voces: [["Escuchar a la E", "e_hola"], ["¿Cómo suena?", "e_suena"]],
    llego: "Una letra con tres rayitas y una estrellita brillaba en el cielo. Cayó al prado… ¡y se dibujó la E!",
    escribe: "Una raya derechita hacia abajo… una rayita arriba… una en medio… ¡y otra abajo!",
    gusta: "Las cosas que empiezan con E: la <b>e</b>strella, el <b>e</b>lefante y la <b>e</b>scalera.",
    filas: [["Es la letra", '<b style="font-size:20px">E</b> (vocal)'], ["Suena", "¡eee!"], ["En su pancita", "Una estrellita ⭐"], ["Color", "Rosa"]] },
  tres: { tipo: "Número", bajada: "Valiente y aventurero: siempre quiere explorar el prado.", ep: 5,
    voces: [["Escuchar a Tres", "t_hola"], ["Contar sus puntitos", "t_puntitos"]],
    llego: "Tres puntitos dorados brillaban en el cielo. Se juntaron en una estrellita que cayó al prado… ¡y se dibujó un 3!",
    escribe: "Hacemos una pancita arriba… ¡y otra pancita abajo!",
    gusta: "Contar hasta tres: <b>tres</b> mariposas, <b>tres</b> flores y <b>tres</b> piedritas del camino.",
    filas: [["Es el número", '<b style="font-size:20px">3</b> (tres)'], ["Puntitos", '<span class="puntito"></span><span class="puntito"></span><span class="puntito"></span> tres'], ["Color", "Amarillo sol"], ["Su frase", "“¡Me encantan las aventuras!”"]] },
  i: { tipo: "Vocal", bajada: "Alta y flaquita, un poquito tímida pero muy curiosa.", ep: 6,
    voces: [["Escuchar a la I", "i_hola"], ["¿Cómo suena?", "i_suena"]],
    llego: "Una letra alta y flaquita brillaba en el cielo. Cayó al prado… ¡y se dibujó la I!",
    escribe: "Una raya derechita hacia abajo… ¡y listo! ¡Así de fácil!",
    gusta: "Las cosas que empiezan con I: la <b>i</b>guana, la <b>i</b>sla y el <b>i</b>glú.",
    filas: [["Es la letra", '<b style="font-size:20px">I</b> (vocal)'], ["Suena", "¡iii!"], ["En su pancita", "Una iguanita 🦎"], ["Color", "Violeta"]] },
};
function vistaFicha(id) {
  const p = PERSONAJES.find((x) => x.id === id), f = FICHAS[id], e = EPISODIOS.find((x) => x.n === f.ep);
  pagina(`${miga('<a href="#personajes">Amigos</a>', p.nombre)}
    <div class="art-con-ficha"><div>
      <span class="etiqueta" style="background:${p.fondo};color:${p.color}">Personaje · ${f.tipo}</span>
      <h1 style="margin-top:14px">${p.nombre}</h1>
      <p class="bajada">${f.bajada}</p>
      <div class="medios">${f.voces.map(([t, a], i) => boton(t, "altavoz", `data-decir="${a}"`, i === 0 ? "primario" : "")).join("")}</div>
      <h2>¿Cómo llegó a Cuentatún?</h2><p>${f.llego}</p>
      <h2>Así se escribe ${f.tipo === "Número" ? "el " + p.s : "la " + p.s}</h2><p>${f.escribe}</p>
      <h2>Le encanta…</h2><p>${f.gusta}</p>
      <div class="medios">${enlace("Su canción", "nota", `#cancion/${id}`)}${e ? enlace("Ver su episodio", "play", `#episodio/${e.n}`) : ""}</div>
    </div>
    <aside class="ficha">
      <div class="ficha-img" style="background:radial-gradient(circle at 50% 60%, #fff, ${p.fondo})"><img src="${p.img}" alt="${p.nombre}, personaje de Cuentatún" width="560" height="714"></div>
      <div class="ficha-titulo">${p.nombre}</div>
      <table>${f.filas.map(([a, b]) => `<tr><th>${a}</th><td>${b}</td></tr>`).join("")}
        ${e ? `<tr><th>Episodio</th><td><a href="#episodio/${e.n}">${e.titulo}</a></td></tr>` : ""}</table>
    </aside></div>`);
}
const tarjetaJuego = (j) => `<a class="juego-tarjeta" href="#juego/${j.id}"><div class="ilus" style="--c:${j.c}">${j.amigo ? `<img src="img/amigo_${j.amigo}.png" alt="" style="height:88%;width:auto;margin:auto;display:block">` : ILUS[j.id]}</div>
  <div class="txt"><h3>${j.nombre}</h3><p>${j.desc}</p></div></a>`;
const tarjetaPersonaje = (p) => p.listo
  ? `<a class="personaje" href="#personaje/${p.id}"><span class="insignia">¡Ya llegó!</span><div class="foto" style="--c:${p.fondo}"><img src="${p.img}" alt="${p.nombre}" width="620" height="730"></div><h3>${p.nombre}</h3><small>${p.lema}</small></a>`
  : `<div class="personaje pronto" style="--c:${p.color}"><span class="insignia">Pronto</span><div class="foto"><span class="simbolo">${p.s}</span></div><h3>${p.nombre}</h3><small>Muy pronto en Cuentatún</small></div>`;
const miga = (...pasos) => `<nav class="miga" aria-label="Estás en"><a href="#inicio">Inicio</a>${pasos.map((p) => `<span>›</span>${p}`).join("")}</nav>`;
const pagina = (contenido) => art.append(html(`<div class="pagina">${contenido}</div>`));

/* ================= vistas ================= */
const VISTAS = {
  inicio() {
    art.append(html(`
    <section class="heroe">
      <picture><source media="(max-width: 760px)" srcset="img/portada_tito-cel.jpg"><img class="heroe-img" src="img/portada_tito.jpg" alt="Tito, Mimi, Tula y Bruno en el prado del Bosque de Cuentatún" width="1920" height="1080"></picture>
      <div class="contenedor"><div class="heroe-texto">
        <span class="etiqueta">Para niños de 2 a 5 años</span>
        <h1>Aprende con <em>Tito y sus amigos</em></h1>
        <p>Tito, Mimi, Tula y Bruno enseñan números, letras y colores con caricaturas, canciones, cuentos y juegos en español.</p>
        <div class="acciones">${enlace("Seguir en YouTube", "yt", SEGUIR, "primario")}${enlace("Ver episodios", "play", "#episodios")}</div>
        <ul class="confianza"><li>${I.check}En español</li><li>${I.check}Sin anuncios en la web</li><li>${I.check}Sin sustos</li></ul>
      </div></div>
    </section>

    <section class="seccion">
      <div class="contenedor">
        <div class="encabezado"><div><h2>Conoce a Tito y sus amigos</h2><p>Cuatro amigos del Bosque de Cuentatún. Tito enseña los números, Mimi las letras, y juntos cantan, cuentan y juegan.</p></div>
          <a class="enlace-flecha" href="#personajes">Ver a todos</a></div>
        <div class="carrusel">${AMIGOS.map(tarjetaAmigo).join("")}</div>
      </div>
    </section>

    <section class="seccion" style="background:#FFF1E2">
      <div class="contenedor">
        <div class="encabezado"><div><span class="etiqueta">Temporada especial</span><h2>Día de Muertos con Tito y sus amigos 🌼</h2>
          <p>Una temporada tierna y muy mexicana: el mercado, el papel picado, el pan de muerto, las calaveritas, las mariposas monarca, la ofrenda y Janitzio. ¡Sin sustos!</p></div>
          <a class="enlace-flecha" href="#episodios">Ver la temporada</a></div>
        <div class="rejilla">${MUERTOS.slice().reverse().map(tarjetaEp).join("")}</div>
      </div>
    </section>

    <section class="seccion cielo">
      <div class="contenedor destacado">
        <a class="video" href="#episodio/${ULTIMO.n}" aria-label="Ver ${ULTIMO.titulo}"><img src="${ULTIMO.img}" alt="${ULTIMO.titulo}" width="1280" height="720" loading="lazy"><span class="play">${I.play}</span></a>
        <div>
          <span class="etiqueta">¡Nuevo! · ${ULTIMO.etq || "Episodio " + ULTIMO.n}</span>
          <h3>${ULTIMO.titulo}</h3>
          <p>${ULTIMO.resumen}</p>
          <ul class="lista-check">${ULTIMO.aprende.slice(0, 3).map((x) => `<li><span>${x}</span></li>`).join("")}</ul>
          <div class="acciones">${enlace("Ver el episodio", "play", `#episodio/${ULTIMO.n}`, "primario")}${enlace("Más episodios", "", "#episodios")}</div>
        </div>
      </div>
    </section>

    <section class="seccion marino">
      <div class="contenedor">
        <div class="encabezado"><div><h2>Juega con Tito y sus amigos</h2><p>Juegos que hablan con la voz de cada amigo, así que no hace falta saber leer. Se juegan con un dedito en el celular o la tableta.</p></div>
          <a class="enlace-flecha" href="#juegos" style="color:#fff">Todos los juegos</a></div>
        <div class="rejilla">${JUEGOS.slice(0, 8).map(tarjetaJuego).join("")}</div>
      </div>
    </section>

    <section class="seccion crema">
      <div class="contenedor cancion-bloque">
        <div>
          <span class="etiqueta">Canciones</span>
          <h2 style="font-size:clamp(30px,3.8vw,44px);margin:14px 0 12px">¡A cantar con Uno!</h2>
          <p style="color:var(--suave);font-size:18px">Canciones originales, pegajosas y fáciles de cantar. La letra se ilumina mientras suena.</p>
          <div class="acciones" style="margin-top:22px">${enlace("Escuchar la canción del Uno", "nota", "#cancion/uno", "oscuro")}</div>
        </div>
        <div class="karaoke" aria-hidden="true"><div>Uno, uno, tengo un puntito</div><div class="ahora">Uno, uno, derechito y bonito</div><div>Un sol, un árbol, un globo también</div><div>¡Uno, uno, lo cuento muy bien!</div></div>
      </div>
    </section>

    <section class="seccion seguir">
      <div class="contenedor seguir-caja">
        <img src="img/uno.png" alt="" width="620" height="730">
        <div><h2>¡No te pierdas ningún episodio!</h2>
          <p>Cada semana llega un amigo nuevo a Cuentatún. Sigue el canal en YouTube y te avisamos cuando salga.</p>
          <div class="acciones">${enlace("Seguir en YouTube", "yt", SEGUIR, "primario")}</div></div>
      </div>
    </section>

    <section class="seccion">
      <div class="contenedor">
        <div class="encabezado"><div><h2>Para mamás, papás y maestros</h2><p>Hecho con cuidado para los más pequeños.</p></div><a class="enlace-flecha" href="#papas">Saber más</a></div>
        <div class="pilares">
          <div class="pilar"><div class="ico" style="--c:${C.turquesa}">${I.ojo}</div><h3>Lo que se dice, se ve</h3><p>Si decimos “tres”, en pantalla hay exactamente tres. Así se aprende a contar sin confusiones.</p></div>
          <div class="pilar"><div class="ico" style="--c:${C.coral}">${I.corazon}</div><h3>Tranquilo y alegre</h3><p>Ritmo pausado, colores suaves, canciones originales y pausas para que tu peque participe.</p></div>
          <div class="pilar"><div class="ico" style="--c:${C.violeta}">${I.escudo}</div><h3>Seguro y privado</h3><p>Canal marcado como contenido infantil. Esta web no usa cookies ni pide ningún dato.</p></div>
        </div>
      </div>
    </section>`));
  },

  personajes() {
    pagina(`${miga("Amigos")}<h1>Tito y sus amigos</h1>
      <p class="bajada">Los protagonistas de Cuentatún: cuatro amigos del Bosque que aprenden y juegan contigo.</p>
      <div class="rejilla" style="margin-top:30px">${AMIGOS.map(tarjetaAmigo).join("")}</div>
      <h2 style="margin-top:48px">Los números y las letras de la temporada anterior</h2>
      <div class="rejilla" style="margin-top:20px">${PERSONAJES.map(tarjetaPersonaje).join("")}</div>`);
  },

  "personaje/uno"() {
    pagina(`${miga('<a href="#personajes">Amigos</a>', "Uno")}
      <div class="art-con-ficha"><div>
        <span class="etiqueta">Personaje · Número</span>
        <h1 style="margin-top:14px">Uno</h1>
        <p class="bajada">El primer amigo de Cuentatún: curioso, alegre y muy valiente, porque fue el primero en llegar.</p>
        <div class="medios">${boton("Escuchar a Uno", "altavoz", 'data-decir="u_hola"', "primario")}${boton("¿Qué tiene en su pancita?", "altavoz", 'data-decir="u_puntito"')}</div>
        <h2>¿Cómo llegó a Cuentatún?</h2>
        <p>Un día, un puntito dorado brilló en el cielo, cayó al prado con un “¡pum!” y… ¡se dibujó un 1! Así nació Uno, con su puntito en la pancita.</p>
        <h2>Así se escribe el uno</h2>
        <p>Una rayita que sube un poquito… ¡y una raya que baja derechito!</p>
        <svg class="demo-trazo" viewBox="0 0 280 320" role="img" aria-label="Cómo se escribe el número 1">
          <path d="M60 120 C87 93 111 51 135 48 C159 45 138 165 138 292" fill="none" stroke="#fff" stroke-width="32" stroke-linecap="round"/>
          <path id="demo-tinta" d="M60 120 C87 93 111 51 135 48 C159 45 138 165 138 292" fill="none" stroke="${C.turquesa}" stroke-width="30" stroke-linecap="round"/>
          <circle cx="60" cy="120" r="12" fill="#6BDB6B" stroke="#fff" stroke-width="3"/>
        </svg>
        <div class="medios">${boton("Ver cómo se escribe", "play", 'id="ver-trazo"')}${enlace("¡Trázalo tú!", "lapiz", "#juego/trazo")}</div>
        <h2>Le gusta…</h2>
        <p>Buscar cosas de las que hay <b>solo una</b>: un sol, un árbol, un globo… ¡y una manzana!</p>
        <div class="medios">${enlace("Jugar a contar", "play", "#juego/puntitos")}${enlace("Su canción", "nota", "#cancion/uno")}</div>
      </div>
      <aside class="ficha">
        <div class="ficha-img"><img src="img/uno.png" alt="Uno, un 1 turquesa con carita feliz y un puntito dorado en la pancita" width="620" height="730"></div>
        <div class="ficha-titulo">Uno</div>
        <table>
          <tr><th>Es el número</th><td><b style="font-size:20px">1</b> (uno)</td></tr>
          <tr><th>Puntitos</th><td><span class="puntito"></span> uno</td></tr>
          <tr><th>Color</th><td>Turquesa</td></tr>
          <tr><th>Vive en</th><td>El prado de Cuentatún</td></tr>
          <tr><th>Su frase</th><td>“¡Yo tengo un puntito!”</td></tr>
          <tr><th>Episodio</th><td><a href="#episodio/1">¡Llega el Uno!</a></td></tr>
        </table>
      </aside></div>`);
    const tinta = $("#demo-tinta"), L = tinta.getTotalLength();
    tinta.style.strokeDasharray = L; tinta.style.strokeDashoffset = 0;
    $("#ver-trazo").onclick = () => {
      tinta.style.transition = "none"; tinta.style.strokeDashoffset = L; tinta.getBoundingClientRect();
      tinta.style.transition = "stroke-dashoffset 2.4s linear"; tinta.style.strokeDashoffset = 0; sfx.ding();
    };
  },

  "personaje/a"() {
    pagina(`${miga('<a href="#personajes">Amigos</a>', "La A")}
      <div class="art-con-ficha"><div>
        <span class="etiqueta" style="background:#FFE3E0;color:${C.coral}">Personaje · Vocal</span>
        <h1 style="margin-top:14px">La A</h1>
        <p class="bajada">La primera letra de Cuentatún: alegre, cantarina y con forma de montañita.</p>
        <div class="medios">${boton("Escuchar a la A", "altavoz", 'data-decir="a_hola"', "primario")}${boton("¿Cómo suena?", "altavoz", 'data-decir="a_suena"')}</div>
        <h2>¿Cómo llegó a Cuentatún?</h2>
        <p>Una montañita brillaba en el cielo. Se volvió estrellita, cayó al prado… ¡y se dibujó una A! Desde entonces es la mejor amiga de Uno.</p>
        <h2>Así se escribe la A</h2>
        <p>Subimos como una montañita… bajamos del otro lado… ¡y una rayita en medio!</p>
        <h2>Le encantan…</h2>
        <p>Las cosas que empiezan con A: el <b>á</b>rbol, la <b>a</b>beja y el <b>a</b>vión.</p>
        <div class="medios">${enlace("Su canción", "nota", "#cancion/a")}${enlace("Ver su episodio", "play", "#episodio/2")}</div>
      </div>
      <aside class="ficha">
        <div class="ficha-img" style="background:radial-gradient(circle at 50% 60%, #FFE9E6, #FFCFC8)"><img src="img/a.png" alt="La A, una A color coral con carita feliz y un arbolito en la pancita" width="552" height="733"></div>
        <div class="ficha-titulo">La A</div>
        <table>
          <tr><th>Es la letra</th><td><b style="font-size:20px;color:${C.coral}">A</b> (vocal)</td></tr>
          <tr><th>Suena</th><td>¡aaa!</td></tr>
          <tr><th>En su pancita</th><td>Un arbolito 🌳</td></tr>
          <tr><th>Color</th><td>Coral</td></tr>
          <tr><th>Su mejor amigo</th><td><a href="#personaje/uno">Uno</a></td></tr>
          <tr><th>Episodio</th><td><a href="#episodio/2">¡Llega la A!</a></td></tr>
        </table>
      </aside></div>`);
  },

  episodios() {
    pagina(`${miga("Episodios")}<h1>Día de Muertos con Tito y sus amigos 🌼</h1>
      <p class="bajada">Temporada especial: tradiciones mexicanas contadas con cariño, colores y canciones. ¡Un episodio nuevo cada dos días!</p>
      <div class="rejilla" style="margin-top:30px">${MUERTOS.slice().reverse().map(tarjetaEp).join("")}</div>
      ${CUENTOS.length ? `<h1 style="margin-top:48px">Cuentos para dormir</h1><div class="rejilla" style="margin-top:30px">${CUENTOS.slice().reverse().map(tarjetaEp).join("")}</div>` : ""}
      <h1 style="margin-top:48px">Aprende con Tito y sus amigos</h1>
      <p class="bajada">Tito enseña los números y Mimi las letras, ahora en estilo película. ¡Un episodio nuevo cada semana!</p>
      <div class="rejilla" style="margin-top:30px">${NUEVA.slice().reverse().map((e) => `<a class="juego-tarjeta" href="#episodio/${e.n}"><img src="${e.img}" alt="" width="1280" height="720" style="aspect-ratio:16/9;object-fit:cover"><div class="txt"><h3>${e.titulo}</h3></div></a>`).join("")}</div>
      <h1 style="margin-top:48px">Temporada anterior</h1>
      <p class="bajada">Los números del 1 al 5 y las vocales A, E, I, O, U. Cada episodio repasa a todos los amigos anteriores.</p>
      <div class="rejilla" style="margin-top:30px">${EPISODIOS.slice().reverse().map((e) => `<a class="juego-tarjeta" href="#episodio/${e.n}"><img src="${e.img}" alt="" width="1280" height="720" style="aspect-ratio:16/9;object-fit:cover"><div class="txt"><h3>Episodio ${e.n}: ${e.titulo}</h3></div></a>`).join("")}</div>
      ${PERSONAJES.length > EPISODIOS.length ? "<h2>Próximamente</h2>" : ""}
      <div class="rejilla">${PERSONAJES.slice(EPISODIOS.length).map((p, i) => `<div class="personaje pronto" style="--c:${p.color}"><div class="foto" style="height:120px"><span class="simbolo" style="font-size:64px">${p.s}</span></div><h3 style="font-size:18px">Episodio ${i + EPISODIOS.length + 1}</h3><small>Llega ${p.nombre.startsWith("La ") ? "la " + p.s : "el " + p.nombre}</small></div>`).join("")}</div>`);
  },

  cuentos() {
    const P_ = [["tito", "Tito", "Conejito curioso y rápido… y un poquito miedoso de la oscuridad."],
                ["mimi", "Mimi", "Ovejita esponjosa y tímida, con su moñito amarillo."],
                ["tula", "Tula", "Tortuguita paciente y sabia, con sus lentes redondos."],
                ["bruno", "Bruno", "Osito bromista y comelón, con su gorra azul."]];
    const C_ = [["Tito y las estrellitas de la noche", "Para dormir solito sin miedo a la oscuridad."],
                ["El columpio de Mimi", "Compartir y esperar turnos."],
                ["La carrera de Tito y Tula", "Despacito y sin rendirse se llega a la meta."]];
    pagina(`${miga("Cuentos")}<h1>Cuentos de Cuentatún</h1>
      <p class="bajada">Historias originales para ver, escuchar y leer juntos antes de dormir. Cada cuento trae una enseñanza sencilla y preguntas para platicar en familia.</p>
      <img src="img/portada_tito.jpg" alt="Tito, Mimi, Tula y Bruno en el prado" width="1280" height="720" style="width:100%;height:auto;border-radius:24px;margin-top:24px">
      <h2>Los protagonistas</h2>
      <div class="rejilla">${P_.map(([id, n, d]) => `<div class="personaje" style="--c:#8E6CF0"><div class="foto" style="--c:#EFEAFF"><img src="img/amigo_${id}.png" alt="${n}" width="420" height="750"></div><h3>${n}</h3><small>${d}</small></div>`).join("")}</div>
      ${CUENTOS.length ? `<h2>Ya puedes verlos</h2><div class="rejilla">${CUENTOS.map(tarjetaEp).join("")}</div>` : ""}
      <h2>Muy pronto</h2>
      <div class="rejilla">${C_.map(([t, d]) => `<div class="juego-tarjeta pronto"><div class="ilus" style="--c:#DCD2FF"><span style="font-family:var(--titulo);font-size:54px;color:#fff">📖</span></div><div class="txt"><h3>${t}</h3><p>${d}</p></div></div>`).join("")}</div>
      <p class="aviso" style="margin-top:24px">Cada cuento tendrá su video, el texto para leerlo juntos y una versión para imprimir.</p>`);
  },

  canciones() {
    pagina(`${miga("Canciones")}<h1>Canciones de Cuentatún</h1>
      <p class="bajada">Canciones originales para cantar y contar.</p>
      <div class="rejilla" style="margin-top:30px">${Object.entries(CANCIONES).map(([id, c]) => { const p = PERSONAJES.find((x) => x.id === id); return `<a class="juego-tarjeta" href="#cancion/${id}"><div class="ilus" style="--c:${id === "uno" ? "#DCD2FF" : p.color}">${id === "uno" ? ILUS.puntitos : `<span style="font-family:var(--titulo);font-size:70px;color:#fff">${p.s}</span>`}</div><div class="txt"><h3>${c.titulo}</h3><p>Episodio ${c.ep}</p></div></a>`; }).join("")}</div>`);
  },

  juegos() {
    pagina(`${miga("Juegos")}<h1>¿A qué quieres jugar?</h1>
      <p class="bajada">Juegos para escuchar, contar, recordar y armar. Todos hablan, así que no hace falta saber leer.</p>
      <h2 style="margin-top:30px">Juega con Tito y sus amigos</h2>
      <div class="rejilla" style="margin-top:20px">${JUEGOS.filter((j) => j.amigo).map(tarjetaJuego).join("")}</div>
      <h2 style="margin-top:44px">Más juegos de números</h2>
      <div class="rejilla" style="margin-top:20px">${JUEGOS.filter((j) => !j.amigo).map(tarjetaJuego).join("")}</div>`);
    decir("elige");
  },

  papas() {
    pagina(`${miga("Familias")}<span class="etiqueta">Para mamás, papás y maestros</span><h1 style="margin-top:14px">Sobre Cuentatún</h1>
      <p class="bajada">Caricaturas y juegos educativos en español para niños de 2 a 5 años. Un desarrollo de CorexDev.</p>
      <div class="pilares" style="margin-top:30px">
        <div class="pilar"><div class="ico" style="--c:${C.turquesa}">${I.ojo}</div><h3>Lo que se dice, se ve</h3><p>Si decimos “tres”, en pantalla hay exactamente tres. Cada número lleva sus puntitos dorados.</p></div>
        <div class="pilar"><div class="ico" style="--c:${C.coral}">${I.corazon}</div><h3>Tranquilo y alegre</h3><p>Ritmo pausado, colores suaves, canciones originales y nada de sustos.</p></div>
        <div class="pilar"><div class="ico" style="--c:${C.violeta}">${I.escudo}</div><h3>Seguro y privado</h3><p>Canal marcado como contenido infantil: sin comentarios ni anuncios personalizados. Esta web no usa cookies.</p></div>
      </div>
      <h2>Consejos para verlo juntos</h2>
      <ul class="lista-check"><li>Cuenten en voz alta y tracen los números en el aire con el dedito.</li><li>Busquen en casa cosas “de las que hay solo una”, como hace Uno.</li><li>A esta edad se recomienda poco tiempo de pantalla: mejor ratos cortos y acompañados.</li></ul>
      <h2>Contacto</h2>
      <p><a href="mailto:cuentatun.com@gmail.com">cuentatun.com@gmail.com</a>. Por favor, no nos envíen datos ni fotos de niños.</p>
      <p class="aviso">Personajes, música y canciones originales de Cuentatún. <a href="privacidad.html">Aviso de privacidad</a>.</p>`);
  },

  "juego/puntitos": () => juegoPuntitos(),
  ...Object.fromEntries(EPISODIOS.map((e) => [`episodio/${e.n}`, () => vistaEpisodio(e)])),
  ...Object.fromEntries(NUEVA.map((e) => [`episodio/${e.n}`, () => vistaEpisodio(e)])),
  ...Object.fromEntries([...MUERTOS, ...CUENTOS].map((e) => [`episodio/${e.n}`, () => vistaEpisodio(e)])),
  ...Object.fromEntries(Object.keys(CANCIONES).map((id) => [`cancion/${id}`, () => vistaCancion(id)])),
  ...Object.fromEntries(Object.keys(FICHAS).map((id) => [`personaje/${id}`, () => vistaFicha(id)])),
  "juego/cuantos": () => juegoCuantos(),
  "juego/trazo": () => juegoTrazo(),
  "juego/globos": () => juegoGlobos(),
  "juego/busca": () => juegoBusca(),
  "juego/donde": () => juegoDonde(),
  "juego/memoria": () => juegoMemoria(),
  "juego/colorea": () => juegoColorea(),
  "juego/rompe": () => juegoRompe(),
  "juego/quien": () => juegoQuien(),
  "juego/zanahorias": () => juegoZanahorias(),
  "juego/memoria-amigos": () => juegoMemoriaAmigos(),
  "juego/colores": () => juegoColoresMuertos(),
  "juego/rompe-amigos": () => juegoRompeAmigos(),
};

function vistaEpisodio(e) {
  pagina(`${miga('<a href="#episodios">Episodios</a>', e.etq ? e.titulo : `Episodio ${e.n}`)}
    <span class="etiqueta">${e.etq || `Episodio ${e.n} · Temporada 1`}</span><h1 style="margin-top:14px">${e.titulo}</h1>
    <p class="bajada">${e.resumen}</p>
    <button class="video reproductor" id="reproducir" style="max-width:760px;margin-top:24px;border:0;padding:0;cursor:pointer;width:100%" aria-label="Reproducir el episodio"><img src="${e.img}" alt="Episodio ${e.n}: ${e.titulo}" width="1280" height="720"><span class="play">${I.play}</span></button>
    <p class="aviso" style="margin-top:12px;max-width:760px">El video se reproduce desde YouTube (modo de privacidad mejorada) solo cuando presionas play. También puedes <a href="https://youtu.be/${e.yt}" rel="noopener">verlo en YouTube</a>.</p>
    <h2>Qué aprendemos</h2><ul class="lista-check">${e.aprende.map((x) => `<li><span>${x}</span></li>`).join("")}</ul>
    <h2>Para seguir jugando</h2><div class="medios">${e.juegos.map(([t, i, h]) => enlace(t, i, h)).join("")}</div>`);
  $("#reproducir").onclick = (ev) => {
    const f = document.createElement("iframe");
    f.src = `https://www.youtube-nocookie.com/embed/${e.yt}?autoplay=1&rel=0&modestbranding=1`; f.title = `${e.titulo} · Cuentatún`;
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen"; f.allowFullscreen = true;
    f.style.cssText = "width:100%;aspect-ratio:16/9;border:0;display:block;border-radius:22px"; ev.currentTarget.replaceWith(f);
  };
}
function vistaCancion(id) {
  const c = CANCIONES[id];
  pagina(`${miga('<a href="#canciones">Canciones</a>', c.titulo)}
    <span class="etiqueta">Canción · Episodio ${c.ep}</span><h1 style="margin-top:14px">${c.titulo}</h1>
    <p class="bajada">¡A cantar! La letra se ilumina mientras suena.</p>
    <audio id="cancion" controls preload="none" src="${c.audio}"></audio>
    <div class="karaoke" id="letra">${c.letra.map(([t, l]) => `<div data-t="${t}">${l}</div>`).join("")}</div>`);
  const au = $("#cancion"), lineas = [...art.querySelectorAll("#letra > div")], palabras = [...art.querySelectorAll(".palabra")];
  au.addEventListener("play", () => callar());
  au.addEventListener("timeupdate", () => {
    const t = au.currentTime;
    lineas.forEach((d, i) => d.classList.toggle("ahora", t >= +d.dataset.t && (i === lineas.length - 1 ? t < c.fin : t < +lineas[i + 1].dataset.t)));
    palabras.forEach((p) => p.classList.toggle("ahora", t >= +p.dataset.t && t < +p.dataset.t + 0.9));
  });
  limpiarJuego = () => au.pause();
}

/* ================= navegación ================= */
let limpiarJuego = null;
function ir() {
  const ruta = location.hash.slice(1) || "inicio";
  if (limpiarJuego) { limpiarJuego(); limpiarJuego = null; }
  callar();
  art.innerHTML = ""; (VISTAS[ruta] || VISTAS.inicio)();
  const sec = { personaje: "personajes", episodio: "episodios", cancion: "canciones", juego: "juegos" }[ruta.split("/")[0]] || ruta.split("/")[0];
  document.querySelectorAll(".nav-principal a").forEach((a) => a.classList.toggle("activo", a.dataset.sec === sec));
  const t = art.querySelector("h1"); document.title = (ruta === "inicio" || !t ? "" : t.textContent + " · ") + "Cuentatún";
  window.scrollTo({ top: 0, behavior: "instant" });
}

/* ================= arranque (lo llama juegos.js al final) ================= */
function iniciar() {
  document.addEventListener("click", (ev) => { const b = ev.target.closest("[data-decir]"); if (b) decir(b.dataset.decir); });
  window.addEventListener("hashchange", ir); ir();
}
