import React from "react";
import MarketingLayout from "../components/marketing/MarketingLayout";
import DualBookingCta from "../components/marketing/DualBookingCta";
import PageContainer from "../components/layout/PageContainer";

/** Specializations called out in Phase 1 §4 / §5.1 (audience focus, not invented credentials). */
const specializations = [
  {
    title: "Busy professionals",
    body: "Coaching and consultations designed around travel, long workdays, and limited recovery windows—so consistency survives a real schedule.",
  },
  {
    title: "Special populations",
    body: "Careful screening awareness, medical-clearance considerations, and coaching decisions that prioritize safety and clarity.",
  },
];

/** Empty until the trainer supplies real credentials / certifications. */
const credentialPlaceholders = [
  { label: "Credential", hint: "Add official title or license here" },
  { label: "Credential", hint: "Add additional credential here" },
];

const certificationPlaceholders = [
  { label: "Certification", hint: "Add certification name and issuing body" },
  { label: "Certification", hint: "Add certification name and issuing body" },
];

function EmptySlot({ label, hint }) {
  return (
    <li className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-steel-light)] bg-white/60 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-steel)]">{label}</p>
      <p className="mt-1 text-sm text-[var(--color-steel)]">{hint}</p>
    </li>
  );
}

export default function AboutPage() {
  return (
    <MarketingLayout>
      <section className="border-b border-[var(--color-border)] bg-[var(--color-ink)] text-white">
        <PageContainer variant="dashboard" className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-signal)]">About</p>
          <h1 className="mt-3 max-w-3xl text-4xl text-white sm:text-5xl md:text-6xl">
            Credentials &amp; focus
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            Learn who Haqq Athlete serves and review credentials and certifications once they are published here. Specializations align with busy professionals and special-population clients.
          </p>
        </PageContainer>
      </section>

      <section className="bg-[var(--color-paper)]">
        <PageContainer variant="dashboard" className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl">Credentials</h2>
                <p className="mt-2 text-sm text-[var(--color-steel)] sm:text-base">
                  Official credentials will appear in this section when provided by the trainer.
                </p>
                <ul className="mt-5 space-y-3">
                  {credentialPlaceholders.map((item, i) => (
                    <EmptySlot key={`cred-${i}`} label={item.label} hint={item.hint} />
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-3xl sm:text-4xl">Certifications</h2>
                <p className="mt-2 text-sm text-[var(--color-steel)] sm:text-base">
                  Certification names and issuing bodies will be listed here when available.
                </p>
                <ul className="mt-5 space-y-3">
                  {certificationPlaceholders.map((item, i) => (
                    <EmptySlot key={`cert-${i}`} label={item.label} hint={item.hint} />
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl">Specializations</h2>
              <p className="mt-2 text-sm text-[var(--color-steel)] sm:text-base">
                Primary coaching focus areas for Phase 1.
              </p>
              <div className="mt-5 space-y-4">
                {specializations.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-5 sm:p-6"
                  >
                    <h3 className="text-xl">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-steel)] sm:text-base">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl">Ready when you are</h2>
            <p className="mt-2 max-w-xl text-sm text-[var(--color-steel)] sm:text-base">
              Book a coaching kickoff or a strategy consultation—both use live calendars with confirmation and intake links sent automatically.
            </p>
            <DualBookingCta className="mt-6" />
          </div>
        </PageContainer>
      </section>
    </MarketingLayout>
  );
}
