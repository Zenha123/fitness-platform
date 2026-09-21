import React from "react";

/**
 * PageContainer — typed width system for all pages.
 *
 * variant:
 *   "dashboard" → max-w-7xl, fluid/responsive (default)
 *   "builder"   → max-w-7xl, fluid/responsive
 *   "form"      → max-w-[480px], centred (forms, narrow pages)
 *   "full"      → w-full, no max-width
 */
export default function PageContainer({ children, variant = "dashboard", className = "" }) {
  const widthClass = {
    dashboard: "max-w-7xl mx-auto",
    builder:   "max-w-7xl mx-auto",
    form:      "max-w-[480px] mx-auto px-4 sm:px-6",
    narrow:    "max-w-4xl mx-auto",
    full:      "w-full",
  }[variant] ?? "max-w-7xl mx-auto";

  return (
    <div className={`${widthClass} ${className}`}>
      {children}
    </div>
  );
}
