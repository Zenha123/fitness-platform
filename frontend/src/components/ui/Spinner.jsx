import React from "react";

export function Spinner({ size = "md", className = "" }) {
  const sizes = {
    xs: "w-3.5 h-3.5 border-2",
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-[3px]",
    xl: "w-12 h-12 border-4",
  };
  return (
    <span
      className={`inline-block rounded-full border-[var(--color-steel-light)] border-t-[var(--color-ink)] animate-spin ${sizes[size] || sizes.md} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader({ message = "Loading..." }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center bg-[var(--color-bg)]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-[var(--color-steel-light)] border-t-[var(--color-signal)] animate-spin" />
        </div>
        <p className="text-sm font-bold tracking-wider uppercase text-[var(--color-steel)]">{message}</p>
      </div>
    </div>
  );
}
