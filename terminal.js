/* ==========================================================
   SM. // TERMINAL — consola interactiva del portfolio
   Ábrela con el botón ">_ TERMINAL" o pulsando º / ` / ~
   ========================================================== */
(() => {
  "use strict";

  const LINKEDIN =
    "https://www.linkedin.com/in/sa%C3%BAl-mart%C3%ADn-s%C3%A1nchez-b07816343/";
  const EMAIL = "saulmartin.snz@gmail.com";
  const PROMPT_HTML =
    '<span class="t-acid">visitor</span><span class="t-muted">@</span><span class="t-cyan">saulmartin.com</span><span class="t-muted">:~$</span>';
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  const esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const link = (href, text, external = true) =>
    `<a href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${text}</a>`;

  /* ---------- DOM ---------- */
  const launch = document.createElement("button");
  launch.type = "button";
  launch.className = "term-launch";
  launch.setAttribute("aria-haspopup", "dialog");
  launch.innerHTML =
    '<span class="term-launch-caret" aria-hidden="true">&gt;_</span> TERMINAL <kbd aria-hidden="true">º</kbd>';

  const dialog = document.createElement("dialog");
  dialog.className = "term-dialog";
  dialog.setAttribute("aria-label", "Terminal interactiva del portfolio");
  dialog.innerHTML = `
    <div class="term-bar">
      <span class="term-lights" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="term-title">visitor@saulmartin.com — sm-shell — 80×24</span>
      <button class="term-close" type="button" aria-label="Cerrar terminal">ESC ×</button>
    </div>
    <div class="term-body">
      <div class="term-out" role="log" aria-live="polite"></div>
    </div>
    <div class="term-hints" aria-label="Comandos rápidos"></div>
    <form class="term-input-row" autocomplete="off">
      <label class="term-prompt" for="termInput">${PROMPT_HTML}</label>
      <input class="term-input" id="termInput" type="text" spellcheck="false"
        autocapitalize="off" autocorrect="off" enterkeyhint="send"
        aria-label="Escribe un comando. Prueba help" />
    </form>`;

  document.body.append(launch, dialog);
  const out = dialog.querySelector(".term-out");
  const body = dialog.querySelector(".term-body");
  const form = dialog.querySelector("form");
  const input = dialog.querySelector(".term-input");
  const hints = dialog.querySelector(".term-hints");

  ["help", "whoami", "experiencia", "proyectos", "contacto", "nmap", "hack"].forEach(
    (c) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = c;
      b.addEventListener("click", () => run(c));
      hints.append(b);
    },
  );

  /* ---------- salida ---------- */
  const print = (html = "") => {
    const line = document.createElement("div");
    line.className = "term-line";
    line.innerHTML = html;
    out.append(line);
    body.scrollTop = body.scrollHeight;
    return line;
  };
  const sleep = (ms) =>
    new Promise((r) => setTimeout(r, reduced.matches ? 0 : ms));
  const printSlow = async (lines, delay = 45) => {
    for (const l of lines) {
      print(l);
      await sleep(delay);
    }
  };

  /* ---------- sistema de ficheros de mentira ---------- */
  const files = {
    "whoami.txt": "whoami",
    "experiencia.log": "experiencia",
    "proyectos/": "proyectos",
    "certs.pem": "certs",
    "logros.txt": "logros",
    "skills.json": "skills",
    "contacto.vcf": "contacto",
  };

  const sections = {
    inicio: "#home",
    experiencia: "#experience",
    proyectos: "#projects",
    sobremi: "#about",
    "sobre-mi": "#about",
    formacion: "#certifications",
    certs: "#certifications",
    logros: "#recognition",
    skills: "#skills",
    conocimientos: "#skills",
    contacto: "#contact",
  };

  /* ---------- comandos ---------- */
  const commands = {
    help: {
      desc: "muestra esta ayuda",
      run: () => {
        print('<span class="t-acid">COMANDOS DISPONIBLES</span>');
        Object.entries(commands)
          .filter(([, c]) => !c.hidden)
          .forEach(([name, c]) =>
            print(
              `  <span class="t-cyan">${name.padEnd(13)}</span><span class="t-muted">${c.desc}</span>`,
            ),
          );
        print(
          '<span class="t-muted">Tip: ↑/↓ historial · Tab autocompleta · Esc cierra.</span>',
        );
        print(
          '<span class="t-muted">Psst… hay un comando secreto. Pista: el otro equipo. 👀</span>',
        );
      },
    },
    whoami: {
      desc: "quién soy",
      run: () => {
        print('<span class="t-strong">Saúl Martín Sánchez</span>');
        print("Administrador de sistemas · Estudiante de ASIR · Valencia, ES");
        print(
          'Foco: <span class="t-acid">seguridad defensiva</span> y análisis de eventos. Mentalidad <span class="t-cyan">Blue Team</span>.',
        );
      },
    },
    experiencia: {
      desc: "experiencia profesional",
      run: () => {
        print('<span class="t-acid">[2026-06 → 2026-07]</span> <span class="t-strong">SolveIT</span> · Administrador de sistemas de TI (MSP)');
        print('  <span class="t-muted">↳ Microsoft 365, Intune, PowerShell, Fortinet, Acronis, Defender, Entra ID</span>');
        print('<span class="t-acid">[2025-03 → 2025-06]</span> <span class="t-strong">Sesame</span> · Especialista de asistencia de TI (FP Dual)');
        print('  <span class="t-muted">↳ Helpdesk, Windows/macOS, gestión de accesos, redes y VPN</span>');
        print('<span class="t-muted">→ </span>goto experiencia <span class="t-muted">para ver el detalle</span>');
      },
    },
    proyectos: {
      desc: "proyectos y laboratorios",
      run: () => {
        print('<span class="t-note">drwxr-x---  </span><span class="t-cyan">cypher-hackathon-incibe/</span>   <span class="t-ok">★</span><span class="t-ok t-note"> propuesta ganadora 2025</span>');
        print('<span class="t-note">drwxr-x---  </span><span class="t-cyan">red-cisco-packet-tracer/</span>   <span class="t-muted t-note">redes · segmentación</span>');
        print('<span class="t-note">drwxr-x---  </span><span class="t-cyan">ftp-hydra-lab/</span>             <span class="t-muted t-note">fuerza bruta en entorno controlado</span>');
        print('<span class="t-note">drwxr-x---  </span><span class="t-cyan">metasploit-lab/</span>            <span class="t-muted t-note">explotación en laboratorio</span>');
        print('<span class="t-muted">→ </span>goto proyectos <span class="t-muted">para verlos con capturas</span>');
      },
    },
    certs: {
      desc: "certificaciones",
      run: () => {
        print('<span class="t-ok">[✓]</span> Cisco · Computer Hardware Basics <span class="t-muted">(may 2026)</span>');
        print('<span class="t-ok">[✓]</span> Cisco · Introduction to Cybersecurity <span class="t-muted">(abr 2026)</span>');
        print('<span class="t-ok">[✓]</span> Splunk · Intro to Splunk <span class="t-muted">(mar 2026 · 89 %)</span>');
      },
    },
    logros: {
      desc: "reconocimientos",
      run: () => {
        print('<span class="t-acid">🏆 GANADOR</span>   Hackathon de Ciberseguridad · INCIBE <span class="t-muted">(nov 2025)</span>');
        print('<span class="t-cyan">◆ FINALISTA</span> Hackea tu futuro · INCIBE <span class="t-muted">(dic 2024)</span>');
        print('<span class="t-pink">◆ 2.º PREMIO</span> Girls4STEM · Universitat de València <span class="t-muted">(jun 2024)</span>');
        print('<span class="t-cyan">◆ FINALISTA</span> Up! Steam 2 · UPV <span class="t-muted">(may 2021)</span>');
      },
    },
    skills: {
      desc: "caja de herramientas",
      run: () => {
        print("{");
        print('  <span class="t-cyan">"sistemas_redes"</span>: ["Windows Server", "Linux", "M365", "Google Workspace", "Packet Tracer"],');
        print('  <span class="t-cyan">"seguridad"</span>: ["Splunk/SPL", "Defender", "Entra ID", "Fortinet", "Nmap", "Wireshark"],');
        print('  <span class="t-cyan">"automatizacion"</span>: ["PowerShell", "Intune", "1Password", "Odoo"]');
        print("}");
      },
    },
    contacto: {
      desc: "cómo hablar conmigo",
      run: () => {
        print(`EMAIL     ${link("mailto:" + EMAIL, EMAIL, false)}`);
        print(`LINKEDIN  ${link(LINKEDIN, "linkedin.com/in/saul-martin-sanchez")}`);
        print(`TELÉFONO  ${link("tel:+34680607627", "+34 680 607 627", false)}`);
      },
    },
    ls: {
      desc: "lista los ficheros",
      run: () =>
        print(
          Object.keys(files)
            .map((f) =>
              f.endsWith("/")
                ? `<span class="t-cyan">${f}</span>`
                : f,
            )
            .join("   "),
        ),
    },
    cat: {
      desc: "lee un fichero (cat whoami.txt)",
      run: (args) => {
        const f = args[0];
        if (!f) return print('<span class="t-pink">cat: falta el nombre del fichero</span>');
        const target = files[f] || files[f + "/"];
        if (!target) return print(`<span class="t-pink">cat: ${esc(f)}: No existe el fichero o el directorio</span>`);
        commands[target].run([]);
      },
    },
    goto: {
      desc: "salta a una sección (goto proyectos)",
      run: (args) => {
        const key = (args[0] || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
        const sel = sections[key];
        if (!sel) {
          print(`<span class="t-muted">Secciones: ${Object.keys(sections).filter((k) => !["sobre-mi", "certs", "conocimientos"].includes(k)).join(" · ")}</span>`);
          return;
        }
        print(`<span class="t-ok">→ conectando con ${esc(sel)}…</span>`);
        setTimeout(() => {
          close();
          document.querySelector(sel)?.scrollIntoView({ behavior: reduced.matches ? "auto" : "smooth" });
        }, reduced.matches ? 0 : 350);
      },
    },
    nmap: {
      desc: "escanea saulmartin.com",
      run: async () => {
        await printSlow([
          '<span class="t-muted">Starting Nmap 7.95 ( https://nmap.org )</span>',
          "Nmap scan report for saulmartin.com",
          '<span class="t-muted">Host is up (0.0042s latency).</span>',
          "",
          '<span class="t-strong">PORT      STATE     SERVICE</span>',
          '22/tcp    <span class="t-pink">filtered</span>  ssh          <span class="t-muted t-note"># buen intento 😉</span>',
          '80/tcp    <span class="t-ok">open</span>      http         <span class="t-muted t-note">→ 301 a HTTPS</span>',
          '443/tcp   <span class="t-ok">open</span>      https        <span class="t-muted t-note">portfolio v2 · cyberpunk edition</span>',
          '1337/tcp  <span class="t-ok">open</span>      motivacion   <span class="t-muted t-note">siempre aprendiendo</span>',
          '31337/tcp <span class="t-pink">closed</span>    elite        <span class="t-muted t-note">aquí defendemos 🛡️</span>',
          "",
          '<span class="t-muted">Nmap done: 1 IP address (1 host up) scanned in 1.37 seconds</span>',
        ], 90);
      },
    },
    hack: {
      desc: "intenta hackear este portfolio",
      run: async () => {
        const line = print("");
        const steps = 24;
        for (let i = 0; i <= steps; i++) {
          const pct = Math.round((i / steps) * 100);
          line.innerHTML = `<span class="t-cyan">[${"█".repeat(i)}${"░".repeat(steps - i)}]</span> ${pct}% <span class="t-muted">inyectando payload…</span>`;
          await sleep(55);
        }
        await sleep(250);
        await printSlow([
          '<span class="t-pink">✖ ALERTA: actividad sospechosa detectada por el SIEM.</span>',
          '<span class="t-acid">  [Splunk] index=portfolio sourcetype=visitor | stats count by curiosity</span>',
          '<span class="t-ok">  ✔ Amenaza contenida. Blue Team activo. 🛡️</span>',
          '<span class="t-muted">Si de verdad has encontrado algo, mira /.well-known/security.txt</span>',
        ], 220);
      },
    },
    sudo: {
      desc: "",
      hidden: true,
      run: () =>
        print(
          '<span class="t-pink">visitor no está en el fichero sudoers. Este incidente será reportado. 👀</span>',
        ),
    },
    "rm": {
      desc: "",
      hidden: true,
      run: () => print('<span class="t-pink">rm: operación no permitida. Los backups están en Acronis. 😎</span>'),
    },
    cv: {
      desc: "descarga mi CV en PDF",
      run: () => {
        print('<span class="t-ok">→ compilando CV desde el portfolio…</span>');
        setTimeout(() => {
          close();
          window.SM?.printCV ? window.SM.printCV() : window.print();
        }, reduced.matches ? 0 : 500);
      },
    },
    redteam: {
      desc: "",
      hidden: true,
      run: () => {
        const on = window.SM?.toggleRedTeam?.();
        print(on ? '<span class="t-pink">☠ Modo Red Team activado. Cambiando de bando…</span>' : '<span class="t-cyan">🛡 Vuelta al Blue Team.</span>');
      },
    },
    linkedin: {
      desc: "abre mi LinkedIn",
      run: () => {
        print('<span class="t-ok">→ abriendo LinkedIn…</span>');
        window.open(LINKEDIN, "_blank", "noopener");
      },
    },
    email: {
      desc: "escríbeme un correo",
      run: () => {
        print(`<span class="t-ok">→ abriendo cliente de correo…</span> ${link("mailto:" + EMAIL, EMAIL, false)}`);
        location.href = "mailto:" + EMAIL;
      },
    },
    history: {
      desc: "historial de comandos",
      run: () => history.forEach((h, i) => print(`<span class="t-muted">${String(i + 1).padStart(4)}</span>  ${esc(h)}`)),
    },
    date: {
      desc: "fecha y hora",
      run: () => print(new Date().toLocaleString("es-ES", { dateStyle: "full", timeStyle: "medium" })),
    },
    echo: {
      desc: "",
      hidden: true,
      run: (args) => print(esc(args.join(" "))),
    },
    clear: {
      desc: "limpia la pantalla",
      run: () => (out.innerHTML = ""),
    },
    exit: {
      desc: "cierra la terminal",
      run: () => close(),
    },
  };
  // alias
  const aliases = { exp: "experiencia", experience: "experiencia", projects: "proyectos", contact: "contacto", certificaciones: "certs", "?": "help", ayuda: "help", cls: "clear", quit: "exit", dir: "ls" };

  /* ---------- ejecución ---------- */
  const history = [];
  let hIndex = 0;
  let busy = false;

  async function run(raw) {
    const line = raw.trim();
    print(`${PROMPT_HTML} ${esc(line)}`);
    if (!line) return;
    history.push(line);
    hIndex = history.length;
    const [first, ...args] = line.split(/\s+/);
    let name = first.toLowerCase();
    name = aliases[name] || name;
    const cmd = commands[name];
    if (!cmd) {
      print(`<span class="t-pink">sm-shell: comando no encontrado: ${esc(first)}</span> <span class="t-muted">— escribe <span class="t-cyan">help</span></span>`);
      return;
    }
    busy = true;
    input.disabled = true;
    try {
      await cmd.run(args);
    } finally {
      busy = false;
      input.disabled = false;
      if (dialog.open) input.focus();
      body.scrollTop = body.scrollHeight;
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (busy) return;
    const v = input.value;
    input.value = "";
    run(v);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      if (!history.length) return;
      e.preventDefault();
      hIndex = Math.max(0, hIndex - 1);
      input.value = history[hIndex] || "";
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      hIndex = Math.min(history.length, hIndex + 1);
      input.value = history[hIndex] || "";
    } else if (e.key === "Tab") {
      e.preventDefault();
      const v = input.value.trim().toLowerCase();
      if (!v) return;
      const parts = v.split(/\s+/);
      if (parts.length === 1) {
        const m = Object.keys(commands).filter((c) => !commands[c].hidden && c.startsWith(v));
        if (m.length === 1) input.value = m[0] + " ";
        else if (m.length > 1) print(`<span class="t-muted">${m.join("   ")}</span>`);
      } else {
        const pool = parts[0] === "goto" ? Object.keys(sections) : parts[0] === "cat" ? Object.keys(files) : [];
        const m = pool.filter((c) => c.startsWith(parts[1]));
        if (m.length === 1) input.value = `${parts[0]} ${m[0]}`;
        else if (m.length > 1) print(`<span class="t-muted">${m.join("   ")}</span>`);
      }
    }
  });

  /* ---------- abrir / cerrar ---------- */
  let booted = false;
  async function boot() {
    booted = true;
    busy = true;
    input.disabled = true;
    await printSlow([
      '<span class="t-muted">SM-BIOS v2.6 · iniciando sm-shell…</span>',
      '<span class="t-muted">[ <span class="t-ok">OK</span> ] Montando /home/saul</span>',
      '<span class="t-muted">[ <span class="t-ok">OK</span> ] Cargando módulos: sysadmin, blue-team, curiosidad</span>',
      '<span class="t-muted">[ <span class="t-ok">OK</span> ] Conexión cifrada (TLS 1.3)</span>',
      "",
      `<span class="t-acid">Bienvenido/a a la terminal de Saúl.</span> Escribe <span class="t-cyan">help</span> para ver los comandos.`,
      "",
    ], 110);
    busy = false;
    input.disabled = false;
    input.focus();
  }

  function open() {
    if (dialog.open) return;
    dialog.showModal();
    document.documentElement.classList.add("term-open");
    if (!booted) boot();
    else input.focus();
  }
  function close() {
    if (dialog.open) dialog.close();
  }
  dialog.addEventListener("close", () => {
    document.documentElement.classList.remove("term-open");
    launch.focus({ preventScroll: true });
  });
  dialog.querySelector(".term-close").addEventListener("click", close);
  // clic fuera de la ventana cierra
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) close();
  });
  body.addEventListener("click", () => {
    if (!getSelection().toString()) input.focus();
  });
  launch.addEventListener("click", open);

  document.addEventListener("keydown", (e) => {
    if (dialog.open || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t.closest && t.closest("input, textarea, select, [contenteditable='true']")) return;
    if (document.querySelector("dialog[open]")) return;
    if (["º", "`", "~", "Backquote"].includes(e.key) || e.code === "Backquote") {
      e.preventDefault();
      open();
    }
  });

  /* ---------- saludo para curiosos en DevTools ---------- */
  console.log(
    "%c sm. %c  ¿Mirando el código? Me gusta. 👀",
    "background:#f1ff28;color:#050810;font:900 14px monospace;padding:4px 6px",
    "color:#34edff;font:12px monospace",
  );
  console.log(
    "%cAbre la terminal con la tecla º (o `) y escribe 'help'.\n¿Has encontrado un fallo de seguridad? → https://saulmartin.com/.well-known/security.txt",
    "color:#a7b8c9;font:12px monospace",
  );
})();
