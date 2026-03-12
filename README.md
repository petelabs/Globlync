
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
   *   **Note**: Leave the `[subid]` and `[payout]` exactly as they are. These are "Macros" that CPALead will replace with real data automatically.
4. **Method**: Ensure it is set to **GET**.
5. **IP Whitelisting**: The app is configured to ONLY trust CPALead's official IP: `4.69.179.33`. Requests from any other IP will be blocked.
6. **Logic**: Globlync will receive the `[payout]` (e.g. 0.50), convert it to credits (50), and if the user hits 100 credits, it automatically unlocks 30 days of Pro VIP.

## 🛠️ Manual Admin Overrides (How Professionals Do It)
If a user pays or completes a task but doesn't get their badge (due to network lag), follow these steps in your "Admin Office":
1. **Open Firebase Console**: Go to your project's Firestore Database.
2. **Find the User**: Go to the `workerProfiles` collection and find the user via their email.
3. **Manual Activation**: 
   *   Change `isPro` to `true`.
   *   In the `activeBenefits` array, add a new item: `{ type: "Pro Member (Manual)", expiresAt: "2026-12-31T...", amountPaid: 0 }`.
4. **Result**: The user will see their VIP badge instantly without needing a code update.

## 💳 PayChangu Webhook Setup
1. **Login**: Access your [PayChangu Dashboard](https://app.paychangu.com).
2. **Navigate**: Click **Settings** -> **API Keys & Webhooks**.
3. **Set URL**: In the **Webhook URL** field, enter: `https://globlync.vercel.app/api/paychangu-webhook`
4. **Match Email**: Users must pay using the **same email address** registered on their Globlync profile for automatic Pro activation.

## 🎨 Branding & Style
- **Colors**: Deep Teal (Primary) and Golden Amber (Secondary).
- **Target**: Global Remote Professionals, Tech Freelancers, and Expert Consultants.
