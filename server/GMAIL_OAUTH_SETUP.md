# Gmail OAuth2 Setup for BloodBridge

Gmail OAuth2 is more reliable than App Passwords, especially on cloud platforms like Render.

## Quick Start (Use App Password - Already Working Locally)

Your current setup with App Password works locally. To make it work on Render:

### Option 1: Try Current Setup on Render (Simplest)

Just add your current credentials to Render and test:

```
SYSTEM_EMAIL=paidikumarsai1@gmail.com
SYSTEM_EMAIL_PASS=uiwadsdxmsxmsnpn
```

If this works on Render, you're done! If not, continue to Option 2.

### Option 2: Use Gmail OAuth2 (More Reliable on Cloud)

Follow these steps to set up OAuth2:

## Step 1: Create Google Cloud Project (5 minutes)

1. Go to: https://console.cloud.google.com
2. Click **"Select a project"** → **"New Project"**
3. Name: **BloodBridge**
4. Click **Create**

## Step 2: Enable Gmail API

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Gmail API"**
3. Click on it and click **"Enable"**

## Step 3: Create OAuth2 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure OAuth consent screen:
   - User Type: **External**
   - App name: **BloodBridge**
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue** (skip scopes and test users)
4. Back to Create OAuth client ID:
   - Application type: **Web application**
   - Name: **BloodBridge Email**
   - Authorized redirect URIs: `https://developers.google.com/oauthplayground`
   - Click **Create**
5. **COPY** the Client ID and Client Secret

## Step 4: Get Refresh Token

1. Go to: https://developers.google.com/oauthplayground
2. Click the **Settings icon** (⚙️) in top right
3. Check **"Use your own OAuth credentials"**
4. Enter your **Client ID** and **Client Secret**
5. In left panel, find **"Gmail API v1"**
6. Select: `https://mail.google.com/`
7. Click **"Authorize APIs"**
8. Sign in with your Gmail account (paidikumarsai1@gmail.com)
9. Click **"Allow"**
10. Click **"Exchange authorization code for tokens"**
11. **COPY the Refresh Token**

## Step 5: Add to Render

Add these to Render Environment Variables:

```
SYSTEM_EMAIL=paidikumarsai1@gmail.com
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
```

You can keep `SYSTEM_EMAIL_PASS` as fallback.

## Step 6: Install Package & Deploy

```bash
cd server
npm install googleapis
```

Then push to GitHub and Render will deploy.

---

## Which Method to Use?

### Use App Password (Current Setup) If:
- ✅ It works on Render (test it first!)
- ✅ You want simplicity
- ✅ You don't want to deal with Google Cloud Console

### Use OAuth2 If:
- ✅ App Password doesn't work on Render
- ✅ You want better reliability
- ✅ You want to avoid "less secure app" issues

---

## Testing

After setup, test by:
1. Logging in to your app
2. Checking if OTP email arrives
3. Checking Render logs for success/error messages

---

## Troubleshooting

### "Invalid credentials"
- Double-check Client ID, Secret, and Refresh Token
- Make sure there are no extra spaces
- Regenerate refresh token if needed

### "Access blocked"
- Make sure Gmail API is enabled in Google Cloud Console
- Check OAuth consent screen is configured

### Still not working?
- Check Render logs for specific error messages
- Verify all environment variables are set correctly
- Try regenerating OAuth credentials

---

**Recommendation**: Try your current App Password setup on Render first. If it doesn't work, then set up OAuth2.
