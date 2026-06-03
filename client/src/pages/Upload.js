import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function Upload() {
  const { userEmail } = useUser();
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [detectedDate, setDetectedDate] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [finalDate, setFinalDate] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setImage(URL.createObjectURL(selectedFile));
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
      const response = await axios.post("http://localhost:5000/process", formData);
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
    try {
      await axios.post("http://localhost:5000/create-reminder", {
        date: finalDate,
        documentName: file.name,
        ocrText,
        userEmail,
      });
      alert("📅 Reminder added to Google Calendar!");
      navigate("/reminders");
    } catch (err) {
      console.error("CONFIRM DATE ERROR:", err);
      alert("Failed to create calendar event. Check backend logs.");
    }
  };

  return (
    <section className="page">
      <div className="page-header">
        <h1 className="page-title">Upload Document</h1>
        <p className="page-subtitle">
          Capture or upload a document — AI will detect the due date for you.
        </p>
      </div>

      <div className="upload-section">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          id="file-upload"
          onChange={handleImageUpload}
          hidden
        />
        <label htmlFor="file-upload" className="custom-file-upload">
          {file ? "Change Document" : "Capture or Upload Document"}
        </label>

        {image && (
          <div className="preview-container">
            <img src={image} alt="preview" className="preview-image" />
            {!showConfirm && (
              <button className="primary-btn" onClick={sendToBackend} disabled={loading}>
                {loading ? "Analyzing..." : "🔍 Analyze Document"}
              </button>
            )}
          </div>
        )}

        {showConfirm && (
          <div className="confirm-box">
            <h3>Analysis Results</h3>
            {detectedDate ? (
              <p>
                Detected Date: <strong>{detectedDate}</strong>{" "}
                {confidence && <>({confidence} confidence)</>}
              </p>
            ) : (
              <p>No date detected automatically. Please select manually:</p>
            )}

            {ocrText && (
              <details className="ocr-preview">
                <summary>Show extracted text</summary>
                <pre>{ocrText}</pre>
              </details>
            )}

            <input
              type="date"
              className="date-input"
              value={finalDate}
              onChange={(e) => setFinalDate(e.target.value)}
            />

            <button className="confirm-btn" onClick={confirmDate} disabled={!finalDate}>
              ✅ Confirm & Add to Calendar
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
