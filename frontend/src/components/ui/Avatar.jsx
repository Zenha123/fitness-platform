import React from "react";

export function Avatar({ name = "", size = "md", className = "" }) {
  const sizes = {
    sm: "w-9 h-9 text-sm",
    md: "w-11 h-11 text-base",
    lg: "w-14 h-14 text-lg",
  };

  const getInitials = (str) => {
    if (!str) return "?";
    const parts = str.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-[var(--color-paper)] text-[var(--color-ink)] border border-[var(--color-steel-light)] font-bold tracking-wider shrink-0 shadow-sm ${sizes[size] || sizes.md} ${className}`}
      aria-label={name}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
