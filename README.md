
# Globlync - Evidence-Based Reputation for Skilled Workers

Globlync is a professional platform designed for informal workers (plumbers, electricians, etc.) to build a digital, evidence-based reputation.

## 💳 PayChangu Setup (Action Required)
To enable automatic "Pro" upgrades when someone pays:

1. **Dashboard Configuration**:
   - Go to your [PayChangu Dashboard](https://dashboard.paychangu.com/).
   - Set **Webhook URL** to: `https://globlync.vercel.app/api/paychangu-webhook`
   - Copy the **Webhook secret** provided by PayChangu.

2. **Environment Variables (Vercel)**:
   - Add a new Environment Variable in Vercel.
   - **Key**: `PAYCHANGU_WEBHOOK_SECRET`
   - **Value**: (Paste your Webhook Secret from PayChangu).
   - Add another variable for AI features: `GOOGLE_GENAI_API_KEY` = (Your Gemini API Key).

3. **How it Works**:
   - When a worker pays using the link on the Pricing page, they MUST use the same email address they used to sign up for Globlync.
   - PayChangu sends a message to our Webhook.
   - Our app finds the worker by email and instantly unlocks their **Pro Status**.

## 🎨 Branding & Logo Setup
To show your professional logo:
1. Save your logo as `logo.png` in the `public/` folder.
2. The app automatically detects it for the Header and Login screens.

## 🛡️ Verification Ready (Google Cloud Console)
- **Privacy Policy URL**: `https://globlync.vercel.app/privacy`
- **Terms of Service URL**: `https://globlync.vercel.app/terms`

## 🚀 Deployment (Vercel)
1. Push to GitHub.
2. Connect to Vercel.
3. Ensure all Environment Variables (`PAYCHANGU_WEBHOOK_SECRET`, `GOOGLE_GENAI_API_KEY`) are added.
