import React, { useState, useEffect, useRef } from "react";
import { ThemeToggle } from "../components/ThemeToggle";
import { StreakWidget } from "../components/widgets/StreakWidget";
import { PerformanceWidget } from "../components/widgets/PerformanceWidget";
import { OopMasteryWidget } from "../components/widgets/OopMasteryWidget";
import { RecentSubmissionsWidget } from "../components/widgets/RecentSubmissionsWidget";
import { RecommendedWidget } from "../components/widgets/RecommendedWidget";
import { getDashboardData } from "../data/dashboardData";
import {
  LayoutDashboard,
  Terminal,
  CheckSquare,
  User,
  Settings,
  Search,
  ChevronRight,
  Code2,
} from "lucide-react";
import "../styles/tokens.css";
import "../styles/dashboard.css";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "practice", label: "Practice", icon: Terminal, href: "/practice" },
  { id: "submissions", label: "Submissions", icon: CheckSquare, href: "/practice" },
  { id: "profile", label: "Profile", icon: User, href: "/profile" },
  { id: "settings", label: "Settings", icon: Settings, href: "/profile" },
];

export function Dashboard() {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

  // Dev state switcher supporting URL param ?state=loading|empty|error|populated
  const [previewState, setPreviewState] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const s = params.get("state");
      if (s && ["loading", "empty", "error", "populated"].includes(s)) {
        return s;
      }
    }
    return "populated";
  });

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (stateToFetch) => {
    setLoading(true);
    setError(null);
    try {
      if (stateToFetch === "loading") {
        // Keep loading state active
        return;
      }
      const data = await getDashboardData(stateToFetch);
      setDashboardData(data);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      if (stateToFetch !== "loading") {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData(previewState);
  }, [previewState]);

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleStateChange = (newState) => {
    setPreviewState(newState);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("state", newState);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const activeNav = NAV_ITEMS.find((item) => item.id === activeItem);

  return (
    <div className="dashboard-layout">
      {/* 64px Icon-Only Rail (Expands to 200px on hover, bottom tab bar on mobile) */}
      <aside className="dashboard-rail" aria-label="Primary Navigation">
        <div className="rail-header">
          <div className="rail-brand-icon" aria-hidden="true">
            <Code2 size={20} strokeWidth={2.2} />
          </div>
          <span className="rail-brand-text">Code Karo</span>
        </div>

        <nav className="rail-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return (
              <div key={item.id} className="rail-item-wrapper">
                <a
                  href={item.href}
                  className={`rail-item ${isActive ? "active" : ""}`}
                  onClick={(e) => {
                    if (item.id === "dashboard") {
                      e.preventDefault();
                      setActiveItem("dashboard");
                    }
                  }}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="rail-item-icon" aria-hidden="true">
                    <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                  </span>
                  <span className="rail-item-label">{item.label}</span>
                </a>
                <span className="rail-tooltip" aria-hidden="true">
                  {item.label}
                </span>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Wrapper */}
      <div className="dashboard-wrapper">
        {/* Slim Top Bar */}
        <header className="dashboard-topbar">
          {/* Breadcrumb on Left */}
          <nav className="topbar-left" aria-label="Breadcrumb">
            <a href="/" style={{ color: "inherit", textDecoration: "none" }}>
              Code Karo
            </a>
            <ChevronRight size={14} strokeWidth={2} aria-hidden="true" />
            <span className="topbar-breadcrumb-current">
              {activeNav ? activeNav.label : "Dashboard"}
            </span>
          </nav>

          {/* Search (Ctrl+K) in Middle */}
          <div className="topbar-center">
            <div className="topbar-search">
              <Search size={15} strokeWidth={2} aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="text"
                className="topbar-search-input"
                placeholder="Search topics, solutions, challenges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search topics, solutions, challenges"
              />
              <kbd className="topbar-search-kbd">Ctrl+K</kbd>
            </div>
          </div>

          {/* Theme Toggle and Avatar on Right */}
          <div className="topbar-right">
            <ThemeToggle />
            <div
              className="topbar-avatar"
              title="Student Profile: CK"
              aria-label="Student Profile: CK"
            >
              CK
            </div>
          </div>
        </header>

        {/* Main Area: max-width 1280px, centred, 24px gaps, 12-column grid */}
        <main className="dashboard-main">
          {/* Accessible single H1 */}
          <h1 style={{ display: "none" }}>Dashboard</h1>

          <div className="dashboard-grid">
            {/* Row 1: Daily Practice Streak (7 cols) + Performance Metrics (5 cols) */}
            <div className="col-streak animate-entrance stagger-1">
              <StreakWidget
                data={dashboardData?.streak}
                loading={loading}
                error={error}
                onRetry={() => fetchData(previewState)}
              />
            </div>

            <div className="col-performance animate-entrance stagger-2">
              <PerformanceWidget
                data={dashboardData?.performance}
                loading={loading}
                error={error}
                onRetry={() => fetchData(previewState)}
              />
            </div>

            {/* Row 2: OOP Mastery (4 cols) + Recent Submissions (8 cols) */}
            <div className="col-mastery animate-entrance stagger-3">
              <OopMasteryWidget
                data={dashboardData?.oopMastery}
                loading={loading}
                error={error}
                onRetry={() => fetchData(previewState)}
              />
            </div>

            <div className="col-submissions animate-entrance stagger-4">
              <RecentSubmissionsWidget
                data={dashboardData?.recentSubmissions}
                loading={loading}
                error={error}
                onRetry={() => fetchData(previewState)}
              />
            </div>

            {/* Row 3: Recommended Challenges (12 cols) */}
            <div className="col-recommended animate-entrance stagger-5">
              <RecommendedWidget
                data={dashboardData?.recommended}
                loading={loading}
                error={error}
                onRetry={() => fetchData(previewState)}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Dev-only State Preview Switcher */}
      <aside className="dev-state-switcher" aria-label="Dev State Switcher">
        <span style={{ color: "var(--muted)", marginRight: "4px" }}>State:</span>
        {["populated", "loading", "empty", "error"].map((s) => (
          <button
            key={s}
            type="button"
            className={`dev-state-btn ${previewState === s ? "active" : ""}`}
            onClick={() => handleStateChange(s)}
            title={`Preview ${s} state`}
          >
            {s}
          </button>
        ))}
      </aside>
    </div>
  );
}

export default Dashboard;
