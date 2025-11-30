# Deployment Guide - Productivity App 🚀

This guide will help you deploy your productivity app with Google OAuth authentication.

## 🎯 Overview

- **Backend**: Render (Free tier with PostgreSQL)
- **Frontend**: Vercel (Free tier)
- **Authentication**: Google OAuth 2.0

---

## 📋 Step 1: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing one)
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - User Type: External
   - App name: Productivity App
   - User support email: Your email
   - Authorized domains: Add your Vercel domain (e.g., `productivity-app.vercel.app`)
6. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for local development)
     - `https://your-app.vercel.app` (your Vercel URL)
   - Authorized redirect URIs:
     - `http://localhost:5173` (for local development)
     - `https://your-app.vercel.app` (your Vercel URL)

7. **Save these credentials**:
   - Client ID (looks like: `123456789-abc.apps.googleusercontent.com`)
   - Client Secret (looks like: `GOCSPX-xxxxxxxxxxxxx`)

---

## 🔧 Step 2: Deploy Backend to Render

### 2.1 Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **PostgreSQL**
3. Name: `productivity-db`
4. Database: `productivity`
5. User: `productivity_user` (or any name)
6. Region: Choose closest to you
7. Click **Create Database**
8. **Copy the Internal Database URL** (it will look like: `postgresql://user:password@dpg-xxxxx/dbname`)

### 2.2 Deploy Backend Web Service

1. In Render, click **New** → **Web Service**
2. Connect your GitHub repository
3. **Configure the service**:

```
Name: productivity-app-backend
Root Directory: backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

4. **Add Environment Variables**:

```bash
# Database (from Step 2.1)
DATABASE_URL=<your-internal-database-url-from-step-2.1>

# Security - IMPORTANT: Generate a secure secret key!
# Run this command to generate: openssl rand -hex 32
SECRET_KEY=<your-secure-random-secret-key>

# Google OAuth (from Step 1)
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Application URLs
FRONTEND_URL=https://your-app.vercel.app
BACKEND_URL=https://productivity-app-backend.onrender.com

# Optional: Additional CORS origins (comma-separated)
EXTRA_CORS_ORIGINS=https://your-app.vercel.app,https://productivity-app.vercel.app
```

5. Click **Create Web Service**
6. Wait for deployment (5-10 minutes)
7. **Copy your backend URL** (e.g., `https://productivity-app-backend.onrender.com`)

### 2.3 Generate a Secure Secret Key

Run this command in your terminal:
```bash
openssl rand -hex 32
```

Copy the output and use it as your `SECRET_KEY` in Render.

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Deploy to Vercel

1. Go to [Vercel](https://vercel.com/)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. **Configure Project**:

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 3.2 Add Environment Variables

In Vercel project settings → **Environment Variables**, add:

```bash
# Backend API URL (from Step 2.2)
VITE_API_URL=https://productivity-app-backend.onrender.com

# Google OAuth Client ID (from Step 1)
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
```

### 3.3 Deploy

1. Click **Deploy**
2. Wait for build to complete
3. **Copy your Vercel URL** (e.g., `https://productivity-app.vercel.app`)

---

## 🔄 Step 4: Update Google OAuth Redirect URIs

1. Go back to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to **Credentials** → Click your OAuth 2.0 Client ID
3. Update **Authorized JavaScript origins**:
   - Add: `https://your-actual-vercel-url.vercel.app`
4. Update **Authorized redirect URIs**:
   - Add: `https://your-actual-vercel-url.vercel.app`
5. Click **Save**

---

## 🔄 Step 5: Update Backend CORS

1. Go to your Render backend service
2. Update the `FRONTEND_URL` environment variable with your actual Vercel URL:
   ```
   FRONTEND_URL=https://your-actual-vercel-url.vercel.app
   ```
3. Click **Save Changes** (this will trigger a redeploy)

---

## ✅ Step 6: Test Your Deployment

1. Open your Vercel URL in a browser
2. You should see the Google Sign-In button
3. Click "Sign in with Google"
4. Authorize the app
5. You should be redirected to the app and see your tasks!

---

## 🐛 Troubleshooting

### Backend Issues

**Error: `400 Bad Request` on `/api/tasks`**
- Check CORS configuration in Render environment variables
- Ensure `FRONTEND_URL` matches your Vercel URL exactly
- Check backend logs in Render dashboard

**Error: `401 Unauthorized`**
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly
- Verify Google OAuth is configured properly in Google Cloud Console

**Database connection errors**
- Verify `DATABASE_URL` is correct
- Check that PostgreSQL database is running in Render

### Frontend Issues

**Google Sign-In button not showing**
- Check that `VITE_GOOGLE_CLIENT_ID` is set in Vercel
- Verify the Client ID matches what's in Google Cloud Console
- Check browser console for errors

**API requests failing**
- Verify `VITE_API_URL` is set correctly in Vercel
- Check that backend is running (visit the backend URL directly)
- Look at Network tab in browser DevTools

### CORS Errors

**Error: `No 'Access-Control-Allow-Origin' header`**
- Update `FRONTEND_URL` in Render to match your Vercel URL
- Add your Vercel URL to `EXTRA_CORS_ORIGINS`
- Redeploy backend after changing environment variables

---

## 📝 Environment Variables Summary

### Backend (Render)

| Variable | Example | Required | Description |
|----------|---------|----------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@host/db` | ✅ Yes | PostgreSQL connection string |
| `SECRET_KEY` | `<64-char-hex-string>` | ✅ Yes | JWT secret key (use `openssl rand -hex 32`) |
| `GOOGLE_CLIENT_ID` | `123-abc.apps.googleusercontent.com` | ✅ Yes | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxxxx` | ✅ Yes | Google OAuth Client Secret |
| `FRONTEND_URL` | `https://your-app.vercel.app` | ✅ Yes | Your Vercel frontend URL |
| `BACKEND_URL` | `https://your-backend.onrender.com` | ⚠️ Optional | Your Render backend URL |
| `EXTRA_CORS_ORIGINS` | `https://app1.com,https://app2.com` | ⚠️ Optional | Additional allowed origins |

### Frontend (Vercel)

| Variable | Example | Required | Description |
|----------|---------|----------|-------------|
| `VITE_API_URL` | `https://your-backend.onrender.com` | ✅ Yes | Backend API URL from Render |
| `VITE_GOOGLE_CLIENT_ID` | `123-abc.apps.googleusercontent.com` | ✅ Yes | Google OAuth Client ID |

---

## 🎉 You're Done!

Your productivity app is now live with:
- ✅ Google OAuth authentication
- ✅ Private user data (each user sees only their own tasks)
- ✅ PostgreSQL database
- ✅ Full PWA support

**Share your app**: `https://your-app.vercel.app` 🌸

がんばって！ (Ganbatte!) - You did great! 💪✨
