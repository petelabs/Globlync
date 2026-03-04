
# Globlync - Evidence-Based Reputation for Skilled Workers

Globlync is a professional platform designed for informal workers (plumbers, electricians, etc.) to build a digital, evidence-based reputation.

## 🎨 Branding & Logo Setup (Action Required)
To show your professional logo in the app:
1. Save your logo image as **`logo.png`**.
2. Upload/Place it in the **`public/`** folder of this project.
3. The app is already coded to automatically detect and display it in the Header, Hero, and Login screens.

## 🛡️ Verification Ready (Google Cloud Console)
**Code Status**: Updated for fast verification.
- **Sensitive Scopes**: None. The app does NOT request access to Cloud Platform or Storage.
- **Allowed Scopes**: `openid`, `email`, `profile` (Non-sensitive).
- **Official Branding**: The login button follows the "Sign in with Google" brand guidelines.

## 🔑 Firebase Console Setup (Action Required)

### 1. Enable Passwordless Sign-in
- Go to **Authentication** > **Sign-in method**.
- Enable **Email/Password**.
- Toggle ON **Email link (passwordless sign-in)**.
- **CRITICAL**: Go to **Settings** > **Authorized domains** and add `globlync.vercel.app`.

### 2. Professional Branding (Google Sign-in)
To show "Globlync" instead of your project ID in the Google popup:
- Go to the [Google Cloud Console](https://console.cloud.google.com/).
- Navigate to **APIs & Services** > **OAuth consent screen**.
- Set **App name** to "Globlync".
- Set your **User support email** and **Developer contact info**.

### 3. Professional Magic Link Template
To make copying easier on mobile:
1. Open the file **`docs/magic-link-template.html`** in this editor.
2. Use "Select All" to copy the entire code.
3. Paste it into your Firebase Console (**Templates** > **Passwordless sign-in** > **HTML**).

## 🚀 Deployment Instructions (Vercel)

1. **Push to GitHub**: Link and push your local code: `git push -u origin main`
2. **Connect to Vercel**: Import your GitHub repository.
3. **Environment Variables**: Add `GOOGLE_GENAI_API_KEY` in Vercel.

## ✨ Features
- **Verified Job Logging**: Workers log work, and AI verifies photos vs descriptions.
- **TikTok-Style UI**: Modern navigation with a search bar at the top and profile-driven settings.
- **Malawi Skill Discovery**: 20+ categories specifically for the Malawian labor market.
- **Magic Link Auth**: Secure, passwordless entry for busy professionals.
- **Trust Score & Badges**: Real-time calculated reputation system.
- **PWA Ready**: Installable on home screens with professional SEO.
