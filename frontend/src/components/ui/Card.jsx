import React from "react";

export function Card({ children, className = "", elevated = false, ...props }) {
  const baseClass = elevated ? "glass-panel-elevated" : "glass-panel";
  return (
    <div className={`${baseClass} overflow-hidden ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div className={`px-6 py-4 border-b border-[var(--color-steel-light)] ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }) {
  return (
    <h3 className={`text-lg text-[var(--color-ink)] ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardBody({ children, className = "", ...props }) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "", ...props }) {
  return (
    <div className={`px-6 py-4 border-t border-[var(--color-steel-light)] bg-[var(--color-paper)]/50 ${className}`} {...props}>
      {children}
    </div>
  );
}
