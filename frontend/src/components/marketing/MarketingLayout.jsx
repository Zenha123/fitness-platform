import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../Navbar";

export default function MarketingLayout({ children }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--color-paper)] text-[var(--color-ink)]">
      <Navbar />
      <main>{children}</main>
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-ink)] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
          <div className="max-w-sm space-y-3">
            <p className="font-[family-name:var(--font-display)] text-2xl tracking-[0.08em] text-white">
              HAQQ <span className="text-[var(--color-signal)]">ATHLETE</span>
            </p>
            <p className="text-sm leading-relaxed text-white/65">
              One-on-one fitness coaching and consultations for busy professionals and special-population clients.
            </p>
          </div>

          <div className="grid w-full grid-cols-2 gap-6 sm:max-w-xl sm:grid-cols-3 sm:gap-8 lg:w-auto">
            <div className="min-w-0 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">Explore</p>
              <Link to="/" className="block truncate text-sm text-white/80 no-underline hover:text-white">Home</Link>
              <Link to="/about" className="block truncate text-sm text-white/80 no-underline hover:text-white">About</Link>
              <Link to="/portfolio" className="block truncate text-sm text-white/80 no-underline hover:text-white">Results</Link>
              <Link to="/services" className="block truncate text-sm text-white/80 no-underline hover:text-white">Services &amp; Pricing</Link>
            </div>
            <div className="min-w-0 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">Book</p>
              <Link to="/book/one_on_one_coaching" className="block truncate text-sm text-white/80 no-underline hover:text-white">
                Book Coaching
              </Link>
              <Link to="/book/consultation" className="block truncate text-sm text-white/80 no-underline hover:text-white">
                Book Consultation
              </Link>
            </div>
            <div className="col-span-2 min-w-0 space-y-2 sm:col-span-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">Account</p>
              <Link to="/login" className="block text-sm text-white/80 no-underline hover:text-white">
                Client / Trainer Login
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/40 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} Haqq Athlete. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
