const express = require("express");
const Reminder = require("../models/Reminder");
const { createCalendarEvent } = require("../services/calendar.service");

const router = express.Router();

router.post("/create-reminder", async (req, res) => {
  const { date, documentName, ocrText, userEmail } = req.body;

  if (!userEmail) return res.status(401).json({ error: "Not authenticated" });

  await createCalendarEvent(date, { documentName, ocrText }, userEmail);

  res.json({ message: "Reminder created" });
});

router.get("/reminders", async (req, res) => {
  const { userEmail } = req.query;
  const reminders = await Reminder.find({ userEmail });
  res.json(reminders);
});

module.exports = router;
