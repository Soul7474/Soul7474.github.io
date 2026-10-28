/* Shared scene clock. Animation follows elapsed time and the display refresh. */
(() => {
  "use strict";
  const root = document.documentElement;
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = matchMedia("(max-width: 760px)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const nativeScroll =
    typeof CSS !== "undefined" &&
    CSS.supports("animation-timeline: view()") &&
    CSS.supports("view-timeline-name: --portfolio-zone");
  root.classList.toggle("has-scroll-timelines", nativeScroll);
  const motionButton = document.querySelector(".motion-toggle");
  const motionLabel = motionButton.querySelector(".motion-label");
  const progressBar = document.querySelector(".reading-progress");
  const city = document.querySelector(".scene-pan");
  const cityOffset = document.querySelector(".scene-offset");
  let paused = false;
  try {
    paused = localStorage.getItem("portfolio-motion") === "paused";
  } catch {}
  let active = false,
    frame = 0,
    lastTime = 0,
    needsMeasure = true,
    scrollDirty = true;
  let pageRange = 1,
    viewWidth = innerWidth,
    viewHeight = innerHeight;
  let scrollCurrent = scrollY,
    scrollTarget = scrollY;
  let heroVisible = true,
    pointerX = 0,
    pointerY = 0;
  let lastProgress = -1,
    lastOpacity = -1,
    canvasWidth = 0,
    canvasHeight = 0;
  let obscured = false;

  function createRain(canvas) {
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    let width = 0,
      height = 0,
      time = 0,
      drops = [];
    const slopeMin = -0.24,
      slopeStep = 0.03,
      angleCount = 13;
    const colors = ["210,229,237", "153,230,242", "238,181,210"];
    // Cache the optics and wind angles once. No live blur or per-drop rotations.
    const sprites = [0, 1, 2].map((layer) =>
      colors.map((color) =>
        Array.from({ length: angleCount }, (_, angle) => {
          const image = document.createElement("canvas");
          image.width = 64;
          image.height = 104;
          const brush = image.getContext("2d");
          const gradient = brush.createLinearGradient(0, 6, 0, 98);
          gradient.addColorStop(0, `rgba(${color},0)`);
          gradient.addColorStop(0.25, `rgba(${color},.08)`);
          gradient.addColorStop(0.78, `rgba(${color},.65)`);
          gradient.addColorStop(0.96, `rgba(${color},.95)`);
          gradient.addColorStop(1, `rgba(${color},0)`);
          brush.strokeStyle = gradient;
          brush.lineWidth = [4.4, 3.8, 4.6][layer];
          brush.lineCap = "round";
          if (layer === 2) {
            brush.shadowColor = `rgba(${color},.3)`;
            brush.shadowBlur = 2;
          }
          brush.beginPath();
          brush.moveTo(32 - (slopeMin + angle * slopeStep) * 90, 6);
          brush.lineTo(32, 96);
          brush.stroke();
          return image;
        }),
      ),
    );
    function makeDrop(w, h) {
      const sample = Math.random(),
        layer = sample < 0.54 ? 0 : sample < 0.89 ? 1 : 2;
      const speed = [380, 760, 1320][layer] * (0.82 + Math.random() * 0.36);
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        layer,
        speed,
        length: speed * (0.023 + Math.random() * 0.009),
        alpha: [0.22, 0.34, 0.44][layer] * (0.65 + Math.random() * 0.35),
        drift: 0.85 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
      };
    }
    function resize(w, h) {
      const previousWidth = width || w,
        previousHeight = height || h;
      width = w;
      height = h;
      const ratio = Math.min(devicePixelRatio || 1, mobile.matches ? 1 : 1.25);
      canvas.width = Math.round(w * ratio);
      canvas.height = Math.round(h * ratio);
      if (!ctx) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.max(
        mobile.matches ? 80 : 140,
        Math.min(mobile.matches ? 128 : 245, Math.round((w * h) / 5200)),
      );
      const previous = drops;
      drops = Array.from({ length: count }, (_, i) =>
        previous[i]
          ? {
              ...previous[i],
              x: (previous[i].x / previousWidth) * w,
              y: (previous[i].y / previousHeight) * h,
            }
          : makeDrop(w, h),
      );
      draw(0);
    }
    function draw(dt) {
      if (!ctx) return;
      time += dt;
      ctx.clearRect(0, 0, width, height);
      // Broad gusts move the entire shower; nearby drops traverse the frame faster.
      const wind =
        -50 + Math.sin(time * 0.31) * 18 + Math.sin(time * 0.11) * 12;
      const bands = [
        Math.sin(time * 0.7) * 6,
        Math.sin(time * 0.7 + 1.4) * 6,
        Math.sin(time * 0.7 + 2.8) * 6,
      ];
      for (const drop of drops) {
        const vx =
          (wind +
            bands[Math.min(2, Math.max(0, Math.floor((drop.x / width) * 3)))]) *
          drop.drift;
        drop.x += vx * dt;
        drop.y += drop.speed * dt;
        if (drop.y > height + drop.length) {
          drop.y = -drop.length - Math.random() * 90;
          drop.x = Math.random() * (width + 50);
        }
        if (drop.x < -40) drop.x = width + 40;
        // Streak orientation follows the actual velocity, including changing wind.
        const angle = Math.max(
          0,
          Math.min(
            angleCount - 1,
            Math.round((vx / drop.speed - slopeMin) / slopeStep),
          ),
        );
        const x = drop.x / width;
        const color = x > 0.62 && x < 0.83 ? 2 : x > 0.13 && x < 0.4 ? 1 : 0;
        // Reflections change gently as a drop passes through the city's light.
        ctx.globalAlpha =
          drop.alpha * (0.89 + 0.11 * Math.sin(time * 0.8 + drop.phase));
        const scale = drop.length / 90;
        ctx.drawImage(
          sprites[drop.layer][color][angle],
          drop.x - 32 * scale,
          drop.y - 96 * scale,
          64 * scale,
          104 * scale,
        );
      }
      ctx.globalAlpha = 1;
    }
    return { resize, draw };
  }

  function createGlobe(canvas) {
    const ctx = canvas.getContext("2d", { alpha: true });
    const latitudes = 10,
      longitudes = 20,
      count = (latitudes + 1) * longitudes;
    const vertices = new Float32Array(count * 3),
      projected = new Float32Array(count * 3),
      edges = [];
    let size = 0,
      height = 0,
      angle = 0.4,
      lookX = 0,
      lookY = 0;
    for (let lat = 0; lat <= latitudes; lat++)
      for (let lon = 0; lon < longitudes; lon++) {
        const i = lat * longitudes + lon,
          p = (Math.PI * lat) / latitudes,
          t = (Math.PI * 2 * lon) / longitudes;
        vertices[i * 3] = Math.sin(p) * Math.cos(t);
        vertices[i * 3 + 1] = Math.cos(p);
        vertices[i * 3 + 2] = Math.sin(p) * Math.sin(t);
        edges.push(i, lat * longitudes + ((lon + 1) % longitudes));
        if (lat < latitudes) edges.push(i, i + longitudes);
      }
    const colors = [
      "rgba(163,113,255,.09)",
      "rgba(69,215,255,.19)",
      "rgba(118,231,250,.37)",
    ];
    function draw(dt) {
      if (!ctx || !size) return;
      angle += dt * 0.09;
      const follow = 1 - Math.exp(-dt / 0.16);
      lookX += (pointerX - lookX) * follow;
      lookY += (pointerY - lookY) * follow;
      const yaw = angle + lookX * 0.18,
        pitch = -0.28 + lookY * 0.14,
        cy = Math.cos(yaw),
        sy = Math.sin(yaw),
        cx = Math.cos(pitch),
        sx = Math.sin(pitch);
      ctx.clearRect(0, 0, size, height);
      for (let i = 0; i < count; i++) {
        const j = i * 3,
          x = vertices[j] * cy - vertices[j + 2] * sy,
          z = vertices[j] * sy + vertices[j + 2] * cy,
          y = vertices[j + 1] * cx - z * sx,
          depth = vertices[j + 1] * sx + z * cx,
          p = 3.6 / (3.6 - depth);
        projected[j] = size / 2 + x * size * 0.345 * p;
        projected[j + 1] = height / 2 + y * size * 0.345 * p;
        projected[j + 2] = depth;
      }
      // Three strokes replace hundreds of individual stroke and shadow calls.
      for (let bucket = 0; bucket < 3; bucket++) {
        ctx.beginPath();
        for (let i = 0; i < edges.length; i += 2) {
          const a = edges[i] * 3,
            b = edges[i + 1] * 3,
            depth = (projected[a + 2] + projected[b + 2]) / 2;
          if ((depth < 0 ? 0 : depth < 0.5 ? 1 : 2) !== bucket) continue;
          ctx.moveTo(projected[a], projected[a + 1]);
          ctx.lineTo(projected[b], projected[b + 1]);
        }
        ctx.strokeStyle = colors[bucket];
        ctx.lineWidth = bucket === 2 ? 0.9 : 0.65;
        ctx.stroke();
      }
      for (let color = 0; color < 2; color++) {
        ctx.beginPath();
        for (let i = color ? 7 : 0; i < count; i += 14) {
          const j = i * 3;
          if (projected[j + 2] < 0.1) continue;
          ctx.moveTo(projected[j] + 1.5, projected[j + 1]);
          ctx.arc(
            projected[j],
            projected[j + 1],
            color ? 1 : 1.6,
            0,
            Math.PI * 2,
          );
        }
        ctx.fillStyle = color ? "#8af0ff" : "#ff83e3";
        ctx.fill();
      }
    }
    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      size = rect.width;
      height = rect.height;
      const ratio = Math.min(devicePixelRatio || 1, 1.25);
      canvas.width = Math.round(size * ratio);
      canvas.height = Math.round(height * ratio);
      if (ctx) ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw(0);
    }
    return { draw, resize };
  }

  const rain = createRain(document.querySelector("#cyberField"));
  const globe = createGlobe(document.querySelector("#signalGlobe"));
  const zones = [...document.querySelectorAll(".chapter-zone")].map(
    (element) => ({
      element,
      city: element.querySelector(".zone-city"),
      circuit: element.querySelector(".zone-circuit"),
      word: element.querySelector(".zone-word"),
      top: 0,
      height: 1,
    }),
  );
  const gates = [...document.querySelectorAll(".chapter-gate")].map(
    (element) => ({
      element,
      variant: element.dataset.gate,
      top: 0,
      height: 1,
      topPanel: element.querySelector(".gate-shutter-top"),
      bottomPanel: element.querySelector(".gate-shutter-bottom"),
      copy: element.querySelector(".gate-copy"),
      scene: element.querySelector(".gate-scene"),
      grid: element.querySelector(".gate-grid"),
      index: element.querySelector(".gate-index"),
      beam: element.querySelector(".gate-beam"),
    }),
  );
  const rail = [...document.querySelectorAll("[data-chapter-link]")];
  let currentChapter = "";
  const clamp = (n) => Math.max(0, Math.min(1, n));

  function measure() {
    const y = scrollY;
    viewWidth = innerWidth;
    viewHeight = innerHeight;
    const rectangles = [...zones, ...gates].map((item) =>
      item.element.getBoundingClientRect(),
    );
    [...zones, ...gates].forEach((item, index) => {
      item.top = rectangles[index].top + y;
      item.height = rectangles[index].height;
    });
    pageRange = Math.max(1, document.documentElement.scrollHeight - viewHeight);
    if (viewWidth !== canvasWidth || viewHeight !== canvasHeight) {
      rain.resize(viewWidth, viewHeight);
      globe.resize();
      canvasWidth = viewWidth;
      canvasHeight = viewHeight;
    }
    needsMeasure = false;
    scrollDirty = true;
  }
  function updateChapters(y, animated) {
    if (!nativeScroll || !animated) {
      for (const item of zones) {
        if (
          animated &&
          (item.top + item.height < y - 100 || item.top > y + viewHeight + 100)
        )
          continue;
        const p = animated
          ? clamp((y + viewHeight - item.top) / (viewHeight + item.height))
          : 0.5;
        item.city.style.transform = `translate3d(0,${(p - 0.5) * 70}px,0) scale(1.05)`;
        item.circuit.style.transform = `translate3d(${(p - 0.5) * -36}px,0,0)`;
        item.word.style.transform = `translate3d(0,${(p - 0.5) * -50}px,0) rotate(-5deg)`;
      }
      for (const item of gates) {
        if (
          animated &&
          (item.top + item.height < y - 100 || item.top > y + viewHeight + 100)
        )
          continue;
        const p = animated
            ? clamp((y + viewHeight - item.top) / (viewHeight + item.height))
            : 0.5,
          open = animated ? clamp((p - 0.12) / 0.33) : 1,
          shift = animated ? (p - 0.5) * 90 : 0;
        let topTransform = `translate3d(0,${open * -115}%,0)`;
        let bottomTransform = `translate3d(0,${open * 115}%,0)`;
        let copyTransform = `translate3d(${shift}px,-50%,0) skewX(${animated ? (p - 0.5) * -5 : 0}deg)`;
        if (item.variant === "about") {
          topTransform = `translate3d(${-115 * open}%,0,0)`;
          bottomTransform = `translate3d(${115 * open}%,0,0)`;
          copyTransform = `translate3d(0,calc(-50% + ${animated ? 42 - 60 * p : 0}px),0)`;
        } else if (item.variant === "certifications") {
          topTransform = bottomTransform = `scaleY(${1 - open})`;
          const scale = animated
            ? 0.76 + 0.24 * clamp(p / 0.45) + 0.04 * clamp((p - 0.7) / 0.3)
            : 1;
          copyTransform = `translate3d(0,-50%,0) scale(${scale})`;
        } else if (item.variant === "recognition") {
          topTransform = `translate3d(${-110 * open}%,${-110 * open}%,0)`;
          bottomTransform = `translate3d(${110 * open}%,${110 * open}%,0)`;
          copyTransform = `translate3d(0,-50%,0) rotate(${animated ? -4 + 8 * p : 0}deg) scale(${animated ? 0.98 + 0.04 * p : 1})`;
        } else if (item.variant === "skills") {
          topTransform = `perspective(700px) rotateX(${-92 * open}deg)`;
          bottomTransform = `perspective(700px) rotateX(${92 * open}deg)`;
          const angle = animated
            ? 38 * (1 - clamp(p / 0.45)) - 12 * clamp((p - 0.7) / 0.3)
            : 0;
          copyTransform = `perspective(850px) translate3d(0,-50%,0) rotateX(${angle}deg)`;
        } else if (item.variant === "contact") {
          topTransform = bottomTransform = `scaleX(${1 - open})`;
          copyTransform = `translate3d(0,-50%,0) scale(${animated ? 0.9 + 0.14 * p : 1})`;
        }
        item.topPanel.style.transform = topTransform;
        item.bottomPanel.style.transform = bottomTransform;
        item.copy.style.transform = copyTransform;
        item.scene.style.transform = `translate3d(${animated ? (p - 0.5) * -80 : 0}px,0,0) scale(1.05)`;
        item.grid.style.transform = `perspective(700px) rotateX(30deg) rotateZ(-9deg) translate3d(0,${shift}px,0)`;
        item.index.style.transform = `translate3d(${-shift}px,-50%,0)`;
        item.beam.style.transform = `translate3d(${(-0.25 + p * 1.7) * viewWidth}px,0,0) skewX(-22deg)`;
      }
    }
    let selected = "";
    for (const zone of zones)
      if (zone.top <= y + viewHeight * 0.38)
        selected = zone.element.dataset.zone;
    if (selected !== currentChapter) {
      rail.forEach((link) => {
        if (link.dataset.chapterLink === selected)
          link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      currentChapter = selected;
    }
  }
  function updateScroll(dt, force = false) {
    scrollTarget = scrollY;
    const jump = Math.abs(scrollTarget - scrollCurrent) > viewHeight;
    if (nativeScroll || !active || jump || force) scrollCurrent = scrollTarget;
    else
      scrollCurrent +=
        (scrollTarget - scrollCurrent) * (1 - Math.exp(-dt / 0.055));
    const progress = scrollTarget / pageRange;
    if (Math.abs(progress - lastProgress) > 0.0001) {
      progressBar.style.transform = `scaleX(${progress})`;
      lastProgress = progress;
    }
    const opacity = Math.max(0.38, 1 - scrollTarget / (viewHeight * 1.3));
    if (Math.abs(opacity - lastOpacity) > 0.003) {
      city.style.opacity = String(opacity);
      lastOpacity = opacity;
    }
    updateChapters(scrollCurrent, active);
    scrollDirty = Math.abs(scrollTarget - scrollCurrent) > 0.2;
  }
  function tick(now) {
    frame = 0;
    if (document.hidden) return;
    const dt = Math.max(0, Math.min((now - lastTime) / 1000, 0.05));
    lastTime = now;
    if (needsMeasure) measure();
    if (scrollDirty) updateScroll(dt);
    if (active && !obscured) {
      rain.draw(dt);
      if (heroVisible) globe.draw(dt);
    }
    if ((active && !obscured) || scrollDirty || needsMeasure)
      frame = requestAnimationFrame(tick);
  }
  function requestFrame() {
    if (!frame && !document.hidden) {
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }
  function syncMotion() {
    active = !paused && !preference.matches;
    root.classList.toggle("motion-paused", !active);
    motionButton.disabled = preference.matches;
    motionButton.hidden = false;
    motionButton.setAttribute("aria-pressed", String(active));
    motionButton.setAttribute(
      "aria-label",
      preference.matches
        ? "Movimiento reducido según tu sistema"
        : active
          ? "Pausar animaciones decorativas"
          : "Activar animaciones decorativas",
    );
    motionLabel.textContent = preference.matches
      ? "MOVIMIENTO REDUCIDO"
      : active
        ? "EFECTOS ON"
        : "EFECTOS OFF";
    window.dispatchEvent(
      new CustomEvent("portfolio:motionchange", { detail: { active } }),
    );
    if (!active) {
      cityOffset.style.transform = "none";
      document
        .querySelectorAll(".credential-card,.focus-panel")
        .forEach((card) => card.style.removeProperty("transform"));
    }
    needsMeasure = true;
    scrollDirty = true;
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    requestFrame();
  }
  motionButton.addEventListener("click", () => {
    paused = !paused;
    try {
      localStorage.setItem("portfolio-motion", paused ? "paused" : "active");
    } catch {}
    syncMotion();
  });
  preference.addEventListener("change", syncMotion);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    } else requestFrame();
  });
  addEventListener(
    "scroll",
    () => {
      scrollDirty = true;
      requestFrame();
    },
    { passive: true },
  );
  addEventListener(
    "resize",
    () => {
      needsMeasure = true;
      requestFrame();
    },
    { passive: true },
  );
  if ("ResizeObserver" in window)
    new ResizeObserver(() => {
      needsMeasure = true;
      requestFrame();
    }).observe(document.querySelector("main"));
  document.fonts?.ready.then(() => {
    needsMeasure = true;
    requestFrame();
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
      },
      { threshold: 0.07, rootMargin: "0px 0px -20px 0px" },
    );
    document
      .querySelectorAll(
        ".section-heading,.experience-card,.project-card,.about-grid>div,.credential-card,.recognition-row,.skill-block,.contact-grid>div",
      )
      .forEach((element) => {
        if (element.getBoundingClientRect().top >= innerHeight) {
          element.classList.add("reveal-pending");
          revealObserver.observe(element);
        }
      });
    new IntersectionObserver((entries) => {
      heroVisible = entries[0].isIntersecting;
    }).observe(document.querySelector("#signalGlobe"));
  }
  const hero = document.querySelector(".hero");
  let scenePointerFrame = 0;
  hero.addEventListener(
    "pointermove",
    (event) => {
      if (!active || !finePointer.matches) return;
      pointerX = event.clientX / viewWidth - 0.5;
      pointerY = event.clientY / viewHeight - 0.5;
      if (!scenePointerFrame)
        scenePointerFrame = requestAnimationFrame(() => {
          cityOffset.style.transform = `translate3d(${-pointerX * 8}px,${-pointerY * 5}px,0)`;
          scenePointerFrame = 0;
        });
    },
    { passive: true },
  );
  hero.addEventListener("pointerleave", () => {
    pointerX = pointerY = 0;
    if (scenePointerFrame) cancelAnimationFrame(scenePointerFrame);
    scenePointerFrame = 0;
    cityOffset.style.transform = "none";
  });
  document
    .querySelectorAll(".project-card,.credential-card,.focus-panel")
    .forEach((card) => {
      let pointerFrame = 0;
      card.addEventListener("pointermove", (event) => {
        if (!active || !finePointer.matches || pointerFrame) return;
        pointerFrame = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect(),
            x = event.clientX - rect.left,
            y = event.clientY - rect.top;
          card.style.setProperty("--pointer-x", `${x}px`);
          card.style.setProperty("--pointer-y", `${y}px`);
          if (!card.classList.contains("project-card"))
            card.style.transform = `perspective(1000px) rotateX(${-(y / rect.height - 0.5) * 3}deg) rotateY(${(x / rect.width - 0.5) * 4}deg)`;
          pointerFrame = 0;
        });
      });
      card.addEventListener("pointerleave", () => {
        if (pointerFrame) cancelAnimationFrame(pointerFrame);
        pointerFrame = 0;
        card.style.removeProperty("transform");
      });
    });
  const dialog = document.querySelector("#detailDialog");
  new MutationObserver(() => {
    obscured = dialog.open;
    root.classList.toggle("scene-obscured", obscured);
    requestFrame();
  }).observe(dialog, { attributes: true, attributeFilter: ["open"] });
  syncMotion();
})();
