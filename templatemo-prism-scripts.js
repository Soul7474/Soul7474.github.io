"use strict";

const uiAnimations = new Set();
function effectsEnabled() {
  return (
    !document.documentElement.classList.contains("motion-paused") &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
function animateUI(element, keyframes, options = {}) {
  if (!effectsEnabled() || !element.animate) return null;
  const animation = element.animate(keyframes, {
    duration: 320,
    easing: "cubic-bezier(.22,1,.36,1)",
    ...options,
  });
  uiAnimations.add(animation);
  animation.finished.then(
    () => uiAnimations.delete(animation),
    () => uiAnimations.delete(animation),
  );
  return animation;
}

document.documentElement.classList.add("js");

// Keep navigation usable without JavaScript; enable the compact menu when available.
const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector("#navMenu");
menuToggle.hidden = false;

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  navMenu.classList.remove("is-open");
}

menuToggle.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(expanded));
  navMenu.classList.toggle("is-open", expanded);
});
navMenu
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuToggle.getAttribute("aria-expanded") === "true"
  ) {
    closeMenu();
    menuToggle.focus();
  }
});
const mobileViewport = window.matchMedia("(max-width: 760px)");
mobileViewport.addEventListener("change", closeMenu);

// All projects are present in HTML, so they remain readable and indexable without JS.
document.querySelector(".filter-bar").hidden = false;
const filterButtons = document.querySelectorAll("[data-filter]");
const projectCards = document.querySelectorAll(".project-card");
const filterStatus = document.querySelector("#filter-status");
let filterTransition = null;
filterButtons.forEach((button) =>
  button.addEventListener("click", () => {
    const apply = () => {
      const filter = button.dataset.filter;
      let count = 0;
      projectCards.forEach((card) => {
        card.hidden = filter !== "all" && card.dataset.category !== filter;
        if (!card.hidden) {
          count++;
          card.classList.add("is-visible");
        }
      });
      filterButtons.forEach((item) => {
        const selected = item === button;
        item.classList.toggle("active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      filterStatus.textContent = `${count} ${count === 1 ? "proyecto mostrado" : "proyectos mostrados"}`;
    };
    if (filterTransition) filterTransition.skipTransition();
    if (document.startViewTransition && effectsEnabled()) {
      filterTransition = document.startViewTransition(apply);
      filterTransition.finished.then(
        () => {
          filterTransition = null;
        },
        () => {
          filterTransition = null;
        },
      );
    } else apply();
  }),
);

const projectDetails = {
  cisco: {
    title: "Diseño de red con Cisco",
    intro:
      "Práctica de formación con una topología creada en Cisco Packet Tracer.",
    work: "Diseño de una red con router, switches, equipos y servidor para practicar la conectividad y la administración de una infraestructura.",
    learning:
      "Entender la relación entre la topología, la segmentación y las comunicaciones entre dispositivos.",
  },
  hydra: {
    title: "Seguridad de un servidor FTP",
    intro:
      "Prueba controlada de credenciales en un servidor FTP de laboratorio.",
    work: "Uso de Hydra en Kali Linux para explorar la resistencia de un servicio frente a intentos de acceso por fuerza bruta.",
    learning:
      "Comprender por qué la robustez de las contraseñas y la protección de los accesos son parte de la defensa de un sistema.",
  },
  hackathon: {
    title: "Cypher · Ganador del Hackathon INCIBE 2025",
    intro:
      "Propuesta ganadora del Hackathon de Ciberseguridad de INCIBE, celebrado en Enseñanzas Profesionales Sorolla en noviembre de 2025.",
    work: "Dentro del equipo Cypher asumí el rol de CEO durante el reto. Colaboramos en la resolución de desafíos y en el desarrollo del prototipo que se convirtió en la propuesta ganadora.",
    learning:
      "Practicar el razonamiento técnico, la colaboración y la comunicación al abordar un reto común.",
  },
  metasploit: {
    title: "Explorando Metasploit",
    intro:
      "Práctica introductoria con Metasploit en un entorno de laboratorio.",
    work: "Configuración inicial de la herramienta y exploración de sus módulos de explotación.",
    learning:
      "Relacionar las vulnerabilidades con sus posibles consecuencias y construir una base para entender su prevención.",
  },
};

const dialog = document.querySelector("#detailDialog");
const dialogTitle = document.querySelector("#dialogTitle");
const dialogLabel = document.querySelector("#dialogLabel");
const dialogImage = document.querySelector("#dialogImage");
const dialogDescription = document.querySelector("#dialogDescription");
const dialogOriginal = document.querySelector("#dialogOriginal");

function addParagraph(text, heading) {
  if (heading) {
    const title = document.createElement("h3");
    title.textContent = heading;
    dialogDescription.append(title);
  }
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  dialogDescription.append(paragraph);
}

const gallery = [...document.querySelectorAll(".project-link[data-project]")];
const dialogNavigation = document.querySelector(".dialog-navigation");
const zoomToggle = document.querySelector(".image-zoom-toggle");
const dialogMedia = document.querySelector(".dialog-media");
let currentProject = null;
let closingDialog = false;
let imageGeneration = 0;

function resetZoom() {
  dialogMedia.classList.remove("image-zoomed");
  zoomToggle.setAttribute("aria-pressed", "false");
  zoomToggle.firstChild.textContent = "Ampliar imagen ";
}
function renderDetail(link) {
  const detail = projectDetails[link.dataset.project];
  currentProject = detail ? link.dataset.project : null;
  dialog.classList.toggle("is-project", Boolean(detail));
  dialogNavigation.hidden = !detail;
  dialogDescription.replaceChildren();
  dialogLabel.textContent = detail
    ? "PROYECTO / EXPERIENCIA"
    : "RECONOCIMIENTO / DIPLOMA";
  dialogTitle.textContent = detail ? detail.title : link.dataset.certificate;
  dialogImage.src = link.href;
  dialogImage.alt = detail
    ? `Imagen de la práctica: ${detail.title}`
    : link.dataset.certificate;
  dialogOriginal.href = link.href;
  if (detail) {
    addParagraph(detail.intro);
    addParagraph(detail.work, "La práctica");
    addParagraph(detail.learning, "Lo que me llevo");
    const index = gallery.findIndex(
      (item) => item.dataset.project === currentProject,
    );
    document.querySelector(".dialog-counter").textContent =
      `${String(index + 1).padStart(2, "0")} / ${String(gallery.length).padStart(2, "0")}`;
  }
  resetZoom();
  zoomToggle.hidden = false;
  dialog.querySelector(".dialog-scroll").scrollTop = 0;
  const generation = ++imageGeneration;
  dialogImage
    .decode()
    .then(() => {
      if (generation !== imageGeneration || !dialog.open) return;
      animateUI(dialogImage, [
        { opacity: 0.2, transform: "scale(1.025)" },
        { opacity: 1, transform: "scale(1)" },
      ]);
    })
    .catch(() => {});
}
function openDetail(event) {
  if (
    event.button !== 0 ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.altKey ||
    typeof dialog.showModal !== "function"
  )
    return;
  const link = event.currentTarget;
  if (!projectDetails[link.dataset.project] && !link.dataset.certificate)
    return;
  event.preventDefault();
  renderDetail(link);
  dialog.showModal();
  document.body.classList.add("dialog-open");
}
function changeProject(direction) {
  if (!currentProject || closingDialog) return;
  const index = gallery.findIndex(
    (link) => link.dataset.project === currentProject,
  );
  renderDetail(gallery[(index + direction + gallery.length) % gallery.length]);
  animateUI(dialog.querySelector(".dialog-copy"), [
    { opacity: 0, transform: `translateX(${direction * 15}px)` },
    { opacity: 1, transform: "none" },
  ]);
}
function closeDetail() {
  if (!dialog.open || closingDialog) return;
  closingDialog = true;
  const animation = animateUI(
    dialog,
    [
      { opacity: 1, transform: "translateY(0)" },
      { opacity: 0, transform: "translateY(15px)" },
    ],
    { duration: 180 },
  );
  if (animation)
    animation.finished.then(
      () => {
        dialog.close();
        closingDialog = false;
      },
      () => {
        dialog.close();
        closingDialog = false;
      },
    );
  else {
    dialog.close();
    closingDialog = false;
  }
}
document
  .querySelectorAll("[data-project], [data-certificate]")
  .forEach((link) => link.addEventListener("click", openDetail));
document.querySelector(".dialog-close").addEventListener("click", closeDetail);
document
  .querySelector(".dialog-prev")
  .addEventListener("click", () => changeProject(-1));
document
  .querySelector(".dialog-next")
  .addEventListener("click", () => changeProject(1));
zoomToggle.addEventListener("click", () => {
  const zoomed = dialogMedia.classList.toggle("image-zoomed");
  zoomToggle.setAttribute("aria-pressed", String(zoomed));
  zoomToggle.firstChild.textContent = zoomed
    ? "Ajustar imagen "
    : "Ampliar imagen ";
});
dialogImage.addEventListener("click", () => {
  if (dialogMedia.classList.contains("image-zoomed")) resetZoom();
});
dialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeDetail();
});
dialog.addEventListener("keydown", (event) => {
  if (!currentProject || !["ArrowLeft", "ArrowRight"].includes(event.key))
    return;
  event.preventDefault();
  changeProject(event.key === "ArrowLeft" ? -1 : 1);
});
dialog.addEventListener("click", (event) => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  )
    closeDetail();
});
dialog.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
  currentProject = null;
  resetZoom();
});

// Highlight the section in view without changing the URL or interrupting scrolling.
if ("IntersectionObserver" in window) {
  const links = [...navMenu.querySelectorAll("a")];
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (!visible.length) return;
      const hash = `#${visible[0].target.id}`;
      links.forEach((link) => {
        if (link.hash === hash) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-15% 0px -55% 0px", threshold: 0 },
  );
  document
    .querySelectorAll("main section[id]")
    .forEach((section) => sectionObserver.observe(section));
}

document.querySelector("#year").textContent = String(new Date().getFullYear());

// Scene rendering is managed independently in portfolio-effects.js.
window.addEventListener("portfolio:motionchange", (event) => {
  if (event.detail.active) return;
  uiAnimations.forEach((animation) => animation.finish());
  if (filterTransition) filterTransition.skipTransition();
});

// The profile map exposes real experience behind each visual node.
const focusAreas = {
  systems: {
    index: "01 / SISTEMAS",
    title: ["Sys", "Admin"],
    caption: "SERVIDORES · BACKUPS · MANTENIMIENTO",
    description:
      "Windows Server, Linux, Acronis y NAS QNAP / Buffalo. Administración, revisión de capacidad y copias de seguridad en SolveIT.",
  },
  network: {
    index: "02 / REDES",
    title: ["Redes"],
    caption: "CONECTIVIDAD · VPN · SEGURIDAD",
    description:
      "Fortinet / FortiClient y Cloudflare WARP en entornos corporativos. Topologías y conectividad en mis prácticas con Cisco Packet Tracer.",
  },
  cloud: {
    index: "03 / CLOUD",
    title: ["Cloud", "& IT"],
    caption: "USUARIOS · ACCESOS · DISPOSITIVOS",
    description:
      "Microsoft 365, Google Workspace e Intune. Altas, bajas, permisos y gestión de equipos durante mi experiencia en IT.",
  },
  security: {
    index: "04 / SEGURIDAD",
    title: ["Blue", "Team"],
    caption: "OBSERVAR · ENTENDER · PROTEGER",
    description:
      "Splunk, Microsoft Defender y Entra ID. Mi formación y experiencia se orientan a la seguridad defensiva.",
  },
};
const focusButtons = [...document.querySelectorAll("[data-focus]")];
function selectFocus(button) {
  const area = focusAreas[button.dataset.focus];
  focusButtons.forEach((item) =>
    item.setAttribute("aria-pressed", String(item === button)),
  );
  const title = document.querySelector("#focusTitle");
  title.replaceChildren();
  area.title.forEach((line, index) => {
    if (index) title.append(document.createElement("br"));
    title.append(document.createTextNode(line));
  });
  const dot = document.createElement("span");
  dot.textContent = ".";
  title.append(dot);
  document.querySelector(".core-index").textContent = area.index;
  document.querySelector("#focusCaption").textContent = area.caption;
  document.querySelector("#focusDescription").textContent = area.description;
  animateUI(title, [
    { opacity: 0, transform: "translateY(10px)" },
    { opacity: 1, transform: "none" },
  ]);
  animateUI(document.querySelector("#focusDescription"), [
    { opacity: 0, transform: "translateY(6px)" },
    { opacity: 1, transform: "none" },
  ]);
}
focusButtons.forEach((button, index) => {
  button.addEventListener("click", () => selectFocus(button));
  button.addEventListener("keydown", (event) => {
    if (
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    )
      return;
    event.preventDefault();
    const direction = ["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1;
    const next =
      focusButtons[
        (index + direction + focusButtons.length) % focusButtons.length
      ];
    next.focus();
    selectFocus(next);
  });
});

// Native disclosures remain functional without JavaScript. With motion enabled,
// animate the measured height and handle repeated clicks without queued effects.
const disclosures = new WeakMap();
document.querySelectorAll("details").forEach((details) => {
  const summary = details.querySelector("summary");
  summary.addEventListener("click", (event) => {
    if (!effectsEnabled() || !details.animate) return;
    event.preventDefault();
    const previous = disclosures.get(details);
    const targetOpen = !(previous ? previous.targetOpen : details.open);
    const start = details.getBoundingClientRect().height;
    if (previous) previous.animation.cancel();
    details.style.height = "";
    details.style.overflow = "hidden";
    details.open = targetOpen;
    const end = details.getBoundingClientRect().height;
    details.open = true;
    details.style.height = `${start}px`;
    const animation = animateUI(
      details,
      [{ height: `${start}px` }, { height: `${end}px` }],
      { duration: 300 },
    );
    const state = { animation, targetOpen };
    disclosures.set(details, state);
    animation.finished.then(
      () => {
        if (disclosures.get(details) !== state) return;
        details.open = targetOpen;
        details.style.height = "";
        details.style.overflow = "";
        disclosures.delete(details);
      },
      () => {},
    );
  });
});

const copyButton = document.querySelector(".copy-email");
copyButton.hidden = false;
copyButton.addEventListener("click", async () => {
  const status = document.querySelector(".copy-status");
  try {
    await navigator.clipboard.writeText("saulmartin.snz@gmail.com");
    copyButton.firstChild.textContent = "Email copiado ";
    status.textContent = "Correo copiado al portapapeles.";
  } catch {
    status.textContent =
      "No se pudo copiar automáticamente. El correo es saulmartin.snz@gmail.com.";
    copyButton.firstChild.textContent = "Copiar no disponible ";
  }
});
