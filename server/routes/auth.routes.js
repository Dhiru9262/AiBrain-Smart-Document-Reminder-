const express = require("express");
const fs = require("fs");
const { google } = require("googleapis");
const { oauth2Client } = require("../config/googleAuth");

const router = express.Router();
const oauth2 = google.oauth2("v2");

let currentUserEmail = null;

router.get("/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });
  res.redirect(url);
});

// Add this to your imports at the top
// const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });

// const { google } = require("googleapis");
// const { oauth2Client } = require("../config/googleAuth");

router.get("/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send("Missing authorization code");
    }

    // 1. Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // 2. Fetch User Info using the newly acquired tokens
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    const userEmail = userInfo.data.email;

    // 3. Redirect back to React (Frontend) with the email
    // This allows the Frontend to know who is logged in
    res.redirect(
      `http://localhost:3000?email=${encodeURIComponent(userEmail)}`
    );
  } catch (err) {
    console.error(
      "❌ OAuth Token Exchange Error:",
      err.response?.data || err.message
    );
    res.status(500).json({
      error: "OAuth failed",
      details: err.response?.data || err.message,
    });
  }
});

module.exports = router;
