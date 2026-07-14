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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (exerciseToEdit) {
        setName(exerciseToEdit.name);
        setCategory(exerciseToEdit.category);
        setNotes(exerciseToEdit.notes || "");
      } else {
        setName("");
        setCategory(CATEGORIES[0]);
        setNotes("");
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
      const data = { name, category, notes };
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
    <div className="modal-overlay">
      <div className="modal-panel max-w-lg">
        <div className="modal-header border-b border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-900">
            {exerciseToEdit ? "Edit Exercise" : "Add New Exercise"}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          <form id="exercise-form" onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert variant="danger">{error}</Alert>}

            <Input
              id="exercise-name"
              label="Exercise Name"
              placeholder="e.g., Barbell Back Squat"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />

            <div>
              <label htmlFor="exercise-category" className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Category
              </label>
              <select
                id="exercise-category"
                className="w-full h-11 px-3 py-2 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
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
              <label htmlFor="exercise-notes" className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Trainer Notes / Form Cues (Optional)
              </label>
              <textarea
                id="exercise-notes"
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm resize-none h-24"
                placeholder="e.g., Keep chest up, drive through heels..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </form>
        </div>

        <div className="modal-footer bg-neutral-50 border-t border-neutral-100">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button form="exercise-form" type="submit" variant="primary" loading={loading}>
            {exerciseToEdit ? "Save Changes" : "Create Exercise"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function XIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
