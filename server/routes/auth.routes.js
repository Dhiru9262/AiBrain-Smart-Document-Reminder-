const express = require("express");
const { google } = require("googleapis");
const { oauth2Client } = require("../config/googleAuth");
const Token = require("../models/Token");

const router = express.Router();

router.get("/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    // Force the consent screen so Google reliably returns a refresh_token.
    // Without this, Google omits refresh_token on repeat logins, leaving us
    // unable to act on the user's calendar later.
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });
  res.redirect(url);
});

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

    // 3. Persist the refresh token so we can act on this user's calendar
    //    later, surviving server restarts/sleeps. Only overwrite when Google
    //    actually sent a new refresh_token (it may omit it on some flows).
    if (tokens.refresh_token) {
      await Token.findOneAndUpdate(
        { email: userEmail },
        { refreshToken: tokens.refresh_token, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    }

    // 4. Redirect back to React (Frontend) with the email so the frontend
    //    knows who is logged in.
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    res.redirect(`${clientUrl}?email=${encodeURIComponent(userEmail)}`);
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
