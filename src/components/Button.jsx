import React, { forwardRef } from "react";
import "../styles/button.css";

/**
 * Code Karo Button Component
 * Linear / Vercel / Raycast aesthetic.
 *
 * Variants: primary | secondary | ghost | accent | danger
 * Sizes: xs (24px) | sm (30px) | md (36px) | icon-only (square)
 * No scale, no glow, no shadow. Active = translateY(1px).
 */
export const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    iconOnly = false,
    isIconOnly = false,
    loading = false,
    disabled = false,
    iconLeft: IconLeft = null,
    iconRight: IconRight = null,
    asChild = false,
    href = null,
    children,
    className = "",
    style = {},
    type = "button",
    onClick,
    "aria-label": ariaLabel,
    ...restProps
  },
  ref
) {
  const actualIconOnly = iconOnly || isIconOnly;

  // Validate accessibility: icon-only buttons require an accessible label
  if (actualIconOnly && !ariaLabel && typeof children === "string" && !children.trim()) {
    console.warn("Button: icon-only buttons must have an accessible aria-label.");
  }

  // Compose class names
  const classes = [
    "ck-button",
    `ck-button--${variant}`,
    `ck-button--size-${size}`,
    actualIconOnly ? "ck-button--icon-only" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const isInteractiveDisabled = disabled || loading;

  const handleClick = (event) => {
    if (isInteractiveDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (onClick) {
      onClick(event);
    }
  };

  const renderIcon = (iconProp, slotClass) => {
    if (!iconProp) return null;
    const iconSize = size === "xs" ? 10 : size === "sm" ? 12 : 14;
    const iconStroke = 1.8;

    if (React.isValidElement(iconProp)) {
      return (
        <span className={`ck-button__icon ${slotClass}`} aria-hidden="true">
          {iconProp}
        </span>
      );
    }

    if (typeof iconProp === "function" || typeof iconProp === "object") {
      const Component = iconProp;
      return (
        <span className={`ck-button__icon ${slotClass}`} aria-hidden="true">
          <Component size={iconSize} strokeWidth={iconStroke} />
        </span>
      );
    }

    return null;
  };

  const innerContent = (
    <>
      <span className="ck-button__content">
        {renderIcon(IconLeft, "ck-button__icon--left")}
        {children}
        {renderIcon(IconRight, "ck-button__icon--right")}
      </span>
      {loading && (
        <span className="ck-button__spinner-wrapper" aria-hidden="true">
          <span className="ck-button__spinner" />
        </span>
      )}
    </>
  );

  // If asChild is requested and child is a valid React element
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref,
      className: [children.props.className, classes].filter(Boolean).join(" "),
      style: { ...children.props.style, ...style },
      "aria-busy": loading ? "true" : undefined,
      "aria-disabled": isInteractiveDisabled ? "true" : undefined,
      "data-loading": loading ? "true" : undefined,
      onClick: handleClick,
      ...restProps,
      children: (
        <>
          {renderIcon(IconLeft, "ck-button__icon--left")}
          {children.props.children}
          {renderIcon(IconRight, "ck-button__icon--right")}
          {loading && (
            <span className="ck-button__spinner-wrapper" aria-hidden="true">
              <span className="ck-button__spinner" />
            </span>
          )}
        </>
      ),
    });
  }

  // If href is provided, render an accessible anchor
  if (href) {
    return (
      <a
        ref={ref}
        href={isInteractiveDisabled ? undefined : href}
        className={classes}
        style={style}
        role={isInteractiveDisabled ? "link" : undefined}
        aria-disabled={isInteractiveDisabled ? "true" : undefined}
        aria-busy={loading ? "true" : undefined}
        aria-label={ariaLabel}
        tabIndex={isInteractiveDisabled ? -1 : undefined}
        data-loading={loading ? "true" : undefined}
        onClick={handleClick}
        {...restProps}
      >
        {innerContent}
      </a>
    );
  }

  // Native button element
  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      style={style}
      disabled={isInteractiveDisabled}
      aria-busy={loading ? "true" : undefined}
      aria-label={ariaLabel}
      data-loading={loading ? "true" : undefined}
      onClick={handleClick}
      {...restProps}
    >
      {innerContent}
    </button>
  );
});

export default Button;
