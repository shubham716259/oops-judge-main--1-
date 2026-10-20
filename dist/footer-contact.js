(() => {
  const repositoryLink = document.querySelector(".repository-link--social");
  if (repositoryLink) {
    const setRepositoryExpanded = expanded => {
      repositoryLink.dataset.expanded = String(expanded);
    };
    repositoryLink.addEventListener("pointerenter", event => {
      if (event.pointerType !== "touch") setRepositoryExpanded(true);
    });
    repositoryLink.addEventListener("pointerleave", () => {
      if (!repositoryLink.contains(document.activeElement)) setRepositoryExpanded(false);
    });
    repositoryLink.addEventListener("focusin", () => setRepositoryExpanded(true));
    repositoryLink.addEventListener("focusout", event => {
      if (!repositoryLink.contains(event.relatedTarget)) setRepositoryExpanded(false);
    });
  }

  const authMenu = document.querySelector(".home-auth");
  if (authMenu) {
    const authButton = authMenu.querySelector(".home-auth__button");
    const setAuthMenuOpen = open => {
      authButton.setAttribute("aria-expanded", String(open));
      authMenu.dataset.open = String(open);
    };
    authMenu.addEventListener("pointerenter", () => setAuthMenuOpen(true));
    authMenu.addEventListener("pointerleave", () => {
      if (!authMenu.contains(document.activeElement)) setAuthMenuOpen(false);
    });
    authMenu.addEventListener("focusin", () => setAuthMenuOpen(true));
    authMenu.addEventListener("focusout", event => {
      if (!authMenu.contains(event.relatedTarget)) setAuthMenuOpen(false);
    });
  }

  const wrapper = document.querySelector("[data-footer-contact]");
  if (!wrapper) return;

  const button = wrapper.querySelector("button");
  let lockedOpen = false;

  function setOpen(open) {
    wrapper.dataset.open = String(open);
    button.setAttribute("aria-expanded", String(open));
  }

  wrapper.addEventListener("pointerenter", () => {
    if (!lockedOpen) setOpen(true);
  });

  wrapper.addEventListener("pointerleave", () => {
    if (!lockedOpen && !wrapper.contains(document.activeElement)) setOpen(false);
  });

  wrapper.addEventListener("focusin", () => setOpen(true));
  wrapper.addEventListener("focusout", event => {
    if (!wrapper.contains(event.relatedTarget) && !lockedOpen) setOpen(false);
  });

  button.addEventListener("click", () => {
    lockedOpen = !lockedOpen;
    setOpen(lockedOpen);
  });

  document.addEventListener("pointerdown", event => {
    if (!wrapper.contains(event.target)) {
      lockedOpen = false;
      setOpen(false);
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && wrapper.dataset.open === "true") {
      lockedOpen = false;
      setOpen(false);
      button.focus();
    }
  });

  const eyes = document.querySelector("[data-follow-eyes]");
  if (eyes && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const pupils = [...eyes.querySelectorAll(".footer-follow-eye__pupil")];
    window.addEventListener("pointermove", event => {
      if (event.pointerType === "touch") return;
      pupils.forEach(pupil => {
        const eye = pupil.parentElement;
        const bounds = eye.getBoundingClientRect();
        const maxDistance = Math.max(0, (bounds.width - pupil.offsetWidth) / 2 * .8);
        const dx = event.clientX - (bounds.left + bounds.width / 2);
        const dy = event.clientY - (bounds.top + bounds.height / 2);
        const distance = Math.hypot(dx, dy);
        const scale = distance > maxDistance ? maxDistance / distance : 1;
        pupil.style.transform = `translate3d(${dx * scale}px, ${dy * scale}px, 0)`;
      });
    }, { passive: true });

    window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      eyes.classList.add("is-blinking");
      window.setTimeout(() => eyes.classList.remove("is-blinking"), 180);
    }, 3400);
  }
})();
