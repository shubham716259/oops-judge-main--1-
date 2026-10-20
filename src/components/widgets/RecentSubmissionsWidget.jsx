import React from "react";
import { Card } from "../Card";
import { Button } from "../Button";
import { CheckSquare, RefreshCw, ExternalLink, Terminal } from "lucide-react";

export function RecentSubmissionsWidget({ data = [], loading, error, onRetry }) {
  if (loading) {
    return (
      <Card title="Recent Submissions" icon={CheckSquare} style={{ height: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, justifyContent: "center" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ height: "26px", background: "var(--surface-2)", borderRadius: "var(--radius)" }} />
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Recent Submissions" icon={CheckSquare} style={{ height: "100%" }}>
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
      <Card title="Recent Submissions" icon={CheckSquare} style={{ height: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: "12px", padding: "24px", textAlign: "center" }}>
          <Terminal size={28} color="var(--muted)" strokeWidth={1.5} />
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            No submissions recorded yet. Solve your first problem in the practice judge.
          </p>
          <Button
            variant="primary"
            size="sm"
            href="/practice"
          >
            Launch Judge
          </Button>
        </div>
      </Card>
    );
  }

  const getVerdictStyle = (type) => {
    switch (type) {
      case "accepted":
        return {
          color: "var(--verdict-accepted)",
          backgroundColor: "var(--verdict-accepted-bg)",
          borderColor: "var(--verdict-accepted)",
        };
      case "warning":
        return {
          color: "var(--verdict-warning)",
          backgroundColor: "var(--verdict-warning-bg)",
          borderColor: "var(--verdict-warning)",
        };
      case "error":
      default:
        return {
          color: "var(--verdict-error)",
          backgroundColor: "var(--verdict-error-bg)",
          borderColor: "var(--verdict-error)",
        };
    }
  };

  return (
    <Card
      title="Recent Submissions"
      subtitle="Evaluated solutions across recent judge runs"
      icon={CheckSquare}
      style={{ height: "100%" }}
    >
      <div style={{ overflowX: "auto", flex: 1 }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
            textAlign: "left",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid var(--border)",
                color: "var(--muted)",
                fontSize: "11px",
              }}
            >
              <th style={{ padding: "8px 10px 8px 0", fontWeight: 500 }}>Problem</th>
              <th style={{ padding: "8px 10px", fontWeight: 500 }}>Language</th>
              <th style={{ padding: "8px 10px", fontWeight: 500 }}>Verdict</th>
              <th style={{ padding: "8px 10px", fontWeight: 500, textAlign: "right" }}>Runtime</th>
              <th style={{ padding: "8px 10px", fontWeight: 500, textAlign: "right" }}>Submitted</th>
              <th style={{ padding: "8px 0 8px 10px", fontWeight: 500, textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((sub) => {
              const vStyle = getVerdictStyle(sub.verdictType);
              return (
                <tr
                  key={sub.id}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    transition: "background-color 0.12s ease",
                  }}
                  className="submission-row"
                >
                  <td style={{ padding: "10px 10px 10px 0" }}>
                    <a
                      href={`/practice?id=${sub.problemId}`}
                      style={{
                        color: "var(--text)",
                        textDecoration: "none",
                        fontWeight: 500,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                      className="problem-link"
                    >
                      <span>{sub.problem}</span>
                    </a>
                  </td>
                  <td style={{ padding: "10px", color: "var(--muted)" }} className="mono">
                    {sub.language}
                  </td>
                  <td style={{ padding: "10px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 600,
                        border: "1px solid",
                        lineHeight: 1.2,
                        ...vStyle,
                      }}
                    >
                      <span
                        style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          backgroundColor: "currentColor",
                          flexShrink: 0,
                        }}
                      />
                      {sub.verdict}
                    </span>
                  </td>
                  <td style={{ padding: "10px", textAlign: "right" }} className="mono">
                    <span style={{ color: "var(--text)" }}>{sub.runtimeMs}</span>{" "}
                    <span style={{ color: "var(--muted)", fontSize: "11px" }}>ms</span>
                  </td>
                  <td style={{ padding: "10px", textAlign: "right", color: "var(--muted)" }} className="mono">
                    {sub.timeAgo}
                  </td>
                  <td style={{ padding: "8px 0 8px 10px", textAlign: "right" }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      href={`/practice?id=${sub.problemId}`}
                      iconRight={ExternalLink}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default RecentSubmissionsWidget;
