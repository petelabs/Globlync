
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

### 3. Monetag Ad Integration (Monetization)
To earn revenue and cover your hosting costs without "spammy" ads, follow these steps:
1. Register at [Monetag.com](https://monetag.com/).
2. Add your site: `https://globlync.vercel.app`.
3. Create a **"Vignette Banner"** zone.
4. **Integration:** The Vignette script is already added to `src/app/layout.tsx`. It will automatically activate once Monetag approves your domain.
5. **Native Slots:** I have created placeholders for "Native Banner" ad zones in:
   - `src/app/dashboard/page.tsx` (ID: `monetag-ad-slot-dashboard`)
   - `src/app/public/[workerId]/page.tsx` (ID: `monetag-ad-slot-sidebar`)

## ✨ Features
- **Verified Job Logging**: Workers log work, and clients verify via QR.
- **AI Photo Analysis**: Gemini 2.0 Flash verifies that job photos match descriptions.
- **Trust Score & Badges**: Real-time calculated reputation system with automated milestones.
- **Public Profiles**: Dynamic, shareable links (e.g., `globlync.vercel.app/public/USER_ID`) for workers to showcase credentials.
- **PWA Ready**: Installable on home screens with professional SEO.

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database/Auth**: Firebase Firestore & Authentication
- **AI**: Genkit with Gemini 2.0 Flash
- **Styling**: Tailwind CSS + ShadCN UI
