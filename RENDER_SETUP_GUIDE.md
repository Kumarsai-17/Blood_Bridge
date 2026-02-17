# 🚀 Render Setup Guide - BloodBridge Backend

## Step-by-Step Instructions

### 1. Create New Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository (if not already connected)
4. Select your **BloodBridge** repository

---

### 2. Basic Configuration

Fill in these settings:

**Name:** `bloodbridge-api` (or any name you prefer)

**Region:** Choose closest to you (e.g., Oregon, Singapore)

**Branch:** `main`

**Root Directory:** Leave empty (or put `server` if it doesn't work)

**Runtime:** `Node`

**Build Command:**
```bash
cd server && npm install
```

**Start Command:**
```bash
cd server && node server.js
```

---

### 3. Environment Variables (CRITICAL!)

Click **"Advanced"** → **"Add Environment Variable"**

Add these **EXACTLY** as shown:

```
NODE_ENV=production
```

```
PORT=5001
```

```
MONGO_URI=mongodb+srv://bloodbridge:sai1234@cluster0.fty6fgv.mongodb.net/bloodbridge?appName=Cluster0
```

```
JWT_SECRET=bloodbridge_secret_key
```

```
FRONTEND_URL=https://blood-bridge-mu.vercel.app
```

```
SYSTEM_EMAIL=paidikumarsai1@gmail.com
```

```
SYSTEM_EMAIL_PASS=uiwadsdxmsxmsnpn
```

```
RESEND_API_KEY=re_gzCrkDqz_KmX9MJhUswauutaNyFpNoNxE
```

```
RESEND_FROM_EMAIL=BloodBridge <onboarding@resend.dev>
```

---

### 4. Plan Selection

**Instance Type:** `Free`

---

### 5. Create Service

Click **"Create Web Service"**

Wait 3-5 minutes for deployment to complete.

---

### 6. Get Your Backend URL

After deployment completes, you'll see your service URL:
```
https://bloodbridge-api-xxxx.onrender.com
```

**Copy this URL!** You'll need it for Vercel.

---

### 7. Test Your Backend

Open this URL in browser:
```
https://your-service-name.onrender.com/api/health
```

Should return:
```json
{
  "status": "OK",
  "message": "API is healthy",
  "timestamp": "...",
  "cors": {
    "origin": "...",
    "allowedOrigins": [...],
    "frontendUrl": "https://blood-bridge-mu.vercel.app"
  }
}
```

---

### 8. Update Vercel Environment Variable

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add or update:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-render-url.onrender.com/api` (use YOUR actual URL)
   - **Environments:** Check all (Production, Preview, Development)
5. Click **Save**
6. Go to **Deployments** → Click **"Redeploy"** on latest deployment

---

### 9. Final Test

1. Wait 2-3 minutes for Vercel to redeploy
2. Go to: `https://blood-bridge-mu.vercel.app/login`
3. Login with:
   - Email: `superadmin@bloodbridge.com`
   - Password: `SuperAdmin@123`
4. Should work! ✅

---

## 🔍 Troubleshooting

### If deployment fails:

**Check Logs:**
- In Render dashboard, click on your service
- Go to **"Logs"** tab
- Look for errors

**Common Issues:**

1. **Build fails:** Make sure build command is `cd server && npm install`
2. **Start fails:** Make sure start command is `cd server && node server.js`
3. **MongoDB connection fails:** Check MONGO_URI is correct
4. **Port issues:** Make sure PORT=5001 is set

### If CORS error persists:

1. Check Render logs when you try to login
2. Look for messages like "✅ CORS: Allowing..." or "❌ CORS: Blocked..."
3. Verify FRONTEND_URL matches your Vercel URL exactly
4. Make sure Vercel has VITE_API_URL set correctly

### Render Free Tier Note:

- Service sleeps after 15 minutes of inactivity
- First request takes 30-60 seconds to wake up
- This is normal for free tier

---

## ✅ Checklist

Before testing, verify:

- [ ] Render service deployed successfully (green checkmark)
- [ ] All 9 environment variables are set on Render
- [ ] Health endpoint returns 200 OK
- [ ] FRONTEND_URL in health response matches Vercel URL
- [ ] Vercel has VITE_API_URL environment variable
- [ ] Vercel redeployed after adding environment variable
- [ ] Browser cache cleared (Ctrl+Shift+Delete)

---

## 📋 Quick Reference

**Render Service URL Format:**
```
https://your-service-name.onrender.com
```

**API Endpoints:**
```
GET  /api/health
POST /api/auth/login
POST /api/auth/register
POST /api/auth/verify-login-otp
```

**Test Login:**
```bash
curl -X POST https://your-render-url.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@bloodbridge.com","password":"SuperAdmin@123"}'
```

Should return:
```json
{
  "success": true,
  "token": "...",
  "role": "super_admin"
}
```
