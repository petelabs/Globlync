
# Globlync - Global Evidence-Based Reputation

Globlync is a professional platform designed for remote professionals and global freelancers to build a digital, evidence-based reputation. Headquartered in Malawi, serving the globe.

## 🚀 Vercel Production Deployment
To ensure all professional features work correctly in production, add these **Environment Variables** in your Vercel Dashboard (*Settings > Environment Variables*):

1. **`GOOGLE_GENAI_API_KEY`**: Your Gemini API Key for AI Bio Polish and Daily Tips.
2. **`FIREBASE_SERVICE_ACCOUNT`**: Go to Firebase Console > Settings > Service Accounts > Generate New Private Key. Copy the **entire** JSON content and paste it here.
3. **`JOOBLE_API_KEY`**: `11f7354d-81e2-4517-ba04-1399caa395ce`
4. **`PAYCHANGU_SECRET_KEY`**: Your live Secret Key from PayChangu (Required for payment verification).
5. **`PAYCHANGU_WEBHOOK_SECRET`**: (Optional) The secret for signature verification.

## 🎯 CPA Lead Postback Setup (Automatic Rewards)
To automatically credit users when they finish a task:
1. **Login**: Access your [CPALead Dashboard](https://www.cpalead.com).
2. **Navigate**: Click **Postbacks** in the sidebar.
3. **Set URL**: Enter exactly this: `https://globlync.vercel.app/api/cpa-postback?uid=[subid]&amount=[payout]`
4. **Method**: Ensure it is set to **GET**.
5. **IP Whitelisting**: The app is already configured to trust CPALead's official IP: `4.69.179.33`. This prevents fraud.
6. **Logic**: Globlync will receive the `[payout]` (e.g. 0.50), convert it to credits (50), and if the user hits 100 credits, it automatically unlocks 30 days of Pro VIP.

## 💳 PayChangu Webhook Setup (Step-by-Step)
1. **Login**: Access your [PayChangu Dashboard](https://app.paychangu.com).
2. **Navigate**: Click **Settings** -> **API Keys & Webhooks**.
3. **Set URL**: In the **Webhook URL** field, enter: `https://globlync.vercel.app/api/paychangu-webhook`
4. **Activate**: Ensure the "Receive Webhook Notifications" toggle is **ON**.
5. **Match Email**: Users must pay using the **same email address** registered on their Globlync profile for automatic Pro activation.

## 🧠 Daily Tip Logic (Cost Optimization)
The app uses a synchronized system to minimize API costs. We use a curated library of professional quotes that rotates daily, requiring zero AI calls for general users.

## 🎨 Branding & Style
- **Headers**: Strictly "Straight" (Non-italic) sans-serif for trust.
- **Colors**: Deep Teal (Primary) and Golden Amber (Secondary).
- **Target**: Global Remote Professionals, Tech Freelancers, and Expert Consultants.

## 🚀 Deployment Steps
1. Connect your GitHub repo to Vercel.
2. Add the Environment Variables listed above.
3. Ensure `globlync.vercel.app` is added to **Authorized Domains** in Firebase Console > Auth > Settings.
4. Deploy!
