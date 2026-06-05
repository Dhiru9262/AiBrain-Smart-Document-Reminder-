const { google } = require("googleapis");

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("❌ Google OAuth env variables missing");
}

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${SERVER_URL}/auth/google/callback`
);

const calendar = google.calendar({
  version: "v3",
  auth: oauth2Client,
});

// Build a per-request OAuth2 client authenticated as a specific user, from
// that user's persisted refresh token. The googleapis client automatically
// exchanges the refresh token for a fresh access token as needed, so this
// works indefinitely without re-login — unlike the shared in-memory client.
function createUserAuthClient(refreshToken) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${SERVER_URL}/auth/google/callback`
  );
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}

module.exports = {
  oauth2Client,
  calendar,
  createUserAuthClient,
};
