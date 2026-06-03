import { NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function Navbar() {
  const { userEmail, login, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <NavLink to="/" className="brand">
        <span className="brand-logo">🧠</span>
        <span className="brand-text">Smart Reminder</span>
      </NavLink>

      {userEmail && (
        <nav className="nav-links">
          <NavLink to="/upload" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            Upload
          </NavLink>
          <NavLink to="/reminders" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            Reminders
          </NavLink>
        </nav>
      )}

      <div className="nav-right">
        {!userEmail ? (
          <button className="login-btn" onClick={login}>
            Sign in with Google
          </button>
        ) : (
          <div className="user-menu">
            <span className="user-badge">{userEmail}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
