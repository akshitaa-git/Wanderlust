# Deployment Guide: Wanderlust AI Travel Planner

This guide will help you take your local project and make it live for the world to see.

---

## Part 1: Prepare for GitHub

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - project ready for deployment"
   ```
2. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/akshitaa-git/Wanderlust.git
   git branch -M main
   git push -u origin main
   ```

---

## Part 2: Deploy the Backend (The "Server")

We recommend **Railway.app** or **Render.com** for the Node.js backend.

1. **New Project**: Select "Deploy from GitHub repo".
2. **Settings**:
   - **Root Directory**: `server`
   - **Install Command**: `npm install`
   - **Start Command**: `npm start`
3. **Add Environment Variables** (Copy from your `server/.env`):
   - `PORT`: (The host will usually provide this automatically)
   - `MONGODB_URI`: (Your MongoDB connection string)
   - `JWT_SECRET`: (Your secret key)
   - `GEMINI_API_KEY`: (Your Google AI key)
   - `GOOGLE_CLIENT_ID`: (From Google Console)
   - `GOOGLE_CLIENT_SECRET`: (From Google Console)
   - `CLIENT_URL`: `https://your-frontend-domain.vercel.app`
   - `BACKEND_URL`: `https://your-backend-domain.railway.app`

---

## Part 3: Deploy the Frontend (The "App")

We recommend **Vercel** for the React/Vite frontend.

1. **New Project**: Select your GitHub repo.
2. **Settings**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Add Environment Variable**:
   - `VITE_API_URL`: `https://your-backend-domain.railway.app/api`

---

## Part 4: Update Google OAuth

Once you have your production URLs, you **must** update your Google Cloud Project:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Edit your **OAuth 2.0 Client ID**.
3. **Authorized JavaScript origins**: 
   - Add `https://your-frontend-domain.vercel.app`
4. **Authorized redirect URIs**:
   - Add `https://your-backend-domain.railway.app/api/auth/google/callback`
5. **Wait 5-10 minutes** for Google to propagate the changes.
