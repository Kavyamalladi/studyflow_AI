# StudyFlow AI — Deployment Guide

## Architecture

```
Browser → Vercel (React frontend) → Render (Express API)
```

- **Vercel** serves the static React/Vite frontend
- **Render** runs the Express backend (AI API calls)

---

## 1. Deploy Backend → Render

### Option A — Using render.yaml (Blueprint)

1. Push this repo to GitHub (already done).
2. Go to [render.com](https://render.com) → **New** → **Blueprint**.
3. Connect your GitHub repo (`Kavyamalladi/studyflow_AI`).
4. Render auto-detects `render.yaml` and creates the service.
5. In the Render dashboard, set these **secret env vars**:
   - `OPENCODE_GO_API_KEY` → your API key from opencode.ai
   - `CORS_ORIGIN` → your Vercel URL (e.g. `https://studyflow-ai.vercel.app`)

### Option B — Manual

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Set:
   - **Build Command**: `npm install && npm run build:all`
   - **Start Command**: `npm start`
   - **Node Version**: 20+
4. Add environment variables:
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `3001` |
   | `CORS_ORIGIN` | `https://your-app.vercel.app` |
   | `OPENCODE_GO_API_KEY` | `your-api-key` |
   | `GO_MODEL` | `deepseek-v4-flash` |

5. Note your Render service URL (e.g. `https://studyflow-ai-api.onrender.com`)

---

## 2. Deploy Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo (`Kavyamalladi/studyflow_AI`)
3. Framework Preset: **Vite**
4. Build & Output Settings (auto-detected from `vercel.json`):
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables in Vercel dashboard:
   | Key | Value |
   |-----|-------|
   | `VITE_API_BASE_URL` | `https://studyflow-ai-api.onrender.com/api` |

6. Deploy! ✅

---

## 3. Update CORS (after both are deployed)

Once you have both URLs, update `CORS_ORIGIN` in Render to your Vercel URL:
```
CORS_ORIGIN=https://your-app.vercel.app
```

Then redeploy the Render service.

---

## Local Development

```bash
# Install dependencies
npm install

# Create .env from example
cp .env.example .env
# Add your OPENCODE_GO_API_KEY

# Start both frontend + backend
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3001
