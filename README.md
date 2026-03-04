# Globlync - Evidence-Based Reputation for Skilled Workers

Globlync is a professional platform designed for informal workers (plumbers, electricians, etc.) to build a digital, evidence-based reputation.

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
- **Note**: The technical domain below the name will remain the Firebase ID until you buy a custom domain (e.g., `.com`). You cannot technically verify a `.vercel.app` domain for this specific Google identity step.

### 3. Domain Verification Note
- You **cannot** verify the DNS records for a `.vercel.app` domain in Firebase (the step asking for TXT/CNAME records). 
- **Don't worry**: Your app will still work! It will just send emails from the default Firebase address. To use a custom sender, you would need a custom domain (e.g., `.com`).

### 4. Professional Magic Link Template
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
