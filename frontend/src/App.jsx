import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, PublicRoute, ChangePasswordRoute } from "./components/ProtectedRoutes";
import LoginPage from "./pages/LoginPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import TrainerDashboard from "./pages/TrainerDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import ClientProfileShell from "./pages/ClientProfileShell";
import ExerciseLibraryPage from "./pages/ExerciseLibraryPage";
import ScheduleWorkoutPage from "./pages/ScheduleWorkoutPage";
import LogWorkoutPage from "./pages/LogWorkoutPage";
import ViewLogPage from "./pages/ViewLogPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes: Redirects logged in users to their dashboards */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Forced Password Reset Route */}
          <Route element={<ChangePasswordRoute />}>
            <Route path="/change-password" element={<ChangePasswordPage />} />
          </Route>

          {/* Protected Trainer Routes */}
          <Route element={<ProtectedRoute allowedRoles={["trainer"]} />}>
            <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
            <Route path="/trainer/clients/:id" element={<ClientProfileShell />} />
            <Route path="/trainer/exercises" element={<ExerciseLibraryPage />} />
            <Route path="/trainer/schedule" element={<ScheduleWorkoutPage />} />
            <Route path="/trainer/schedule/:planId" element={<ScheduleWorkoutPage />} />
            <Route path="/trainer/logs/:logId" element={<ViewLogPage />} />
          </Route>

          {/* Protected Client Routes */}
          <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/client/log-workout" element={<LogWorkoutPage />} />
            <Route path="/client/logs/:logId" element={<ViewLogPage />} />
          </Route>

          {/* Root redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}