import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import WorkoutCalendar from "../components/workouts/WorkoutCalendar";
import { workoutsApi } from "../api/workouts";
import { Spinner } from "../components/ui/Spinner";

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  
  const [todayPlan, setTodayPlan] = useState(null);
  const [todayLog, setTodayLog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayWorkout();
  }, []);

  const fetchTodayWorkout = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const monthStr = today.substring(0, 7);
      
      const [plansData, logsData] = await Promise.all([
        workoutsApi.getPlans({ month: monthStr }),
        workoutsApi.getLogs({ month: monthStr })
      ]);
      
      const plan = plansData.find(p => p.scheduled_date === today);
      const log = logsData.find(l => l.date === today);
      
      if (plan) setTodayPlan(plan);
      if (log) setTodayLog(log);
    } catch (error) {
      console.error("Failed to fetch today's workout", error);
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "C";

  return (
    <div className="min-h-screen bg-neutral-50 page-enter">
      {/* Top navigation bar */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.268a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-bold text-lg text-neutral-900 tracking-tight">FitCoach</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right mr-1">
              <p className="text-sm font-semibold text-neutral-900">{user?.name}</p>
              <p className="text-xs text-neutral-400">Client</p>
            </div>
            <div className="avatar avatar-md bg-orange-100 text-orange-700">{initials}</div>
            <Button variant="ghost" size="sm" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
            Hey, {user?.name?.split(" ")[0]}! 💪
          </h1>
          <p className="text-neutral-500 mt-1">
            Your workouts, progress, and coaching notes live here.
          </p>
        </div>

        {/* Today's Workout Hero */}
        <div className="card bg-white border border-neutral-200 overflow-hidden">
          <div className="bg-neutral-900 px-6 py-4 flex items-center justify-between">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Today's Workout
            </h2>
            <span className="text-neutral-400 text-sm font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="py-8 flex justify-center"><Spinner /></div>
            ) : todayLog?.completed ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Great job today!</h3>
                <p className="text-neutral-500 mb-6">You've completed your workout.</p>
                <Link to={`/client/logs/${todayLog.id}`}>
                  <Button variant="outline">View Log Details</Button>
                </Link>
              </div>
            ) : todayPlan ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-1">{todayPlan.title}</h3>
                  <p className="text-neutral-500 mb-2">{todayPlan.exercise_count || todayPlan.exercises?.length || 0} exercises assigned</p>
                </div>
                <Link to={`/client/log-workout?planId=${todayPlan.id}`}>
                  <Button variant="primary" className="w-full sm:w-auto">Start Workout</Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Rest Day</h3>
                <p className="text-neutral-500 mb-6">You have no scheduled workout for today.</p>
                <Link to={`/client/log-workout`}>
                  <Button variant="outline">Log Ad-hoc Workout</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links / Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Weight & Photo Card */}
          <Link to="/client/progress" className="card hover:border-violet-300 hover:shadow-md transition-all duration-200 p-6 bg-white border border-neutral-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="font-extrabold text-neutral-900 text-base mb-1">Weight & Photo Journey</h3>
              <p className="text-xs text-neutral-400 font-semibold leading-relaxed">
                Log your body weight and upload bi-weekly progress photos to track physical transformation.
              </p>
            </div>
            <span className="text-violet-600 text-xs font-bold mt-4 inline-flex items-center gap-1">
              View Journey →
            </span>
          </Link>

          {/* Strength Charts Card */}
          <Link to="/client/strength" className="card hover:border-violet-300 hover:shadow-md transition-all duration-200 p-6 bg-white border border-neutral-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-extrabold text-neutral-900 text-base mb-1">Strength Analytics</h3>
              <p className="text-xs text-neutral-400 font-semibold leading-relaxed">
                Analyze auto-generated progress charts for weights lifted across logged exercises.
              </p>
            </div>
            <span className="text-orange-500 text-xs font-bold mt-4 inline-flex items-center gap-1">
              View Analytics →
            </span>
          </Link>

          {/* Coach Notes Card */}
          <Link to="/client/reviews" className="card hover:border-violet-300 hover:shadow-md transition-all duration-200 p-6 bg-white border border-neutral-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-extrabold text-neutral-900 text-base mb-1">Coach Reviews</h3>
              <p className="text-xs text-neutral-400 font-semibold leading-relaxed">
                Read review notes, progress reports, and focal correction comments posted by your coach.
              </p>
            </div>
            <span className="text-emerald-600 text-xs font-bold mt-4 inline-flex items-center gap-1">
              Read Notes →
            </span>
          </Link>
        </div>

        {/* Calendar Section */}
        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Attendance & Schedule</h2>
          <WorkoutCalendar clientId={user.id} />
        </div>
      </main>
    </div>
  );
}
