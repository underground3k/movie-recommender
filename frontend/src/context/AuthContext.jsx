import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { userId, username, token }
  const [loading, setLoading] = useState(true);

  // On first load, check if there's a saved session in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("auth");
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch {
      localStorage.removeItem("auth");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    // userData = { userId, username, token }
    setUser(userData);
    localStorage.setItem("auth", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}