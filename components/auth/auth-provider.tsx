"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore(state => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
    // Removed storage listener to prevent infinite loops
    // Storage changes will be handled by individual components as needed
  }, [initializeAuth]);

  return <>{children}</>;
}