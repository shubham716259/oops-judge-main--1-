import React from "react";

export function Skeleton({
  width = "100%",
  height = "20px",
  borderRadius = "var(--radius)",
  style = {},
  className = "",
}) {
  return (
    <div
      className={`skeleton-pulse ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: "var(--surface-2)",
        border: "1px solid var(--border)",
        display: "inline-block",
        boxSizing: "border-box",
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ height = "220px", rows = 3 }) {
  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "20px",
        minHeight: height,
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
      aria-busy="true"
      aria-label="Loading content"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Skeleton width="20px" height="20px" borderRadius="4px" />
        <Skeleton width="140px" height="16px" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, justifyContent: "center" }}>
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} width={`${90 - i * 15}%`} height="14px" />
        ))}
      </div>
    </div>
  );
}

export default Skeleton;
