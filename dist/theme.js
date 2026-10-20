(() => {
  const root = document.documentElement;
  const preferenceKey = "code-karo-theme";
  const revealAttribute = "data-theme-reveal";
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let revealRunning = false;

  function readTheme() {
    try {
      const storedTheme = window.localStorage.getItem(preferenceKey);
      if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
    } catch (error) {
      console.warn("Code-Karo.dev could not read the saved theme preference.", error);
    }
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function syncControls(theme) {
    document.querySelectorAll("[data-theme-switch]").forEach(button => {
      const nextTheme = theme === "dark" ? "light" : "dark";
      button.setAttribute("aria-label", `Switch to ${nextTheme} theme`);
      button.setAttribute("aria-pressed", String(theme === "dark"));
      button.title = `Switch to ${nextTheme} theme`;
      const label = button.querySelector("[data-theme-label]");
      if (label) label.textContent = theme === "dark" ? "Dark" : "Light";
    });
  }

  function applyTheme(theme, persist = true) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    if (themeMeta) themeMeta.content = theme === "dark" ? "#101014" : "#f0f0f2";
    syncControls(theme);
    if (persist) {
      try {
        window.localStorage.setItem(preferenceKey, theme);
      } catch (error) {
        console.warn("Code-Karo.dev could not save the theme preference.", error);
      }
    }
    document.dispatchEvent(new CustomEvent("code-karo-theme-change", { detail: { theme } }));
  }

  function revealTheme(button, theme) {
    const doc = document;
    if (
      typeof doc.startViewTransition !== "function"
      || reducedMotion.matches
      || revealRunning
      || doc.activeViewTransition
    ) {
      applyTheme(theme);
      return;
    }

    const bounds = button.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    root.setAttribute(revealAttribute, "");
    revealRunning = true;

    let transition;
    try {
      transition = doc.startViewTransition(() => applyTheme(theme));
    } catch (error) {
      root.removeAttribute(revealAttribute);
      revealRunning = false;
      applyTheme(theme);
      console.warn("Theme reveal was unavailable; changed theme without the reveal.", error);
      return;
    }

    transition.ready.then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: "cubic-bezier(.4, 0, .2, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    }, () => {});

    const cleanup = () => {
      root.removeAttribute(revealAttribute);
      revealRunning = false;
    };
    transition.finished.then(cleanup, cleanup);
  }

  applyTheme(readTheme(), false);
  document.addEventListener("DOMContentLoaded", () => syncControls(root.dataset.theme));
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-theme-switch]");
    if (!button) return;
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    revealTheme(button, nextTheme);
  });
})();
