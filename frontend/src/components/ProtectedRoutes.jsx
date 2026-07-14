import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PageLoader } from "./ui/Spinner";

export function ProtectedRoute({ allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <PageLoader message="Loading your dashboard…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user.needs_password_change) {
    return <Navigate to="/change-password" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectPath = user.role === "trainer" ? "/trainer/dashboard" : "/client/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}

export function PublicRoute() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    if (user.needs_password_change) {
      return <Navigate to="/change-password" replace />;
    }
    const redirectPath = user.role === "trainer" ? "/trainer/dashboard" : "/client/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}

export function ChangePasswordRoute() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user.needs_password_change) {
    const redirectPath = user.role === "trainer" ? "/trainer/dashboard" : "/client/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}
