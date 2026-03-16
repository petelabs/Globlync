
# Globlync - Global Evidence-Based Reputation

Globlync is a professional platform designed for remote professionals and global freelancers to build a digital, evidence-based reputation. Headquartered in Malawi, serving the globe.

## 🚀 Vercel Production Deployment
To ensure all professional features work correctly in production, add these **Environment Variables** in your Vercel Dashboard (*Settings > Environment Variables*):

1. **`GOOGLE_GENAI_API_KEY`**: Your Gemini API Key for AI Bio Polish.
2. **`FIREBASE_SERVICE_ACCOUNT`**: Your JSON service account key.
3. **`JOOBLE_API_KEY`**: `11f7354d-81e2-4517-ba04-1399caa395ce`
4. **`PAYCHANGU_SECRET_KEY`**: Your **LIVE Secret Key** from PayChangu (found in API Keys).
5. **`PAYCHANGU_WEBHOOK_SECRET`**: The secret word YOU typed into the PayChangu Webhook Setup box.

## 💳 PayChangu Webhook Setup (Automatic VIP)
To automatically activate Pro VIP when a user pays:
1. **Login**: Access your [PayChangu Dashboard](https://app.paychangu.com).
2. **Navigate**: Click **Settings** -> **API Keys & Webhooks**.
3. **Webhook URL**: Enter: `https://globlync.vercel.app/api/paychangu-webhook`
4. **Webhook Secret**: Type a secret word (e.g., `GloblyncSecure2026`). **Copy this to Vercel environment variables as `PAYCHANGU_WEBHOOK_SECRET`.**
5. **Receive Notifications**: Ensure this toggle is **ON**.
6. **Important**: Users MUST pay using the **same email address** registered on their Globlync profile. If they use a different email, you must verify them manually via WhatsApp.

## 🎯 CPA Lead Postback Setup (Automatic Rewards)
1. **Login**: Access your [CPALead Dashboard](https://www.cpalead.com).
2. **Set Postback URL**: `https://globlync.vercel.app/api/cpa-postback?uid=[subid]&amount=[payout]`
3. **Whitelist IP**: `4.69.179.33`
4. **Conversion**: $1 Earned = 100 User Credits. 100 Credits = 30 Days Pro VIP.

## 🛠️ Manual Admin Overrides (Missed Payments)
If a user pays but automation fails (e.g., they used a different email):
1. **Open Firebase Console**: Go to Firestore Database.
2. **Find User**: Search `workerProfiles` by their email.
3. **Manual Activation**: 
   *   Change `isPro` to `true`.
   *   In the `activeBenefits` array, add: `{ type: "Pro Member (Manual)", expiresAt: "2026-12-31...", amountPaid: 0 }`.
4. **Done**: The user sees their badge instantly.

## 💡 Troubleshooting $0 Earnings
*   CPALead only pays for **Leads** (Task completion), not clicks.
*   Offers depend on the user's **Country and Device**.

## 🎨 Branding & Style
- **Colors**: Deep Teal (Primary) and Golden Amber (Secondary).
- **Target**: Global Remote Professionals and Tech Freelancers.
