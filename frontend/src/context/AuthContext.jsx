import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [officer, setOfficer] = useState(null);

  function signIn(name) {
    setOfficer({ name: name.trim() });
  }

  function signOut() {
    setOfficer(null);
  }

  return (
    <AuthContext.Provider value={{ officer, signIn, signOut, isAuthenticated: !!officer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
