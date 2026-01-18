async function createCalendarEvent(date) {
  const event = {
    summary: "📄 Document Due Date",
    description: "Reminder created from Smart Document Reminder",
    start: {
      date: date,
      timeZone: "Asia/Kolkata",
    },
    end: {
      date: date,
      timeZone: "Asia/Kolkata",
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 24 * 60 }, // 1 day before
        { method: "popup", minutes: 60 }, // 1 hour before
      ],
    },
  };

  await calendar.events.insert({
    calendarId: "primary",
    resource: event,
  });
}
