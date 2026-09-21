import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

/**
 * Dual booking CTAs — Phase 1 §5.1
 * Links to the two independent booking flows.
 */
export default function DualBookingCta({
  align = "start",
  size = "lg",
  tone = "light",
  className = "",
  primaryLabel = "Book Coaching",
  secondaryLabel = "Book Consultation",
}) {
  const alignClass =
    align === "center"
      ? "justify-center"
      : align === "stretch"
        ? "sm:flex-row [&>a]:flex-1"
        : "justify-start";

  const sizeClass =
    size === "lg"
      ? "px-6 py-3 text-lg rounded-[var(--radius-md)]"
      : size === "sm"
        ? "px-3 py-1.5 text-sm rounded-[var(--radius-sm)]"
        : "px-4 py-2 text-base rounded-[var(--radius-md)]";

  const secondaryToneClass =
    tone === "dark"
      ? "border border-white/35 bg-transparent text-white hover:bg-white hover:text-[var(--color-ink)]"
      : "border-2 border-[var(--color-ink)] bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-white";

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap ${alignClass} ${className}`}>
      <Link to="/book/one_on_one_coaching" className="inline-flex no-underline">
        <Button variant="accent" size={size} fullWidth={align === "stretch"} className="w-full sm:w-auto">
          {primaryLabel}
        </Button>
      </Link>
      <Link
        to="/book/consultation"
        className={`inline-flex w-full items-center justify-center gap-2 font-bold no-underline transition-all duration-200 sm:w-auto ${sizeClass} ${secondaryToneClass}`}
      >
        {secondaryLabel}
      </Link>
    </div>
  );
}
