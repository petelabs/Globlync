
# Globlync - Evidence-Based Reputation for Skilled Workers

Globlync is a professional platform designed for informal workers (plumbers, electricians, etc.) to build a digital, evidence-based reputation in Malawi.

## 💳 PayChangu Setup (Action Required)
To enable automatic "Pro" upgrades when someone pays:

1. **PayChangu Dashboard**:
   - Go to your [PayChangu Dashboard](https://dashboard.paychangu.com/).
   - Set **Webhook URL** to: `https://globlync.vercel.app/api/paychangu-webhook`
   - Ensure the "Receive Webhook Notifications" toggle is **ON**.
   - Copy the **Webhook secret**.

2. **Vercel Environment Variables**:
   - Go to your project settings in Vercel.
   - Add `PAYCHANGU_WEBHOOK_SECRET` = (Your Webhook Secret from PayChangu).
   - Add `GOOGLE_GENAI_API_KEY` = (Your Gemini API Key for AI verification).
   - Add `FIREBASE_SERVICE_ACCOUNT` = (The content of your Firebase Service Account JSON file).

3. **How it Works**:
   - Users choose their amount on your PayChangu link: [https://pay.paychangu.com/SC-c9Mara](https://pay.paychangu.com/SC-c9Mara)
   - They MUST use the same email address they used to sign up for Globlync.
   - The system automatically detects the tier:
     - **700+ MWK**: Gold Pro (30 Days)
     - **500+ MWK**: Silver Pro (15 Days)
     - **250+ MWK**: Standard Pro (7 Days)
     - **Under 250 MWK**: Trial Pro (2 Days)

## 🎨 Branding & Assets
- Save your logo as `logo.png` in the `public/` folder.
- Save your app icons as `icon-192.png` and `icon-512.png` in the `public/` folder.
- These are automatically used for the PWA and navigation.

## 🛡️ Verification
- **Privacy Policy**: `https://globlync.vercel.app/privacy`
- **Terms**: `https://globlync.vercel.app/terms`
- **Purpose**: Bridge the trust gap in the Malawian labor market via AI-verified work logs.

## 🚀 Deployment
- Connect your GitHub repo to Vercel.
- The app will automatically build and deploy.
- All Firebase Security Rules are managed automatically.
