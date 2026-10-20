(() => {
  const canvas = document.querySelector(".gradient-ascii-canvas");
  const hero = canvas?.parentElement;
  const context = canvas?.getContext("2d", { alpha: true });
  if (!canvas || !hero || !context) return;

  const colors = ["#1e3fd8", "#f6f8ff", "#a5d8ff", "#38bdf8"];
  const characters = " =+xX0S8#@";
  const cellSize = 18;
  const density = 0.8;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const colorCache = new Map();
  const clicks = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let lastFrame = 0;
  let elapsed = 0;
  let intro = 0;
  let visible = true;
  let previousTime = 0;
  let pointer = null;

  function parseColor(value) {
    const hex = value.slice(1);
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16)
    ];
  }

  const palette = colors.map(parseColor);

  function colorAt(position, opacity) {
    const scaled = Math.min(1, Math.max(0, position)) * (palette.length - 1);
    const segment = Math.min(Math.floor(scaled), palette.length - 2);
    const mix = scaled - segment;
    const rgb = palette[segment].map((channel, index) =>
      Math.round(channel + (palette[segment + 1][index] - channel) * mix)
    );
    const alpha = Math.round(Math.min(1, opacity) * 20) / 20;
    const key = `${rgb.join(",")}/${alpha}`;
    if (!colorCache.has(key)) colorCache.set(key, `rgba(${rgb.join(",")},${alpha})`);
    return colorCache.get(key);
  }

  function resize() {
    const bounds = hero.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw(performance.now());
  }

  function clickWave(x, y, now) {
    let strength = 0;
    for (let index = clicks.length - 1; index >= 0; index -= 1) {
      const click = clicks[index];
      const age = (now - click.time) / 1000;
      if (age > 1.2) {
        clicks.splice(index, 1);
        continue;
      }
      const radius = age * 240;
      const distance = Math.hypot(x - click.x, y - click.y);
      const ring = Math.exp(-((distance - radius) ** 2) / 1800) * (1 - age / 1.2);
      strength = Math.max(strength, ring);
    }
    return strength;
  }

  function draw(now) {
    if (!width || !height) return;
    const time = reducedMotion.matches ? 0 : elapsed;
    const columns = Math.ceil(width / cellSize);
    const rows = Math.ceil(height / cellSize);
    context.clearRect(0, 0, width, height);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = '14px "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

    for (let row = 0; row < rows; row += 1) {
      const y = row * cellSize + cellSize / 2;
      const v = y / height;
      for (let column = 0; column < columns; column += 1) {
        const x = column * cellSize + cellSize / 2;
        const u = x / width;
        const across = (u - 0.5) * (width / height);
        const arch = 0.38 + 0.2 * across * across + 0.018 * Math.sin(time * 0.6);
        const edge = v - arch;
        const distance = Math.abs(edge);
        const rim = Math.max(0, Math.min(1, (edge + 0.12) / 0.42)) * 0.38;
        const centerX = 0.5 + 0.08 * Math.sin(time * 0.31);
        const spread = Math.hypot((u - centerX) / 0.95, (v - 0.42) / 0.75);
        const sky = 0.55 + 0.45 * Math.max(0, Math.min(1, (spread - 0.2) / 0.75));
        const wave = Math.max(0, 1 - distance * 3.2);
        const flicker = 0.94 + 0.06 * Math.sin(column * 1.7 + row * 2.3 + time * 1.8);
        const ripple = clickWave(x, y, now);
        const pointerGlow = pointer
          ? Math.exp(-(Math.hypot(x - pointer.x, y - pointer.y) ** 2) / 18000) * 0.9
          : 0;
        const energy = Math.max(0, Math.min(1, (rim + sky * wave * 0.78 + ripple * 0.6 + pointerGlow) * flicker));
        const random = (Math.sin(column * 127.1 + row * 311.7) * 43758.5453) % 1;
        if (Math.abs(random) > density * energy) continue;

        const reveal = reducedMotion.matches
          ? 1
          : Math.max(0, Math.min(1, (intro * 1.45 - Math.max(0, edge * 1.3)) / 0.45));
        if (!reveal) continue;
        const characterIndex = Math.min(
          characters.length - 1,
          Math.floor(Math.max(0, Math.min(1, energy)) * (characters.length - 1))
        );
        const position = Math.min(1, Math.max(0, u * 0.72 + energy * 0.28));
        context.fillStyle = colorAt(position, reveal * (0.52 + energy * 0.48));
        context.fillText(characters[characterIndex], x, y);
      }
    }
  }

  function animate(now) {
    frame = 0;
    if (document.hidden || !visible) return;
    if (lastFrame && now - lastFrame < 33) {
      frame = requestAnimationFrame(animate);
      return;
    }
    if (!reducedMotion.matches) {
      const delta = previousTime ? Math.min((now - previousTime) / 1000, 0.05) : 0;
      elapsed += delta * 0.5;
      intro = Math.min(1, intro + delta / 2.4);
      previousTime = now;
    }
    draw(now);
    lastFrame = now;
    if (!reducedMotion.matches || clicks.length) frame = requestAnimationFrame(animate);
  }

  function wake() {
    if (!frame && !document.hidden && visible) frame = requestAnimationFrame(animate);
  }

  hero.addEventListener("pointermove", event => {
    if (reducedMotion.matches) return;
    const bounds = hero.getBoundingClientRect();
    const next = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    if (pointer && Math.hypot(next.x - pointer.x, next.y - pointer.y) > 10) {
      clicks.unshift({ ...next, time: performance.now() });
      if (clicks.length > 4) clicks.pop();
    }
    pointer = next;
    wake();
  }, { passive: true });

  hero.addEventListener("pointerdown", event => {
    if (reducedMotion.matches) return;
    const bounds = hero.getBoundingClientRect();
    clicks.unshift({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      time: performance.now()
    });
    if (clicks.length > 4) clicks.pop();
    wake();
  }, { passive: true });

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(hero);
  document.addEventListener("visibilitychange", wake);
  reducedMotion.addEventListener("change", () => {
    previousTime = 0;
    wake();
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if (visible) wake();
      else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    observer.observe(hero);
  }

  resize();
  wake();
})();
