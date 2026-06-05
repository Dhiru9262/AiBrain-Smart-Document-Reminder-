const mongoose = require("mongoose");

// Persists each user's Google OAuth refresh token so we can act on their
// Calendar even after the server restarts/sleeps (Render free tier wipes
// in-memory state). One row per user, keyed by email.
const tokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Token", tokenSchema);
