# 🚀 Deployment Guide — AiBrain (Smart Document Reminder)

This app has **three** independently-deployed pieces:

| Piece | Tech | Host (recommended) | Public URL example |
|-------|------|--------------------|--------------------|
| `client` | React (CRA) | **Vercel** (or Netlify) | `https://aibrain.vercel.app` |
| `server` | Node/Express | **Render** Web Service | `https://aibrain-server.onrender.com` |
| `ai-service` | Python/Flask + Tesseract | **Render** Web Service (Docker) | `https://aibrain-ocr.onrender.com` |
| database | MongoDB | **MongoDB Atlas** (free M0) | connection string |

> The pieces reference each other by URL. Because those URLs only exist *after*
> you deploy, the order below is deliberate: **Atlas → ai-service → server → client → finalize**.
> The very last step circles back to fill in URLs that didn't exist yet.

The code already reads every cross-service URL from environment variables (with
localhost fallbacks), so **no code changes are needed to deploy** — only env vars.

---

## 0. Prerequisites

- The repo is on GitHub (it is): `Dhiru9262/AiBrain-Smart-Document-Reminder-`
- Free accounts: [MongoDB Atlas](https://www.mongodb.com/atlas), [Render](https://render.com), [Vercel](https://vercel.com)
- Your secrets ready: `GEMINI_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Google Cloud project with the **Calendar API** enabled (for OAuth)

Each folder has a `.env.example` listing exactly what that piece needs.

---

## 1. Database — MongoDB Atlas

1. Create a free **M0** cluster.
2. **Database Access** → add a database user (username + password).
3. **Network Access** → Add IP `0.0.0.0/0` (allow from anywhere — needed so Render can connect).
4. **Connect → Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/aibrain?retryWrites=true&w=majority
   ```
   Replace `<user>`/`<pass>` and keep this as your `MONGO_URI`.

---

## 2. AI service (Python OCR) — Render Web Service (Docker)

The OCR service needs the **Tesseract binary**, which isn't a pip package. The included
`ai-service/Dockerfile` installs it (`apt-get install tesseract-ocr`), so deploy it as Docker.

1. Render → **New → Web Service** → connect your GitHub repo.
2. Settings:
   - **Root Directory**: `ai-service`
   - **Runtime / Language**: `Docker` (Render auto-detects the `Dockerfile`)
   - **Instance Type**: Free
3. Environment variables: none required (Tesseract is on PATH inside the image; `PORT` is auto-injected).
4. **Create Web Service**. Wait for the build, then test:
   ```
   https://<your-ai-service>.onrender.com/health   →  {"status":"ok"}
   ```
5. **Copy this URL** — it's your `AI_SERVICE_URL` for the next step.

> ⚠️ Render free services **sleep after ~15 min idle** and take ~30–60s to wake.
> The first OCR request after idle may be slow or time out — just retry.

---

## 3. Server (Node/Express) — Render Web Service

1. Render → **New → Web Service** → same repo.
2. Settings:
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
3. **Environment variables** (from `server/.env.example`):
   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | your Atlas string from step 1 |
   | `GEMINI_API_KEY` | your Gemini key |
   | `GOOGLE_CLIENT_ID` | your Google client id |
   | `GOOGLE_CLIENT_SECRET` | your Google client secret |
   | `AI_SERVICE_URL` | the ai-service URL from step 2 |
   | `SERVER_URL` | this server's own URL (set after first deploy, see note) |
   | `CLIENT_URL` | the client URL (set in step 5 — use a placeholder for now) |

   > Chicken-and-egg: Render only shows this service's URL after it's created. Do an
   > initial deploy, copy the assigned URL (e.g. `https://aibrain-server.onrender.com`),
   > then set `SERVER_URL` to it and redeploy. `CLIENT_URL` gets filled in step 5.
4. Test once live:
   ```
   https://<your-server>.onrender.com/auth/google   →  should redirect to a Google login
   ```

---

## 4. Client (React) — Vercel

1. Vercel → **Add New → Project** → import the repo.
2. Settings:
   - **Root Directory**: `client`
   - **Framework Preset**: Create React App (auto-detected)
   - **Build Command**: `npm run build` · **Output Directory**: `build`
3. **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | your server URL from step 3, e.g. `https://aibrain-server.onrender.com` |

   > CRA bakes `REACT_APP_*` vars in **at build time** — if you change this later you must redeploy.
4. **Deploy**. Copy the resulting URL, e.g. `https://aibrain.vercel.app`.

---

## 5. Finalize — wire the URLs together + Google OAuth

Now that every URL exists, close the loop:

**a) Server env vars** (Render → server → Environment → edit → save → redeploy):
- `CLIENT_URL` = your Vercel URL (`https://aibrain.vercel.app`)
- `SERVER_URL` = your Render server URL (if not already set)

**b) Google Cloud Console** (APIs & Services → **Credentials** → your OAuth client):
- **Authorized redirect URIs** → add:
  ```
  https://<your-server>.onrender.com/auth/google/callback
  ```
- (Keep `http://localhost:5000/auth/google/callback` too, for local dev.)
- Save. Changes can take a few minutes to apply.

**c)** Redeploy the server so the new `CLIENT_URL`/`SERVER_URL` take effect.

✅ Visit your Vercel URL, click login, authorize Google, upload a document.

---

## Local development (after these changes)

Three terminals from the project root:

```powershell
# 1. AI service (port 8000)
cd ai-service; .\venv\Scripts\Activate.ps1; python app.py

# 2. Server (port 5000) — create server\.env from server\.env.example first
cd server; npm install; npm run dev

# 3. Client (port 3000) — create client\.env from client\.env.example first
cd client; npm install; npm start
```

The localhost fallbacks mean local dev works even without `.env` files, except for
the server's secrets (`MONGO_URI`, `GEMINI_API_KEY`, Google OAuth), which you must provide.

---

## Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| "OCR Service is down" | ai-service asleep (Render free tier) — retry after ~30s, or check its logs. |
| OAuth `redirect_uri_mismatch` | The redirect URI in Google Console must **exactly** match `SERVER_URL` + `/auth/google/callback`. |
| Login redirects to localhost | `CLIENT_URL` not set / server not redeployed after setting it. |
| Client calls go to localhost:5000 in prod | `REACT_APP_API_URL` missing at build time — set it in Vercel and redeploy. |
| MongoDB connection timeout | Atlas Network Access must allow `0.0.0.0/0`. |
| CORS errors | `server/index.js` uses open CORS by default; if you lock it down, allow your `CLIENT_URL` origin. |

---

## Cost note (free tiers)

All four (Atlas M0, 2× Render free, Vercel hobby) are **$0**. The trade-off is Render
free services **sleep when idle**, so the first request after a quiet period is slow.
To remove that, upgrade the two Render services to a paid instance (~$7/mo each).
