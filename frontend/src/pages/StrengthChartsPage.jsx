import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { progressApi } from "../api/progress";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/ui/Alert";
import { Spinner, PageLoader } from "../components/ui/Spinner";
import StrengthChart from "../components/progress/StrengthChart";
import ClientLayout from "../components/layout/ClientLayout";
import PageContainer from "../components/layout/PageContainer";

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
    <ClientLayout>
      <PageContainer variant="dashboard" className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link
            to="/client/dashboard"
            className="p-2 rounded-[var(--radius-md)] hover:bg-black/5 text-[var(--color-steel)] transition-colors -ml-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-base text-[var(--color-ink)]">Strength Analytics</h1>
            <p className="text-xs text-[var(--color-steel)]">Progressive overload tracking</p>
          </div>
        </div>
        {/* Hero */}
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-paper)] border border-[var(--color-border)] shadow-sm">
          <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrophyIcon className="w-5 h-5 text-[var(--color-signal)]" />
                <span className="text-[var(--color-steel)] text-xs font-bold uppercase tracking-wider">Strength Progression</span>
              </div>
              <h2 className="text-2xl text-[var(--color-ink)]">
                {selectedExercise?.name || "Select an Exercise"}
              </h2>
              <p className="text-[var(--color-steel)] text-sm mt-1 font-medium">
                Analyze your progressive overload. PRs are automatically detected.
              </p>
            </div>

            {pr && (
              <div className="flex-shrink-0 bg-black/5 rounded-[var(--radius-xl)] px-6 py-4 text-center border border-[var(--color-border)]">
                <p className="text-[var(--color-signal)] text-[10px] font-black uppercase tracking-widest mb-1">Personal Record</p>
                <p className="text-3xl font-extrabold text-[var(--color-ink)]">{pr.weight}{unit}</p>
                <p className="text-[var(--color-steel)] text-xs font-bold mt-1">{pr.reps} reps · {new Date(pr.date).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {exercises.length === 0 ? (
          /* Empty state */
          <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-[var(--color-paper)] border border-[var(--color-border)] text-[var(--color-ink)] rounded-[var(--radius-md)] flex items-center justify-center mx-auto mb-4">
              <DumbbellIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg text-[var(--color-ink)] mb-2">No exercise data yet</h3>
            <p className="text-[var(--color-steel)] max-w-sm mx-auto mb-6 text-sm leading-relaxed font-medium">
              You haven't completed any workouts with weight entries yet. Strength charts will appear here automatically once you log weights.
            </p>
            <Link to="/client/dashboard">
              <button className="px-5 py-2 text-sm font-bold text-white bg-[var(--color-ink)] hover:bg-[var(--color-ink)]/90 rounded-[var(--radius-md)] transition-all shadow-sm">
                Go to Dashboard
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Exercise Selector */}
            <div className="bg-[var(--color-paper)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm">
              <div className="flex-1 min-w-0">
                <label htmlFor="exercise-select" className="block text-xs font-bold text-[var(--color-steel)] uppercase tracking-wider mb-1.5">
                  Select Exercise to Track
                </label>
                <select
                  id="exercise-select"
                  className="w-full h-10 px-3 bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] text-sm font-semibold text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]/20 focus:border-[var(--color-ink)] transition-all disabled:opacity-60"
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
                <div className="flex-shrink-0 bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] px-4 py-3 text-center">
                  <span className="text-[10px] uppercase font-black text-[var(--color-steel)] tracking-widest block">Category</span>
                  <span className="text-sm font-extrabold text-[var(--color-ink)] capitalize">{selectedExercise.category}</span>
                </div>
              )}
            </div>

            {/* Chart Area */}
            {loadingChart ? (
              <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] h-80 flex items-center justify-center shadow-sm">
                <div className="flex flex-col items-center gap-3">
                  <Spinner />
                  <p className="text-sm text-[var(--color-steel)] font-bold">Loading chart data…</p>
                </div>
              </div>
            ) : (
              chartData && (
                <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden pt-4">
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
      </PageContainer>
    </ClientLayout>
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
