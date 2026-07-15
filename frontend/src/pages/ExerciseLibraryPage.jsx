import React, { useState, useEffect } from "react";
import TrainerLayout from "../components/layout/TrainerLayout";
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
  "Chest":     { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200" },
  "Back":      { bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200"  },
  "Shoulders": { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200" },
  "Biceps":    { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200" },
  "Triceps":   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200" },
  "Legs":      { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "Glutes":    { bg: "bg-pink-50",    text: "text-pink-700",    border: "border-pink-200" },
  "Core":      { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200" },
  "Cardio":    { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200" },
  "Full Body": { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200" },
  "Mobility":  { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200" },
  "Stretching":{ bg: "bg-cyan-50",    text: "text-cyan-700",    border: "border-cyan-200" },
  "Custom":    { bg: "bg-neutral-100",text: "text-neutral-700", border: "border-neutral-200" },
};

function getCategoryStyle(category) {
  return CATEGORY_COLORS[category] || { bg: "bg-neutral-100", text: "text-neutral-700", border: "border-neutral-200" };
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
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-2xl mb-8"
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #4338ca 100%)",
        }}
      >
        {/* Ambient blobs */}
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #a78bfa 0%, transparent 70%)" }} />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #818cf8 0%, transparent 70%)" }} />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <DumbbellIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/70 text-sm font-semibold uppercase tracking-wider">Exercise Library</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Your Movement Database
            </h1>
            <p className="text-indigo-200 mt-1 text-sm max-w-md">
              Build and manage your private collection of exercises. Use them to create powerful workout plans for your clients.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-xl px-3 py-1.5">
                <span className="text-white font-extrabold text-lg">{exercises.length}</span>
                <span className="text-indigo-200 text-xs">Total Exercises</span>
              </div>
              {withVideo > 0 && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-xl px-3 py-1.5">
                  <span className="text-white font-extrabold text-lg">{withVideo}</span>
                  <span className="text-indigo-200 text-xs">With Video Demo</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-white text-indigo-700 font-bold rounded-xl shadow-lg hover:bg-indigo-50 transition-all hover:-translate-y-0.5 text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Add Exercise
          </button>
        </div>
      </div>

      {/* ── Search + Filter Bar ── */}
      <div className="glass-panel tint-sky border-sky-100/50 mb-6 overflow-hidden">
        <div className="px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 border-b border-sky-100/50">
          <div className="relative flex-1">
            <SearchIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search exercises by name…"
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
            {filteredExercises.length} {filteredExercises.length === 1 ? "Result" : "Results"}
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-4 py-3 flex overflow-x-auto gap-2" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
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
        <div className="bg-white border-2 border-dashed border-neutral-200 rounded-2xl flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mb-5 shadow-inner">
            <DumbbellIcon className="w-10 h-10 text-violet-400" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 mb-2">Your library is empty</h3>
          <p className="text-sm text-neutral-500 max-w-sm leading-relaxed mb-6">
            Start building your private database of exercises. You'll use these to construct powerful workout plans for your clients.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
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
                className="group glass-panel tint-violet border-indigo-150/30 hover-lift overflow-hidden"
              >

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] uppercase font-black tracking-widest border ${catStyle.bg} ${catStyle.text} ${catStyle.border} mb-2`}>
                        {exercise.category}
                      </span>
                      <h3 className="font-bold text-neutral-900 text-base leading-tight truncate">
                        {exercise.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => openEditModal(exercise)}
                        className="p-1.5 text-neutral-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                        title="Edit Exercise"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exercise.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
                        title="Delete Exercise"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {exercise.notes && (
                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed mb-3">
                      {exercise.notes}
                    </p>
                  )}

                  {exercise.demo_link && (
                    <div className="mt-2 pt-3 border-t border-neutral-100">
                      <a
                        href={exercise.demo_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 px-3 py-1.5 rounded-lg transition-all shadow-sm shadow-indigo-200"
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
