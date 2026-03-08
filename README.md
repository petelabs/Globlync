
# Globlync - Evidence-Based Reputation for Skilled Workers

Globlync is a professional platform designed for informal workers (plumbers, electricians, etc.) to build a digital, evidence-based reputation globally.

## 🚀 Vercel Production Setup
To ensure all professional features work correctly, set these Environment Variables in your Vercel Dashboard:

1. **`GOOGLE_GENAI_API_KEY`**: Your Gemini API Key for bio polishing and job analysis.
2. **`FIREBASE_SERVICE_ACCOUNT`**: Go to Firebase Console > Settings > Service Accounts > Generate New Private Key. Copy the **entire** JSON content and paste it here.
3. **`PAYCHANGU_SECRET_KEY`**: Your live Secret Key from PayChangu.
4. **`PAYCHANGU_WEBHOOK_SECRET`**: (Optional) The secret for signature verification.

## 💳 PayChangu Webhook Setup
1. **Webhook URL**: Set to `https://globlync.vercel.app/api/paychangu-webhook`
2. **Ensure**: "Receive Webhook Notifications" is **ON**.

## 🧠 Daily Tip Logic
The app uses a synchronized system to minimize API costs. Only **1 API call per day** is made for all users. The first person to visit the site each day triggers the AI to update the `system/dailyTip` document in Firestore, which is then served to everyone else instantly.

## 🎨 Branding & Style
- **Headers**: Strictly "Straight" (Non-italic) sans-serif for trust.
- **Colors**: Deep Teal (Primary) and Golden Amber (Secondary).
- **Images**: High-quality placeholder gradients for privacy and trust.

## 🚀 Deployment
Connect your GitHub repo to Vercel. Ensure all environment variables are set before your first payment test.
