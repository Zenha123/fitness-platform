import React, { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Alert } from "../ui/Alert";
import { Modal } from "../ui/Modal";
import { exercisesApi } from "../../api/exercises";

const CATEGORIES = [
  "Chest", "Back", "Shoulders", "Biceps", "Triceps",
  "Legs", "Glutes", "Core", "Cardio", "Full Body",
  "Mobility", "Stretching", "Custom"
];

export default function ExerciseModal({ isOpen, onClose, onSave, exerciseToEdit = null }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [notes, setNotes] = useState("");
  const [demoLink, setDemoLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (exerciseToEdit) {
        setName(exerciseToEdit.name);
        setCategory(exerciseToEdit.category);
        setNotes(exerciseToEdit.notes || "");
        setDemoLink(exerciseToEdit.demo_link || "");
      } else {
        setName("");
        setCategory(CATEGORIES[0]);
        setNotes("");
        setDemoLink("");
      }
      setError("");
    }
  }, [isOpen, exerciseToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Exercise name is required.");
      return;
    }

    setLoading(true);
    try {
      const data = { name, category, notes, demo_link: demoLink };
      let savedExercise;

      if (exerciseToEdit) {
        savedExercise = await exercisesApi.updateExercise(exerciseToEdit.id, data);
      } else {
        savedExercise = await exercisesApi.createExercise(data);
      }

      onSave(savedExercise, !!exerciseToEdit);
      onClose();
    } catch (err) {
      setError(err.response?.data?.name?.[0] || err.response?.data?.detail || "Failed to save exercise.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={exerciseToEdit ? "Edit Exercise" : "New Exercise"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="exercise-form" loading={loading} disabled={loading}>
            {exerciseToEdit ? "Save Changes" : "Create Exercise"}
          </Button>
        </>
      }
    >
      <form id="exercise-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="danger">{error}</Alert>}

        <div>
          <label htmlFor="exercise-name" className="block text-sm font-bold text-neutral-700 mb-1.5">
            Exercise Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="exercise-name"
            type="text"
            placeholder="e.g., Barbell Back Squat"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
            className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-[var(--radius-md)] text-sm text-[var(--color-ink)] font-medium placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)]/20 focus:border-[var(--color-signal)] transition-all"
          />
        </div>

        <div>
          <label htmlFor="exercise-category" className="block text-sm font-bold text-neutral-700 mb-1.5">
            Category <span className="text-rose-500">*</span>
          </label>
          <select
            id="exercise-category"
            className="w-full h-11 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-[var(--radius-md)] text-[var(--color-ink)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)]/20 focus:border-[var(--color-signal)] transition-all"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="exercise-notes" className="block text-sm font-bold text-neutral-700 mb-1.5">
            Trainer Notes / Form Cues
            <span className="ml-1.5 text-xs font-normal text-neutral-400">(Optional)</span>
          </label>
          <textarea
            id="exercise-notes"
            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-[var(--radius-md)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)]/20 focus:border-[var(--color-signal)] transition-all resize-none h-24"
            placeholder="e.g., Keep chest up, drive through heels, brace core throughout…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="exercise-demo-link" className="block text-sm font-bold text-neutral-700 mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <VideoIcon className="w-3.5 h-3.5 text-[var(--color-ink)]" />
              Demo Video URL
            </span>
            <span className="ml-1.5 text-xs font-normal text-neutral-400">(Optional)</span>
          </label>
          <input
            id="exercise-demo-link"
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={demoLink}
            onChange={(e) => setDemoLink(e.target.value)}
            className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-[var(--radius-md)] text-sm text-[var(--color-ink)] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)]/20 focus:border-[var(--color-signal)] transition-all"
          />
        </div>
      </form>
    </Modal>
  );
}

function XIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function VideoIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}
