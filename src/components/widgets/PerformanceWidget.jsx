import React, { useRef, useEffect, useState } from "react";
import { Card } from "../Card";
import { Button } from "../Button";
import { CountUp } from "../CountUp";
import { Activity, Gauge, CheckCircle2, RefreshCw } from "lucide-react";

export function PerformanceWidget({ data, loading, error, onRetry }) {
  const containerRef = useRef(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setAnimated(true);
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
      <Card title="Performance Metrics" icon={Activity} style={{ height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, minHeight: "180px" }}>
          <div style={{ width: "90px", height: "90px", borderRadius: "50%", border: "4px solid var(--surface-2)" }} />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Performance Metrics" icon={Activity} style={{ height: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: "12px", padding: "20px" }}>
          <p style={{ fontSize: "13px", color: "var(--verdict-error)", textAlign: "center" }}>{error}</p>
          {onRetry && (
            <Button
              variant="secondary"
              size="sm"
              iconLeft={RefreshCw}
              onClick={onRetry}
            >
              Retry
            </Button>
          )}
        </div>
      </Card>
    );
  }

  const isEmpty = !data || (data.attempted === 0 && data.totalTestsRun === 0);

  if (isEmpty) {
    return (
      <Card title="Performance Metrics" icon={Activity} style={{ height: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: "12px", padding: "24px", textAlign: "center" }}>
          <Activity size={28} color="var(--muted)" strokeWidth={1.5} />
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            No test runs recorded yet. Execute code in the judge to view telemetry.
          </p>
          <Button
            variant="primary"
            size="sm"
            href="/practice"
          >
            Launch IDE
          </Button>
        </div>
      </Card>
    );
  }

  const { accepted, attempted, acceptanceRate, medianRuntimeMs, totalTestsRun } = data;

  // Custom SVG ring chart geometry
  const radius = 38;
  const stroke = 7;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const targetOffset = circumference - (acceptanceRate / 100) * circumference;
  const strokeDashoffset = animated ? targetOffset : circumference;

  return (
    <Card
      title="Performance Metrics"
      subtitle="Evaluation accuracy and execution speed"
      icon={Activity}
      style={{ height: "100%" }}
    >
      <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1, justifyContent: "space-between" }}>
        {/* Ring Chart and primary stats row */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* Custom SVG Ring Chart */}
          <div style={{ position: "relative", width: "90px", height: "90px", flexShrink: 0 }}>
            <svg
              height="90"
              width="90"
              viewBox="0 0 90 90"
              style={{ transform: "rotate(-90deg)", display: "block" }}
              aria-label={`Acceptance rate ring chart: ${acceptanceRate}%`}
              role="img"
            >
              <circle
                stroke="var(--surface-2)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx="45"
                cy="45"
              />
              <circle
                stroke="var(--accent)"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={`${circumference} ${circumference}`}
                style={{
                  strokeDashoffset,
                  transition: "stroke-dashoffset 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  strokeLinecap: "round",
                }}
                r={normalizedRadius}
                cx="45"
                cy="45"
              />
            </svg>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "15px", fontWeight: 500, color: "var(--text)" }}>
                <CountUp end={acceptanceRate} decimals={1} suffix="%" />
              </span>
              <span style={{ fontSize: "9px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pass</span>
            </div>
          </div>

          {/* Breakdown numbers */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "var(--muted)" }}>Accepted Solves</span>
              <span style={{ fontWeight: 500, color: "var(--verdict-accepted)" }}>
                <CountUp end={accepted} /> <span style={{ color: "var(--muted)" }}>/ {attempted}</span>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "var(--muted)" }}>Median Runtime</span>
              <span style={{ fontWeight: 500, color: "var(--text)" }}>
                <CountUp end={medianRuntimeMs} suffix=" ms" />
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "var(--muted)" }}>Tests Executed</span>
              <span style={{ fontWeight: 500, color: "var(--text)" }}>
                <CountUp end={totalTestsRun} />
              </span>
            </div>
          </div>
        </div>

        {/* Telemetry Footer pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            backgroundColor: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            fontSize: "11px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--muted)" }}>
            <Gauge size={13} />
            <span>Judge Efficiency</span>
          </div>
          <span style={{ color: "var(--easy)", fontWeight: 500 }}>Optimal (99.2%)</span>
        </div>
      </div>
    </Card>
  );
}

export default PerformanceWidget;
