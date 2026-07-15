import React, { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Alert } from "../ui/Alert";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg glass-panel-elevated p-1.5 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Gradient header stripe */}
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-t-2xl" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200/40">
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900">
              {exerciseToEdit ? "Edit Exercise" : "New Exercise"}
            </h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              {exerciseToEdit ? "Update this exercise in your library." : "Add a new exercise to your library."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-all"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
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
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label htmlFor="exercise-category" className="block text-sm font-bold text-neutral-700 mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="exercise-category"
                className="w-full h-11 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none h-24"
                placeholder="e.g., Keep chest up, drive through heels, brace core throughout…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="exercise-demo-link" className="block text-sm font-bold text-neutral-700 mb-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <VideoIcon className="w-3.5 h-3.5 text-indigo-500" />
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
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 rounded-xl transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            form="exercise-form"
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {exerciseToEdit ? "Save Changes" : "Create Exercise"}
          </button>
        </div>
      </div>
    </div>
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
