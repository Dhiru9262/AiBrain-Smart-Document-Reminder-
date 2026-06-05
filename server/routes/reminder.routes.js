const express = require("express");
const Reminder = require("../models/Reminder");
const { createCalendarEvent } = require("../services/calendar.service");

const router = express.Router();

router.post("/create-reminder", async (req, res) => {
  const { date, documentName, ocrText, userEmail } = req.body;

  if (!userEmail) return res.status(401).json({ error: "Not authenticated" });
  if (!date) return res.status(400).json({ error: "Missing date" });

  try {
    const calendarEventId = await createCalendarEvent(
      date,
      { documentName, ocrText },
      userEmail
    );
    res.json({ message: "Reminder created", calendarEventId });
  } catch (err) {
    // No stored Google token for this user → they must (re)login with Google.
    if (err.code === "NOT_AUTHORIZED") {
      return res.status(401).json({
        error: "Google access expired. Please log in with Google again.",
      });
    }
    console.error("❌ Create Reminder Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create calendar event." });
  }
});

router.get("/reminders", async (req, res) => {
  const { userEmail } = req.query;
  const reminders = await Reminder.find({ userEmail });
  res.json(reminders);
});

module.exports = router;
