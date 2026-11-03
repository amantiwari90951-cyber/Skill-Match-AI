/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe, login, logout as logoutApi, register } from "./services/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await getMe();
        if (response?.user) {
          setUser(response.user);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const handleLogin = async ({ email, password }) => {
    setLoading(true);

    try {
      const response = await login({ email, password });

      if (response?.user) {
        setUser(response.user);
      }

      return response;
    } catch {
      return { message: "Unable to log in right now. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async ({ username, email, password }) => {
    setLoading(true);

    try {
      const response = await register({ username, email, password });

      if (response?.user) {
        setUser(response.user);
      }

      return response;
    } catch {
      return { message: "Unable to create your account right now. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({ user, loading, handleLogin, handleRegister, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside an AuthProvider");
  }

  return context;
}
