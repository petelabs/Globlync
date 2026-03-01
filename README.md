# Globlync - Portable Reputation for Skilled Workers

Globlync is a professional platform designed for informal workers (plumbers, electricians, etc.) to build a digital, evidence-based reputation.

## 🚀 Deployment Instructions (Vercel)

To deploy this application to Vercel, follow these steps:

### 1. Push to GitHub
- Create a new repository on GitHub.
- Initialize your local project as a git repo (if not already): `git init`
- Add all files: `git add .`
- Commit: `git commit -m "Initial commit"`
- Link and push to your GitHub repo: `git remote add origin <your-repo-url>` and `git push -u origin main`

### 2. Connect to Vercel
- Go to [Vercel](https://vercel.com) and click **"Add New"** > **"Project"**.
- Import your GitHub repository.
- In the **"Environment Variables"** section, add the following:
    - `GOOGLE_GENAI_API_KEY`: Your Google AI Studio API key (required for AI Bio features).
- Click **"Deploy"**.

### 3. Firebase Configuration
The app is pre-configured with the Firebase settings found in `src/firebase/config.ts`. Ensure your Firebase project's Authorized Domains includes your Vercel deployment URL (e.g., `your-app-name.vercel.app`) to allow Google Login to work.

## ✨ Features
- **Verified Job Logging**: Workers log work, and clients verify via QR/SMS.
- **Trust Score**: Real-time calculation of worker reputation.
- **AI Bio Assistant**: Genkit-powered professional bio generation.
- **Public Profiles**: Shareable links for workers to showcase credentials.

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database/Auth**: Firebase Firestore & Authentication
- **AI**: Genkit with Gemini 2.0 Flash
- **Styling**: Tailwind CSS + ShadCN UI
