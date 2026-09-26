/* Cuentatún — sitio oficial: portada, personajes, canciones, episodios y minijuegos.
   Sin cookies, sin analítica, sin recursos externos. Regla de oro: lo que se dice es lo que se ve. */
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const C = { marino: "#1B2A6B", coral: "#FF5A4E", sol: "#FFC21A", turquesa: "#14B8B0", violeta: "#8E6CF0",
            rosa: "#FF6FAE", naranja: "#FF8A1F", azul: "#3D8BFF" };
const art = $("#articulo");
const YT = "https://www.youtube.com/@Cuentatun";
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
  { id: "uno", s: "1", nombre: "Uno", color: C.turquesa, fondo: "#DDF6F4", listo: true, lema: "¡Yo tengo un puntito!" },
  { id: "a", s: "A", nombre: "La A", color: C.coral }, { id: "dos", s: "2", nombre: "Dos", color: C.naranja },
  { id: "e", s: "E", nombre: "La E", color: C.rosa }, { id: "tres", s: "3", nombre: "Tres", color: C.sol },
  { id: "i", s: "I", nombre: "La I", color: C.violeta }, { id: "cuatro", s: "4", nombre: "Cuatro", color: C.azul },
  { id: "o", s: "O", nombre: "La O", color: C.coral }, { id: "cinco", s: "5", nombre: "Cinco", color: C.turquesa },
  { id: "u", s: "U", nombre: "La U", color: C.naranja },
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
const JUEGOS = [
  { id: "puntitos", nombre: "Cuenta los puntitos", desc: "Toca cada puntito y cuéntalos en voz alta.", c: "#FFE9A6" },
  { id: "cuantos", nombre: "¿Cuántos hay?", desc: "Cuenta las manzanas y elige el número.", c: "#FFD3CF" },
  { id: "trazo", nombre: "Traza el 1", desc: "Sigue el camino con tu dedito.", c: "#C9F0EC" },
  { id: "globos", nombre: "Revienta globos", desc: "Revienta cinco globos y cuéntalos.", c: "#DCD2FF" },
];
const tarjetaJuego = (j) => `<a class="juego-tarjeta" href="#juego/${j.id}"><div class="ilus" style="--c:${j.c}">${ILUS[j.id]}</div>
  <div class="txt"><h3>${j.nombre}</h3><p>${j.desc}</p></div></a>`;
const tarjetaPersonaje = (p) => p.listo
  ? `<a class="personaje" href="#personaje/${p.id}"><span class="insignia">¡Ya llegó!</span><div class="foto" style="--c:${p.fondo}"><img src="img/uno.png" alt="${p.nombre}" width="620" height="730"></div><h3>${p.nombre}</h3><small>${p.lema}</small></a>`
  : `<div class="personaje pronto" style="--c:${p.color}"><span class="insignia">Pronto</span><div class="foto"><span class="simbolo">${p.s}</span></div><h3>${p.nombre}</h3><small>Muy pronto en Cuentatún</small></div>`;
const miga = (...pasos) => `<nav class="miga" aria-label="Estás en"><a href="#inicio">Inicio</a>${pasos.map((p) => `<span>›</span>${p}`).join("")}</nav>`;
const pagina = (contenido) => art.append(html(`<div class="pagina">${contenido}</div>`));

/* ================= vistas ================= */
const VISTAS = {
  inicio() {
    art.append(html(`
    <section class="heroe">
      <picture><source media="(max-width: 760px)" srcset="img/portada-cel.jpg"><img class="heroe-img" src="img/portada.jpg" alt="Uno, el número 1 de Cuentatún, saludando en el prado" width="1920" height="1080"></picture>
      <div class="contenedor"><div class="heroe-texto">
        <span class="etiqueta">Para niños de 2 a 5 años</span>
        <h1>Aprender números y letras <em>es un juego</em></h1>
        <p>Caricaturas, canciones y juegos en español donde los números y las letras son personajes.</p>
        <div class="acciones">${enlace("Ver episodios", "yt", YT, "primario")}${enlace("Jugar ahora", "play", "#juegos")}</div>
        <ul class="confianza"><li>${I.check}En español</li><li>${I.check}Sin anuncios en la web</li><li>${I.check}Sin sustos</li></ul>
      </div></div>
    </section>

    <section class="seccion">
      <div class="contenedor">
        <div class="encabezado"><div><h2>Conoce a los amigos</h2><p>Cada número tiene forma de número y lleva en la pancita tantos puntitos dorados como vale. En cada episodio llega uno nuevo.</p></div>
          <a class="enlace-flecha" href="#personajes">Ver a todos</a></div>
        <div class="carrusel">${PERSONAJES.map(tarjetaPersonaje).join("")}</div>
      </div>
    </section>

    <section class="seccion cielo">
      <div class="contenedor destacado">
        <a class="video" href="${YT}" rel="noopener" aria-label="Ver el episodio 1 en YouTube"><img src="img/miniatura_ep01.jpg" alt="Episodio 1: ¡Llega el Uno!" width="1280" height="720" loading="lazy"><span class="play">${I.play}</span></a>
        <div>
          <span class="etiqueta">Episodio 1 · Temporada 1</span>
          <h3>¡Llega el Uno!</h3>
          <p>Un puntito brillante cae del cielo… ¡y se dibuja un 1! Conoce a Uno, aprende cómo se escribe y busca cosas de las que hay solo una.</p>
          <ul class="lista-check"><li>El número 1 y la palabra “uno”</li><li>Cómo se escribe, trazándolo con el dedito</li><li>Contar: un sol, un árbol, un globo</li></ul>
          <div class="acciones">${enlace("Ver en YouTube", "yt", YT, "primario")}${enlace("Más episodios", "", "#episodios")}</div>
        </div>
      </div>
    </section>

    <section class="seccion marino">
      <div class="contenedor">
        <div class="encabezado"><div><h2>Juegos para aprender</h2><p>Todos hablan, así que no hace falta saber leer. Se juegan con un dedito en el celular o la tableta.</p></div>
          <a class="enlace-flecha" href="#juegos" style="color:#fff">Todos los juegos</a></div>
        <div class="rejilla">${JUEGOS.map(tarjetaJuego).join("")}</div>
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
    pagina(`${miga("Amigos")}<h1>Los amigos de Cuentatún</h1>
      <p class="bajada">Números y letras con carita, cada uno con su color y su personalidad. En la temporada 1 llegan diez.</p>
      <div class="rejilla" style="margin-top:30px">${PERSONAJES.map(tarjetaPersonaje).join("")}</div>`);
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

  episodios() {
    pagina(`${miga("Episodios")}<h1>Temporada 1</h1>
      <p class="bajada">Los números del 1 al 5 y las vocales A, E, I, O, U. Cada episodio repasa a todos los amigos anteriores.</p>
      <div class="destacado" style="margin-top:34px">
        <a class="video" href="${YT}" rel="noopener" aria-label="Ver el episodio 1 en YouTube"><img src="img/miniatura_ep01.jpg" alt="Episodio 1: ¡Llega el Uno!" width="1280" height="720"><span class="play">${I.play}</span></a>
        <div><span class="etiqueta">Episodio 1</span><h3>¡Llega el Uno!</h3>
          <p>Un puntito brillante cae del cielo y se dibuja un 1. Aprendemos cómo se escribe, buscamos cosas de las que hay solo una y cantamos la canción del Uno.</p>
          <div class="acciones">${enlace("Ver en YouTube", "yt", YT, "primario")}${enlace("Detalles", "", "#episodio/1")}</div></div>
      </div>
      <h2>Próximamente</h2>
      <div class="rejilla">${PERSONAJES.slice(1).map((p, i) => `<div class="personaje pronto" style="--c:${p.color}"><div class="foto" style="height:120px"><span class="simbolo" style="font-size:64px">${p.s}</span></div><h3 style="font-size:18px">Episodio ${i + 2}</h3><small>Llega ${p.nombre.toLowerCase().startsWith("la") ? p.nombre.toLowerCase() : "el " + p.nombre}</small></div>`).join("")}</div>`);
  },

  "episodio/1"() {
    pagina(`${miga('<a href="#episodios">Episodios</a>', "Episodio 1")}
      <span class="etiqueta">Episodio 1 · Temporada 1</span><h1 style="margin-top:14px">¡Llega el Uno!</h1>
      <p class="bajada">Un puntito brillante cae del cielo… ¡y se dibuja un 1! Conoce a Uno, aprende cómo se escribe, busca cosas de las que hay solo una y canta su canción.</p>
      <a class="video" href="${YT}" rel="noopener" style="max-width:760px;margin-top:24px" aria-label="Ver en YouTube"><img src="img/miniatura_ep01.jpg" alt="Episodio 1: ¡Llega el Uno!" width="1280" height="720"><span class="play">${I.play}</span></a>
      <h2>Qué aprendemos</h2>
      <ul class="lista-check"><li>El número <b>1</b> y la palabra <b>“uno”</b></li><li>Cómo se escribe el 1 (¡trázalo en el aire con tu dedito!)</li><li>Contar: <b>un</b> sol, <b>un</b> árbol, <b>un</b> globo y <b>una</b> manzana</li></ul>
      <h2>Para seguir jugando</h2>
      <div class="medios">${enlace("Traza el 1", "lapiz", "#juego/trazo")}${enlace("¿Cuántos hay?", "play", "#juego/cuantos")}${enlace("La canción del Uno", "nota", "#cancion/uno")}</div>`);
  },

  canciones() {
    pagina(`${miga("Canciones")}<h1>Canciones de Cuentatún</h1>
      <p class="bajada">Canciones originales para cantar y contar.</p>
      <div class="rejilla" style="margin-top:30px">
        <a class="juego-tarjeta" href="#cancion/uno"><div class="ilus" style="--c:#DCD2FF">${ILUS.puntitos}</div><div class="txt"><h3>La canción del Uno</h3><p>Episodio 1</p></div></a>
        <div class="juego-tarjeta" style="opacity:.55"><div class="ilus" style="--c:#FFD3CF"><span style="font-family:var(--titulo);font-size:70px;color:#fff">A</span></div><div class="txt"><h3>La canción de la A</h3><p>Muy pronto</p></div></div>
      </div>`);
  },

  "cancion/uno"() {
    const LETRA = [
      [8.6, "Uno, uno, tengo un puntito"], [12.8, "Uno, uno, derechito y bonito"],
      [18.46, 'Un <b class="palabra" data-t="19.42">sol</b>, un <b class="palabra" data-t="20.44">árbol</b>, un <b class="palabra" data-t="21.54">globo</b> también'],
      [22.92, "¡Uno, uno, lo cuento muy bien!"],
    ];
    pagina(`${miga('<a href="#canciones">Canciones</a>', "La canción del Uno")}
      <span class="etiqueta">Canción · Episodio 1</span><h1 style="margin-top:14px">La canción del Uno</h1>
      <p class="bajada">¡Canta con Uno! La letra se ilumina mientras suena.</p>
      <audio id="cancion" controls preload="none" src="audio/cancion_del_uno.m4a"></audio>
      <div class="karaoke" id="letra">${LETRA.map(([t, l]) => `<div data-t="${t}">${l}</div>`).join("")}</div>`);
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
    pagina(`${miga("Juegos")}<h1>¿A qué quieres jugar?</h1>
      <p class="bajada">Juegos para contar y trazar. Todos hablan, así que no hace falta saber leer.</p>
      <div class="rejilla" style="margin-top:30px">${JUEGOS.map(tarjetaJuego).join("")}</div>`);
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
  "juego/cuantos": () => juegoCuantos(),
  "juego/trazo": () => juegoTrazo(),
  "juego/globos": () => juegoGlobos(),
};

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
