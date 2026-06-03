import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function Home() {
  const { userEmail, login } = useUser();
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-badge">AI-Powered Document Reminders</div>
      <h1 className="hero-title">
        Never miss an<br />
        <span className="gradient-text">important deadline</span> again.
      </h1>
      <p className="hero-subtitle">
        Snap any document — bills, prescriptions, notices. Our AI extracts the due
        date and adds it straight to your Google Calendar.
      </p>

      <div className="hero-actions">
        {!userEmail ? (
          <button className="primary-btn hero-btn" onClick={login}>
            Get Started — Sign in with Google
          </button>
        ) : (
          <button className="primary-btn hero-btn" onClick={() => navigate("/upload")}>
            Upload a Document →
          </button>
        )}
      </div>

      <div className="feature-grid">
        <div className="feature-card">
          <div className="feature-icon">📸</div>
          <h3>Capture</h3>
          <p>Snap a photo or upload any document image.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🧠</div>
          <h3>Analyze</h3>
          <p>OCR + AI extract the deadline automatically.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📅</div>
          <h3>Remind</h3>
          <p>Synced with your Google Calendar instantly.</p>
        </div>
      </div>
    </section>
  );
}
