import React from "react";

const variants = {
  primary: "btn btn-primary",
  accent:  "btn btn-accent",
  outline: "btn btn-outline",
  ghost:   "btn btn-ghost",
  danger:  "btn btn-danger",
};

const sizes = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
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
  const classes = [
    variants[variant] ?? "btn btn-primary",
    sizes[size] ?? "",
    fullWidth ? "btn-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" color={variant === "outline" || variant === "ghost" ? "primary" : "white"} />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

function Spinner({ size = "sm", color = "white" }) {
  const sz = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const borderColor =
    color === "white"
      ? "border-white/30 border-t-white"
      : "border-violet-200 border-t-violet-600";
  return (
    <span
      className={`${sz} border-2 ${borderColor} rounded-full animate-spin`}
      aria-hidden
    />
  );
}
