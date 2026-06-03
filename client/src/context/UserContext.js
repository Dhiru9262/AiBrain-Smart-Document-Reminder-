import { createContext, useContext, useState, useEffect } from "react";

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
    window.location.href = "http://localhost:5000/auth/google";
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
