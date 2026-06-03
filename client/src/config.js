// Base URL of the backend (Express) server.
// Set REACT_APP_API_URL in client/.env for local dev and in the host
// dashboard (Vercel/Netlify) for production. Falls back to localhost.
export const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";
