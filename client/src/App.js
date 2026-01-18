import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

function App() {
  // User Session State
  const [userEmail, setUserEmail] = useState(null);

  // File & Preview State
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);

  // Analysis State
  const [ocrText, setOcrText] = useState("");
  const [detectedDate, setDetectedDate] = useState(null);
  const [confidence, setConfidence] = useState(null);

  // Confirmation State
  const [finalDate, setFinalDate] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Capture user email from URL after Google Redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");
    if (email) {
      setUserEmail(email);
      // Clean the URL so the email isn't hanging out in the address bar
      window.history.replaceState({}, document.title, "/");
      fetchReminders(email);
    }
  }, []);

  const handleImageUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImage(URL.createObjectURL(selectedFile));

    // Reset old analysis state for new upload
    setShowConfirm(false);
    setDetectedDate(null);
    setFinalDate("");
  };

  const sendToBackend = async () => {
    if (!file) return alert("Please select an image first");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("document", file);

      const response = await axios.post(
        "http://localhost:5000/process",
        formData
      );

      setOcrText(response.data.text);
      setDetectedDate(response.data.dueDate?.due_date || null);
      setConfidence(response.data.dueDate?.confidence || null);

      if (response.data.dueDate?.due_date) {
        setFinalDate(response.data.dueDate.due_date);
      }

      setShowConfirm(true);
    } catch (error) {
      console.error(error);
      alert("Error during OCR/AI processing");
    } finally {
      setLoading(false);
    }
  };

  const confirmDate = async () => {
    if (!userEmail) return alert("Please login with Google first!");

    try {
      await axios.post("http://localhost:5000/create-reminder", {
        date: finalDate,
        documentName: file.name,
        ocrText: ocrText,
        userEmail: userEmail, // Critical: Backend needs this for DB & Calendar
      });

      alert("📅 Reminder added to Google Calendar!");
      setShowConfirm(false);
      fetchReminders(userEmail);
    } catch (err) {
      console.error("CONFIRM DATE ERROR:", err);
      alert("Failed to create calendar event. Check backend logs.");
    }
  };

  const fetchReminders = async (email = userEmail) => {
    if (!email) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/reminders?userEmail=${email}`
      );
      setReminders(res.data);
    } catch (err) {
      console.error("Failed to load reminders", err);
    }
  };

  const handleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <div className="container">
      <header className="header">
        <h2 className="title">🚀 Smart Document Reminder</h2>
        {!userEmail ? (
          <button className="login-btn" onClick={handleLogin}>
            Sign in with Google
          </button>
        ) : (
          <p className="user-badge">
            Logged in as: <strong>{userEmail}</strong>
          </p>
        )}
      </header>

      <main className="upload-section">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          id="file-upload"
          onChange={handleImageUpload}
          hidden
        />
        <label htmlFor="file-upload" className="custom-file-upload">
          {file ? "Change Document" : "📸 Capture or Upload Document"}
        </label>

        {image && (
          <div className="preview-container">
            <img src={image} alt="preview" className="preview-image" />
            {!showConfirm && (
              <button
                className="primary-btn"
                onClick={sendToBackend}
                disabled={loading}
              >
                {loading ? "Analyzing..." : "🔍 Analyze Document"}
              </button>
            )}
          </div>
        )}
      </main>

      {/* Confirmation / Date Correction Section */}
      {showConfirm && (
        <div className="confirm-box">
          <h3>📄 Analysis Results</h3>
          {detectedDate ? (
            <p>
              Detected Date: <strong>{detectedDate}</strong> ({confidence}{" "}
              confidence)
            </p>
          ) : (
            <p>No date detected automatically. Please select manually:</p>
          )}

          <input
            type="date"
            className="date-input"
            value={finalDate}
            onChange={(e) => setFinalDate(e.target.value)}
          />

          <button
            className="confirm-btn"
            onClick={confirmDate}
            disabled={!finalDate}
          >
            ✅ Confirm & Add to Calendar
          </button>
        </div>
      )}

      <hr />

      <section className="reminders-section">
        <div className="section-header">
          <h3>My Reminders</h3>
          <button className="refresh-btn" onClick={() => fetchReminders()}>
            🔄 Refresh
          </button>
        </div>

        <ul className="reminder-list">
          {reminders.length === 0 && (
            <p className="empty-msg">No reminders found.</p>
          )}
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
      </section>
    </div>
  );
}

export default App;
