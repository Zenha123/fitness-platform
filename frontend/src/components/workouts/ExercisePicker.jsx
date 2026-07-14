import React, { useState, useEffect } from "react";
import { exercisesApi } from "../../api/exercises";
import { Spinner } from "../ui/Spinner";

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
    <div className="modal-overlay z-50 flex items-center justify-center">
      <div className="modal-panel max-w-3xl w-full h-[80vh] flex flex-col">
        {/* Header */}
        <div className="modal-header border-b border-neutral-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-neutral-900">Select Exercise</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex-shrink-0">
          <div className="relative mb-3">
            <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text"
              placeholder="Search library..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
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
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
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

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 bg-neutral-50/30">
          {loading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-10 text-neutral-500">No exercises found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredExercises.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => onSelect(ex)}
                  className="text-left p-4 bg-white border border-neutral-200 rounded-xl hover:border-violet-300 hover:shadow-sm transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-y-0 left-0 w-1 bg-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-violet-600 mb-1">
                    {ex.category}
                  </span>
                  <span className="block font-semibold text-neutral-900 truncate">
                    {ex.name}
                  </span>
                  {ex.notes && (
                    <span className="block text-xs text-neutral-500 mt-1 truncate">
                      {ex.notes}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
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

function SearchIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
