import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { API_URL } from "../config";

export default function Reminders() {
  const { userEmail } = useUser();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReminders = async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/reminders?userEmail=${userEmail}`
      );
      setReminders(res.data);
    } catch (err) {
      console.error("Failed to load reminders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Reminders</h1>
          <p className="page-subtitle">
            {reminders.length} {reminders.length === 1 ? "reminder" : "reminders"} tracked
          </p>
        </div>
        <button className="refresh-btn" onClick={fetchReminders}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <p className="empty-msg">Loading...</p>
      ) : reminders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No reminders yet</h3>
          <p>Upload a document to create your first reminder.</p>
          <Link to="/upload" className="primary-btn empty-cta">
            Upload Document
          </Link>
        </div>
      ) : (
        <ul className="reminder-list">
          {reminders.map((r) => (
            <li key={r._id} className="reminder-card">
              <div className="reminder-info">
                <strong>{r.documentName}</strong>
                <p className="due-date">📅 Due: {r.dueDate}</p>
              </div>
              <span className="timestamp">
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
