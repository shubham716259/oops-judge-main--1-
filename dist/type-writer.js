(() => {
  const text = document.querySelector("[data-typewriter]");
  if (!text) return;

  const message = "Code Karo";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotion.matches) {
    text.textContent = message;
    return;
  }

  text.textContent = "";
  let index = 0;
  const typeNextCharacter = () => {
    if (reduceMotion.matches) {
      text.textContent = message;
      return;
    }
    index += 1;
    text.textContent = message.slice(0, index);
    if (index < message.length) window.setTimeout(typeNextCharacter, 130);
  };

  window.setTimeout(typeNextCharacter, 350);
})();
