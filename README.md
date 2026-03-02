# Globlync - Evidence-Based Reputation for Skilled Workers

Globlync is a professional platform designed for informal workers (plumbers, electricians, etc.) to build a digital, evidence-based reputation.

## 🚀 Deployment Instructions (Vercel)

To deploy this application to Vercel, follow these steps:

### 1. Push to GitHub
- Create a new repository on GitHub.
- Link and push your local code: `git push -u origin main`

### 2. Connect to Vercel
- Import your GitHub repository into Vercel.
- **CRITICAL:** In the **Environment Variables** section, add:
    - `GOOGLE_GENAI_API_KEY`: Your Google AI Studio API key (Required for AI Photo Analysis).

### 3. A-Ads Integration (Monetization)
To earn revenue and cover your hosting costs without tracking ads, follow these steps:
1. Register at [A-Ads.com](https://a-ads.com/).
2. Create an **Adaptive** ad unit.
3. **Integration:** The A-Ads sticky banner code is already added to `src/app/layout.tsx`. It provides a clean, protocol-relative unit for your site.

## ✨ Features
- **Verified Job Logging**: Workers log work, and clients verify via QR.
- **AI Photo Analysis**: Gemini 2.0 Flash verifies that job photos match descriptions.
- **Trust Score & Badges**: Real-time calculated reputation system with automated milestones.
- **Public Profiles**: Dynamic, shareable links (e.g., `globlync.vercel.app/public/USER_ID`) for workers to showcase credentials.
- **PWA Ready**: Installable on home screens with professional SEO.
- **Privacy First Ads**: Clean monetization using A-Ads.

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database/Auth**: Firebase Firestore & Authentication
- **AI**: Genkit with Gemini 2.0 Flash
- **Styling**: Tailwind CSS + ShadCN UI
- **Ad Network**: A-Ads (Privacy-focused)
