/* ==========================================================
   SM. // EXTRAS
   1. Mapa de conocimientos (grafo de red interactivo)
   2. Línea de tiempo en la experiencia
   3. Logros desbloqueables
   4. Modo Red Team (código Konami o comando "redteam")
   ========================================================== */
(() => {
  "use strict";
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const mobileQ = matchMedia("(max-width: 760px)");
  const fxOn = () =>
    !reduced.matches && !root.classList.contains("motion-paused");
  const SVGNS = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs = {}) => {
    const el = document.createElementNS(SVGNS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  };
  const SM = (window.SM = window.SM || {});

  /* =========================================================
     3. LOGROS (se define primero porque lo usan los demás)
     ========================================================= */
  const ACHIEVEMENTS = {
    hacker: { icon: ">_", title: "HACKER", text: "Has abierto la terminal" },
    explorer: { icon: "◈", title: "EXPLORADOR", text: "Has recorrido los 7 capítulos" },
    verifier: { icon: "✓", title: "VERIFICADOR", text: "Has comprobado una acreditación" },
    redteam: { icon: "☠", title: "RED TEAM", text: "Has encontrado el modo secreto" },
  };
  const TOTAL = Object.keys(ACHIEVEMENTS).length;
  let unlocked = [];
  try {
    unlocked = JSON.parse(localStorage.getItem("sm-achievements") || "[]");
  } catch {}
  const toastHost = document.createElement("div");
  toastHost.className = "toast-host";
  toastHost.setAttribute("aria-live", "polite");
  if ("popover" in HTMLElement.prototype) toastHost.popover = "manual";
  document.body.append(toastHost);

  function toast({ icon, kicker, title, text, tone = "acid" }) {
    const t = document.createElement("div");
    t.className = `toast tone-${tone}`;
    t.innerHTML = `<span class="toast-icon" aria-hidden="true">${icon}</span>
      <span class="toast-body"><span class="toast-kicker">${kicker}</span>
      <strong>${title}</strong><span class="toast-text">${text}</span></span>`;
    toastHost.append(t);
    // los popovers van a la capa superior: se ven incluso con la terminal abierta
    try {
      if (toastHost.popover) {
        if (toastHost.matches(":popover-open")) toastHost.hidePopover();
        toastHost.showPopover();
      }
    } catch {}
    requestAnimationFrame(() => t.classList.add("in"));
    setTimeout(() => {
      t.classList.remove("in");
      t.classList.add("out");
      setTimeout(() => {
        t.remove();
        if (!toastHost.children.length && toastHost.popover) {
          try {
            toastHost.hidePopover();
          } catch {}
        }
      }, 500);
    }, 4200);
  }
  SM.toast = toast;

  function unlock(id) {
    if (unlocked.includes(id) || !ACHIEVEMENTS[id]) return;
    unlocked.push(id);
    try {
      localStorage.setItem("sm-achievements", JSON.stringify(unlocked));
    } catch {}
    const a = ACHIEVEMENTS[id];
    toast({
      icon: a.icon,
      kicker: `LOGRO DESBLOQUEADO · ${unlocked.length}/${TOTAL}`,
      title: a.title,
      text: unlocked.length === TOTAL ? `${a.text}. ¡Los tienes todos! 🏆` : a.text,
      tone: id === "redteam" ? "red" : "acid",
    });
  }
  SM.unlock = unlock;

  // Hacker: abrir la terminal (la crea terminal.js)
  const watchTerminal = () => {
    const d = document.querySelector(".term-dialog");
    if (!d) return setTimeout(watchTerminal, 300);
    new MutationObserver(() => d.open && setTimeout(() => unlock("hacker"), 1200)).observe(d, {
      attributes: true,
      attributeFilter: ["open"],
    });
  };
  watchTerminal();

  // Verificador: abrir un diploma o una credencial
  document.addEventListener("click", (e) => {
    const a = e.target.closest?.(".recognition-row, .credential-card .project-link");
    if (a) setTimeout(() => unlock("verifier"), 900);
  });

  // Explorador: ver los 7 capítulos
  if ("IntersectionObserver" in window) {
    const seen = new Set();
    const chapters = document.querySelectorAll("[data-chapter]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            seen.add(e.target.id);
            io.unobserve(e.target);
          }
        });
        if (seen.size >= chapters.length) setTimeout(() => unlock("explorer"), 1500);
      },
      { threshold: 0.25 },
    );
    chapters.forEach((c) => io.observe(c));
  }

  /* =========================================================
     1. MAPA DE CONOCIMIENTOS
     ========================================================= */
  const CATS = [
    { id: "sys", label: "Sistemas & redes", tone: "cyan", block: 0 },
    { id: "sec", label: "Seguridad & análisis", tone: "pink", block: 1 },
    { id: "ops", label: "Automatización & soporte", tone: "acid", block: 2 },
  ];
  const ITEMS = [
    ["sys", "Windows Server"],
    ["sys", "Linux"],
    ["sys", "Microsoft 365"],
    ["sys", "Google Workspace"],
    ["sys", "Acronis"],
    ["sys", "NAS QNAP · Buffalo"],
    ["sys", "Cisco Packet Tracer"],
    ["sec", "Splunk · SPL"],
    ["sec", "Microsoft Defender"],
    ["sec", "Entra ID"],
    ["sec", "Fortinet"],
    ["sec", "Cloudflare WARP"],
    ["sec", "Nmap"],
    ["sec", "Wireshark"],
    ["ops", "PowerShell"],
    ["ops", "Microsoft Intune"],
    ["ops", "AnyDesk"],
    ["ops", "Odoo"],
    ["ops", "1Password"],
    ["ops", "RedTrust"],
  ];
  const CROSS = [
    ["PowerShell", "Windows Server"],
    ["Microsoft Intune", "Microsoft 365"],
    ["Entra ID", "Microsoft 365"],
    ["Microsoft Defender", "Microsoft Intune"],
    ["Wireshark", "Cisco Packet Tracer"],
    ["Nmap", "Linux"],
    ["Fortinet", "Cisco Packet Tracer"],
    ["Splunk · SPL", "Microsoft Defender"],
    ["Acronis", "Windows Server"],
    ["1Password", "Entra ID"],
  ];

  function buildGraphModel() {
    const nodes = [{ id: "core", label: "SM.", type: "core", tone: "core" }];
    CATS.forEach((c) => nodes.push({ id: c.id, label: c.label, type: "cat", tone: c.tone, cat: c.id }));
    ITEMS.forEach(([cat, label]) =>
      nodes.push({ id: label, label, type: "item", tone: CATS.find((c) => c.id === cat).tone, cat }),
    );
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const edges = [];
    CATS.forEach((c) => edges.push({ a: byId.get("core"), b: byId.get(c.id), kind: "spine" }));
    ITEMS.forEach(([cat, label]) => edges.push({ a: byId.get(cat), b: byId.get(label), kind: "branch" }));
    CROSS.forEach(([x, y]) => edges.push({ a: byId.get(x), b: byId.get(y), kind: "cross" }));
    nodes.forEach((n) => (n.links = []));
    edges.forEach((e) => {
      e.a.links.push(e);
      e.b.links.push(e);
    });
    return { nodes, edges, byId };
  }

  // PRNG con semilla: el grafo sale siempre igual
  function mulberry(seed) {
    return () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function layout(model, W, H, compact) {
    // Disposición radial "dibujada": núcleo al centro, 3 áreas alrededor
    // y cada tecnología en abanico hacia fuera (dos anillos alternos).
    const rnd = mulberry(7474);
    const cx = W / 2,
      cy = H * (compact ? 0.47 : 0.45);
    const deg = (d) => (d * Math.PI) / 180;
    const CAT_ANG = compact ? { sys: 215, sec: 325, ops: 90 } : { sys: 196, sec: 344, ops: 90 };
    const catR = compact ? { x: W * 0.25, y: H * 0.2 } : { x: W * 0.2, y: H * 0.24 };
    const ring = compact ? { x: W * 0.22, y: H * 0.19 } : { x: W * 0.15, y: H * 0.3 };
    const spread = compact ? 64 : { sys: 78, sec: 78, ops: 70 };
    const { nodes } = model;
    const core = nodes.find((n) => n.type === "core");
    core.x = cx;
    core.y = cy;
    if (compact) {
      // Móvil: cada área es un "clúster" circular; etiquetas hacia dentro
      core.y = H / 2;
      const angs = { sys: 270, sec: 30, ops: 150 };
      CATS.forEach((c) => {
        const n = model.byId.get(c.id);
        const a = deg(angs[c.id]);
        n.x = W / 2 + Math.cos(a) * W * 0.27;
        n.y = H / 2 + Math.sin(a) * H * 0.31;
        const items = nodes.filter((m) => m.type === "item" && m.cat === c.id);
        const toCore = angs[c.id] + 180;
        items.forEach((m, i) => {
          const ang = deg(toCore + 40 + (i * 280) / (items.length - 1));
          m.x = n.x + Math.cos(ang) * W * 0.21;
          m.y = n.y + Math.sin(ang) * W * 0.21;
          m.side = m.x > W / 2 ? "left" : "right";
        });
      });
    } else
    CATS.forEach((c) => {
      const n = model.byId.get(c.id);
      const a = deg(CAT_ANG[c.id]);
      n.x = cx + Math.cos(a) * catR.x;
      n.y = cy + Math.sin(a) * catR.y;
      const items = nodes.filter((m) => m.type === "item" && m.cat === c.id);
      const sp = typeof spread === "number" ? spread : spread[c.id];
      items.forEach((m, i) => {
        const f = items.length === 1 ? 0.5 : i / (items.length - 1);
        const ang = deg(CAT_ANG[c.id] - sp + f * sp * 2);
        const r = ring;
        m.x = n.x + Math.cos(ang) * r.x;
        m.y = n.y + Math.sin(ang) * r.y;
        m.side = Math.cos(ang) < -0.25 ? "left" : Math.cos(ang) > 0.25 ? "right" : "mid";
      });
    });
    // Evitar que las etiquetas se pisen: empujar en vertical
    if (!compact) {
      const items = nodes.filter((n) => n.type === "item");
      const box = (n) => {
        const w = n.label.length * 6.7 + 6;
        if (n.side === "right") return { l: n.x + 8, r: n.x + 10 + w, t: n.y - 9, b: n.y + 9 };
        if (n.side === "left") return { l: n.x - 10 - w, r: n.x - 8, t: n.y - 9, b: n.y + 9 };
        return { l: n.x - w / 2, r: n.x + w / 2, t: n.y - 6, b: n.y + 25 };
      };
      for (let it = 0; it < 80; it++) {
        let moved = false;
        for (let i = 0; i < items.length; i++)
          for (let j = i + 1; j < items.length; j++) {
            const A = box(items[i]),
              B = box(items[j]);
            if (A.l < B.r && B.l < A.r && A.t < B.b && B.t < A.b) {
              const push = (Math.min(A.b, B.b) - Math.max(A.t, B.t)) / 2 + 1;
              const dir = items[i].y <= items[j].y ? -1 : 1;
              items[i].y += dir * push;
              items[j].y -= dir * push;
              moved = true;
            }
          }
        if (!moved) break;
      }
    }
    const padX = compact ? 14 : 24,
      padY = compact ? 22 : 30;
    nodes.forEach((n) => {
      n.x = Math.max(padX, Math.min(W - padX, n.x));
      n.y = Math.max(padY, Math.min(H - padY, n.y));
      n.hx = n.x;
      n.hy = n.y;
      n.phase = rnd() * Math.PI * 2;
      n.amp = n.type === "core" ? 0 : n.type === "cat" ? 2 : 3;
      n.speed = 0.4 + rnd() * 0.5;
    });
  }

  function setupGraph() {
    const section = document.querySelector("#skills .container");
    const grid = section?.querySelector(".skills-grid");
    if (!section || !grid) return;
    const blocks = grid.querySelectorAll(".skill-block");

    const wrap = document.createElement("div");
    wrap.className = "skill-graph";
    wrap.innerHTML = `
      <div class="graph-head">
        <span class="graph-title"><i aria-hidden="true"></i>MAPA DE CONOCIMIENTOS</span>
        <span class="graph-status mono" aria-hidden="true">${ITEMS.length + 4} NODOS · ${ITEMS.length + 3 + CROSS.length} ENLACES</span>
      </div>
      <div class="graph-stage">
        <span class="graph-corner tl" aria-hidden="true"></span><span class="graph-corner tr" aria-hidden="true"></span>
        <span class="graph-corner bl" aria-hidden="true"></span><span class="graph-corner br" aria-hidden="true"></span>
      </div>
      <div class="graph-foot">
        <span class="graph-legend" aria-hidden="true">
          <span class="lg tone-cyan">Sistemas & redes</span>
          <span class="lg tone-pink">Seguridad & análisis</span>
          <span class="lg tone-acid">Automatización & soporte</span>
        </span>
        <span class="graph-readout mono" aria-live="polite">${mobileQ.matches ? "Toca un nodo para ver sus conexiones" : "Pasa el ratón por un nodo para ver sus conexiones"}</span>
      </div>`;
    section.insertBefore(wrap, grid);
    const stage = wrap.querySelector(".graph-stage");
    const readout = wrap.querySelector(".graph-readout");
    const defaultReadout = readout.textContent;

    let model, svg, W, H, compact, gEdges, gPackets, gNodes;
    let visible = false,
      raf = 0,
      intro = 0,
      packets = [];

    function render() {
      compact = mobileQ.matches;
      W = Math.round(stage.clientWidth);
      H = compact ? 560 : 540;
      model = buildGraphModel();
      layout(model, W, H, compact);
      svg?.remove();
      svg = svgEl("svg", {
        class: "graph-svg",
        viewBox: `0 0 ${W} ${H}`,
        width: W,
        height: H,
        role: "img",
        "aria-label":
          "Mapa de conocimientos: sistemas y redes, seguridad y análisis, y automatización y soporte, con las tecnologías de cada área conectadas entre sí. El detalle está en la lista de abajo.",
      });
      const defs = svgEl("defs");
      defs.innerHTML = `
        <pattern id="gGrid" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M28 0H0V28" fill="none" stroke="#34edff" stroke-opacity=".06"/>
        </pattern>
        <radialGradient id="gCore"><stop offset="0" stop-color="#f1ff28" stop-opacity=".35"/><stop offset="1" stop-color="#f1ff28" stop-opacity="0"/></radialGradient>`;
      svg.append(defs, svgEl("rect", { width: W, height: H, fill: "url(#gGrid)" }));
      svg.append(svgEl("circle", { cx: W / 2, cy: H / 2, r: Math.min(W, H) * 0.42, class: "graph-ring" }));
      svg.append(svgEl("circle", { cx: W / 2, cy: H / 2, r: Math.min(W, H) * 0.24, class: "graph-ring inner" }));
      gEdges = svgEl("g", { class: "g-edges" });
      gPackets = svgEl("g", { class: "g-packets" });
      gNodes = svgEl("g", { class: "g-nodes" });
      svg.append(gEdges, gPackets, gNodes);

      model.edges.forEach((e) => {
        e.el = svgEl("line", { class: `g-edge ${e.kind} tone-${e.b.tone}` });
        gEdges.append(e.el);
      });
      model.nodes.forEach((n) => {
        const g = svgEl("g", { class: `g-node ${n.type} tone-${n.tone}`, tabindex: "-1" });
        if (n.type === "core") {
          g.append(svgEl("circle", { r: 60, fill: "url(#gCore)", class: "core-halo" }));
          g.append(svgEl("circle", { r: compact ? 20 : 25, class: "dot" }));
          const t = svgEl("text", { class: "label", "text-anchor": "middle", dy: "0.36em" });
          t.textContent = "SM.";
          g.append(t);
        } else {
          g.append(svgEl("circle", { r: n.type === "cat" ? 18 : 10, class: "hit" }));
          g.append(svgEl("circle", { r: n.type === "cat" ? 14 : 7, class: "glow" }));
          g.append(svgEl("circle", { r: n.type === "cat" ? 8 : 4, class: "dot" }));
          const side = n.side || "mid";
          const isCat = n.type === "cat";
          const t = svgEl("text", {
            class: "label",
            x: isCat || side === "mid" ? 0 : side === "right" ? 10 : -10,
            y: isCat ? (n.id === "ops" || (compact && n.id !== "sys") ? 26 : -18) : side === "mid" ? 16 : 0,
            dy: "0.35em",
            "text-anchor": isCat || side === "mid" ? "middle" : side === "right" ? "start" : "end",
          });
          t.textContent = n.type === "cat" ? n.label.toUpperCase() : n.label;
          g.append(t);
        }
        n.el = g;
        gNodes.append(g);
        g.addEventListener("pointerenter", () => focusNode(n));
        g.addEventListener("pointerleave", () => focusNode(null));
        g.addEventListener("click", (ev) => {
          ev.stopPropagation();
          focusNode(focused === n ? null : n, true);
        });
      });
      svg.addEventListener("click", () => focusNode(null));
      stage.append(svg);
      packets = [];
      for (let i = 0; i < (compact ? 4 : 7); i++) {
        const c = svgEl("circle", { r: 2.4, cx: 0, cy: 0, class: "g-packet" });
        gPackets.append(c);
        packets.push(newPacket(c));
      }
      intro = 0;
      settled = false;
      draw(performance.now(), true);
    }

    function newPacket(el, from) {
      const node = from || model.byId.get("core");
      const e = node.links[(Math.random() * node.links.length) | 0];
      const to = e.a === node ? e.b : e.a;
      el.setAttribute("class", `g-packet tone-${to.tone}`);
      return { el, from: node, to, t: 0, dur: 1100 + Math.random() * 900 };
    }

    let focused = null;
    function focusNode(n, sticky) {
      if (!n && focused && !sticky && focused._sticky) return;
      focused = n;
      if (n) n._sticky = !!sticky;
      svg.classList.toggle("has-focus", !!n);
      model.nodes.forEach((m) => m.el.classList.remove("lit", "focus"));
      model.edges.forEach((e) => e.el.classList.remove("lit"));
      blocks.forEach((b) => b.classList.remove("graph-lit"));
      if (!n) {
        readout.textContent = defaultReadout;
        return;
      }
      n.el.classList.add("lit", "focus");
      n.links.forEach((e) => {
        e.el.classList.add("lit");
        e.a.el.classList.add("lit");
        e.b.el.classList.add("lit");
      });
      const cat = CATS.find((c) => c.id === (n.cat || n.id));
      if (cat && n.type !== "core") blocks[cat.block]?.classList.add("graph-lit");
      const others = n.links
        .map((e) => (e.a === n ? e.b : e.a))
        .filter((m) => m.type !== "core")
        .map((m) => m.label);
      readout.textContent =
        n.type === "core"
          ? "SM. → Sistemas & redes · Seguridad & análisis · Automatización & soporte"
          : `${n.label} → ${others.join(" · ")}`;
    }

    const ease = (t) => 1 - Math.pow(1 - t, 3);
    // Rendimiento: los nodos solo se mueven durante la intro. Después el
    // grafo queda estático y solo se animan unos pocos "paquetes" (círculos).
    let settled = false;
    function placeNodes(k) {
      const cx = W / 2,
        cy = H / 2;
      model.nodes.forEach((n) => {
        n.x = cx + (n.hx - cx) * k;
        n.y = cy + (n.hy - cy) * k;
        n.el.setAttribute("transform", `translate(${n.x.toFixed(1)},${n.y.toFixed(1)})`);
        n.el.style.opacity = n.type === "core" ? 1 : Math.min(1, k * 1.4);
      });
      model.edges.forEach((e) => {
        e.el.setAttribute("x1", e.a.x.toFixed(1));
        e.el.setAttribute("y1", e.a.y.toFixed(1));
        e.el.setAttribute("x2", e.b.x.toFixed(1));
        e.el.setAttribute("y2", e.b.y.toFixed(1));
      });
    }
    let lastPacket = 0;
    function draw(now, still) {
      const moving = fxOn() && !still;
      if (!fxOn()) intro = 1;
      if (intro < 1) {
        if (moving) intro = Math.min(1, intro + 0.025);
        placeNodes(ease(intro));
        settled = false;
      } else if (!settled) {
        placeNodes(1);
        settled = true;
      }
      if (!moving || intro < 1) {
        packets.forEach((p) => (p.el.style.opacity = 0));
        return;
      }
      // paquetes a ~30 fps: suficiente para el ojo y la mitad de trabajo
      const dt = Math.min(100, now - (lastPacket || now - 33));
      if (dt < 30) return;
      lastPacket = now;
      packets.forEach((p, i) => {
        p.t += dt / p.dur;
        if (p.t >= 1) {
          packets[i] = newPacket(p.el, p.to);
          return;
        }
        const x = p.from.x + (p.to.x - p.from.x) * p.t;
        const y = p.from.y + (p.to.y - p.from.y) * p.t;
        p.el.setAttribute("transform", `translate(${x.toFixed(1)},${y.toFixed(1)})`);
        p.el.style.opacity = Math.sin(p.t * Math.PI).toFixed(2);
      });
    }

    function loop(now) {
      raf = 0;
      if (!visible) return;
      draw(now);
      if (fxOn() || intro < 1) raf = requestAnimationFrame(loop);
    }
    const start = () => {
      if (!raf && visible) raf = requestAnimationFrame(loop);
    };

    render();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        (entries) => {
          visible = entries[0].isIntersecting;
          if (visible) start();
        },
        { threshold: 0.2 },
      ).observe(stage);
    } else {
      intro = 1;
      draw(0, true);
    }
    if (!fxOn()) {
      intro = 1;
      draw(0, true);
    }
    addEventListener("portfolio:motionchange", () => {
      draw(performance.now(), true);
      start();
    });
    let lastW = W,
      rt = 0;
    addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        if (Math.round(stage.clientWidth) === lastW) return;
        lastW = Math.round(stage.clientWidth);
        const wasIntro = intro;
        render();
        intro = wasIntro >= 1 ? 1 : 0;
        draw(performance.now(), true);
        start();
      }, 200);
    });
  }

  /* =========================================================
     2. LÍNEA DE TIEMPO EN LA EXPERIENCIA
     ========================================================= */
  function setupTimeline() {
    const list = document.querySelector(".experience-list");
    if (!list) return;
    list.classList.add("has-timeline");
    const rail = document.createElement("span");
    rail.className = "xp-rail";
    rail.setAttribute("aria-hidden", "true");
    rail.innerHTML = '<span class="xp-fill"></span><span class="xp-head"></span>';
    list.prepend(rail);
    const cards = [...list.querySelectorAll(".experience-card")];
    const nodes = cards.map((card, i) => {
      const n = document.createElement("span");
      n.className = "xp-node";
      n.setAttribute("aria-hidden", "true");
      n.innerHTML = `<span>${String(cards.length - i).padStart(2, "0")}</span>`;
      card.append(n);
      return n;
    });
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = list.getBoundingClientRect();
      const focusY = innerHeight * 0.6;
      const p = Math.max(0, Math.min(1, (focusY - r.top) / r.height));
      list.style.setProperty("--xp", p.toFixed(4));
      nodes.forEach((n, i) => {
        const cr = cards[i].getBoundingClientRect();
        n.classList.toggle("on", cr.top + 46 < focusY);
      });
    };
    // solo calcular mientras la sección está cerca de la pantalla
    let near = true;
    if ("IntersectionObserver" in window)
      new IntersectionObserver(
        (entries) => {
          near = entries[0].isIntersecting;
          if (near) update();
        },
        { rootMargin: "200px 0px" },
      ).observe(list);
    addEventListener(
      "scroll",
      () => {
        if (near && !ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true },
    );
    addEventListener("resize", update, { passive: true });
    update();
  }

  /* =========================================================
     5. ATAJOS DE TECLADO (1-7 capítulos, ? ayuda)
     ========================================================= */
  function setupShortcuts() {
    const chapters = [...document.querySelectorAll("[data-chapter]")];
    const names = ["Experiencia", "Proyectos", "Sobre mí", "Formación", "Logros", "Conocimientos", "Contacto"];
    const hud = document.createElement("div");
    hud.className = "keys-hud";
    hud.setAttribute("role", "dialog");
    hud.setAttribute("aria-label", "Atajos de teclado");
    if ("popover" in HTMLElement.prototype) hud.popover = "auto";
    else hud.hidden = true;
    hud.innerHTML = `
      <div class="keys-head"><span>ATAJOS DE TECLADO</span><button type="button" class="keys-close" aria-label="Cerrar">ESC ×</button></div>
      <ul>
        ${chapters.map((c, i) => `<li><kbd>${i + 1}</kbd><span>${names[i] || c.id}</span></li>`).join("")}
        <li><kbd>º</kbd><span>Abrir la terminal</span></li>
        <li><kbd>?</kbd><span>Mostrar / ocultar esta ayuda</span></li>
        <li class="keys-secret"><kbd>•••</kbd><span>Hay un código secreto… 👀</span></li>
      </ul>`;
    document.body.append(hud);
    const toggle = (force) => {
      const open = hud.popover ? hud.matches(":popover-open") : !hud.hidden;
      const want = typeof force === "boolean" ? force : !open;
      if (hud.popover) want ? hud.showPopover() : hud.hidePopover();
      else hud.hidden = !want;
    };
    hud.querySelector(".keys-close").addEventListener("click", () => toggle(false));
    SM.toggleKeys = toggle;
    addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target.closest?.("input, textarea, select, [contenteditable='true']")) return;
      if (document.querySelector("dialog[open]")) return;
      if (e.key === "?") {
        e.preventDefault();
        toggle();
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= chapters.length) {
        e.preventDefault();
        toggle(false);
        chapters[n - 1].scrollIntoView({ behavior: fxOn() ? "smooth" : "auto" });
      }
    });
  }

  /* =========================================================
     6. DETALLES: pestaña, email copiado, sello, footer
     ========================================================= */
  function setupDetails() {
    // Título de la pestaña cuando el visitante se va a otra
    const title = document.title;
    document.addEventListener("visibilitychange", () => {
      document.title = document.hidden ? "⚠ Conexión perdida… vuelve 👀" : title;
    });

    // Aviso al copiar el email
    document.querySelector(".copy-email")?.addEventListener("click", () =>
      setTimeout(() => {
        const ok = /copiado/i.test(document.querySelector(".copy-status")?.textContent || "");
        if (ok)
          toast({
            icon: "⧉",
            kicker: "PORTAPAPELES",
            title: "Email copiado",
            text: "saulmartin.snz@gmail.com · ¡hablamos!",
            tone: "cyan",
          });
      }, 250),
    );

    // Sello "ACREDITADO" en las credenciales
    const metas = document.querySelectorAll(".credential-card .credential-meta");
    const io =
      "IntersectionObserver" in window &&
      new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            io.unobserve(e.target);
            e.target.querySelector(".cred-stamp")?.classList.add("stamped");
          }),
        { threshold: 0.6 },
      );
    metas.forEach((m) => {
      const st = document.createElement("span");
      st.className = "cred-stamp";
      st.textContent = "✓ ACREDITADO";
      m.append(st);
      if (io && fxOn()) io.observe(m.closest(".credential-card"));
      else st.classList.add("stamped");
    });

    // Línea de estado en el footer
    const footer = document.querySelector(".site-footer");
    const copy = footer?.querySelector("p");
    if (copy) {
      const status = document.createElement("p");
      status.className = "sys-status mono";
      status.innerHTML =
        '<span class="sys-dot" aria-hidden="true"></span> TODOS LOS SISTEMAS ONLINE <span class="sys-sep" aria-hidden="true">·</span> HECHO A MANO EN VALENCIA <button type="button" class="sys-keys">PULSA <kbd>?</kbd> PARA VER ATAJOS</button>';
      copy.after(status);
      status.querySelector(".sys-keys").addEventListener("click", () => SM.toggleKeys?.());
    }
  }

  /* =========================================================
     4. MODO RED TEAM
     ========================================================= */
  function setupRedTeam() {
    let on = false;
    SM.toggleRedTeam = (force) => {
      on = typeof force === "boolean" ? force : !on;
      root.classList.add("rt-switching");
      setTimeout(() => root.classList.remove("rt-switching"), 650);
      root.classList.toggle("redteam", on);
      const ft = document.querySelector("#focusTitle");
      if (ft) {
        if (on) {
          ft.dataset.blue = ft.innerHTML;
          ft.innerHTML = "Red<br />Team<span>.</span>";
        } else if (ft.dataset.blue) ft.innerHTML = ft.dataset.blue;
      }
      if (on) {
        toast({
          icon: "☠",
          kicker: "MODO SECRETO",
          title: "RED TEAM ACTIVADO",
          text: "Repite el código o escribe «redteam» en la terminal para volver",
          tone: "red",
        });
        setTimeout(() => unlock("redteam"), 1600);
      } else
        toast({
          icon: "🛡",
          kicker: "MODO NORMAL",
          title: "BLUE TEAM DE VUELTA",
          text: "Defensas restauradas",
          tone: "cyan",
        });
      return on;
    };
    const code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let pos = 0;
    addEventListener("keydown", (e) => {
      if (e.target.closest?.("input, textarea")) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = k === code[pos] ? pos + 1 : k === code[0] ? 1 : 0;
      if (pos === code.length) {
        pos = 0;
        SM.toggleRedTeam();
      }
    });
  }

  /* ---------- arranque ---------- */
  setupGraph();
  setupTimeline();
  setupRedTeam();
  setupShortcuts();
  setupDetails();
})();
