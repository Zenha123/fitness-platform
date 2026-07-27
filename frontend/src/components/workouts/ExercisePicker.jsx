import React, { useState, useEffect } from "react";
import { exercisesApi } from "../../api/exercises";
import { Spinner } from "../ui/Spinner";
import { Modal } from "../ui/Modal";
export default function ExercisePicker({ isOpen, onClose, onSelect }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    if (isOpen) {
      fetchExercises();
    }
  }, [isOpen]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const data = await exercisesApi.getExercises();
      setExercises(data);
    } catch (err) {
      console.error("Failed to load exercises for picker", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const categories = ["All", ...Array.from(new Set(exercises.map(e => e.category)))];

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || ex.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Exercise"
      maxWidth="max-w-2xl"
      stickyHeader={
        <div className="p-4">
          <div className="relative mb-3">
            <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search library..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]/20 focus:border-[var(--color-ink)] transition-all text-[var(--color-ink)]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-[var(--radius-md)] text-xs font-semibold whitespace-nowrap transition-colors border ${
                  activeCategory === cat
                    ? "bg-[var(--color-ink)] text-white border-[var(--color-ink)] shadow-sm"
                    : "bg-white border-[var(--color-border)] text-[var(--color-steel)] hover:bg-black/5 hover:text-[var(--color-ink)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      }
    >
      {/* Scrollable exercise list */}
      {loading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : filteredExercises.length === 0 ? (
        <div className="text-center py-10 text-[var(--color-steel)] font-medium">No exercises found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredExercises.map(ex => (
            <button
              key={ex.id}
              onClick={() => onSelect(ex)}
              className="text-left p-4 bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] hover:border-[var(--color-ink)] hover:shadow-sm transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-[var(--color-ink)] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-steel)] mb-1">
                {ex.category}
              </span>
              <span className="block text-[var(--color-ink)] truncate font-display uppercase tracking-wider">
                {ex.name}
              </span>
              {ex.notes && (
                <span className="block text-xs text-[var(--color-steel)] mt-1 truncate font-medium">
                  {ex.notes}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </Modal>
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
