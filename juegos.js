/* Cuentatún — minijuegos (pantalla completa, rondas, premio, ayuda automática).
   Regla de oro: lo que se dice es lo que se ve. Todo se entiende sin saber leer. */
"use strict";
const NS = "http://www.w3.org/2000/svg";
function sv(tag, attrs = {}, padre) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (padre) padre.appendChild(e);
  return e;
}
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
const COLORES = [C.coral, C.sol, C.turquesa, C.violeta, C.azul, C.naranja, C.rosa];

/* ---------- objetos para contar (ilustraciones propias) ---------- */
const OBJETOS = {
  manzana(g) {
    sv("path", { d: "M0 -26 C-26 -40 -46 -14 -40 8 C-34 30 -14 38 0 30 C14 38 34 30 40 8 C46 -14 26 -40 0 -26Z", fill: "#E0262E" }, g);
    sv("ellipse", { cx: -16, cy: -8, rx: 7, ry: 12, fill: "#fff", opacity: 0.45 }, g);
    sv("path", { d: "M0 -26 L4 -44", stroke: "#6B3E1E", "stroke-width": 5, "stroke-linecap": "round" }, g);
    sv("path", { d: "M5 -38 C16 -52 30 -44 30 -40 C22 -34 12 -34 5 -38Z", fill: "#3DAA3A" }, g);
  },
  estrella(g) {
    const p = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? 19 : 42, a = -Math.PI / 2 + (i * Math.PI) / 5; p.push(`${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`); }
    sv("polygon", { points: p.join(" "), fill: "#FFC21A", stroke: "#fff", "stroke-width": 5, "stroke-linejoin": "round" }, g);
    sv("circle", { cx: -8, cy: -6, r: 4, fill: "#1B2A6B" }, g); sv("circle", { cx: 8, cy: -6, r: 4, fill: "#1B2A6B" }, g);
    sv("path", { d: "M-7 6 Q0 12 7 6", stroke: "#1B2A6B", "stroke-width": 3, fill: "none", "stroke-linecap": "round" }, g);
  },
  pelota(g) {
    sv("circle", { r: 36, fill: "#3D8BFF", stroke: "#fff", "stroke-width": 5 }, g);
    sv("path", { d: "M-36 0 Q0 -22 36 0 M-36 0 Q0 22 36 0", stroke: "#FFC21A", "stroke-width": 7, fill: "none" }, g);
    sv("ellipse", { cx: -14, cy: -16, rx: 8, ry: 5, fill: "#fff", opacity: 0.5 }, g);
  },
  flor(g) {
    for (let i = 0; i < 5; i++) { const a = (i * 2 * Math.PI) / 5; sv("circle", { cx: 22 * Math.cos(a), cy: 22 * Math.sin(a) - 4, r: 16, fill: "#FF6FAE", stroke: "#fff", "stroke-width": 3 }, g); }
    sv("circle", { cx: 0, cy: -4, r: 13, fill: "#FFC21A", stroke: "#fff", "stroke-width": 3 }, g);
  },
};
const ORDEN_OBJETOS = ["manzana", "estrella", "pelota", "flor", "manzana"];

/* ---------- motor común ---------- */
function crearJuego({ titulo, instruccion, rondas, fondoColor, iniciarRonda }) {
  art.innerHTML = "";
  art.append(html(`<div class="jf">
    <div class="jbar">
      <a class="jbtn" href="#juegos" aria-label="Salir del juego"><svg viewBox="0 0 24 24"><path d="M15.5 4 7.5 12l8 8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
      <div class="jtitulo">${titulo}</div>
      <div class="jprogreso" id="jprog">${Array.from({ length: rondas }, () => '<i><svg viewBox="0 0 24 24"><path d="m12 2 3 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.8 5.7 21.4l1.5-7.1L1.8 9.4 9 8.6z"/></svg></i>').join("")}</div>
      <button class="jbtn" id="joir" aria-label="Escuchar otra vez">${I.altavoz}</button>
      <button class="jbtn" id="jmudo" aria-label="Silenciar">${I.nota}</button>
    </div>
    <div class="jescena" style="--fondo:${fondoColor || "#9FD6FF"}">
      <div class="jcielo"><span class="jsol"></span><i class="nube n1"></i><i class="nube n2"></i></div>
      <svg class="jcolinas" viewBox="0 0 1000 200" preserveAspectRatio="none"><path d="M0 90 Q180 20 380 70 T760 60 T1000 80 V200 H0Z" fill="#A2DC84"/><path d="M0 130 Q250 70 520 120 T1000 110 V200 H0Z" fill="#7ACB62"/></svg>
      <svg class="jcapa" id="jcapa" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet"></svg>
      <div class="jguia" id="jguia"><div class="jburbuja" id="jburbuja">${I.altavoz}</div><img src="img/uno.png" alt="Uno"></div>
      <svg class="jmano" id="jmano" viewBox="0 0 64 64" aria-hidden="true"><path d="M26 8a5 5 0 0 1 10 0v20l3-1a5 5 0 0 1 6 4l1 3a5 5 0 0 1 5 5v8c0 9-7 16-16 16h-4c-6 0-11-3-14-8l-7-12a4 4 0 0 1 6-5l6 5z" fill="#fff" stroke="#1B2A6B" stroke-width="3" stroke-linejoin="round"/></svg>
    </div>
  </div>`));
  document.body.classList.add("modo-juego");
  const capa = $("#jcapa"), guia = $("#jguia"), burbuja = $("#jburbuja"), mano = $("#jmano");
  const estrellas = [...document.querySelectorAll("#jprog i")];
  let ronda = 0, vivo = true, reloj = 0, objetivoPista = null, limpiadores = [];

  const api = {
    capa, rondaActual: () => ronda,
    alTerminar: (f) => limpiadores.push(f),
    hablar: async (...ids) => { burbuja.classList.add("on"); const ok = await decir(...ids); burbuja.classList.remove("on"); return ok; },
    pista(elem) { objetivoPista = elem; reiniciarReloj(); },
    tocado() { reiniciarReloj(); },
    estallido(x, y, color = C.sol, n = 14) { estallido(capa, x, y, color, n); },
    async acierto() {
      clearTimeout(reloj); objetivoPista = null; ocultarMano();
      guia.animate([{ transform: "translateY(0)" }, { transform: "translateY(-60px) rotate(-8deg)" }, { transform: "translateY(0)" }, { transform: "translateY(-24px)" }, { transform: "translateY(0)" }],
        { duration: 900, easing: "ease-out" });
      const e = estrellas[ronda]; e.classList.add("llena");
      e.animate([{ transform: "scale(0.4)" }, { transform: "scale(1.5)" }, { transform: "scale(1)" }], { duration: 500, easing: "ease-out" });
      sfx.bien(); ronda++;
      if (ronda >= rondas) { await pausa(500); if (vivo) premio(); }
      else { await pausa(1100); if (vivo) nueva(); }
    },
    async fallo(el) {
      reiniciarReloj();
      guia.animate([{ transform: "rotate(0)" }, { transform: "rotate(-7deg)" }, { transform: "rotate(7deg)" }, { transform: "rotate(0)" }], { duration: 500 });
      if (el) el.animate([{ transform: "translateX(0)" }, { transform: "translateX(-12px)" }, { transform: "translateX(12px)" }, { transform: "translateX(0)" }], { duration: 380 });
      tono([330, 262], 0.12, "sine", 0.08);
      await api.hablar("otravez");
    },
  };

  function reiniciarReloj() {             // ayuda automática: si nadie toca, la manita enseña qué hacer
    clearTimeout(reloj); ocultarMano();
    reloj = setTimeout(mostrarMano, 6500);
  }
  function mostrarMano() {
    if (!vivo || !objetivoPista) return;
    const destino = typeof objetivoPista === "function" ? objetivoPista() : objetivoPista;
    if (!destino) return;
    const r = destino.getBoundingClientRect(), e = mano.parentElement.getBoundingClientRect();
    mano.style.left = r.left - e.left + r.width / 2 - 10 + "px"; mano.style.top = r.top - e.top + r.height / 2 - 6 + "px";
    mano.classList.add("on");
    reloj = setTimeout(() => { ocultarMano(); reloj = setTimeout(mostrarMano, 5000); }, 2600);
  }
  function ocultarMano() { mano.classList.remove("on"); }

  function nueva() {
    capa.innerHTML = ""; objetivoPista = null;
    iniciarRonda(api, ronda, rondas);
    reiniciarReloj();
  }
  function premio() {
    const caja = document.createElement("div"); caja.className = "jpremio";
    caja.innerHTML = `<div class="jpremio-tarjeta">
      <div class="jpremio-estrellas">${"<i>★</i>".repeat(3)}</div>
      <img src="img/uno.png" alt="">
      <h2>¡Lo lograste!</h2>
      <div class="acciones" style="justify-content:center">${boton("Otra vez", "repetir", 'id="jotra"', "primario")}${enlace("Más juegos", "play", "#juegos")}</div>
    </div>`;
    $(".jescena").appendChild(caja); confeti(120);
    caja.querySelector("#jotra").onclick = () => { caja.remove(); ronda = 0; estrellas.forEach((e) => e.classList.remove("llena")); nueva(); };
    api.hablar("muybien", "u_yupi");
  }

  $("#joir").onclick = () => api.hablar(instruccion);
  const mudoBtn = $("#jmudo");
  const pintarMudo = () => { mudoBtn.classList.toggle("apagado", !!window.MUDO); mudoBtn.setAttribute("aria-label", window.MUDO ? "Activar sonido" : "Silenciar"); };
  mudoBtn.onclick = () => { window.MUDO = !window.MUDO; if (window.MUDO) callar(); pintarMudo(); }; pintarMudo();

  limpiarJuego = () => { vivo = false; clearTimeout(reloj); limpiadores.forEach((f) => f()); document.body.classList.remove("modo-juego"); };
  nueva();
  api.hablar(instruccion);
  return api;
}

function estallido(capa, x, y, color, n) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.4, d = 70 + Math.random() * 60;
    const p = sv(i % 2 ? "circle" : "polygon", i % 2 ? { cx: x, cy: y, r: 7, fill: color } :
      { points: `${x},${y - 10} ${x + 4},${y - 3} ${x + 11},${y - 3} ${x + 5},${y + 2} ${x + 7},${y + 10} ${x},${y + 5} ${x - 7},${y + 10} ${x - 5},${y + 2} ${x - 11},${y - 3} ${x - 4},${y - 3}`, fill: i % 4 === 0 ? "#fff" : color }, capa);
    p.animate([{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) scale(.3)`, opacity: 0 }],
      { duration: 650 + Math.random() * 250, easing: "cubic-bezier(.2,.8,.3,1)" }).onfinish = () => p.remove();
  }
}
function aparecer(el, retraso = 0) {
  el.style.transformBox = "fill-box"; el.style.transformOrigin = "center";
  return el.animate([{ transform: "scale(0)" }, { transform: "scale(1.2)" }, { transform: "scale(1)" }], { duration: 420, delay: retraso, easing: "ease-out", fill: "backwards" });
}
function rebote(el) {
  el.style.transformBox = "fill-box"; el.style.transformOrigin = "center";
  return el.animate([{ transform: "scale(1)" }, { transform: "scale(1.25,0.8)" }, { transform: "scale(0.9,1.15)" }, { transform: "scale(1)" }], { duration: 420 });
}
function numeroCartel(capa, n, color = C.turquesa) {   // el número grande que aparece al final de cada ronda
  const g = sv("g", { transform: "translate(500 300)" }, capa);
  sv("rect", { x: -110, y: -130, width: 220, height: 250, rx: 44, fill: "#fff", stroke: color, "stroke-width": 10 }, g);
  const t = sv("text", { y: 70, "text-anchor": "middle", "font-family": "Fredoka", "font-size": 230, fill: color }, g); t.textContent = n;
  g.style.transformBox = "fill-box"; g.style.transformOrigin = "center";
  g.animate([{ transform: "scale(0) rotate(-20deg)" }, { transform: "scale(1.12) rotate(4deg)" }, { transform: "scale(1)" }], { duration: 600, easing: "cubic-bezier(.3,1.5,.5,1)" });
  return g;
}

/* ---------- 1. Cuenta los puntitos ---------- */
const DISPOS = { 1: [[0, 0]], 2: [[-1, 0], [1, 0]], 3: [[-1.2, 0.55], [0, -0.1], [1.2, -0.75]],
  4: [[-1, -0.6], [1, -0.6], [-1, 0.6], [1, 0.6]], 5: [[-1.25, -0.7], [1.25, -0.7], [0, 0], [-1.25, 0.7], [1.25, 0.7]] };
function juegoPuntitos() {
  crearJuego({ titulo: "Cuenta los puntitos", instruccion: "j_puntitos", rondas: 5, iniciarRonda(api, r) {
    const n = r + 1, capa = api.capa;
    const defs = sv("defs", {}, capa), rg = sv("radialGradient", { id: "oro", cx: "35%", cy: "35%", r: "70%" }, defs);
    [["0%", "#FFF3B8"], ["45%", "#FFC83A"], ["100%", "#E0A000"]].forEach(([o, c]) => sv("stop", { offset: o, "stop-color": c }, rg));
    let contados = 0; const puntos = [];
    DISPOS[n].forEach(([x, y], i) => {
      const cx = 500 + x * 170, cy = 270 + y * 150;
      const g = sv("g", { class: "tocable", transform: `translate(${cx} ${cy})` }, capa);
      sv("circle", { r: 78, fill: "transparent" }, g);
      sv("circle", { r: 62, fill: "rgba(0,0,0,.08)", cy: 8 }, g);
      const c = sv("circle", { r: 60, fill: "url(#oro)", stroke: "#fff", "stroke-width": 8 }, g);
      sv("ellipse", { cx: -20, cy: -22, rx: 16, ry: 10, fill: "#fff", opacity: 0.55 }, g);
      const t = sv("text", { "text-anchor": "middle", dy: 26, "font-size": 74, "font-family": "Fredoka", fill: "#fff" }, g);
      aparecer(g, i * 130); puntos.push(g);
      g.addEventListener("pointerdown", async () => {
        if (g.dataset.ok) return; g.dataset.ok = 1; contados++; api.tocado();
        c.setAttribute("fill", C.turquesa); t.textContent = contados; rebote(g); sfx.pop(); api.estallido(cx, cy, C.turquesa, 10);
        const mio = contados, sigue = await api.hablar(NUM[mio]);
        if (mio === n && sigue !== false) {
          for (const p of puntos) { rebote(p); await pausa(110); }
          numeroCartel(capa, n); await pausa(700); api.acierto();
        }
      });
    });
    api.pista(() => puntos.find((p) => !p.dataset.ok));
  } });
}

/* ---------- 2. ¿Cuántos hay? ---------- */
function juegoCuantos() {
  let ultimo = 0;
  crearJuego({ titulo: "¿Cuántos hay?", instruccion: "j_cuantos", rondas: 5, iniciarRonda(api, r) {
    const capa = api.capa, max = r < 2 ? 3 : 5; let n;
    do { n = 1 + Math.floor(Math.random() * max); } while (n === ultimo); ultimo = n;
    const tipo = ORDEN_OBJETOS[r], paso = n > 4 ? 150 : 175, x0 = 500 - ((n - 1) * paso) / 2, objs = [];
    for (let i = 0; i < n; i++) {
      const g = sv("g", { transform: `translate(${x0 + i * paso} 190) scale(1.5)` }, capa);
      const dentro = sv("g", {}, g); OBJETOS[tipo](dentro); aparecer(dentro, i * 120); objs.push(dentro);
    }
    // respuestas: el número y sus puntitos (para quien aún no reconoce el número)
    const ops = new Set([n]); while (ops.size < 3) ops.add(1 + Math.floor(Math.random() * 5));
    const lista = [...ops].sort(() => Math.random() - 0.5); let bloqueado = false, correcta = null;
    lista.forEach((v, i) => {
      const x = 500 + (i - 1) * 230, col = [C.coral, C.azul, C.violeta][i];
      const g = sv("g", { class: "tocable", transform: `translate(${x} 450)` }, capa);
      const cuerpo = sv("g", {}, g);
      sv("rect", { x: -92, y: -82, width: 184, height: 176, rx: 40, fill: "rgba(0,0,0,.14)", transform: "translate(0 9)" }, cuerpo);
      sv("rect", { x: -92, y: -82, width: 184, height: 176, rx: 40, fill: col, stroke: "#fff", "stroke-width": 7 }, cuerpo);
      const t = sv("text", { y: 30, "text-anchor": "middle", "font-family": "Fredoka", "font-size": 108, fill: "#fff" }, cuerpo); t.textContent = v;
      for (let k = 0; k < v; k++) sv("circle", { cx: (k - (v - 1) / 2) * 24, cy: 64, r: 8, fill: "#fff", opacity: 0.9 }, cuerpo);
      aparecer(cuerpo, 350 + i * 120);
      if (v === n) correcta = g;
      g.addEventListener("pointerdown", async () => {
        if (bloqueado) return; api.tocado();
        if (v !== n) { api.fallo(cuerpo); return; }
        bloqueado = true; rebote(cuerpo); api.estallido(x, 450, col);
        callar();
        for (let k = 0; k < n; k++) {         // se cuentan una por una: lo que se dice es lo que se ve
          rebote(objs[k]);
          const et = sv("text", { x: x0 + k * paso, y: 100, "text-anchor": "middle", "font-family": "Fredoka", "font-size": 54, fill: C.marino, stroke: "#fff", "stroke-width": 8, "paint-order": "stroke" }, capa);
          et.textContent = k + 1; aparecer(et);
          await api.hablar(NUM[k + 1]);
        }
        api.acierto();
      });
    });
    api.pista(() => correcta);
    if (r > 0) api.hablar("cuantos");
  } });
}

/* ---------- 3. Traza el 1 (al terminar, el 1 se convierte en Uno) ---------- */
function juegoTrazo() {
  const D = "M60 120 C87 93 111 51 135 48 C159 45 138 165 138 292";
  const colores = [C.turquesa, C.violeta, C.coral];
  crearJuego({ titulo: "Traza el 1", instruccion: "j_trazo", rondas: 3, iniciarRonda(api, r) {
    const capa = api.capa, col = colores[r];
    const g = sv("g", { transform: "translate(345 20) scale(1.6)" }, capa);
    sv("path", { d: D, fill: "none", stroke: "rgba(27,42,107,.12)", "stroke-width": 50, "stroke-linecap": "round", transform: "translate(0 6)" }, g);
    sv("path", { d: D, fill: "none", stroke: "#fff", "stroke-width": 50, "stroke-linecap": "round" }, g);
    const guiaPath = sv("path", { d: D, fill: "none", stroke: "#C9D3E6", "stroke-width": 5, "stroke-dasharray": "2 14", "stroke-linecap": "round" }, g);
    const tinta = sv("path", { d: D, fill: "none", stroke: col, "stroke-width": 40, "stroke-linecap": "round" }, g);
    const L = tinta.getTotalLength(); tinta.style.strokeDasharray = L; tinta.style.strokeDashoffset = L;
    // flechitas de dirección
    for (const f of [0.12, 0.3, 0.55, 0.8]) {
      const p = tinta.getPointAtLength(L * f), q = tinta.getPointAtLength(L * f + 2), ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
      sv("path", { d: "M-6 -7 L4 0 L-6 7", fill: "none", stroke: "#AAB6CF", "stroke-width": 4, "stroke-linecap": "round", "stroke-linejoin": "round", transform: `translate(${p.x} ${p.y}) rotate(${ang})` }, g);
    }
    const inicio = sv("circle", { cx: 60, cy: 120, r: 20, fill: "#6BDB6B", stroke: "#fff", "stroke-width": 5 }, g);
    inicio.animate([{ r: 20 }, { r: 26 }, { r: 20 }], { duration: 1100, iterations: Infinity });
    const estrella = sv("circle", { cx: 60, cy: 120, r: 15, fill: "#FFE27A", stroke: "#fff", "stroke-width": 4 }, g);
    const N = 260, pts = []; for (let i = 0; i <= N; i++) { const p = tinta.getPointAtLength((L * i) / N); pts.push([p.x, p.y]); }
    let idx = 0, activo = false, listo = false;
    const aLocal = (ev) => { const p = capa.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(g.getScreenCTM().inverse()); };
    async function mover(ev) {
      if (!activo || listo) return;
      const q = aLocal(ev); let mejor = idx, dist = 1e9;
      for (let j = idx; j <= Math.min(N, idx + 34); j++) { const d = Math.hypot(pts[j][0] - q.x, pts[j][1] - q.y); if (d < dist) { dist = d; mejor = j; } }
      if (dist < 38 && mejor > idx) {
        idx = mejor; api.tocado(); tinta.style.strokeDashoffset = L * (1 - idx / N);
        estrella.setAttribute("cx", pts[idx][0]); estrella.setAttribute("cy", pts[idx][1]);
        if (idx % 26 === 0) tono([700 + idx * 4], 0.05, "sine", 0.05);
        if (idx >= N - 4) {
          listo = true; tinta.style.strokeDashoffset = 0; sfx.bien(); api.estallido(500, 300, col, 22);
          // ¡el 1 trazado se convierte en Uno!
          await pausa(250);
          g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, fill: "forwards" });
          const img = sv("image", { href: "img/uno.png", x: 333, y: 88, width: 340, height: 400 }, capa);   // justo sobre el 1 trazado
          aparecer(img);
          await api.hablar("u_yupi"); api.acierto();
        }
      }
    }
    capa.onpointerdown = (ev) => { activo = true; capa.setPointerCapture(ev.pointerId); mover(ev); };
    capa.onpointermove = mover; capa.onpointerup = () => { activo = false; };
    api.alTerminar(() => { capa.onpointerdown = capa.onpointermove = capa.onpointerup = null; });
    api.pista(() => (idx === 0 ? inicio : null));
    if (r > 0) api.hablar("j_trazo");
  } });
}

/* ---------- 4. Revienta globos ---------- */
function juegoGlobos() {
  let raf = 0;
  crearJuego({ titulo: "Revienta globos", instruccion: "j_globos", rondas: 3, iniciarRonda(api, r) {
    cancelAnimationFrame(raf);
    const capa = api.capa, TOTAL = r + 3; let cuenta = 0;
    // contador visible: se llena un círculo por cada globo (lo que se dice es lo que se ve)
    const marcas = [];
    for (let i = 0; i < TOTAL; i++) {
      const m = sv("circle", { cx: 500 + (i - (TOTAL - 1) / 2) * 56, cy: 52, r: 20, fill: "#fff", stroke: C.marino, "stroke-width": 5 }, capa);
      aparecer(m, i * 80); marcas.push(m);
    }
    const globos = [];
    for (let i = 0; i < TOTAL; i++) {
      const col = COLORES[(i + r) % COLORES.length];
      const g = sv("g", { class: "tocable" }, capa);
      sv("path", { d: "M0 60 q-10 40 6 80", stroke: "#fff", "stroke-width": 3, fill: "none" }, g);
      sv("ellipse", { cx: 0, cy: 0, rx: 52, ry: 62, fill: col, stroke: "#fff", "stroke-width": 5 }, g);
      sv("ellipse", { cx: -17, cy: -22, rx: 11, ry: 19, fill: "#fff", opacity: 0.5 }, g);
      sv("path", { d: "M-10 62 L10 62 L0 52Z", fill: col }, g);
      const b = { g, col, x: 1000 * (i + 0.5) / TOTAL + (Math.random() * 40 - 20), y: 660 + i * 90, v: 1.1 + Math.random() * 0.7 + r * 0.25, fase: Math.random() * 6, vivo: true };
      g.addEventListener("pointerdown", async () => {
        if (!b.vivo) return; b.vivo = false; api.tocado(); cuenta++; sfx.pop();
        api.estallido(b.x, b.y, col, 16);
        g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: "forwards" });
        marcas[cuenta - 1].setAttribute("fill", C.sol); rebote(marcas[cuenta - 1]);
        const mio = cuenta, sigue = await api.hablar(NUM[mio]);
        if (mio === TOTAL && sigue !== false) { numeroCartel(capa, TOTAL, C.violeta); await pausa(700); api.acierto(); }
      });
      globos.push(b);
    }
    let t = 0;
    (function paso() {
      t++;
      for (const b of globos) {
        if (!b.vivo) continue;
        b.y -= b.v; if (b.y < -90) b.y = 690;           // si se escapa, vuelve a salir por abajo
        b.g.setAttribute("transform", `translate(${b.x + Math.sin(t / 45 + b.fase) * 18} ${b.y}) rotate(${Math.sin(t / 35 + b.fase) * 5})`);
      }
      raf = requestAnimationFrame(paso);
    })();
    api.alTerminar(() => cancelAnimationFrame(raf));
    api.pista(() => { const b = globos.find((x) => x.vivo && x.y > 120 && x.y < 520); return b && b.g; });
    if (r > 0) api.hablar("j_globos");
  } });
}

/* ---------- utilidades para los juegos nuevos ---------- */
const barajar = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function tarjetaNumero(padre, x, y, txt, col, lado = 116) {
  const g = sv("g", { class: "tocable", transform: `translate(${x} ${y})` }, padre);
  const c = sv("g", {}, g);
  sv("rect", { x: -lado / 2, y: -lado / 2 + 8, width: lado, height: lado, rx: 30, fill: "rgba(0,0,0,.14)" }, c);
  sv("rect", { x: -lado / 2, y: -lado / 2, width: lado, height: lado, rx: 30, fill: col, stroke: "#fff", "stroke-width": 7 }, c);
  const t = sv("text", { y: lado * 0.3, "text-anchor": "middle", "font-family": "Fredoka", "font-size": lado * 0.78, fill: "#fff" }, c); t.textContent = txt;
  return { g, c };
}

/* ---------- 5. Encuentra el 1 ---------- */
function juegoBusca() {
  crearJuego({ titulo: "Encuentra el 1", instruccion: "j_busca", rondas: 4, iniciarRonda(api, r) {
    const capa = api.capa, total = 5 + r * 2, unos = r === 0 ? 1 : 1 + Math.floor(Math.random() * Math.min(3, r + 1));
    const numeros = barajar([...Array(unos).fill("1"), ...Array.from({ length: total - unos }, () => String(2 + Math.floor(Math.random() * 4)))]);
    const cols = Math.min(total, r < 2 ? 4 : 5), filas = Math.ceil(total / cols), lado = total > 8 ? 104 : 118;
    let hallados = 0; const tarjetas = [];
    numeros.forEach((n, i) => {
      const f = Math.floor(i / cols), c = i % cols, enFila = Math.min(cols, total - f * cols);
      const x = 500 + (c - (enFila - 1) / 2) * (lado + 46) + (Math.random() * 16 - 8);
      const y = 300 + (f - (filas - 1) / 2) * (lado + 36) + (Math.random() * 16 - 8);
      const t = tarjetaNumero(capa, x, y, n, COLORES[(i * 3 + r) % COLORES.length], lado); aparecer(t.c, i * 70);
      t.g.setAttribute("transform", `translate(${x} ${y}) rotate(${(Math.random() * 10 - 5).toFixed(1)})`);   // ligeramente inclinadas
      t.num = n; tarjetas.push(t);
      t.g.addEventListener("pointerdown", async () => {
        if (t.ok) return; api.tocado();
        if (n !== "1") { api.fallo(t.c); return; }
        t.ok = true; hallados++; rebote(t.c); sfx.pop(); api.estallido(x, y, C.sol, 14);
        sv("circle", { cx: lado / 2 - 8, cy: -lado / 2 + 8, r: 22, fill: C.sol, stroke: "#fff", "stroke-width": 5 }, t.c);
        const ok = sv("path", { d: `M${lado / 2 - 18} ${-lado / 2 + 8} l7 7 13 -14`, stroke: "#fff", "stroke-width": 6, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, t.c);
        aparecer(ok);
        const sigue = await api.hablar("n_uno");
        if (hallados === unos && sigue !== false) api.acierto();
      });
    });
    api.pista(() => { const t = tarjetas.find((x) => x.num === "1" && !x.ok); return t && t.g; });
    if (r > 0) api.hablar("j_busca");
  } });
}

/* ---------- 6. ¿Dónde hay uno? ---------- */
function juegoDonde() {
  crearJuego({ titulo: "¿Dónde hay uno?", instruccion: "j_donde", rondas: 5, iniciarRonda(api, r) {
    const capa = api.capa, tipo = ORDEN_OBJETOS[r], muchos = 2 + Math.floor(Math.random() * (r < 2 ? 2 : 4));
    const unoIzq = Math.random() < 0.5; let listo = false, zonaUno = null;
    [0, 1].forEach((lado) => {
      const x = lado === 0 ? 290 : 710, esUno = (lado === 0) === unoIzq, n = esUno ? 1 : muchos;
      const zona = sv("g", { class: "tocable" }, capa);
      sv("rect", { x: x - 200, y: 120, width: 400, height: 380, rx: 40, fill: "transparent" }, zona);
      sv("ellipse", { cx: x, cy: 420, rx: 180, ry: 38, fill: "rgba(0,0,0,.12)" }, zona);
      sv("ellipse", { cx: x, cy: 410, rx: 180, ry: 38, fill: "#fff", stroke: "#E3DCCB", "stroke-width": 5 }, zona);
      const pos = n === 1 ? [[0, 0]] : Array.from({ length: n }, (_, k) => [((k % 3) - (Math.min(n, 3) - 1) / 2) * 105, -Math.floor(k / 3) * 95]);
      const objs = pos.map(([dx, dy], k) => {
        const g = sv("g", { transform: `translate(${x + dx} ${360 + dy}) scale(1.25)` }, zona); const d = sv("g", {}, g);
        OBJETOS[tipo](d); aparecer(d, lado * 250 + k * 90); return d;
      });
      if (esUno) zonaUno = zona;
      zona.addEventListener("pointerdown", async () => {
        if (listo) return; api.tocado();
        if (!esUno) { api.fallo(zona); return; }
        listo = true; rebote(objs[0]); api.estallido(x, 330, C.turquesa, 18);
        const et = sv("text", { x, y: 215, "text-anchor": "middle", "font-family": "Fredoka", "font-size": 90, fill: C.turquesa, stroke: "#fff", "stroke-width": 12, "paint-order": "stroke" }, capa);
        et.textContent = "1"; aparecer(et);
        await api.hablar("n_uno"); api.acierto();
      });
    });
    api.pista(() => zonaUno);
    if (r > 0) api.hablar("j_donde");
  } });
}

/* ---------- 7. Memoria ---------- */
function juegoMemoria() {
  crearJuego({ titulo: "Memoria", instruccion: "j_memoria", rondas: 3, iniciarRonda(api, r) {
    const capa = api.capa, pares = r + 2, tipos = barajar(["manzana", "estrella", "pelota", "flor"]).slice(0, pares);
    const cartas = barajar([...tipos, ...tipos]), cols = pares === 3 ? 3 : 4, filas = Math.ceil(cartas.length / cols);
    const W = 150, H = 180; let abiertas = [], bloqueo = false, hechas = 0; const lista = [];
    cartas.forEach((tipo, i) => {
      const f = Math.floor(i / cols), c = i % cols;
      const x = 500 + (c - (cols - 1) / 2) * (W + 34), y = 300 + (f - (filas - 1) / 2) * (H + 30);
      const g = sv("g", { class: "tocable", transform: `translate(${x} ${y})` }, capa);
      g.dataset.tipo = tipo;
      const giro = sv("g", {}, g); giro.style.transformBox = "fill-box"; giro.style.transformOrigin = "center";
      sv("rect", { x: -W / 2, y: -H / 2 + 8, width: W, height: H, rx: 26, fill: "rgba(0,0,0,.14)" }, giro);
      const dorso = sv("g", {}, giro);
      sv("rect", { x: -W / 2, y: -H / 2, width: W, height: H, rx: 26, fill: C.turquesa, stroke: "#fff", "stroke-width": 7 }, dorso);
      for (let k = 0; k < 5; k++) sv("circle", { cx: -38 + (k % 3) * 38, cy: -40 + Math.floor(k / 3) * 80 + (k % 3 === 1 ? 40 : 0), r: 11, fill: "#fff", opacity: 0.35 }, dorso);
      sv("circle", { r: 26, fill: "#FFC83A", stroke: "#fff", "stroke-width": 5 }, dorso);
      const cara = sv("g", { visibility: "hidden" }, giro);
      sv("rect", { x: -W / 2, y: -H / 2, width: W, height: H, rx: 26, fill: "#fff", stroke: C.turquesa, "stroke-width": 7 }, cara);
      const dib = sv("g", { transform: "scale(1.3)" }, cara); OBJETOS[tipo](dib);
      aparecer(giro, i * 60);
      const carta = { g, giro, dorso, cara, tipo, abierta: false, hecha: false };
      const voltear = async (abrir) => {
        await giro.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], { duration: 140, fill: "forwards" }).finished;
        dorso.setAttribute("visibility", abrir ? "hidden" : "visible"); cara.setAttribute("visibility", abrir ? "visible" : "hidden");
        await giro.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 160, fill: "forwards" }).finished;
      };
      g.addEventListener("pointerdown", async () => {
        if (bloqueo || carta.abierta || carta.hecha) return; api.tocado();
        carta.abierta = true; sfx.pop(); abiertas.push(carta); await voltear(true);
        if (abiertas.length < 2) return;
        bloqueo = true; const [a, b] = abiertas; abiertas = [];
        if (a.tipo === b.tipo) {
          a.hecha = b.hecha = true; hechas++; rebote(a.giro); rebote(b.giro); sfx.ding();
          api.estallido(x, y, C.sol, 12);
          await api.hablar("pareja"); bloqueo = false;
          if (hechas === pares) api.acierto();
        } else {
          tono([330, 262], 0.1, "sine", 0.06); await pausa(800);
          a.abierta = false; b.abierta = false; await Promise.all([a.voltear(false), b.voltear(false)]); bloqueo = false;
        }
      });
      carta.voltear = voltear; lista.push(carta);
    });
    api.pista(() => { const c = lista.find((x) => !x.hecha && !x.abierta); return c && c.g; });
    if (r > 0) api.hablar("j_memoria");
  } });
}

/* ---------- 8. Colorea ---------- */
const PINTURAS = ["#FF5A4E", "#FFC21A", "#14B8B0", "#3D8BFF", "#8E6CF0", "#FF6FAE", "#6CC456", "#8B5A2B"];
function juegoColorea() {
  crearJuego({ titulo: "Colorea", instruccion: "j_colorea", rondas: 2, iniciarRonda(api, r) {
    const capa = api.capa, M = C.marino;
    sv("rect", { x: 170, y: 20, width: 660, height: 470, rx: 36, fill: "#fff", stroke: "#E6DECF", "stroke-width": 6 }, capa);
    const zonas = []; let color = PINTURAS[0];
    const zona = (el, prop = "fill") => { el.classList.add("tocable"); zonas.push(el);
      el.addEventListener("pointerdown", () => { api.tocado(); el.setAttribute(prop, color); el.dataset.pintado = 1; sfx.pop();
        const b = el.getBBox(); api.estallido(b.x + b.width / 2, b.y + b.height / 2, color, 8); }); return el; };
    if (r === 0) {                                   // Uno para colorear
      const D = "M60 120 C87 93 111 51 135 48 C159 45 138 165 138 292";
      const g = sv("g", { transform: "translate(340 12) scale(1.45)" }, capa);
      for (const [cx, rot] of [[112, 35], [165, -35]]) sv("ellipse", { cx, cy: 222, rx: 12, ry: 30, fill: "#fff", stroke: M, "stroke-width": 5, transform: `rotate(${rot} ${cx} 222)` }, g);
      [...g.querySelectorAll("ellipse")].forEach((e) => zona(e));
      sv("path", { d: D, fill: "none", stroke: M, "stroke-width": 62, "stroke-linecap": "round" }, g);
      zona(sv("path", { d: D, fill: "none", stroke: "#fff", "stroke-width": 50, "stroke-linecap": "round", "pointer-events": "stroke" }, g), "stroke");
      for (const cx of [124, 154]) zona(sv("ellipse", { cx, cy: 300, rx: 20, ry: 12, fill: "#fff", stroke: M, "stroke-width": 5 }, g));
      zona(sv("circle", { cx: 140, cy: 222, r: 19, fill: "#fff", stroke: M, "stroke-width": 5 }, g));
      for (const cx of [127, 152]) { sv("circle", { cx, cy: 160, r: 11, fill: "#fff", stroke: M, "stroke-width": 4 }, g); sv("circle", { cx: cx + 2, cy: 162, r: 5.5, fill: M }, g); }
      sv("path", { d: "M130 183 Q140 192 150 183", stroke: M, "stroke-width": 4, fill: "none", "stroke-linecap": "round" }, g);
    } else {                                         // el prado: sol, nube, árbol, globo y pasto
      zona(sv("path", { d: "M176 400 Q330 330 500 380 T824 360 V470 Q824 484 810 484 H190 Q176 484 176 470Z", fill: "#fff", stroke: M, "stroke-width": 5 }, capa));
      const rayos = sv("g", { stroke: M, "stroke-width": 4, fill: "#fff" }, capa);
      for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; sv("polygon", { points: `${290 + 62 * Math.cos(a - 0.2)},${140 + 62 * Math.sin(a - 0.2)} ${290 + 62 * Math.cos(a + 0.2)},${140 + 62 * Math.sin(a + 0.2)} ${290 + 88 * Math.cos(a)},${140 + 88 * Math.sin(a)}` }, rayos); }
      zona(rayos);
      zona(sv("circle", { cx: 290, cy: 140, r: 52, fill: "#fff", stroke: M, "stroke-width": 5 }, capa));
      zona(sv("path", { d: "M520 150 a28 28 0 0 1 50 -20 a36 36 0 0 1 66 14 a26 26 0 0 1 4 50 h-112 a24 24 0 0 1 -8 -44z", fill: "#fff", stroke: M, "stroke-width": 5 }, capa));
      zona(sv("rect", { x: 675, y: 290, width: 34, height: 120, rx: 8, fill: "#fff", stroke: M, "stroke-width": 5 }, capa));
      zona(sv("path", { d: "M620 300 a50 50 0 0 1 10 -90 a60 60 0 0 1 110 -10 a50 50 0 0 1 20 100 z", fill: "#fff", stroke: M, "stroke-width": 5 }, capa));
      sv("path", { d: "M440 320 q-10 40 6 80", stroke: M, "stroke-width": 3, fill: "none" }, capa);
      zona(sv("ellipse", { cx: 440, cy: 262, rx: 44, ry: 56, fill: "#fff", stroke: M, "stroke-width": 5 }, capa));
    }
    // paleta de colores
    const aros = [];
    PINTURAS.forEach((c, i) => {
      const x = 250 + i * 72, g = sv("g", { class: "tocable" }, capa);
      const aro = sv("circle", { cx: x, cy: 548, r: 34, fill: "none", stroke: i === 0 ? M : "transparent", "stroke-width": 6 }, g);
      sv("circle", { cx: x, cy: 548, r: 26, fill: c, stroke: "#fff", "stroke-width": 5 }, g); aros.push(aro);
      g.addEventListener("pointerdown", () => { color = c; aros.forEach((a) => a.setAttribute("stroke", "transparent")); aro.setAttribute("stroke", M); rebote(g); tono([880], 0.05, "sine", 0.05); api.tocado(); });
    });
    const listo = sv("g", { class: "tocable", transform: "translate(90 548)" }, capa);
    sv("circle", { r: 44, fill: C.turquesa, stroke: "#fff", "stroke-width": 6 }, listo);
    sv("path", { d: "M-18 0 l12 12 24 -26", stroke: "#fff", "stroke-width": 9, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, listo);
    listo.addEventListener("pointerdown", async () => { if (listo.dataset.ok) return; listo.dataset.ok = 1; rebote(listo); api.estallido(500, 250, color, 24); await api.hablar("precioso"); api.acierto(); });
    api.pista(() => zonas.find((z) => !z.dataset.pintado) || listo);
    if (r > 0) api.hablar("j_colorea");
  } });
}

/* ---------- 9. Arma a Uno (rompecabezas) ---------- */
function juegoRompe() {
  const CORTES = [[[0, 0, 1, 0.5], [0, 0.5, 1, 0.5]], [[0, 0, 1, 0.34], [0, 0.34, 1, 0.33], [0, 0.67, 1, 0.33]],
                  [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]]];
  crearJuego({ titulo: "Arma a Uno", instruccion: "j_rompe", rondas: 3, iniciarRonda(api, r) {
    const capa = api.capa, IW = 320, IH = 377, X0 = 110, Y0 = 70;
    sv("rect", { x: X0 - 14, y: Y0 - 14, width: IW + 28, height: IH + 28, rx: 30, fill: "rgba(255,255,255,.7)", stroke: "#fff", "stroke-width": 6 }, capa);
    sv("image", { href: "img/uno.png", x: X0, y: Y0, width: IW, height: IH, opacity: 0.18 }, capa);
    const defs = sv("defs", {}, capa); let puestas = 0; const piezas = [];
    const cortes = CORTES[r];
    cortes.forEach(([fx, fy, fw, fh], i) => sv("rect", { x: X0 + fx * IW, y: Y0 + fy * IH, width: fw * IW, height: fh * IH, fill: "none", stroke: "#8C9AC0", "stroke-width": 3, "stroke-dasharray": "10 8" }, capa));
    const lugares = barajar(cortes.map((c) => c));          // bandeja a la derecha: mismas casillas, en otro orden, sin encimarse
    cortes.map((c, i) => [c, i]).forEach(([[fx, fy, fw, fh], i], k) => {
      const id = `pz${r}_${i}`, cp = sv("clipPath", { id }, defs);
      sv("rect", { x: X0 + fx * IW, y: Y0 + fy * IH, width: fw * IW, height: fh * IH, rx: 10 }, cp);
      const g = sv("g", { class: "tocable" }, capa);
      sv("rect", { x: X0 + fx * IW, y: Y0 + fy * IH, width: fw * IW, height: fh * IH, rx: 10, fill: "#fff", stroke: "#fff", "stroke-width": 8 }, g);
      sv("image", { href: "img/uno.png", x: X0, y: Y0, width: IW, height: IH, "clip-path": `url(#${id})` }, g);
      const cx = X0 + (fx + fw / 2) * IW, cy = Y0 + (fy + fh / 2) * IH;
      const [lx, ly, lw, lh] = lugares[k], sep = 22;
      const destinoX = 560 + (lx + lw / 2) * IW + (lx > 0 ? sep : 0), destinoY = Y0 + (ly + lh / 2) * IH + (ly > 0 ? sep * Math.round(ly * 3) : 0);
      const pz = { g, dx: destinoX - cx, dy: destinoY - cy, puesta: false };
      const pintar = () => g.setAttribute("transform", `translate(${pz.dx} ${pz.dy})`); pintar(); aparecer(g, k * 120);
      let arrastre = null;
      const aSvg = (ev) => { const p = capa.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(capa.getScreenCTM().inverse()); };
      g.addEventListener("pointerdown", (ev) => { if (pz.puesta) return; api.tocado(); capa.appendChild(g); g.setPointerCapture(ev.pointerId); const q = aSvg(ev); arrastre = { x: q.x - pz.dx, y: q.y - pz.dy }; tono([660], 0.04, "sine", 0.05); });
      g.addEventListener("pointermove", (ev) => { if (!arrastre) return; const q = aSvg(ev); pz.dx = q.x - arrastre.x; pz.dy = q.y - arrastre.y; pintar(); });
      g.addEventListener("pointerup", async () => {
        if (!arrastre) return; arrastre = null;
        if (Math.hypot(pz.dx, pz.dy) < 75) {            // cerca de su lugar: se acomoda sola
          pz.dx = 0; pz.dy = 0; pintar(); pz.puesta = true; puestas++; sfx.ding(); rebote(g); api.estallido(cx, cy, C.turquesa, 10);
          if (puestas === cortes.length) { api.estallido(X0 + IW / 2, Y0 + IH / 2, C.sol, 24); await api.hablar("u_yupi"); api.acierto(); }
        }
      });
      piezas.push(pz);
    });
    api.pista(() => { const p = piezas.find((x) => !x.puesta); return p && p.g.querySelector("rect"); });   // el marco real de la pieza
    if (r > 0) api.hablar("j_rompe");
  } });
}

iniciar();
