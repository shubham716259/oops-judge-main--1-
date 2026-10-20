import React, { useEffect, useState, useRef } from "react";

export function CountUp({
  end,
  duration = 500,
  decimals = 0,
  suffix = "",
  prefix = "",
}) {
  const [displayValue, setDisplayValue] = useState(() => {
    // Check reduced motion immediately
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return end;
    }
    return 0;
  });

  const ref = useRef(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    if (animatedRef.current) return;

    const isReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) {
      setDisplayValue(end);
      animatedRef.current = true;
      return;
    }

    let startTime = null;
    let animationFrame = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = easeOut * end;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setDisplayValue(end);
        animatedRef.current = true;
      }
    };

    animationFrame = requestAnimationFrame(step);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [end, duration]);

  const formatted = decimals > 0
    ? Number(displayValue).toFixed(decimals)
    : Math.round(displayValue);

  return (
    <span ref={ref} className="mono" style={{ fontVariantNumeric: "tabular-nums" }}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

export default CountUp;
