import React, { useRef, useEffect, useState } from "react";
import { Card } from "../Card";
import { Button } from "../Button";
import { CountUp } from "../CountUp";
import { Flame, RefreshCw } from "lucide-react";

/* ============================================================
   StreakWidget
   Heatmap of submission activity + streak counters.
   Canvas: --canvas-overlay cells. Accent: amber fill.
   No glow, no shadow. SVG cells with rx=2.
   ============================================================ */

export function StreakWidget({ data, loading, error, onRetry }) {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <Card title="Daily Practice Streak" tag="submission activity" style={{ height: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", flex: 1 }}>
          <div className="ck-inset" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: "36px", background: "var(--canvas-hover)", borderRadius: "var(--radius-sm)" }} />
            ))}
          </div>
          <div style={{ flex: 1, minHeight: "110px", background: "var(--canvas-overlay)", borderRadius: "var(--radius-sm)" }} />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Daily Practice Streak" tag="submission activity" style={{ height: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: "12px", padding: "20px" }}>
          <p style={{ fontSize: "12px", color: "var(--verdict-error)", textAlign: "center" }}>{error}</p>
          {onRetry && (
            <Button variant="secondary" size="sm" iconLeft={RefreshCw} onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      </Card>
    );
  }

  const isEmpty = !data || (data.current === 0 && data.totalActiveDays === 0);

  if (isEmpty) {
    return (
      <Card title="Daily Practice Streak" tag="submission activity" style={{ height: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: "12px", padding: "24px", textAlign: "center" }}>
          <Flame size={24} color="var(--ink-muted)" strokeWidth={1.5} />
          <p style={{ fontSize: "12px", color: "var(--ink-secondary)" }}>
            No activity recorded yet. Solve your first problem to ignite your streak.
          </p>
          <Button variant="primary" size="sm" href="/practice">
            Start Practice
          </Button>
        </div>
      </Card>
    );
  }

  const { current, longest, totalActiveDays, heatmap = [] } = data;

  const cellWidth = 11;
  const cellGap = 3;
  const totalWeeks = Math.ceil(heatmap.length / 7);
  const svgWidth = totalWeeks * (cellWidth + cellGap);
  const svgHeight = 7 * (cellWidth + cellGap);

  // Electric Coral activity levels — distinct low-activity from empty
  const levelColors = {
    0: "var(--canvas-overlay)",
    1: "rgba(255, 121, 94, 0.25)",
    2: "rgba(255, 121, 94, 0.50)",
    3: "rgba(255, 121, 94, 0.75)",
    4: "var(--accent)",
  };

  return (
    <Card
      title="Daily Practice Streak"
      tag="submission activity"
      accent
      style={{ height: "100%" }}
    >
      <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
        {/* Stat counters — inset panel, not floating */}
        <div
          className="ck-inset"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0" }}
        >
          {[
            { label: "Current Streak", value: current, unit: "days", accent: true },
            { label: "Longest", value: longest, unit: "days", accent: false },
            { label: "Active Days", value: totalActiveDays, unit: "total", accent: false },
          ].map((stat, i) => (
            <div
              key={stat.label}
              style={{
                padding: "10px 14px",
                borderRight: i < 2 ? "1px solid var(--line-subtle)" : "none",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontFamily: "var(--font-mono)",
                  fontSize: "9.5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "var(--ink-muted)",
                  marginBottom: "4px",
                }}
              >
                {stat.label}
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: 500,
                    fontFamily: "var(--font-mono)",
                    color: stat.accent ? "var(--accent)" : "var(--ink-primary)",
                    lineHeight: 1,
                  }}
                >
                  <CountUp end={stat.value} />
                </span>
                <span style={{ fontSize: "10px", color: "var(--ink-muted)" }}>{stat.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* SVG heatmap */}
        <div style={{ overflowX: "auto", overflowY: "hidden", paddingBottom: "2px" }}>
          <svg
            width="100%"
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ display: "block", minWidth: `${svgWidth}px` }}
            aria-label={`Activity heatmap: ${current} day current streak, ${totalActiveDays} active days`}
            role="img"
          >
            {heatmap.map((day, idx) => {
              const weekIdx = Math.floor(idx / 7);
              const dayOfWeek = idx % 7;
              const x = weekIdx * (cellWidth + cellGap);
              const y = dayOfWeek * (cellWidth + cellGap);
              const fill = levelColors[day.level] ?? levelColors[0];
              return (
                <rect
                  key={day.date || idx}
                  x={x}
                  y={y}
                  width={cellWidth}
                  height={cellWidth}
                  rx="2"
                  ry="2"
                  fill={fill}
                  stroke="var(--line-subtle)"
                  strokeWidth="0.5"
                  style={{
                    opacity: isVisible ? 1 : 0.15,
                    transition: "opacity 0.3s ease",
                  }}
                >
                  <title>{`${day.date}: ${day.count} submission${day.count !== 1 ? "s" : ""}`}</title>
                </rect>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "5px",
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--ink-muted)",
          }}
        >
          <span>less</span>
          {[0, 1, 2, 3, 4].map((lvl) => (
            <span
              key={lvl}
              style={{
                width: "9px",
                height: "9px",
                borderRadius: "2px",
                backgroundColor: levelColors[lvl],
                border: "0.5px solid var(--line-subtle)",
                display: "inline-block",
              }}
              aria-hidden="true"
            />
          ))}
          <span>more</span>
        </div>
      </div>
    </Card>
  );
}

export default StreakWidget;
