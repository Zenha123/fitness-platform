import React, { useState } from "react";
import AuthenticatedImage from "../ui/AuthenticatedImage";
import { Button } from "../ui/Button";

function getDateDifference(d1, d2) {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"}`;
  }
  
  const diffMonths = Math.floor(diffDays / 30.43);
  const remainingDays = Math.round(diffDays % 30.43);
  
  if (remainingDays === 0) {
    return `${diffMonths} month${diffMonths === 1 ? "" : "s"}`;
  }
  return `${diffMonths} month${diffMonths === 1 ? "" : "s"}, ${remainingDays} day${remainingDays === 1 ? "" : "s"}`;
}

export default function PhotoTimeline({ entries, unit = "kg" }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [compareMode, setCompareMode] = useState(false);

  const photoEntries = entries.filter((e) => e.has_photo);

  if (photoEntries.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50 p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-neutral-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
        </svg>
        <span className="text-sm font-semibold text-neutral-500">No progress photos uploaded yet</span>
        <span className="text-xs text-neutral-400 mt-1">Upload progress photos when adding weight entries.</span>
      </div>
    );
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 2) {
        // Keep the newest selection, remove the oldest one
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleCompare = () => {
    if (selectedIds.length === 2) {
      setCompareMode(true);
    }
  };

  const closeCompare = () => {
    setCompareMode(false);
  };

  // Find the selected entry objects
  const selectedEntries = photoEntries
    .filter((e) => selectedIds.includes(e.id))
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort chronologically: older first

  const photo1 = selectedEntries[0];
  const photo2 = selectedEntries[1];

  let weightDiff = null;
  let timeDiff = null;

  if (photo1 && photo2) {
    weightDiff = photo2.weight_display - photo1.weight_display;
    timeDiff = getDateDifference(photo1.date, photo2.date);
  }

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
        <div>
          <h3 className="font-bold text-neutral-900">Photo Journey</h3>
          <p className="text-xs text-neutral-400">
            {selectedIds.length} of 2 photos selected for side-by-side comparison
          </p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
            >
              Clear Selection
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            disabled={selectedIds.length !== 2}
            onClick={handleCompare}
          >
            Compare Selected
          </Button>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photoEntries.map((entry) => {
          const isSelected = selectedIds.includes(entry.id);
          return (
            <div
              key={entry.id}
              onClick={() => toggleSelect(entry.id)}
              className={`group cursor-pointer bg-white rounded-xl border overflow-hidden shadow-sm transition-all duration-200 relative ${
                isSelected
                  ? "border-violet-600 ring-2 ring-violet-100"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <div className="aspect-square w-full relative bg-neutral-50 overflow-hidden">
                <AuthenticatedImage
                  src={entry.photo_url}
                  alt={`Progress photo on ${entry.date}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Checkbox overlay */}
                <div className="absolute top-2 right-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                      isSelected
                        ? "bg-violet-600 border-violet-600 text-white"
                        : "bg-black/20 border-white/80 text-transparent"
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="p-3 text-center border-t border-neutral-100">
                <p className="text-xs font-bold text-neutral-800">
                  {new Date(entry.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-neutral-400 font-semibold mt-0.5">
                  {entry.weight_display} {unit}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compare Modal */}
      {compareMode && photo1 && photo2 && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div>
                <h3 className="font-extrabold text-neutral-900 text-lg">Side-by-Side Comparison</h3>
                <p className="text-xs text-neutral-400 font-semibold mt-0.5">
                  Time difference: <span className="text-violet-600 font-bold">{timeDiff}</span>
                </p>
              </div>
              <button
                onClick={closeCompare}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Diff card */}
              <div className="bg-violet-50 border border-violet-100 p-4 rounded-xl flex items-center justify-around text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">Before</span>
                  <p className="text-sm font-extrabold text-neutral-800 mt-0.5">
                    {new Date(photo1.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <p className="text-lg font-black text-neutral-900">{photo1.weight_display} {unit}</p>
                </div>
                <div className="w-px h-10 bg-violet-200"></div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">Weight Diff</span>
                  <p className={`text-xl font-black mt-1 ${weightDiff < 0 ? "text-emerald-600" : weightDiff > 0 ? "text-rose-600" : "text-neutral-500"}`}>
                    {weightDiff > 0 ? "+" : ""}{weightDiff.toFixed(1)} {unit}
                  </p>
                </div>
                <div className="w-px h-10 bg-violet-200"></div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">After</span>
                  <p className="text-sm font-extrabold text-neutral-800 mt-0.5">
                    {new Date(photo2.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <p className="text-lg font-black text-neutral-900">{photo2.weight_display} {unit}</p>
                </div>
              </div>

              {/* Side-by-Side Images */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="aspect-[3/4] sm:aspect-square w-full rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 shadow-sm relative">
                    <AuthenticatedImage
                      src={photo1.photo_url}
                      alt="Before progress photo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-bold">
                      Before
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-neutral-800">
                      {new Date(photo1.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                    <p className="text-xs text-neutral-400 font-semibold">{photo1.weight_display} {unit}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="aspect-[3/4] sm:aspect-square w-full rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 shadow-sm relative">
                    <AuthenticatedImage
                      src={photo2.photo_url}
                      alt="After progress photo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-violet-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                      After
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-neutral-800">
                      {new Date(photo2.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                    <p className="text-xs text-neutral-400 font-semibold">{photo2.weight_display} {unit}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex justify-end">
              <Button variant="outline" size="sm" onClick={closeCompare}>
                Close Comparison
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
