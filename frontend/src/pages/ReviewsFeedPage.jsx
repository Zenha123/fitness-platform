import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { progressApi } from "../api/progress";
import { Alert } from "../components/ui/Alert";
import { PageLoader } from "../components/ui/Spinner";
import ReviewCard from "../components/reviews/ReviewCard";
import ClientLayout from "../components/layout/ClientLayout";
import PageContainer from "../components/layout/PageContainer";

export default function ReviewsFeedPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await progressApi.getReviews();
      setReviews(data);
    } catch (err) {
      setError("Failed to load coaching review notes.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader message="Loading review notes…" />;

  return (
    <ClientLayout>
      <PageContainer variant="form" className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link
            to="/client/dashboard"
            className="p-2 rounded-[var(--radius-md)] hover:bg-black/5 text-[var(--color-steel)] transition-colors -ml-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-base text-[var(--color-ink)]">Coach Feedback Feed</h1>
            <p className="text-xs text-[var(--color-steel)]">Read-only review notes from your trainer</p>
          </div>
        </div>
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-paper)] border border-[var(--color-border)] shadow-sm">
          <div className="relative z-10 p-6 sm:p-8 flex items-center gap-5">
            <div className="w-14 h-14 rounded-[var(--radius-md)] bg-black/5 flex items-center justify-center flex-shrink-0">
              <ChatIcon className="w-7 h-7 text-[var(--color-ink)]" />
            </div>
            <div>
              <h2 className="text-xl text-[var(--color-ink)] leading-tight">
                Coach Feedback
              </h2>
              <p className="text-[var(--color-steel)] text-sm mt-0.5 font-medium">
                {reviews.length > 0
                  ? `${reviews.length} review ${reviews.length === 1 ? "note" : "notes"} from your trainer`
                  : "Personalized progress reviews from your trainer"}
              </p>
            </div>
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {reviews.length === 0 ? (
          <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-md)] flex items-center justify-center mx-auto mb-4">
              <ChatIcon className="w-8 h-8 text-[var(--color-ink)]" />
            </div>
            <h3 className="text-lg text-[var(--color-ink)] mb-2">No feedback yet</h3>
            <p className="text-[var(--color-steel)] max-w-sm mx-auto text-sm leading-relaxed mb-1 font-medium">
              Your coach hasn't posted any feedback notes to your dashboard yet.
            </p>
            <p className="text-xs text-[var(--color-steel)]/70">
              When they write a progress review, it will appear right here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {reviews.map((review, idx) => (
              <div key={review.id} className="relative">
                {/* Timeline connector */}
                {idx < reviews.length - 1 && (
                  <div className="absolute left-7 top-full w-0.5 h-5 bg-gradient-to-b from-[var(--color-border)] to-transparent z-0" />
                )}
                <div className="relative z-10">
                  <ReviewCard review={review} isTrainer={false} />
                </div>
              </div>
            ))}

            {/* Timeline end dot */}
            <div className="flex justify-center">
              <div className="w-2 h-2 rounded-full bg-[var(--color-border)]" />
            </div>
          </div>
        )}
      </PageContainer>
    </ClientLayout>
  );
}

function ArrowLeftIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

function ChatIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}
