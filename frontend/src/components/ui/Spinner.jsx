import React from "react";

export function Spinner({ size = "md", className = "" }) {
  const sizes = {
    xs: "w-3.5 h-3.5 border-2",
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
    xl: "w-12 h-12 border-4",
  };
  return (
    <span
      className={`inline-block rounded-full border-violet-200 border-t-violet-600 animate-spin ${sizes[size] ?? sizes.md} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader({ message = "Loading..." }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <BoltIcon className="w-6 h-6 text-violet-600" />
          </div>
        </div>
        <p className="text-sm font-medium text-neutral-500">{message}</p>
      </div>
    </div>
  );
}

function BoltIcon({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.268a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
    </svg>
  );
}
