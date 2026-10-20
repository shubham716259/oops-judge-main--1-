import React from "react";
import "../styles/tokens.css";

/**
 * Card — grounded surface component.
 *
 * Props:
 *   title        string    — section title (required for header)
 *   tag          string    — monospace uppercase sub-label beneath title
 *   accent       bool      — add 1px top-edge amber accent bar
 *   action       ReactNode — right-side header slot (button, link)
 *   children     ReactNode — card body
 *   className    string
 *   style        object
 *   noPadding    bool      — skip default content padding (e.g. for tables)
 */
export function Card({
  title,
  tag,
  accent = false,
  action,
  children,
  className = "",
  style = {},
  noPadding = false,

  // Legacy compat props (still forwarded where needed)
  subtitle,
  icon: Icon,
  headerStyle = {},
  contentStyle = {},
}) {
  const hasHeader = title || tag || action || Icon;

  return (
    <section
      className={`ck-card dashboard-card ${accent ? "ck-card--accented" : ""} ${className}`}
      style={{ display: "flex", flexDirection: "column", ...style }}
    >
      {hasHeader && (
        <header className="ck-card__header" style={headerStyle}>
          <div className="ck-card__header-left">
            {/* Solid left-bar marker */}
            <span className="ck-card__marker" aria-hidden="true" />

            <div className="ck-card__title-group">
              {title && <span className="ck-card__title">{title}</span>}
              {/* sub-tag: prefer explicit tag prop, fall back to subtitle for compat */}
              {(tag || subtitle) && (
                <span className="ck-card__tag">{tag || subtitle}</span>
              )}
            </div>
          </div>

          {/* Legacy icon support: render inline with title if provided */}
          {Icon && !action && (
            <span
              style={{ color: "var(--accent)", display: "flex", alignItems: "center" }}
              aria-hidden="true"
            >
              <Icon size={14} strokeWidth={2} />
            </span>
          )}

          {action && (
            <div className="ck-card__header-action">{action}</div>
          )}
        </header>
      )}

      <div
        className="ck-card__content"
        style={{
          padding: noPadding ? 0 : "16px",
          flex: 1,
          ...contentStyle,
        }}
      >
        {children}
      </div>
    </section>
  );
}

export default Card;
