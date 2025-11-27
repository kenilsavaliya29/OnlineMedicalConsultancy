# CareChat Deployment Guide

This project intentionally separates the backend (Node/Express + MongoDB) and the frontend (Vite/React). The recommended hosting stack is:

- **Backend:** Render Web Service (auto builds from `/Backend`)
- **Frontend:** Netlify Static Site (builds the Vite app under `/Frontend`)

Both platforms integrate directly with GitHub, so pushing to your default branch will trigger redeploys automatically.

---

## 1. Prerequisites

1. Push the repository to GitHub (or any Git provider that Render/Netlify can read).
2. Make sure MongoDB is reachable from Render (Atlas is recommended).
3. Collect all required secrets (JWT secret, SMTP creds, Razorpay keys, Gemini API key, etc.).

---

## 2. Backend on Render

Render can provision the backend using the `render.yaml` blueprint that lives in the repo root. High-level steps:

1. In Render, click **New > Blueprint** and point it to your repo.
2. Select the `carechat-backend` service and click **Create Resources**.
3. After the first build, open the service ➜ **Environment** and provide values for each secret (the blueprint leaves them as `sync: false`).
4. Provision a persistent disk (already defined in the blueprint) so `/uploads` survives restarts.
5. Click **Manual Deploy > Clear build cache & deploy** after adding the secrets.

### Render settings recap

| Setting | Value |
| --- | --- |
| Root directory | `Backend` |
| Build command | `npm install` |
| Start command | `npm start` |
| Runtime | Node 20 |
| Region | Any (keep close to MongoDB cluster) |
| Health check | `/` |
| Websockets | Enabled by default |
| Disk | `/opt/render/project/src/uploads` (≥1 GB) |

### Required environment variables

| Key | Purpose |
| --- | --- |
| `PORT` (optional) | Render injects one automatically, but we default to 3000 |
| `NODE_ENV` | Set to `production` to enable prod CORS/cookie settings |
| `FRONTEND_URL` | Netlify site URL, e.g. `https://carechat.netlify.app` |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used by auth + sockets |
| `EMAIL_USER` / `EMAIL_PASS` / `EMAIL_SERVICE` / `EMAIL_FROM` | SMTP credentials for password reset, notifications |
| `GEMINI_API_KEY` | For the AI chatbot |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Payment integration |
| `MONGO_RETRY_CONNECT` | Optional `true`/`false` flag for automatic retries |

After the backend deploys successfully, note the public URL (e.g. `https://carechat-backend.onrender.com`). You will plug this into Netlify.

---

## 3. Frontend on Netlify

The repo includes a `netlify.toml` so Netlify can autodetect the build. Steps:

1. In Netlify, click **Add new site > Import an existing project** and choose this repo.
2. Netlify reads `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `Frontend/dist`
   - Node runtime: 20
3. Set the environment variable `VITE_BACKEND_URL` under **Site settings > Environment variables**. Value should be the Render URL from the previous step.
4. Trigger the initial deploy.
5. Once live, copy the Netlify URL (or attach a custom domain) and add it back into the backend’s `FRONTEND_URL` value on Render, then redeploy the backend so CORS/cookies line up.

### Why we need `VITE_BACKEND_URL`

All frontend API calls are centralized behind `import.meta.env.VITE_BACKEND_URL`. At build time, Netlify injects the production API host, ensuring the generated assets never reference `localhost`.

---

## 4. Post-deploy checklist

1. **Smoke test API:** `curl https://<render-app>.onrender.com/` should return the JSON health payload.
2. **Test auth flow:** Create an account, log in/out, exercise routes that set cookies to confirm Render ↔ Netlify CORS works (needs HTTPS on both sides).
3. **File uploads:** Upload a doctor avatar or patient document and verify it persists across backend restarts (Render disk mount).
4. **Email + payments:** Trigger Forgot Password, send a prescription email, and create a Razorpay order in sandbox mode.
5. **AI chatbot:** Confirm the Gemini-powered endpoints work by opening the AI assistant in the UI.

---

## 5. Ongoing operations

- Push to `main` ➜ Render + Netlify redeploy automatically.
- Use Render’s **Logs** tab for server issues; Netlify’s deploy logs for build failures.
- For DB migrations or seed data, use Render Shell or connect locally with your Atlas URI.
- Keep secrets in Render/Netlify dashboards; never commit `.env` files.

Following the steps above gets the full CareChat stack live with minimal manual wiring. Let me know if you’d like CI/CD or environment-group automation added next.***

