const { google } = require("googleapis");
const { createUserAuthClient } = require("../config/googleAuth");
const Reminder = require("../models/Reminder");
const Token = require("../models/Token");

async function createCalendarEvent(date, meta, userEmail) {
  // Look up THIS user's stored refresh token and act as them. This survives
  // server restarts/sleeps, unlike the old shared in-memory auth client.
  const tokenDoc = await Token.findOne({ email: userEmail });
  if (!tokenDoc) {
    const err = new Error("NOT_AUTHORIZED");
    err.code = "NOT_AUTHORIZED";
    throw err;
  }

  const auth = createUserAuthClient(tokenDoc.refreshToken);
  const calendar = google.calendar({ version: "v3", auth });

  const event = {
    summary: "📄 Document Due Date",
    start: { date },
    end: { date },
  };

  const res = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
  });

  await Reminder.create({
    userEmail,
    documentName: meta.documentName,
    ocrText: meta.ocrText,
    dueDate: date,
    calendarEventId: res.data.id,
  });

  return res.data.id;
}

module.exports = { createCalendarEvent };
