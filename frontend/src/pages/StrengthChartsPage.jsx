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

  if (loadingList) return <PageLoader message="Loading exercises list..." />;

  const selectedExercise = exercises.find((e) => e.id === selectedExerciseId);

  return (
    <div className="min-h-screen bg-neutral-50 page-enter pb-16">
      {/* Navigation Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/client/dashboard" className="text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors">
              ← Dashboard
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-sm font-bold text-neutral-900">Strength Analytics</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Intro */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
            Strength Progression
          </h1>
          <p className="text-neutral-500 mt-1">
            Analyze your progressive overload logs for exercises you have completed.
          </p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {exercises.length === 0 ? (
          <div className="card p-12 text-center border border-neutral-200">
            <div className="w-16 h-16 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">No exercise data recorded</h3>
            <p className="text-neutral-500 max-w-sm mx-auto mb-6">
              You haven't completed any workouts with weight entries yet. Strength charts will appear here automatically once you log weights.
            </p>
            <Link to="/client/dashboard">
              <button className="btn btn-primary btn-sm">Go to Dashboard</button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Exercise Selector Card */}
            <div className="card bg-white p-5 border border-neutral-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="w-full sm:max-w-md space-y-1">
                <label htmlFor="exercise-select" className="form-label">
                  Select Exercise to Track
                </label>
                <select
                  id="exercise-select"
                  className="form-input"
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
                <div className="bg-neutral-50 border border-neutral-200 px-4 py-2 rounded-xl text-center self-stretch sm:self-auto flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Category</span>
                  <span className="text-sm font-bold text-neutral-700 capitalize">{selectedExercise.category}</span>
                </div>
              )}
            </div>

            {/* Chart Area */}
            {loadingChart ? (
              <div className="card h-96 flex items-center justify-center border border-neutral-200 bg-white">
                <Spinner />
              </div>
            ) : (
              chartData && (
                <StrengthChart
                  data={chartData.data}
                  pr={chartData.pr}
                  unit={unit}
                  exerciseName={chartData.exercise_name}
                />
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}
