import React from "react";
import MarketingLayout from "../components/marketing/MarketingLayout";
import DualBookingCta from "../components/marketing/DualBookingCta";
import PageContainer from "../components/layout/PageContainer";

/**
 * Content arrays stay empty until real client material is supplied.
 * Spec §5.1: testimonials (text + optional photo) and short case studies.
 * Spec §4: also transformation stories.
 */
const testimonials = [];
const transformationStories = [];
const caseStudies = [];

function SectionIntro({ title, description }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl sm:text-4xl">{title}</h2>
      <p className="mt-2 text-sm text-[var(--color-steel)] sm:text-base">{description}</p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="mt-6 rounded-[var(--radius-xl)] border border-dashed border-[var(--color-steel-light)] bg-white/70 px-5 py-8 text-center sm:px-8">
      <p className="text-sm text-[var(--color-steel)] sm:text-base">{message}</p>
    </div>
  );
}

/** Renders a testimonial with optional photo slot (Phase 1 §5.1). */
function TestimonialCard({ item }) {
  return (
    <blockquote className="flex h-full flex-col rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-5 sm:p-6">
      {item.photoUrl ? (
        <img
          src={item.photoUrl}
          alt=""
          className="mb-4 h-14 w-14 rounded-full object-cover"
        />
      ) : (
        <div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-[var(--color-steel-light)] bg-[var(--color-paper)] text-[10px] font-bold uppercase tracking-wider text-[var(--color-steel)]"
          aria-hidden
        >
          Photo
        </div>
      )}
      <p className="flex-1 text-sm leading-relaxed text-[var(--color-ink)] sm:text-base">
        “{item.quote}”
      </p>
      <footer className="mt-5 border-t border-[var(--color-border)] pt-4">
        <cite className="not-italic text-sm font-bold text-[var(--color-ink)]">{item.name}</cite>
        {item.role && <p className="mt-0.5 text-xs text-[var(--color-steel)]">{item.role}</p>}
      </footer>
    </blockquote>
  );
}

function StoryCard({ item }) {
  return (
    <article className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-5 sm:p-7">
      <h3 className="text-xl sm:text-2xl">{item.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-steel)] sm:text-base">{item.summary}</p>
      {item.outcome && (
        <p className="mt-4 text-sm font-semibold text-[var(--color-ink)]">
          <span className="text-[var(--color-signal)]">Outcome — </span>
          {item.outcome}
        </p>
      )}
    </article>
  );
}

export default function PortfolioPage() {
  return (
    <MarketingLayout>
      <section className="border-b border-[var(--color-border)] bg-[var(--color-ink)] text-white">
        <PageContainer variant="dashboard" className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-signal)]">
            Portfolio / Results
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl text-white sm:text-5xl md:text-6xl">
            Client results
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            Testimonials, transformation stories, and case studies will appear here once real client content is provided.
          </p>
        </PageContainer>
      </section>

      {/* Testimonials — text + optional photo */}
      <section className="bg-[var(--color-paper)]">
        <PageContainer variant="dashboard" className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <SectionIntro
            title="Testimonials"
            description="Client quotes with optional photos. Structures are ready; content is pending."
          />
          {testimonials.length === 0 ? (
            <EmptyState message="No testimonials published yet. Placeholder slots are reserved for text and optional client photos." />
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <TestimonialCard key={t.name + t.quote.slice(0, 24)} item={t} />
              ))}
            </div>
          )}
        </PageContainer>
      </section>

      {/* Transformation stories */}
      <section className="border-t border-[var(--color-border)] bg-white">
        <PageContainer variant="dashboard" className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <SectionIntro
            title="Transformation stories"
            description="Longer client journeys and before/after narratives will be listed in this section."
          />
          {transformationStories.length === 0 ? (
            <EmptyState message="No transformation stories published yet." />
          ) : (
            <div className="mt-8 space-y-4">
              {transformationStories.map((story) => (
                <StoryCard key={story.title} item={story} />
              ))}
            </div>
          )}
        </PageContainer>
      </section>

      {/* Case studies */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-paper)]">
        <PageContainer variant="dashboard" className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <SectionIntro
            title="Case studies"
            description="Short case studies summarizing approach and outcomes will appear here."
          />
          {caseStudies.length === 0 ? (
            <EmptyState message="No case studies published yet." />
          ) : (
            <div className="mt-8 space-y-4">
              {caseStudies.map((cs) => (
                <StoryCard key={cs.title} item={cs} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <h2 className="text-2xl sm:text-3xl">Book your session</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--color-steel)] sm:text-base">
              Choose coaching for a full kickoff, or a consultation for a focused first conversation.
            </p>
            <DualBookingCta align="center" className="mt-6" />
          </div>
        </PageContainer>
      </section>
    </MarketingLayout>
  );
}
