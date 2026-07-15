import React, { createContext, useContext, useState, useEffect } from "react";
import axiosClient, { setTokens, clearTokens, getAccessToken } from "../api/axiosClient";

const AuthContext = createContext(null);

const USER_KEY = "fcp_user";

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load: check if token and user data exist
    const token = getAccessToken();
    const storedUser = localStorage.getItem(USER_KEY);

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Fetch fresh profile to get server-computed fields like trainer_name
        axiosClient.get('/auth/profile/').then(res => {
          const enriched = { ...parsedUser, ...res.data };
          localStorage.setItem(USER_KEY, JSON.stringify(enriched));
          setUser(enriched);
        }).catch(() => {/* silently ignore if offline */});
      } catch (e) {
        // Fallback: parse from JWT token
        const decoded = parseJwt(token);
        if (decoded) {
          setUser({
            id: decoded.user_id,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role,
            needs_password_change: decoded.needs_password_change,
            weight_unit: decoded.weight_unit || 'kg',
          });
        }
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axiosClient.post("/auth/login/", { email, password });
      const { access, refresh, user: userData } = response.data;
      
      setTokens({ access, refresh });
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);
      
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearTokens();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const response = await axiosClient.post("/auth/change-password/", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      
      // Upon successful password change, update user state
      if (user) {
        const updatedUser = { ...user, needs_password_change: false };
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updatePreferences = async (preferenceData) => {
    try {
      const response = await axiosClient.patch('/auth/profile/', preferenceData);
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await axiosClient.get('/auth/profile/');
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    changePassword,
    updatePreferences,
    refreshProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
