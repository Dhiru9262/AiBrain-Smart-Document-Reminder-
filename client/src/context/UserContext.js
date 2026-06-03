import { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../config";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [userEmail, setUserEmail] = useState(
    () => localStorage.getItem("userEmail") || null
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");
    if (email) {
      setUserEmail(email);
      localStorage.setItem("userEmail", email);
      window.history.replaceState({}, document.title, "/upload");
    }
  }, []);

  const login = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const logout = () => {
    localStorage.removeItem("userEmail");
    setUserEmail(null);
  };

  return (
    <UserContext.Provider value={{ userEmail, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
