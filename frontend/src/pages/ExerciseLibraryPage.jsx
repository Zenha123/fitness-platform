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

  return (
    <TrainerLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
            Exercise Library
          </h1>
          <p className="text-neutral-500 mt-1 text-sm sm:text-base">
            Build and manage your private collection of exercises.
          </p>
        </div>
        <Button variant="primary" onClick={openAddModal}>
          <PlusIcon className="w-4 h-4" />
          Add Exercise
        </Button>
      </div>

      <div className="card mb-8">
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text"
              placeholder="Search exercises by name..."
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-sm text-neutral-500 font-medium whitespace-nowrap">
            {filteredExercises.length} {filteredExercises.length === 1 ? 'Exercise' : 'Exercises'}
          </div>
        </div>
        <div className="bg-neutral-50/50 px-4 py-3 flex overflow-x-auto hide-scrollbar gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat 
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && <Alert variant="danger" className="mb-6">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : exercises.length === 0 ? (
        <div className="card card-elevated">
          <div className="card-body-lg flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-5">
              <DumbbellIcon className="w-8 h-8 text-violet-400" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">
              Your library is empty
            </h3>
            <p className="text-sm text-neutral-500 max-w-sm leading-relaxed mb-6">
              Start building your private database of exercises. You'll use these to construct workout plans for your clients later.
            </p>
            <Button variant="outline" onClick={openAddModal}>
              Add your first exercise
            </Button>
          </div>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-500">No exercises match your search filters.</p>
          <Button variant="ghost" className="mt-4" onClick={() => { setSearch(""); setActiveCategory("All"); }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise) => (
            <div key={exercise.id} className="card hover:shadow-md transition-shadow group">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-violet-50 text-violet-700 mb-2">
                      {exercise.category}
                    </span>
                    <h3 className="font-bold text-neutral-900 text-base leading-tight">
                      {exercise.name}
                    </h3>
                  </div>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditModal(exercise)}
                      className="p-1.5 text-neutral-400 hover:text-violet-600 transition-colors rounded hover:bg-violet-50"
                      title="Edit Exercise"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(exercise.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors rounded hover:bg-rose-50"
                      title="Delete Exercise"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {exercise.notes && (
                  <p className="text-sm text-neutral-500 line-clamp-2 mt-2 leading-relaxed">
                    {exercise.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
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
