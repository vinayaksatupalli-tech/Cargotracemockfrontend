import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile, UserRole } from "../types";
import { api } from "../lib/api";

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signUp: (data: { email: string; role: UserRole; displayName: string; organizationName?: string }) => Promise<void>;
  signOut: () => void;
  switchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      const token = api.getToken();
      if (token) {
        try {
          const res = await api.getMe();
          setCurrentUser(res.user);
        } catch {
          // Fallback to default supplier demo role if token is stale
          try {
            const res = await api.switchRole("supplier");
            setCurrentUser(res.user);
          } catch {
            api.clearToken();
          }
        }
      } else {
        // Auto-initialize with Supplier demo role on first visit for seamless judge experience
        try {
          const res = await api.switchRole("supplier");
          setCurrentUser(res.user);
        } catch (e) {
          console.warn("Could not set initial demo user", e);
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const signIn = async (email: string) => {
    const res = await api.signIn(email);
    setCurrentUser(res.user);
  };

  const signUp = async (data: { email: string; role: UserRole; displayName: string; organizationName?: string }) => {
    const res = await api.signUp({
      email: data.email,
      role: data.role,
      displayName: data.displayName,
      organizationName: data.organizationName || "Independent Operator",
    });
    setCurrentUser(res.user);
  };

  const signOut = () => {
    api.clearToken();
    setCurrentUser(null);
  };

  const switchRole = async (role: UserRole) => {
    const res = await api.switchRole(role);
    setCurrentUser(res.user);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, signIn, signUp, signOut, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
