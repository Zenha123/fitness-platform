import React from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * BottomTabBar — shared mobile bottom navigation.
 *
 * Props:
 *   tabs: Array<{ name: string, path: string, icon: Component, matchPaths?: string[] }>
 *
 * Visible only on mobile (md:hidden). Fixed to bottom of screen with safe-area support.
 */
export default function BottomTabBar({ tabs }) {
  const location = useLocation();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[var(--color-border)] flex items-stretch"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Mobile navigation"
    >
      {tabs.map((tab) => {
        const isActive =
          location.pathname === tab.path ||
          (tab.matchPaths && tab.matchPaths.some((p) => location.pathname.startsWith(p)));

        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-signal)] focus-visible:ring-inset ${
              isActive
                ? "text-[var(--color-ink)]"
                : "text-[var(--color-steel)] hover:text-[var(--color-ink)]"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {/* Icon */}
            <span className="relative">
              <tab.icon
                className={`w-5 h-5 transition-all duration-200 ${
                  isActive ? "scale-110" : ""
                }`}
                filled={isActive}
              />
              {/* Active dot indicator */}
              {isActive && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[var(--color-signal)]" />
              )}
            </span>
            {/* Label */}
            <span
              className={`text-[10px] font-bold tracking-wide leading-none transition-all duration-200 ${
                isActive ? "text-[var(--color-ink)]" : "text-[var(--color-steel)]"
              }`}
            >
              {tab.name}
            </span>
            {/* Active underline */}
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[var(--color-ink)] rounded-b-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
