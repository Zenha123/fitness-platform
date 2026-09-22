import React from "react";
import { Spinner } from "./Spinner";

const variants = {
  primary: "bg-[var(--color-signal)] text-white hover:bg-[var(--color-signal-hover)] active:translate-y-px shadow-md shadow-[var(--color-signal)]/20",
  secondary: "border-2 border-[var(--color-steel-light)] text-white hover:border-white hover:bg-white/10",
  accent: "bg-[var(--color-signal)] text-white hover:bg-[var(--color-signal-hover)] active:translate-y-px shadow-md shadow-[var(--color-signal)]/20",
  ghost: "text-[var(--color-steel)] hover:text-white hover:bg-white/10",
  destructive: "bg-rose-600 text-white hover:bg-rose-700 active:translate-y-px shadow-md shadow-rose-600/20",
};


const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-[var(--radius-sm)]",
  md: "px-4 py-2 text-base rounded-[var(--radius-md)]",
  lg: "px-6 py-3 text-lg rounded-[var(--radius-md)]",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = "",
  type = "button",
  ...props
}) {
  const baseStyle = "inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none";
  
  const classes = [
    baseStyle,
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    fullWidth ? "w-full" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" className={variant === "secondary" || variant === "ghost" ? "border-t-[var(--color-ink)]" : "border-white/30 border-t-white"} />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
