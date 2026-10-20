import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import Button from "./Button";

const STORAGE_KEY = "code_karo_theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") {
        return saved;
      }
    } catch {
      // Fallback if storage access is restricted
    }
    return window.matchMedia?.("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const isLight = theme === "light";
  const label = `Switch to ${isLight ? "dark" : "light"} theme`;

  return (
    <Button
      variant="secondary"
      size="sm"
      iconOnly
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      iconLeft={isLight ? Moon : Sun}
    />
  );
}

export default ThemeToggle;
