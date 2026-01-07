import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

/* ---------------------------------------------
   Types
--------------------------------------------- */
export interface User {
  id: string;
  name: string;
  email: string;
  storageUsed: number;
  storageLimit: number;
  isGuest: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loginAsGuest: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
}

/* ---------------------------------------------
   Context
--------------------------------------------- */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ---------------------------------------------
   API CONFIG
--------------------------------------------- */
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LOGIN_URL = `${API_BASE}/loginWithEmail`;
const SIGNUP_URL = `${API_BASE}/auth/signup`;

/* ---------------------------------------------
   Guest User
--------------------------------------------- */
const GUEST_USER: User = {
  id: "guest",
  name: "Guest User",
  email: "guest@vault.app",
  storageUsed: 0,
  storageLimit: 100 * 1024 * 1024,
  isGuest: true,
};

/* ---------------------------------------------
   Provider
--------------------------------------------- */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ---------------------------------------------
     Restore Session
  --------------------------------------------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("vault_user");
    const token = localStorage.getItem("vault_token");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.clear();
      }
    }

    setIsLoading(false);
  }, []);

  /* ---------------------------------------------
     LOGIN
  --------------------------------------------- */
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        setIsLoading(true);

        const res = await fetch(LOGIN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: "Login failed" }));
          const errorMessage = errorData.message || "Invalid credentials";
          console.error("Login failed:", errorMessage);
          throw new Error(errorMessage);
        }

        const data = await res.json();

        if (!data.success || !data.token || !data.user) {
          console.error("Invalid response format:", data);
          throw new Error("Invalid response from server");
        }

        localStorage.setItem("vault_token", data.token);
        localStorage.setItem("vault_user", JSON.stringify(data.user));

        setUser(data.user);
        return true;
      } catch (err: any) {
        console.error("Login failed:", err);
        throw err; // Re-throw to let the UI handle it
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /* ---------------------------------------------
     SIGNUP
  --------------------------------------------- */
  const signup = useCallback(
    async (name: string, email: string, password: string): Promise<boolean> => {
      try {
        setIsLoading(true);

        const res = await fetch(SIGNUP_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: "Signup failed" }));
          const errorMessage = errorData.message || "Signup failed";
          console.error("Signup failed:", errorMessage);
          throw new Error(errorMessage);
        }

        const data = await res.json();

        if (!data.success || !data.token || !data.user) {
          console.error("Invalid response format:", data);
          throw new Error("Invalid response from server");
        }

        localStorage.setItem("vault_token", data.token);
        localStorage.setItem("vault_user", JSON.stringify(data.user));

        setUser(data.user);
        return true;
      } catch (err: any) {
        console.error("Signup failed:", err);
        throw err; // Re-throw to let the UI handle it
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /* ---------------------------------------------
     LOGOUT
  --------------------------------------------- */
  const logout = useCallback(() => {
    localStorage.removeItem("vault_token");
    localStorage.removeItem("vault_user");
    setUser(null);
  }, []);

  /* ---------------------------------------------
     GUEST LOGIN
  --------------------------------------------- */
  const loginAsGuest = useCallback(() => {
    localStorage.removeItem("vault_token");
    localStorage.setItem("vault_user", JSON.stringify(GUEST_USER));
    setUser(GUEST_USER);
  }, []);

  /* ---------------------------------------------
     UPDATE USER
  --------------------------------------------- */
  const updateUser = useCallback((userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("vault_user", JSON.stringify(updatedUser));
    }
  }, [user]);

  /* ---------------------------------------------
     Context Value
  --------------------------------------------- */
  const value: AuthContextType = {
    user,
    isLoading,
    login,
    signup,
    logout,
    loginAsGuest,
    updateUser,
    isAuthenticated: !!user && !user.isGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ---------------------------------------------
   Hook
--------------------------------------------- */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
