import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { progressApi } from "../api/progress";
import { Alert } from "../components/ui/Alert";
import { PageLoader } from "../components/ui/Spinner";
import ReviewCard from "../components/reviews/ReviewCard";
import ClientLayout from "../components/layout/ClientLayout";

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
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link
            to="/client/dashboard"
            className="p-2 rounded-xl hover:bg-neutral-100 text-neutral-500 transition-colors -ml-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-extrabold text-base text-neutral-900">Coach Feedback Feed</h1>
            <p className="text-xs text-neutral-400">Read-only review notes from your trainer</p>
          </div>
        </div>
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl"
          style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 70%, #a855f7 100%)" }}
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #c4b5fd 0%, transparent 70%)" }} />
          <div className="relative z-10 p-6 sm:p-8 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center flex-shrink-0">
              <ChatIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white leading-tight">
                Coach Feedback
              </h2>
              <p className="text-indigo-200 text-sm mt-0.5">
                {reviews.length > 0
                  ? `${reviews.length} review ${reviews.length === 1 ? "note" : "notes"} from your trainer`
                  : "Personalized progress reviews from your trainer"}
              </p>
            </div>
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {reviews.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <ChatIcon className="w-8 h-8 text-violet-400" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">No feedback yet</h3>
            <p className="text-neutral-500 max-w-sm mx-auto text-sm leading-relaxed mb-1">
              Your coach hasn't posted any feedback notes to your dashboard yet.
            </p>
            <p className="text-xs text-neutral-400">
              When they write a progress review, it will appear right here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {reviews.map((review, idx) => (
              <div key={review.id} className="relative">
                {/* Timeline connector */}
                {idx < reviews.length - 1 && (
                  <div className="absolute left-7 top-full w-0.5 h-5 bg-gradient-to-b from-indigo-200 to-transparent z-0" />
                )}
                <div className="relative z-10">
                  <ReviewCard review={review} isTrainer={false} />
                </div>
              </div>
            ))}

            {/* Timeline end dot */}
            <div className="flex justify-center">
              <div className="w-2 h-2 rounded-full bg-indigo-200" />
            </div>
          </div>
        )}
      </div>
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
