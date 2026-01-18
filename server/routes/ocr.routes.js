const express = require("express");
const multer = require("multer");
const path = require("path");
const axios = require("axios");
const { extractDueDate } = require("../services/gemini.service");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

router.post("/process", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imagePath = path.resolve(req.file.path);
    console.log("📂 File received at:", imagePath);

    // 1. Call OCR Service
    console.log("🤖 Sending to OCR service at port 8000...");
    let ocrText = "";
    try {
      const ocrResponse = await axios.post("http://127.0.0.1:8000/ocr", {
        image_path: imagePath,
      });
      ocrText = ocrResponse.data.text;
    } catch (ocrErr) {
      console.error("❌ OCR Service Error:", ocrErr.message);
      return res
        .status(500)
        .json({ error: "OCR Service is down or returned an error." });
    }

    // 2. Call Gemini AI
    console.log("🧠 Sending text to Gemini for extraction...");
    try {
      const dueDate = await extractDueDate(ocrText);
      res.json({ text: ocrText, dueDate });
    } catch (aiErr) {
      if (aiErr.message.includes("429")) {
        return res.status(429).json({
          error:
            "AI limit reached. Please wait a moment or try again tomorrow.",
        });
      }
      console.error("❌ Gemini AI Error:", aiErr.message);
      return res.status(500).json({ error: "AI processing failed." });
    }
  } catch (err) {
    console.error("❌ General Server Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
