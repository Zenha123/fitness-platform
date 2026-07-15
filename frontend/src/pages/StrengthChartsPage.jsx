import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { progressApi } from "../api/progress";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/ui/Alert";
import { Spinner, PageLoader } from "../components/ui/Spinner";
import StrengthChart from "../components/progress/StrengthChart";

export default function StrengthChartsPage() {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [chartData, setChartData] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState("");

  const unit = user?.weight_unit || "kg";

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoadingList(true);
      const exerciseList = await progressApi.getStrengthExercises();
      setExercises(exerciseList);
      if (exerciseList.length > 0) {
        setSelectedExerciseId(exerciseList[0].id);
      }
    } catch (err) {
      setError("Failed to load exercises logged in workouts.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (selectedExerciseId) {
      fetchChartData(selectedExerciseId);
    } else {
      setChartData(null);
    }
  }, [selectedExerciseId]);

  const fetchChartData = async (exerciseId) => {
    try {
      setLoadingChart(true);
      setError("");
      const data = await progressApi.getStrengthData({ exercise: exerciseId });
      setChartData(data);
    } catch (err) {
      setError("Failed to fetch strength logs.");
    } finally {
      setLoadingChart(false);
    }
  };

  if (loadingList) return <PageLoader message="Loading exercises list…" />;

  const selectedExercise = exercises.find((e) => e.id === selectedExerciseId);

  const pr = chartData?.pr;

  return (
    <div className="min-h-screen pb-20 relative overflow-x-hidden" style={{ background: "linear-gradient(135deg, #f5f7ff 0%, #eef2ff 50%, #e0e7ff 100%)" }}>
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40rem] h-[40rem] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none animate-bloom" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[35rem] h-[35rem] rounded-full bg-violet-500/10 blur-[80px] pointer-events-none animate-bloom" style={{ animationDelay: "200ms" }} />
      {/* ── Header ── */}
      <header className="bg-white/40 backdrop-blur-xl border-b border-white/20 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <Link
            to="/client/dashboard"
            className="p-2 rounded-xl hover:bg-neutral-100 text-neutral-500 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-extrabold text-base text-neutral-900">Strength Analytics</h1>
            <p className="text-xs text-neutral-400">Progressive overload tracking</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl"
          style={{ background: "linear-gradient(135deg, #312e81 0%, #4f46e5 60%, #7c3aed 100%)" }}
        >
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #a5b4fc 0%, transparent 70%)" }} />
          <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrophyIcon className="w-5 h-5 text-yellow-400" />
                <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Strength Progression</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">
                {selectedExercise?.name || "Select an Exercise"}
              </h2>
              <p className="text-indigo-200 text-sm mt-1">
                Analyze your progressive overload. PRs are automatically detected.
              </p>
            </div>

            {pr && (
              <div className="flex-shrink-0 bg-white/10 backdrop-blur rounded-2xl px-6 py-4 text-center border border-white/20">
                <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-1">Personal Record</p>
                <p className="text-3xl font-extrabold text-white">{pr.weight}{unit}</p>
                <p className="text-indigo-300 text-xs mt-1">{pr.reps} reps · {new Date(pr.date).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {exercises.length === 0 ? (
          /* Empty state */
          <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <DumbbellIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">No exercise data yet</h3>
            <p className="text-neutral-500 max-w-sm mx-auto mb-6 text-sm leading-relaxed">
              You haven't completed any workouts with weight entries yet. Strength charts will appear here automatically once you log weights.
            </p>
            <Link to="/client/dashboard">
              <button className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-200">
                Go to Dashboard
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Exercise Selector */}
            <div className="glass-panel tint-sky border-sky-100/50 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-md">
              <div className="flex-1 min-w-0">
                <label htmlFor="exercise-select" className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Select Exercise to Track
                </label>
                <select
                  id="exercise-select"
                  className="w-full h-10 px-3 bg-white/60 border border-neutral-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60"
                  value={selectedExerciseId}
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                  disabled={loadingChart}
                >
                  {exercises.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.category})
                    </option>
                  ))}
                </select>
              </div>

              {selectedExercise && (
                <div className="flex-shrink-0 bg-white/60 border border-indigo-100/50 rounded-xl px-4 py-3 text-center">
                  <span className="text-[10px] uppercase font-black text-indigo-500 tracking-widest block">Category</span>
                  <span className="text-sm font-extrabold text-indigo-700 capitalize">{selectedExercise.category}</span>
                </div>
              )}
            </div>

            {/* Chart Area */}
            {loadingChart ? (
              <div className="bg-white border border-neutral-200 rounded-2xl h-80 flex items-center justify-center shadow-sm">
                <div className="flex flex-col items-center gap-3">
                  <Spinner />
                  <p className="text-sm text-neutral-400">Loading chart data…</p>
                </div>
              </div>
            ) : (
              chartData && (
                <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
                  <StrengthChart
                    data={chartData.data}
                    pr={chartData.pr}
                    unit={unit}
                    exerciseName={chartData.exercise_name}
                  />
                </div>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function ArrowLeftIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

function TrophyIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h3v6a6 6 0 0012 0V6h3M3 6H1m2 0V4m18 2h2m-2 0V4M12 18v2m0 0h-3m3 0h3" />
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
