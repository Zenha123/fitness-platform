import React from "react";
import { Link } from "react-router-dom";
import MarketingLayout from "../components/marketing/MarketingLayout";
import DualBookingCta from "../components/marketing/DualBookingCta";
import PageContainer from "../components/layout/PageContainer";

export default function HomePage() {
  return (
    <MarketingLayout>
      {/* Hero — brand-first, single composition */}
      <section className="relative overflow-hidden bg-[var(--color-ink)] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(232,67,26,0.45), transparent 55%), linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.04) 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <PageContainer variant="dashboard" className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <p className="font-[family-name:var(--font-display)] text-4xl tracking-[0.08em] text-white sm:text-5xl md:text-6xl lg:text-7xl">
              HAQQ <span className="text-[var(--color-signal)]">ATHLETE</span>
            </p>
            <h1 className="mt-5 max-w-2xl font-[family-name:var(--font-display)] text-3xl tracking-[0.06em] text-white sm:text-4xl md:text-5xl">
              Coaching that fits a demanding life
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              One-on-one fitness coaching and consultations for busy professionals and special-population clients—book a live slot, no back-and-forth.
            </p>
            <DualBookingCta
              tone="dark"
              className="mt-8"
              primaryLabel="Book Coaching"
              secondaryLabel="Book Consultation"
            />
          </div>
        </PageContainer>
      </section>

      {/* Who we serve */}
      <section className="border-b border-[var(--color-border)] bg-[var(--color-paper)]">
        <PageContainer variant="dashboard" className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-signal)]">Who we serve</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">Built for real schedules</h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--color-steel)] sm:text-lg">
              Premium coaching without the chaos—clear availability, structured intake, and sessions that respect your time and health constraints.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl">Busy professionals</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-steel)] sm:text-base">
                Travel, late meetings, and limited recovery time. Programs and consults designed around consistency you can actually keep.
              </p>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl">Special populations</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-steel)] sm:text-base">
                Thoughtful assessment, medical awareness, and coaching that prioritizes safety, clarity, and sustainable progress.
              </p>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Path forward */}
      <section className="bg-white">
        <PageContainer variant="dashboard" className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-signal)]">Next step</p>
              <h2 className="mt-2 text-3xl sm:text-4xl">Choose your session type</h2>
              <p className="mt-3 text-base leading-relaxed text-[var(--color-steel)]">
                Coaching kickoffs and strategy consultations run on separate calendars so you book the right experience the first time.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/services" className="no-underline">
                <ButtonGhost>View services & pricing</ButtonGhost>
              </Link>
              <Link to="/portfolio" className="no-underline">
                <ButtonGhost>See results</ButtonGhost>
              </Link>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              to="/book/one_on_one_coaching"
              className="group block rounded-[var(--radius-xl)] border border-[var(--color-ink)] bg-[var(--color-ink)] p-6 text-white no-underline transition-opacity hover:opacity-95 sm:p-8"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-signal)]">1-on-1</p>
              <h3 className="mt-2 text-2xl text-white">Coaching kickoff</h3>
              <p className="mt-2 text-sm text-white/65">
                Goals, assessment, and a clear training direction—book from live availability.
              </p>
              <span className="mt-5 inline-block text-sm font-bold text-white group-hover:underline">
                Book coaching →
              </span>
            </Link>
            <Link
              to="/book/consultation"
              className="group block rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-paper)] p-6 no-underline transition-colors hover:border-[var(--color-ink)] sm:p-8"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-signal)]">Consult</p>
              <h3 className="mt-2 text-2xl">Strategy consultation</h3>
              <p className="mt-2 text-sm text-[var(--color-steel)]">
                A focused discovery call to evaluate your routine, constraints, and coaching fit.
              </p>
              <span className="mt-5 inline-block text-sm font-bold text-[var(--color-ink)] group-hover:underline">
                Book consultation →
              </span>
            </Link>
          </div>
        </PageContainer>
      </section>
    </MarketingLayout>
  );
}

function ButtonGhost({ children }) {
  return (
    <span className="inline-flex items-center justify-center rounded-[var(--radius-md)] border-2 border-[var(--color-steel-light)] px-4 py-2 text-sm font-bold text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)] hover:bg-black/5">
      {children}
    </span>
  );
}
