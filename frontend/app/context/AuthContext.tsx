"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { apiFetch } from "@/lib/api";

type Role = "admin" | "user";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

interface SessionPayload {
  id: number;
  name: string;
  email: string;
  is_admin?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (session: SessionPayload) => void;
  logout: () => void;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = [
  "40770471@live.napier.ac.uk",
  "40770470@live.napier.ac.uk",
  "40735762@live.napier.ac.uk",
  "40736676@live.napier.ac.uk",
  "40730587@live.napier.ac.uk",
];

function toAuthUser(data: SessionPayload): User {
  const emailLower = data.email.toLowerCase().trim();
  const role: Role =
    data.is_admin || ADMIN_EMAILS.includes(emailLower) ? "admin" : "user";
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role,
  };
}

const STORAGE_KEY = "napier_skillswap_user";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const syncSession = async () => {
      let parsed: SessionPayload | null = null;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          parsed = JSON.parse(raw) as SessionPayload;
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }

      try {
        const res = await apiFetch("/users/me");
        if (cancelled) return;

        if (res.ok) {
          const data = (await res.json()) as SessionPayload;
          const next = toAuthUser(data);
          setUser(next);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          } catch {
            /* ignore */
          }
        } else {
          if (parsed) {
            try {
              localStorage.removeItem(STORAGE_KEY);
            } catch {
              /* ignore */
            }
          }
          setUser(null);
        }
      } catch {
        if (cancelled) return;
        if (
          parsed &&
          typeof parsed.id === "number" &&
          typeof parsed.name === "string" &&
          typeof parsed.email === "string"
        ) {
          setUser(toAuthUser(parsed));
        } else {
          setUser(null);
        }
      }
      if (!cancelled) setLoading(false);
    };

    syncSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((session: SessionPayload) => {
    const next = toAuthUser(session);
    setUser(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      /* ignore */
    }
  }, []);

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAdmin, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
