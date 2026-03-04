# Globlync - Evidence-Based Reputation for Skilled Workers

Globlync is a professional platform designed for informal workers (plumbers, electricians, etc.) to build a digital, evidence-based reputation.

## 🚀 Deployment Instructions (Vercel)

1. **Push to GitHub**: Link and push your local code: `git push -u origin main`
2. **Connect to Vercel**: Import your GitHub repository.
3. **Environment Variables**: Add `GOOGLE_GENAI_API_KEY` in Vercel.

## 🔑 Firebase Console Setup (Action Required)

### 1. Enable Passwordless Sign-in
- Go to **Authentication** > **Sign-in method**.
- Enable **Email/Password**.
- Toggle ON **Email link (passwordless sign-in)**.
- Add `globlync.vercel.app` to **Authorized domains**.

### 2. Professional Magic Link Template
To make copying easier on mobile:
1. Open the file **`docs/magic-link-template.html`** in this editor.
2. Use "Select All" to copy the entire code.
3. Paste it into your Firebase Console (**Templates** > **Passwordless sign-in** > **HTML**).

## ✨ Features
- **Verified Job Logging**: Workers log work, and AI verifies photos vs descriptions.
- **TikTok-Style UI**: Modern navigation with a search bar at the top and profile-driven settings.
- **Malawi Skill Discovery**: 20+ categories specifically for the Malawian labor market.
- **Magic Link Auth**: Secure, passwordless entry for busy professionals.
- **Trust Score & Badges**: Real-time calculated reputation system.
- **PWA Ready**: Installable on home screens with professional SEO.
