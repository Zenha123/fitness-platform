import React, { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { Alert } from "../ui/Alert";

export default function ReviewForm({ clientName, initialData, onSubmit, onCancel }) {
  const [summary, setSummary] = useState("");
  const [improvements, setImprovements] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setSummary(initialData.summary || "");
      setImprovements(initialData.improvements_needed || "");
    } else {
      setSummary("");
      setImprovements("");
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!summary.trim()) {
      setError("Progress summary cannot be empty.");
      return;
    }
    if (!improvements.trim()) {
      setError("Areas to improve cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        summary: summary.trim(),
        improvements_needed: improvements.trim(),
      });
      // Success is handled by parent (typically closing form or state update)
    } catch (err) {
      console.error(err);
      setError("Failed to save review note. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
      <div className="bg-neutral-50 border-b border-neutral-100 p-5">
        <h3 className="font-extrabold text-neutral-900 text-base">
          {initialData ? "Edit Coaching Review Note" : `New Review Note for ${clientName}`}
        </h3>
        <p className="text-xs text-neutral-400 mt-1">
          Post feedback summarizing progress and suggesting specific improvements.
        </p>
      </div>

      <div className="p-6 space-y-5">
        {error && <Alert variant="danger">{error}</Alert>}

        <div className="space-y-1.5">
          <label htmlFor="summary" className="form-label">
            Overall Progress Summary
          </label>
          <textarea
            id="summary"
            rows={4}
            className="form-input min-h-[100px] resize-y"
            placeholder="Summarize their recent training blocks, strength gains, and consistency..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="improvements" className="form-label">
            Areas to Focus & Improve
          </label>
          <textarea
            id="improvements"
            rows={4}
            className="form-input min-h-[100px] resize-y"
            placeholder="Focus on form on squats, hit 3x week attendance, hit protein goals, etc..."
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-3">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" type="submit" loading={loading}>
          {initialData ? "Save Changes" : "Post Note"}
        </Button>
      </div>
    </form>
  );
}
