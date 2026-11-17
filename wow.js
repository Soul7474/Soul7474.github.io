/* ==========================================================
   SM. // WOW LAYER
   ========================================================== */
(() => {
  "use strict";
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const fxOn = () =>
    !reduced.matches && !root.classList.contains("motion-paused");
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&@$<>/\\[]{}=+*?!01";
  const DIGITS = "0123456789";
  const rand = (s) => s[(Math.random() * s.length) | 0];

  /* ---------------------------------------------------------
     Descifrado de texto: recorre los nodos de texto y los
     "desencripta" carácter a carácter sin tocar el HTML.
     --------------------------------------------------------- */
  function decrypt(el, { duration = 900, charset = GLYPHS, onDone } = {}) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (n.nodeValue.trim()) nodes.push({ n, text: n.nodeValue });
    }
    if (!nodes.length) return;
    const total = nodes.reduce((a, o) => a + o.text.length, 0);
    // momento en el que se resuelve cada carácter
    let idx = 0;
    nodes.forEach((o) => {
      o.at = [...o.text].map(() => {
        const t = (idx++ / total) * duration * 0.7 + Math.random() * duration * 0.3;
        return t;
      });
    });
    const label = el.textContent;
    if (!el.hasAttribute("aria-hidden") && !el.closest("[aria-hidden='true']"))
      el.setAttribute("aria-label", label.replace(/\s+/g, " ").trim());
    const start = performance.now();
    let lastSwap = 0;
    const step = (now) => {
      const t = now - start;
      // no cambiar glifos en cada frame: ~22 fps da sensación "terminal"
      if (now - lastSwap < 45 && t < duration) return requestAnimationFrame(step);
      lastSwap = now;
      let done = true;
      nodes.forEach((o) => {
        let s = "";
        for (let i = 0; i < o.text.length; i++) {
          const ch = o.text[i];
          if (t >= o.at[i] || /\s|[.,¿?¡!/&·—-]/.test(ch)) s += ch;
          else {
            s += rand(charset);
            done = false;
          }
        }
        o.n.nodeValue = s;
      });
      if (!done && t < duration + 200) requestAnimationFrame(step);
      else {
        nodes.forEach((o) => (o.n.nodeValue = o.text));
        el.removeAttribute("aria-label");
        onDone && onDone();
      }
    };
    requestAnimationFrame(step);
  }

  /* ---------------------------------------------------------
     1. Intro de arranque (una vez por sesión)
     --------------------------------------------------------- */
  function runBoot() {
    if (!root.classList.contains("boot-pending")) return;
    try {
      sessionStorage.setItem("sm-boot", "1");
    } catch {}
    const boot = document.createElement("div");
    boot.className = "boot";
    boot.setAttribute("role", "status");
    boot.setAttribute("aria-label", "Cargando el portfolio de Saúl Martín Sánchez");
    boot.innerHTML = `
      <div class="boot-half top"></div><div class="boot-half bottom"></div>
      <div class="boot-beam"></div>
      <div class="boot-content" aria-hidden="true">
        <div class="boot-head"><span>SM-OS // SECURE BOOT</span><span>v2.6</span></div>
        <div class="boot-log"></div>
        <div class="boot-name">Saúl Martín Sánchez</div>
        <div class="boot-bar"><i></i></div>
        <div class="boot-foot"><span class="boot-pct">000%</span><span class="boot-granted">ACCESO CONCEDIDO</span></div>
      </div>
      <div class="boot-skip" aria-hidden="true">PULSA PARA SALTAR</div>`;
    document.body.append(boot);
    root.classList.remove("boot-pending");

    const log = boot.querySelector(".boot-log");
    const bar = boot.querySelector(".boot-bar i");
    const pct = boot.querySelector(".boot-pct");
    const lines = [
      ["estableciendo túnel cifrado", "OK", "ok"],
      ["verificando identidad", "OK", "ok"],
      ["cargando perfil: saul.martin", "OK", "ok"],
      ["módulo blue-team", "ACTIVO", "act"],
    ];
    const timers = [];
    lines.forEach(([txt, res, cls], i) =>
      timers.push(
        setTimeout(() => {
          const d = document.createElement("div");
          d.innerHTML = `<span>&gt; ${txt}</span><span class="dots">${".".repeat(80)}</span><span class="${cls}">[ ${res} ]</span>`;
          log.append(d);
        }, 120 + i * 210),
      ),
    );
    decrypt(boot.querySelector(".boot-name"), { duration: 1100 });

    const DURATION = 1500;
    const t0 = performance.now();
    let raf = 0;
    const progress = (now) => {
      const p = Math.min(1, (now - t0) / DURATION);
      const eased = 1 - Math.pow(1 - p, 3);
      bar.style.setProperty("--p", eased.toFixed(3));
      pct.textContent = String(Math.round(eased * 100)).padStart(3, "0") + "%";
      if (p < 1) raf = requestAnimationFrame(progress);
      else {
        boot.classList.add("is-granted");
        timers.push(setTimeout(exit, 520));
      }
    };
    raf = requestAnimationFrame(progress);

    let exiting = false;
    function exit() {
      if (exiting) return;
      exiting = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      boot.classList.add("is-out");
      setTimeout(() => root.classList.remove("booting"), 250);
      setTimeout(() => boot.remove(), 1000);
      removeEventListener("keydown", exit);
    }
    boot.addEventListener("click", exit);
    boot.addEventListener("touchstart", exit, { passive: true });
    addEventListener("keydown", exit);
  }

  /* ---------------------------------------------------------
     2. Títulos que se descifran al entrar en pantalla
     --------------------------------------------------------- */
  function setupDecrypt() {
    const targets = [
      ...document.querySelectorAll(
        ".section-heading h2, .about-grid h2, #contact-title, .section-heading .eyebrow, .about-grid .eyebrow, .contact-top .eyebrow, .gate-title, .gate-kicker",
      ),
    ].map((el) => ({ el, charset: GLYPHS, duration: el.matches("h2, .gate-title") ? 1000 : 700 }));
    document
      .querySelectorAll(".evidence-grid strong")
      .forEach((el) => targets.push({ el, charset: DIGITS, duration: 900 }));

    if (!("IntersectionObserver" in window)) return;
    const map = new Map(targets.map((t) => [t.el, t]));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          if (!fxOn()) return;
          const t = map.get(e.target);
          if (t.el.id === "contact-title") {
            decrypt(t.el, { ...t, onDone: () => {} });
            t.el.classList.add("neon-on");
          } else decrypt(t.el, t);
        });
      },
      { threshold: 0.45 },
    );
    targets.forEach((t) => io.observe(t.el));
  }

  /* ---------------------------------------------------------
     3. Cursor retícula con coordenadas
     --------------------------------------------------------- */
  function setupReticle() {
    const r = document.createElement("div");
    r.className = "reticle";
    r.setAttribute("aria-hidden", "true");
    r.innerHTML =
      '<span class="reticle-ring"></span><span class="reticle-dot"></span><span class="reticle-label"></span>';
    document.body.append(r);
    const ring = r.querySelector(".reticle-ring");
    const dot = r.querySelector(".reticle-dot");
    const label = r.querySelector(".reticle-label");
    let x = innerWidth / 2,
      y = innerHeight / 2,
      rx = x,
      ry = y,
      raf = 0,
      hoverText = "";

    const enabled = () =>
      finePointer.matches && fxOn() && !document.querySelector("dialog[open]");
    const sync = () => {
      const on = enabled();
      root.classList.toggle("has-reticle", on);
      if (!on) r.classList.remove("is-on");
    };

    const loop = () => {
      rx += (x - rx) * 0.22;
      ry += (y - ry) * 0.22;
      dot.style.transform = `translate3d(${x}px,${y}px,0) rotate(45deg)`;
      ring.style.translate = `${rx}px ${ry}px`;
      label.style.translate = `${rx}px ${ry}px`;
      label.textContent =
        hoverText ||
        `X ${String(Math.round(x)).padStart(4, "0")} · Y ${String(Math.round(y)).padStart(4, "0")}`;
      if (Math.abs(x - rx) > 0.3 || Math.abs(y - ry) > 0.3)
        raf = requestAnimationFrame(loop);
      else raf = 0;
    };

    const hoverLabel = (el) => {
      if (!el) return "";
      if (el.matches(".project-image, .project-link[data-project]")) return "[ VER PRÁCTICA ]";
      if (el.matches(".recognition-row")) return "[ VER DIPLOMA ]";
      if (el.matches("[href^='mailto:']")) return "[ ENVIAR CORREO ]";
      if (el.matches("[href^='tel:']")) return "[ LLAMAR ]";
      if (el.matches("a[target='_blank']")) return "[ ABRIR ENLACE ]";
      if (el.matches(".radar-node")) return "[ ESCANEAR ÁREA ]";
      if (el.matches(".term-launch")) return "[ ABRIR TERMINAL ]";
      if (el.matches(".g-node")) return "[ ANALIZAR NODO ]";
      if (el.matches(".copy-email")) return "[ COPIAR ]";
      if (el.matches(".sys-keys")) return "[ VER ATAJOS ]";
      if (el.matches("summary")) return "[ DESPLEGAR ]";
      if (el.matches("a[href^='#']")) return "[ IR ]";
      return "[ CLICK ]";
    };

    addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType !== "mouse") return;
        sync();
        if (!root.classList.contains("has-reticle")) return;
        x = e.clientX;
        y = e.clientY;
        r.classList.add("is-on");
        const hit = e.target.closest?.(
          "a, button, summary, label, [role='button'], .recognition-row, .g-node",
        );
        r.classList.toggle("is-hover", !!hit);
        hoverText = hit ? hoverLabel(hit) : "";
        if (!raf) raf = requestAnimationFrame(loop);
      },
      { passive: true },
    );
    // al hacer scroll el elemento bajo el cursor cambia: recalcular
    let scrollRaf = 0;
    addEventListener(
      "scroll",
      () => {
        if (scrollRaf || !r.classList.contains("is-on")) return;
        scrollRaf = requestAnimationFrame(() => {
          scrollRaf = 0;
          const el = document.elementFromPoint(x, y);
          const hit = el?.closest?.("a, button, summary, label, [role='button'], .recognition-row, .g-node");
          r.classList.toggle("is-hover", !!hit);
          hoverText = hit ? hoverLabel(hit) : "";
          if (!raf) raf = requestAnimationFrame(loop);
        });
      },
      { passive: true },
    );
    document.addEventListener("pointerleave", () => r.classList.remove("is-on"));
    addEventListener("blur", () => r.classList.remove("is-on"));
    addEventListener("pointerdown", () => r.classList.add("is-down"));
    addEventListener("pointerup", () => r.classList.remove("is-down"));
    // los <dialog> viven en la capa superior: ahí volvemos al cursor normal
    const mo = new MutationObserver(sync);
    document.querySelectorAll("dialog").forEach((d) =>
      mo.observe(d, { attributes: true, attributeFilter: ["open"] }),
    );
    // la terminal se crea en otro script: observar cuando aparezca
    new MutationObserver(() => {
      document
        .querySelectorAll("dialog:not([data-reticle-watch])")
        .forEach((d) => {
          d.dataset.reticleWatch = "1";
          mo.observe(d, { attributes: true, attributeFilter: ["open"] });
        });
    }).observe(document.body, { childList: true });
    addEventListener("portfolio:motionchange", sync);
    finePointer.addEventListener?.("change", sync);
    sync();
  }

  /* ---------------------------------------------------------
     4. Holograma en credenciales y diplomas
     --------------------------------------------------------- */
  function setupHolo() {
    document
      .querySelectorAll(".credential-card, .recognition-row .award-preview")
      .forEach((host) => {
        const h = document.createElement("span");
        h.className = "holo";
        h.setAttribute("aria-hidden", "true");
        host.append(h);
        const target = host.closest(".recognition-row") || host;
        target.addEventListener("pointermove", (e) => {
          if (!fxOn() || !finePointer.matches) return;
          const b = target.getBoundingClientRect();
          h.style.setProperty("--holo-x", `${((e.clientX - b.left) / b.width) * 100}%`);
          h.style.setProperty("--holo-y", `${((e.clientY - b.top) / b.height) * 100}%`);
        });
      });
  }

  /* ---------------------------------------------------------
     5. Barrido de escáner cuando aparece cada tarjeta
     --------------------------------------------------------- */
  function setupScan() {
    if (!("IntersectionObserver" in window)) return;
    const hosts = document.querySelectorAll(
      ".experience-card, .project-card, .credential-card, .skill-block, .contact-links",
    );
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          if (!fxOn()) return;
          const w = e.target.querySelector(":scope > .scan-wrap");
          if (w) setTimeout(() => w.classList.add("go"), 120);
        }),
      { threshold: 0.35 },
    );
    hosts.forEach((host) => {
      if (getComputedStyle(host).position === "static") host.style.position = "relative";
      const wrap = document.createElement("span");
      wrap.className = "scan-wrap";
      wrap.setAttribute("aria-hidden", "true");
      wrap.dataset.tone = host.closest("[data-tone]")?.dataset.tone || "cyan";
      wrap.innerHTML = '<span class="scan-beam"></span>';
      host.append(wrap);
      io.observe(host);
    });
  }

  /* ---------------------------------------------------------
     6. Reloj en vivo (hora de Valencia)
     --------------------------------------------------------- */
  function setupClock() {
    const loc = document.querySelector(".hero-location");
    if (!loc) return;
    const div = document.createElement("span");
    div.className = "location-divider clock-divider";
    div.setAttribute("aria-hidden", "true");
    div.textContent = "/";
    const clock = document.createElement("span");
    clock.className = "live-clock";
    clock.setAttribute("aria-label", "Hora actual en Valencia");
    loc.append(" ", div, " ", clock);
    let fmt;
    try {
      fmt = new Intl.DateTimeFormat("es-ES", {
        timeZone: "Europe/Madrid",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      });
    } catch {
      fmt = { format: (d) => d.toLocaleTimeString("es-ES") };
    }
    const tick = () => (clock.textContent = "VLC " + fmt.format(new Date()));
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------
     7. Botones magnéticos
     --------------------------------------------------------- */
  function setupMagnetic() {
    document
      .querySelectorAll(".button-primary, .nav-contact, .term-launch")
      .forEach((el) => {
        el.classList.add("magnetic");
        el.addEventListener("pointermove", (e) => {
          if (!fxOn() || !finePointer.matches) return;
          const b = el.getBoundingClientRect();
          const dx = e.clientX - (b.left + b.width / 2);
          const dy = e.clientY - (b.top + b.height / 2);
          el.style.translate = `${dx * 0.18}px ${dy * 0.28}px`;
        });
        el.addEventListener("pointerleave", () => (el.style.translate = ""));
      });
  }

  /* ---------- arranque ---------- */
  runBoot();
  setupClock();
  setupDecrypt();
  setupHolo();
  setupScan();
  // la terminal (terminal.js) añade su botón; esperar un tick
  setTimeout(setupMagnetic, 0);
  setupReticle();
})();
