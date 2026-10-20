import React, { useRef, useEffect, useState } from "react";
import { Card } from "../Card";
import { Button } from "../Button";
import { CountUp } from "../CountUp";
import { Layers, RefreshCw, ChevronRight } from "lucide-react";

export function OopMasteryWidget({ data = [], loading, error, onRetry }) {
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
      <Card title="OOP Mastery" icon={Layers} style={{ height: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", flex: 1, justifyContent: "center" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: "30px", background: "var(--surface-2)", borderRadius: "var(--radius)" }} />
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="OOP Mastery" icon={Layers} style={{ height: "100%" }}>
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

  const isEmpty = !data || data.length === 0;

  if (isEmpty) {
    return (
      <Card title="OOP Mastery" icon={Layers} style={{ height: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: "12px", padding: "24px", textAlign: "center" }}>
          <Layers size={28} color="var(--muted)" strokeWidth={1.5} />
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            No topics attempted yet. Complete exercises across the 4 OOP pillars.
          </p>
          <Button
            variant="primary"
            size="sm"
            href="/practice"
          >
            Start Practice
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="OOP Mastery"
      subtitle="Progress across core Java object oriented concepts"
      icon={Layers}
      style={{ height: "100%" }}
    >
      <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1, justifyContent: "space-between" }}>
        {data.map((topic) => {
          const percentage = topic.total > 0 ? Math.round((topic.solved / topic.total) * 100) : 0;
          const barWidth = animated ? `${percentage}%` : "0%";

          return (
            <div key={topic.id} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", fontSize: "12px" }}>
                <span style={{ fontWeight: 500, color: "var(--text)" }}>{topic.title}</span>
                <span className="mono" style={{ fontSize: "11px", color: "var(--muted)" }}>
                  <span style={{ color: "var(--text)", fontWeight: 500 }}>{topic.solved}</span>/{topic.total} ({percentage}%)
                </span>
              </div>

              {/* Progress bar track */}
              <div
                style={{
                  height: "6px",
                  width: "100%",
                  backgroundColor: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: barWidth,
                    backgroundColor: "var(--accent)",
                    borderRadius: "2px",
                    transition: "width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  }}
                  role="progressbar"
                  aria-valuenow={percentage}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label={`${topic.title} mastery progress: ${percentage}%`}
                />
              </div>

              <span style={{ fontSize: "10px", color: "var(--muted)" }}>{topic.conceptKey}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default OopMasteryWidget;
