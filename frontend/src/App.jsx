import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, PublicRoute, ChangePasswordRoute } from "./components/ProtectedRoutes";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import TrainerDashboard from "./pages/TrainerDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import ClientProfileShell from "./pages/ClientProfileShell";
import ExerciseLibraryPage from "./pages/ExerciseLibraryPage";
import ScheduleWorkoutPage from "./pages/ScheduleWorkoutPage";
import LogWorkoutPage from "./pages/LogWorkoutPage";
import ViewLogPage from "./pages/ViewLogPage";
import WeightJourneyPage from "./pages/WeightJourneyPage";
import StrengthChartsPage from "./pages/StrengthChartsPage";
import ReviewsFeedPage from "./pages/ReviewsFeedPage";

import TrainerReportsPage from "./pages/TrainerReportsPage";
import PublicBookingPage from "./pages/PublicBookingPage";
import BookingSuccessPage from "./pages/BookingSuccessPage";
import IntakeFormPage from "./pages/IntakeFormPage";
import TrainerAvailabilityPage from "./pages/TrainerAvailabilityPage";
import TrainerBookingsPage from "./pages/TrainerBookingsPage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import PortfolioPage from "./pages/PortfolioPage";
import ServicesPage from "./pages/ServicesPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Phase 1 marketing / sitemap pages (public, no auth required) */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/results" element={<Navigate to="/portfolio" replace />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services-pricing" element={<Navigate to="/services" replace />} />
          <Route path="/pricing" element={<Navigate to="/services" replace />} />

          {/* Booking flows (public) — coaching & consultation */}
          <Route path="/book" element={<PublicBookingPage />} />
          <Route path="/book/:serviceType" element={<PublicBookingPage />} />
          <Route path="/booking/success/:bookingId" element={<BookingSuccessPage />} />
          <Route path="/intake/:token" element={<IntakeFormPage />} />
          {/* Public Auth Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Forced Password Reset Route */}
          <Route element={<ChangePasswordRoute />}>
            <Route path="/change-password" element={<ChangePasswordPage />} />
          </Route>

          {/* Protected Trainer Routes */}
          <Route element={<ProtectedRoute allowedRoles={["trainer"]} />}>
            <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
            <Route path="/trainer/reports" element={<TrainerReportsPage />} />
            <Route path="/trainer/availability" element={<TrainerAvailabilityPage />} />
            <Route path="/trainer/bookings" element={<TrainerBookingsPage />} />
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
            <Route path="/client/progress" element={<WeightJourneyPage />} />
            <Route path="/client/strength" element={<StrengthChartsPage />} />
            <Route path="/client/reviews" element={<ReviewsFeedPage />} />
          </Route>

          {/* Unknown paths → Home (marketing entry) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
