import React, { useState, useEffect } from "react";
import TrainerLayout from "../components/layout/TrainerLayout";
import PageContainer from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { Alert } from "../components/ui/Alert";
import ExerciseModal from "../components/exercises/ExerciseModal";
import { exercisesApi } from "../api/exercises";

const CATEGORIES = [
  "All", "Chest", "Back", "Shoulders", "Biceps", "Triceps",
  "Legs", "Glutes", "Core", "Cardio", "Full Body",
  "Mobility", "Stretching", "Custom"
];

const CATEGORY_COLORS = {
  "Chest":     { bg: "bg-black/5", text: "text-[var(--color-steel)]", border: "border-[var(--color-border)]" },
  "Back":      { bg: "bg-black/5", text: "text-[var(--color-steel)]", border: "border-[var(--color-border)]" },
  "Shoulders": { bg: "bg-black/5", text: "text-[var(--color-steel)]", border: "border-[var(--color-border)]" },
  "Biceps":    { bg: "bg-black/5", text: "text-[var(--color-steel)]", border: "border-[var(--color-border)]" },
  "Triceps":   { bg: "bg-black/5", text: "text-[var(--color-steel)]", border: "border-[var(--color-border)]" },
  "Legs":      { bg: "bg-black/5", text: "text-[var(--color-steel)]", border: "border-[var(--color-border)]" },
  "Glutes":    { bg: "bg-black/5", text: "text-[var(--color-steel)]", border: "border-[var(--color-border)]" },
  "Core":      { bg: "bg-black/5", text: "text-[var(--color-steel)]", border: "border-[var(--color-border)]" },
  "Cardio":    { bg: "bg-black/5", text: "text-[var(--color-steel)]", border: "border-[var(--color-border)]" },
  "Full Body": { bg: "bg-black/5", text: "text-[var(--color-steel)]", border: "border-[var(--color-border)]" },
  "Mobility":  { bg: "bg-black/5", text: "text-[var(--color-steel)]", border: "border-[var(--color-border)]" },
  "Stretching":{ bg: "bg-black/5", text: "text-[var(--color-steel)]", border: "border-[var(--color-border)]" },
  "Custom":    { bg: "bg-black/5", text: "text-[var(--color-steel)]", border: "border-[var(--color-border)]" },
};

function getCategoryStyle(category) {
  return CATEGORY_COLORS[category] || { bg: "bg-black/5", text: "text-[var(--color-steel)]", border: "border-[var(--color-border)]" };
}

export default function ExerciseLibraryPage() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const data = await exercisesApi.getExercises();
      setExercises(data);
    } catch (err) {
      setError("Failed to load exercises. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExercise = (savedExercise, isEdit) => {
    if (isEdit) {
      setExercises(exercises.map(ex => ex.id === savedExercise.id ? savedExercise : ex));
    } else {
      setExercises([...exercises, savedExercise].sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exercise? It will be removed from your library.")) return;
    try {
      await exercisesApi.deleteExercise(id);
      setExercises(exercises.filter(ex => ex.id !== id));
    } catch (err) {
      alert("Failed to delete exercise.");
    }
  };

  const openAddModal = () => {
    setExerciseToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (exercise) => {
    setExerciseToEdit(exercise);
    setIsModalOpen(true);
  };

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || ex.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const withVideo = filteredExercises.filter(e => e.demo_link).length;

  return (
    <TrainerLayout>
      <PageContainer variant="dashboard">
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-[var(--radius-2xl)] mb-8 bg-[var(--color-ink)]">
        <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-[var(--radius-md)] bg-white/20 backdrop-blur flex items-center justify-center">
                <DumbbellIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/70 text-sm font-semibold uppercase tracking-wider">Exercise Library</span>
            </div>
            <h1 className="text-2xl sm:text-3xl text-white leading-tight">
              Your Movement Database
            </h1>
            <p className="text-white/70 mt-1 text-sm max-w-md font-medium">
              Build and manage your private collection of exercises. Use them to create powerful workout plans for your clients.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-[var(--radius-md)] px-3 py-1.5 border border-white/10">
                <span className="text-white font-extrabold text-lg">{exercises.length}</span>
                <span className="text-white/70 text-xs">Total Exercises</span>
              </div>
              {withVideo > 0 && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-[var(--radius-md)] px-3 py-1.5 border border-white/10">
                  <span className="text-white font-extrabold text-lg">{withVideo}</span>
                  <span className="text-white/70 text-xs">With Video Demo</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-[var(--color-signal)] text-white font-bold rounded-[var(--radius-md)] shadow-sm hover:bg-[var(--color-signal)]/90 transition-all hover:-translate-y-0.5 text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Add Exercise
          </button>
        </div>
      </div>

      {/* ── Search + Filter Bar ── */}
      <div className="bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-sm mb-6 overflow-hidden">
        <div className="px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 border-b border-[var(--color-border)]">
          <div className="relative flex-1">
            <SearchIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search exercises by name…"
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-[var(--color-border)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]/20 focus:border-[var(--color-ink)] transition-all text-[var(--color-ink)]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-xs font-bold text-[var(--color-steel)] uppercase tracking-widest whitespace-nowrap">
            {filteredExercises.length} {filteredExercises.length === 1 ? "Result" : "Results"}
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-4 py-3 flex overflow-x-auto gap-2" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-[var(--radius-md)] text-xs font-bold whitespace-nowrap transition-all border ${
                activeCategory === cat
                  ? "bg-[var(--color-ink)] text-white border-[var(--color-ink)] shadow-sm scale-105"
                  : "bg-black/5 text-[var(--color-steel)] border-[var(--color-border)] hover:bg-black/10 hover:text-[var(--color-ink)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && <Alert variant="danger" className="mb-6">{error}</Alert>}

      {/* ── Content ── */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : exercises.length === 0 ? (
        /* Empty state */
        <div className="bg-black/5 border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-xl)] flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="w-20 h-20 rounded-[var(--radius-md)] bg-white border border-[var(--color-border)] flex items-center justify-center mb-5 shadow-sm">
            <DumbbellIcon className="w-10 h-10 text-[var(--color-steel)]" />
          </div>
          <h3 className="text-xl text-[var(--color-ink)] mb-2">Your library is empty</h3>
          <p className="text-sm text-[var(--color-steel)] max-w-sm leading-relaxed mb-6 font-medium">
            Start building your private database of exercises. You'll use these to construct powerful workout plans for your clients.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-ink)] text-white text-sm font-bold rounded-[var(--radius-md)] hover:bg-[var(--color-ink)]/90 transition-all shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Add your first exercise
          </button>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-400">
            <SearchIcon className="w-8 h-8" />
          </div>
          <p className="font-semibold text-neutral-700">No exercises match your filters</p>
          <p className="text-sm text-neutral-400 mt-1 mb-5">Try changing the category or search term.</p>
          <button
            onClick={() => { setSearch(""); setActiveCategory("All"); }}
            className="text-indigo-600 text-sm font-bold hover:text-indigo-700 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise) => {
            const catStyle = getCategoryStyle(exercise.category);
            return (
              <div
                key={exercise.id}
                className="group bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-sm hover-lift overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <span className={`inline-block px-2 py-0.5 rounded-[var(--radius-sm)] text-[10px] uppercase font-black tracking-widest border ${catStyle.bg} ${catStyle.text} ${catStyle.border} mb-2`}>
                        {exercise.category}
                      </span>
                      <h3 className="text-[var(--color-ink)] text-base leading-tight truncate">
                        {exercise.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => openEditModal(exercise)}
                        className="p-1.5 text-[var(--color-steel)] hover:text-[var(--color-ink)] transition-colors rounded-[var(--radius-sm)] hover:bg-black/5"
                        title="Edit Exercise"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exercise.id)}
                        className="p-1.5 text-[var(--color-steel)] hover:text-rose-600 transition-colors rounded-[var(--radius-sm)] hover:bg-rose-50"
                        title="Delete Exercise"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {exercise.notes && (
                    <p className="text-xs text-[var(--color-steel)] font-medium line-clamp-2 leading-relaxed mb-3">
                      {exercise.notes}
                    </p>
                  )}

                  {exercise.demo_link && (
                    <div className="mt-2 pt-3 border-t border-[var(--color-border)]">
                      <a
                        href={exercise.demo_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[var(--color-ink)] hover:bg-[var(--color-ink)]/90 px-3 py-1.5 rounded-[var(--radius-md)] transition-all shadow-sm"
                      >
                        <VideoIcon className="w-3.5 h-3.5" />
                        Watch Demo
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ExerciseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExercise}
        exerciseToEdit={exerciseToEdit}
      />
      </PageContainer>
    </TrainerLayout>
  );
}

function PlusIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SearchIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function DumbbellIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v18M18 3v18M2 9h4v6H2zM18 9h4v6h-4zM6 12h12" />
    </svg>
  );
}

function EditIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
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
