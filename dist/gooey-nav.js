(() => {
  const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
  document.querySelectorAll("[data-nav-island] [data-nav-link]").forEach(link => {
    const targetPath = new URL(link.href, window.location.href).pathname.replace(/\/+$/, "") || "/";
    if (targetPath === currentPath || (targetPath !== "/" && currentPath.startsWith(`${targetPath}/`))) {
      link.setAttribute("aria-current", "page");
    }
  });
})();
