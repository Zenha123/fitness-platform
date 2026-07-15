import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { progressApi } from "../api/progress";
import { Alert } from "../components/ui/Alert";
import { Spinner, PageLoader } from "../components/ui/Spinner";
import ReviewCard from "../components/reviews/ReviewCard";

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

  if (loading) return <PageLoader message="Loading review notes..." />;

  return (
    <div className="min-h-screen bg-neutral-50 page-enter pb-16">
      {/* Navigation Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/client/dashboard" className="text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors">
              ← Dashboard
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-sm font-bold text-neutral-900">Coach Feedback Logs</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
            Coach Feedback Feed
          </h1>
          <p className="text-neutral-500 mt-1">
            Read-only feedback reviews written directly by your personal trainer.
          </p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {reviews.length === 0 ? (
          <div className="card p-12 text-center border border-neutral-200 bg-white">
            <div className="w-16 h-16 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">No review notes posted yet</h3>
            <p className="text-neutral-500 max-w-sm mx-auto mb-2">
              Your coach hasn't posted any feedback reviews to your dashboard yet.
            </p>
            <p className="text-xs text-neutral-400">
              When they write a progress review note, it will appear right here in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isTrainer={false}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
