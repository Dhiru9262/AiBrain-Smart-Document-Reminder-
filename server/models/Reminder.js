const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "Document Due Date",
  },
  documentName: String,
  ocrText: String,
  dueDate: String,
  calendarEventId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Reminder", reminderSchema);
