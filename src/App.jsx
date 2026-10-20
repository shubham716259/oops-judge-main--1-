import React, { useState, useEffect } from "react";
import { Dashboard } from "./pages/Dashboard";
import "./styles/tokens.css";
import "./styles/dashboard.css";
import "./styles/button.css";

export function App() {
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname || "/dashboard";
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return <Dashboard currentPath={currentPath} />;
}

export default App;
