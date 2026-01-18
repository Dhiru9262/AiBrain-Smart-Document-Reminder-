const { calendar } = require("../config/googleAuth");
const Reminder = require("../models/Reminder");

async function createCalendarEvent(date, meta, userEmail) {
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
}

module.exports = { createCalendarEvent };
