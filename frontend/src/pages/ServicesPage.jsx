import React from "react";
import { Link } from "react-router-dom";
import MarketingLayout from "../components/marketing/MarketingLayout";
import DualBookingCta from "../components/marketing/DualBookingCta";
import PageContainer from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";

const services = [
  {
    type: "one_on_one_coaching",
    eyebrow: "1-on-1 Coaching",
    title: "Coaching kickoff session",
    duration: "60 minutes",
    priceLabel: "Pricing",
    priceValue: "To be confirmed",
    priceNote: "Live availability · confirmation + intake included",
    description:
      "A structured first coaching session covering goals, constraints, baseline assessment, and recommended program direction. Ideal when you are ready to begin a coaching relationship.",
    includes: [
      "Live slot booking with double-booking protection",
      "Video join link in your confirmation email",
      "Pre-session intake questionnaire",
      "Calendar invite (.ics) attached to confirmation",
    ],
    cta: "Book Coaching",
    href: "/book/one_on_one_coaching",
    featured: true,
  },
  {
    type: "consultation",
    eyebrow: "Consultation",
    title: "Strategy consultation",
    duration: "30 minutes",
    priceLabel: "Pricing",
    priceValue: "To be confirmed",
    priceNote: "Separate calendar · discovery-focused",
    description:
      "A focused discovery call to evaluate your current routine, nutrition habits, and coaching suitability. Ideal if you want clarity before committing to a full kickoff.",
    includes: [
      "Independent consultation availability calendar",
      "Confirmation email with join link",
      "Lightweight intake before the call",
      "Clear next-step recommendation after the session",
    ],
    cta: "Book Consultation",
    href: "/book/consultation",
    featured: false,
  },
];

export default function ServicesPage() {
  return (
    <MarketingLayout>
      <section className="border-b border-[var(--color-line,#E2E1DC)] bg-[var(--color-ink)] text-white">
        <PageContainer variant="dashboard" className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-signal)]">
            Services & Pricing
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl text-white sm:text-5xl md:text-6xl">
            Two clear paths. Live availability.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            Coaching and consultation are managed on separate calendars so you book the right experience—then receive confirmation, a join link, and an intake form automatically.
          </p>
          <DualBookingCta tone="dark" className="mt-8" />
        </PageContainer>
      </section>

      <section className="bg-[var(--color-paper)]">
        <PageContainer variant="dashboard" className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {services.map((svc) => (
              <article
                key={svc.type}
                className={`flex h-full flex-col rounded-[var(--radius-xl)] border p-6 sm:p-8 ${
                  svc.featured
                    ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                    : "border-[var(--color-line,#E2E1DC)] bg-white text-[var(--color-ink)]"
                }`}
              >
                <p
                  className={`text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-signal)]`}
                >
                  {svc.eyebrow}
                </p>
                <h2 className={`mt-2 text-3xl ${svc.featured ? "text-white" : ""}`}>{svc.title}</h2>
                <p className={`mt-2 text-sm font-semibold ${svc.featured ? "text-white/80" : "text-[var(--color-ink)]"}`}>
                  {svc.duration}
                </p>
                <div
                  className={`mt-3 rounded-[var(--radius-md)] border border-dashed px-3 py-2 ${
                    svc.featured
                      ? "border-white/25 bg-white/5"
                      : "border-[var(--color-steel-light)] bg-[var(--color-paper)]"
                  }`}
                >
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${svc.featured ? "text-white/45" : "text-[var(--color-steel)]"}`}>
                    {svc.priceLabel}
                  </p>
                  <p className={`text-sm font-semibold ${svc.featured ? "text-white/85" : "text-[var(--color-ink)]"}`}>
                    {svc.priceValue}
                  </p>
                </div>
                <p className={`mt-2 text-xs ${svc.featured ? "text-white/50" : "text-[var(--color-steel)]"}`}>
                  {svc.priceNote}
                </p>
                <p className={`mt-4 text-sm leading-relaxed ${svc.featured ? "text-white/70" : "text-[var(--color-steel)]"}`}>
                  {svc.description}
                </p>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {svc.includes.map((item) => (
                    <li key={item} className="flex gap-3 text-sm">
                      <span
                        className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                          svc.featured ? "bg-[var(--color-signal)]" : "bg-[var(--color-ink)]"
                        }`}
                        aria-hidden
                      />
                      <span className={svc.featured ? "text-white/80" : "text-[var(--color-ink)]"}>{item}</span>
                    </li>
                  ))}
                </ul>

                <Link to={svc.href} className="mt-8 inline-flex no-underline">
                  <Button
                    variant={svc.featured ? "accent" : "primary"}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {svc.cta}
                  </Button>
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-12 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-6 text-center sm:p-8">
            <h2 className="text-2xl sm:text-3xl">Not sure which to book?</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--color-steel)] sm:text-base">
              Start with a consultation if you want a discovery conversation. Choose coaching when you are ready for a full kickoff and assessment flow.
            </p>
            <DualBookingCta align="center" className="mt-6" />
          </div>
        </PageContainer>
      </section>
    </MarketingLayout>
  );
}
