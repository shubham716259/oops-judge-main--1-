// Code-Karo.dev Configuration
// Automatically detects environment (local development vs production Render URL),
// supports localStorage override ('oops_runner_url'), and allows URL parameter (?runner_url=https://...).

(function () {
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // Production Render runner URL (matches live Render service)
  const PROD_RUNNER_URL = "https://oops-judge.onrender.com";
  const LOCAL_RUNNER_URL = window.location.port
    ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}`
    : `${window.location.protocol}//${window.location.hostname}:8000`;

  let customUrl = null;
  try {
    const param = new URLSearchParams(window.location.search).get("runner_url");
    if (param) {
      customUrl = param.replace(/\/+$/, "");
      localStorage.setItem("oops_runner_url", customUrl);
    } else {
      const stored = localStorage.getItem("oops_runner_url");
      if (stored) customUrl = stored.replace(/\/+$/, "");
    }
  } catch (e) {}

  window.CONFIG = {
    RUNNER_URL: customUrl || (isLocal ? LOCAL_RUNNER_URL : PROD_RUNNER_URL),
    PROD_RUNNER_URL: PROD_RUNNER_URL,
    LOCAL_RUNNER_URL: LOCAL_RUNNER_URL,
  };
})();
