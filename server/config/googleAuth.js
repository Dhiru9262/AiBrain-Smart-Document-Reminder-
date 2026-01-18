const { google } = require("googleapis");

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("❌ Google OAuth env variables missing");
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5000/auth/google/callback"
);

const calendar = google.calendar({
  version: "v3",
  auth: oauth2Client,
});

console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);

module.exports = {
  oauth2Client,
  calendar,
};
