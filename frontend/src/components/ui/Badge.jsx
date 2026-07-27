import React from "react";

const variants = {
  default: "bg-[var(--color-paper)] text-[var(--color-ink)] border-[var(--color-steel-light)]",
  primary: "bg-[var(--color-ink)] text-white border-[var(--color-ink)]",
  accent: "bg-[var(--color-signal-dim)] text-[var(--color-signal)] border-[var(--color-signal)]/20",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
};

export function Badge({ children, variant = "default", className = "" }) {
  const baseStyle = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border";
  const variantStyle = variants[variant] || variants.default;

  return (
    <span className={`${baseStyle} ${variantStyle} ${className}`}>
      {children}
    </span>
  );
}
