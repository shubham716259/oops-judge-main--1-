import React from "react";
import { Card } from "../Card";
import { Button } from "../Button";
import { Award, ArrowRight, RefreshCw, Compass } from "lucide-react";

export function RecommendedWidget({ data = [], loading, error, onRetry }) {
  if (loading) {
    return (
      <Card title="Recommended Challenges" icon={Award}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: "90px", background: "var(--surface-2)", borderRadius: "var(--radius)" }} />
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Recommended Challenges" icon={Award}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", padding: "20px" }}>
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
      <Card title="Recommended Challenges" icon={Award}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", padding: "24px", textAlign: "center" }}>
          <Compass size={28} color="var(--muted)" strokeWidth={1.5} />
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            All current recommended tracks completed. Explore the full library.
          </p>
          <Button
            variant="primary"
            size="sm"
            href="/practice"
          >
            Launch Practice IDE
          </Button>
        </div>
      </Card>
    );
  }

  const getDifficultyColor = (diff) => {
    switch (diff.toLowerCase()) {
      case "easy":
        return "var(--easy)";
      case "hard":
        return "var(--hard)";
      case "medium":
      default:
        return "var(--medium)";
    }
  };

  return (
    <Card
      title="Recommended Challenges"
      subtitle="Selected exercises to strengthen current OOP concept mastery"
      icon={Award}
      action={
        <a
          href="/practice"
          style={{
            fontSize: "12px",
            color: "var(--muted)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
          className="see-all-link"
        >
          <span>All Challenges</span>
          <ArrowRight size={13} />
        </a>
      }
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
        }}
      >
        {data.map((rec) => {
          const diffColor = getDifficultyColor(rec.difficulty);

          return (
            <div
              key={rec.id}
              className="recommended-card"
              style={{
                backgroundColor: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "14px",
                transition: "border-color 0.12s ease, background-color 0.12s ease",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 600,
                      color: diffColor,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {rec.difficulty}
                  </span>
                  <span style={{ fontSize: "10.5px", color: "var(--border)" }}>•</span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--muted)",
                    }}
                  >
                    {rec.topic}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 500,
                    color: "var(--text)",
                    lineHeight: 1.35,
                  }}
                >
                  {rec.title}
                </h3>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "8px",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <span className="mono" style={{ fontSize: "11px", color: "var(--muted)" }}>
                  ~{rec.estimatedMin} min
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  href={`/practice?id=${rec.problemId}`}
                  iconRight={ArrowRight}
                >
                  Start
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default RecommendedWidget;
