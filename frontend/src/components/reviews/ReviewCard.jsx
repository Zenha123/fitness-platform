import React, { useState } from "react";
import { Button } from "../ui/Button";

export default function ReviewCard({ review, isTrainer, onEdit, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this review note?")) {
      try {
        setIsDeleting(true);
        await onDelete(review.id);
      } catch (err) {
        setIsDeleting(false);
      }
    }
  };

  const formattedDate = new Date(review.created_at).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = new Date(review.created_at).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="glass-panel tint-violet border-indigo-150/30 transition-all hover-lift shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-white/60 border-b border-indigo-100/50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm">
            {review.trainer_name ? review.trainer_name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "TR"}
          </div>
          <div>
            <p className="font-bold text-neutral-800 text-sm">Coach {review.trainer_name || "Trainer"}</p>
            <p className="text-xs text-neutral-400 font-semibold">
              {formattedDate} at {formattedTime}
            </p>
          </div>
        </div>

        {isTrainer && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(review)}
              disabled={isDeleting}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              onClick={handleDelete}
              loading={isDeleting}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h4 className="text-sm font-extrabold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-3 bg-violet-600 rounded-full"></span>
            Overall Progress Summary
          </h4>
          <p className="text-neutral-700 leading-relaxed text-sm bg-white/70 p-4 rounded-xl border border-indigo-100/30 whitespace-pre-wrap">
            {review.summary}
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-extrabold text-amber-600 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-3 bg-amber-500 rounded-full"></span>
            Areas to Focus & Improve
          </h4>
          <p className="text-neutral-700 leading-relaxed text-sm bg-amber-50/30 p-4 rounded-xl border border-amber-100/50 whitespace-pre-wrap">
            {review.improvements_needed}
          </p>
        </div>
      </div>
    </div>
  );
}
