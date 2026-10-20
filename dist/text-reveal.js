(() => {
  const heading = document.querySelector("[data-scroll-reveal]");
  if (!heading) return;

  const originalText = heading.textContent.replace(/\s+/g, " ").trim();
  const words = originalText.split(" ");
  heading.replaceChildren();

  const segments = words.map((word, index) => {
    const span = document.createElement("span");
    span.className = "reveal-word";
    span.textContent = word;
    heading.append(span);
    if (index < words.length - 1) heading.append(document.createTextNode(" "));
    return span;
  });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let visible = false;
  let frame = 0;
  if (reducedMotion.matches) {
    segments.forEach(segment => { segment.style.opacity = "1"; });
  }

  function update() {
    frame = 0;
    if (!visible) return;
    if (reducedMotion.matches) {
      segments.forEach(segment => { segment.style.opacity = "1"; });
      return;
    }

    const bounds = heading.getBoundingClientRect();
    const start = window.innerHeight * .9;
    const end = window.innerHeight * .3;
    const progress = Math.max(0, Math.min(1, (start - bounds.top) / (bounds.height + start - end)));
    const revealed = progress * segments.length;
    segments.forEach((segment, index) => {
      const amount = Math.max(0, Math.min(1, revealed - index));
      segment.style.opacity = String(.2 + amount * .8);
    });
  }

  function scheduleUpdate() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    if (visible) scheduleUpdate();
  }, { rootMargin: "120px 0px" });
  observer.observe(heading);
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  reducedMotion.addEventListener("change", scheduleUpdate);
  scheduleUpdate();
})();
