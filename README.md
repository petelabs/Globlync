
# Globlync - Global Evidence-Based Reputation

Globlync is a professional platform designed for remote professionals and global freelancers to build a digital, evidence-based reputation. Headquartered in Malawi, serving the globe.

## 🚀 Vercel Production Deployment
To ensure all professional features work correctly in production, add these **Environment Variables** in your Vercel Dashboard:

1. **`GOOGLE_GENAI_API_KEY`**: Your Gemini API Key for AI Bio Polish and Daily Tips.
2. **`FIREBASE_SERVICE_ACCOUNT`**: Go to Firebase Console > Settings > Service Accounts > Generate New Private Key. Copy the **entire** JSON content and paste it here.
3. **`JOOBLE_API_KEY`**: `11f7354d-81e2-4517-ba04-1399caa395ce` (or your updated key).
4. **`PAYCHANGU_SECRET_KEY`**: Your live Secret Key from PayChangu.
5. **`PAYCHANGU_WEBHOOK_SECRET`**: (Optional) The secret for signature verification.

## 💳 PayChangu Webhook Setup
1. **Webhook URL**: Set to `https://your-domain.vercel.app/api/paychangu-webhook`
2. **Settings**: Ensure "Receive Webhook Notifications" is **ON** in your PayChangu dashboard.

## 🧠 Daily Tip Logic (Cost Optimization)
The app uses a synchronized system to minimize API costs. Only **1 API call per day** is made for the entire platform. The first person to visit the site each day triggers the AI to update the `system/dailyTip` document in Firestore, which is then served to everyone else instantly.

## 🎨 Branding & Style
- **Headers**: Strictly "Straight" (Non-italic) sans-serif for trust.
- **Colors**: Deep Teal (Primary) and Golden Amber (Secondary).
- **Target**: Global Remote Professionals, Tech Freelancers, and Expert Consultants.

## 🚀 Deployment Steps
1. Connect your GitHub repo to Vercel.
2. Add the Environment Variables listed above.
3. Ensure `globlync.vercel.app` (or your domain) is added to **Authorized Domains** in Firebase Console > Auth > Settings.
4. Deploy!
