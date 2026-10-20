(() => {
  const compactAfter = 80;
  const splitSize = 8;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const bump = (focus, index) => Math.max(0, 1 - Math.abs(focus - index));

  function activeIndexFor(links) {
    const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
    let activeIndex = 0;
    let matchedLength = -1;

    links.forEach((link, index) => {
      const path = new URL(link.href, window.location.href).pathname.replace(/\/+$/, "") || "/";
      const matches = path === currentPath || (path !== "/" && currentPath.startsWith(`${path}/`));
      if (matches && path.length > matchedLength) {
        activeIndex = index;
        matchedLength = path.length;
      }
    });

    return activeIndex;
  }

  document.querySelectorAll("[data-split-nav]").forEach(nav => {
    const links = [...nav.querySelectorAll("[data-nav-link]")];
    const expandButton = nav.querySelector("[data-nav-expand]");
    const linksRow = nav.querySelector(".split-nav__links");
    if (!links.length || !linksRow || !expandButton) return;

    const activeIndex = activeIndexFor(links);
    let previewIndex = null;
    let userOpenAt = null;
    let frame = 0;

    function offsetsFor(focus) {
      const centers = [];
      let position = 0;
      links.forEach(link => {
        centers.push(position + link.offsetWidth / 2);
        position += link.offsetWidth;
      });
      const gaps = [];
      for (let index = 0; index < links.length - 1; index += 1) {
        gaps.push(splitSize * Math.max(bump(focus, index), bump(focus, index + 1)));
      }
      const total = gaps.reduce((sum, gap) => sum + gap, 0);
      let accumulated = 0;
      links.forEach((link, index) => {
        link.style.setProperty("--nav-offset", `${accumulated - total / 2}px`);
        accumulated += gaps[index] || 0;
      });
    }

    function render() {
      frame = 0;
      const folded = nav.hasAttribute("data-compact-nav")
        && window.scrollY > compactAfter
        && userOpenAt === null
        && !nav.contains(document.activeElement);
      const highlightIndex = previewIndex ?? activeIndex;
      nav.classList.toggle("is-folded", folded);
      expandButton.hidden = !folded;
      expandButton.tabIndex = folded ? 0 : -1;
      expandButton.setAttribute("aria-expanded", String(!folded));
      links.forEach((link, index) => {
        const active = index === activeIndex;
        const hidden = folded && !active;
        link.classList.toggle("is-active", active);
        link.classList.toggle("is-highlighted", index === highlightIndex);
        if (active) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
        link.setAttribute("aria-hidden", String(hidden));
        link.tabIndex = hidden ? -1 : 0;
        link.inert = hidden;
      });
      offsetsFor(highlightIndex);
    }

    function scheduleRender() {
      if (!frame) frame = requestAnimationFrame(render);
    }

    links.forEach((link, index) => {
      link.addEventListener("pointerenter", event => {
        if (event.pointerType === "mouse") {
          previewIndex = index;
          scheduleRender();
        }
      });
      link.addEventListener("pointerleave", event => {
        if (event.pointerType === "mouse" && previewIndex === index) {
          previewIndex = null;
          scheduleRender();
        }
      });
      link.addEventListener("focus", () => {
        previewIndex = index;
        scheduleRender();
      });
    });

    nav.addEventListener("focusout", event => {
      if (!nav.contains(event.relatedTarget)) {
        previewIndex = null;
        scheduleRender();
      }
    });

    nav.addEventListener("keydown", event => {
      const current = links.indexOf(document.activeElement);
      if (current < 0) return;
      const keyMoves = {
        ArrowLeft: current - 1,
        ArrowRight: current + 1,
        Home: 0,
        End: links.length - 1,
      };
      if (!(event.key in keyMoves)) return;
      event.preventDefault();
      links[clamp(keyMoves[event.key], 0, links.length - 1)].focus();
    });

    expandButton.addEventListener("click", () => {
      userOpenAt = window.scrollY;
      links[activeIndex].focus({ preventScroll: true });
      scheduleRender();
    });

    window.addEventListener("scroll", () => {
      if (userOpenAt !== null && Math.abs(window.scrollY - userOpenAt) > compactAfter) {
        userOpenAt = null;
      }
      scheduleRender();
    }, { passive: true });

    window.addEventListener("resize", scheduleRender);
    render();
  });
})();
