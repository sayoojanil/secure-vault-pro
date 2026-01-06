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
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  loginAsGuest: () => void;
  resetPassword: (email: string) => Promise<boolean>;
}

/* ---------------------------------------------
   Context
--------------------------------------------- */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ---------------------------------------------
   Constants
--------------------------------------------- */
const LOGIN_URL =
  // "http://localhost:5000/loginWithEmail";
  "https://dripjerceybackend-production.up.railway.app/loginWithEmail";

const SIGNUP_URL =
  "https://dripjercey-backend.onrender.com/signup";

const RESET_PASSWORD_URL =
  "https://dripjercey-backend.onrender.com/auth/reset-password";

const GUEST_USER: User = {
  id: "guest-user",
  name: "Guest User",
  email: "guest@vault.app",
  storageUsed: 0,
  storageLimit: 100 * 1024 * 1024, // 100MB
  isGuest: true,
};

/* ---------------------------------------------
   Provider
--------------------------------------------- */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ---------------------------------------------
     Load user on app start
  --------------------------------------------- */
  useEffect(() => {
    const savedUser = localStorage.getItem("vault_user");
    const token = localStorage.getItem("vault_token");

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) return false;

        const data = await res.json();

        localStorage.setItem("vault_token", data.token);
        localStorage.setItem("vault_user", JSON.stringify(data.user));

        setUser(data.user);
        return true;
      } catch (error) {
        console.error("Login error:", error);
        return false;
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
    async (email: string, password: string, name: string): Promise<boolean> => {
      try {
        setIsLoading(true);

        const res = await fetch(SIGNUP_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, name }),
        });

        if (!res.ok) return false;

        const data = await res.json();

        localStorage.setItem("vault_token", data.token);
        localStorage.setItem("vault_user", JSON.stringify(data.user));

        setUser(data.user);
        return true;
      } catch (error) {
        console.error("Signup error:", error);
        return false;
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
    localStorage.setItem("vault_user", JSON.stringify(GUEST_USER));
    localStorage.removeItem("vault_token");
    setUser(GUEST_USER);
  }, []);

  /* ---------------------------------------------
     RESET PASSWORD (OPTIONAL)
  --------------------------------------------- */
  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    try {
      const res = await fetch(RESET_PASSWORD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      return res.ok;
    } catch {
      return false;
    }
  }, []);

  /* ---------------------------------------------
     Provider Value
  --------------------------------------------- */
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        loginAsGuest,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ---------------------------------------------
   Hook
--------------------------------------------- */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
