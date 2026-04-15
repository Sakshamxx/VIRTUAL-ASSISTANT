import { useEffect, useState, createContext, useContext } from "react";
import { useLocation } from "wouter";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { useGetMe, User } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("jarvis_token");
  });
  const [user, setUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);

  const { data: meData, isLoading: meLoading, error } = useGetMe({
    query: {
      enabled: !!token,
      retry: false
    }
  });

  useEffect(() => {
    if (meData) {
      setUser(meData);
    }
  }, [meData]);

  useEffect(() => {
    if (error) {
      // Token might be invalid
      logout();
    }
  }, [error]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("jarvis_token", newToken);
    setToken(newToken);
    setUser(newUser);
    setLocation("/");
  };

  const logout = () => {
    localStorage.removeItem("jarvis_token");
    setToken(null);
    setUser(null);
    queryClient.clear();
    setLocation("/auth");
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading: !!token && meLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
