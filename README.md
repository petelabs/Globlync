
# Globlync - Global Evidence-Based Reputation

Globlync is a professional platform designed for remote professionals and global freelancers to build a digital, evidence-based reputation. Headquartered in Malawi, serving the globe.

## 🚀 Vercel Production Deployment
To ensure all professional features work correctly in production, add these **Environment Variables** in your Vercel Dashboard (*Settings > Environment Variables*):

1. **`GOOGLE_GENAI_API_KEY`**: Your Gemini API Key for AI Bio Polish and Daily Tips.
2. **`FIREBASE_SERVICE_ACCOUNT`**: Go to Firebase Console > Settings > Service Accounts > Generate New Private Key. Copy the **entire** JSON content and paste it here.
3. **`JOOBLE_API_KEY`**: `11f7354d-81e2-4517-ba04-1399caa395ce`
4. **`PAYCHANGU_SECRET_KEY`**: Your live Secret Key from PayChangu (Required for payment verification).
5. **`PAYCHANGU_WEBHOOK_SECRET`**: (Optional) The secret for signature verification. If your dashboard doesn't provide this, the app will automatically use API verification as a fallback.

## 💳 PayChangu Webhook Setup (Step-by-Step)
1. **Login**: Access your [PayChangu Dashboard](https://app.paychangu.com).
2. **Navigate**: Click **Settings** -> **API Keys & Webhooks**.
3. **Set URL**: In the **Webhook URL** field, enter: `https://globlync.vercel.app/api/paychangu-webhook`
4. **Activate**: Ensure the "Receive Webhook Notifications" toggle is **ON**.
5. **Match Email**: Users must pay using the **same email address** registered on their Globlync profile for automatic Pro activation.

## 🧠 Daily Tip Logic (Cost Optimization)
The app uses a synchronized system to minimize API costs. Only **1 API call per day** is made for the entire platform. The first person to visit the site each day triggers the AI to update the `system/dailyTip` document in Firestore, which is then served to everyone else instantly.

## 🎨 Branding & Style
- **Headers**: Strictly "Straight" (Non-italic) sans-serif for trust.
- **Colors**: Deep Teal (Primary) and Golden Amber (Secondary).
- **Target**: Global Remote Professionals, Tech Freelancers, and Expert Consultants.

## 🚀 Deployment Steps
1. Connect your GitHub repo to Vercel.
2. Add the Environment Variables listed above.
3. Ensure `globlync.vercel.app` is added to **Authorized Domains** in Firebase Console > Auth > Settings.
4. Deploy!
