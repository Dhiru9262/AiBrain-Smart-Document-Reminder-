const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { extractDueDate } = require("../services/gemini.service");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

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

    // 1. Call OCR Service — send the image BYTES (base64) so the OCR service
    //    can run on a different host (no shared filesystem required).
    console.log(`🤖 Sending to OCR service at ${AI_SERVICE_URL} ...`);
    let ocrText = "";
    try {
      const imageBase64 = fs.readFileSync(imagePath).toString("base64");
      const ocrResponse = await axios.post(`${AI_SERVICE_URL}/ocr`, {
        image_base64: imageBase64,
      });
      ocrText = ocrResponse.data.text;
    } catch (ocrErr) {
      console.error("❌ OCR Service Error:", ocrErr.message);
      return res
        .status(500)
        .json({ error: "OCR Service is down or returned an error." });
    } finally {
      // Uploaded file is transient — remove it so the (often ephemeral) disk
      // doesn't fill up on the host.
      fs.unlink(imagePath, () => {});
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
