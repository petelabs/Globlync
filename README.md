it 
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
5. **IP Whitelisting**: The app is configured to ONLY trust CPALead's official IP: `4.69.179.33`.
6. **Conversion**: The system converts `$1 Earned` into `100 User Credits`. When a user hits 100 credits, Pro VIP is automatically unlocked for 30 days.

## 🧪 How to Test the Postback
1. **The "Test Tool"**: If you use the CPALead dashboard "Test" button, it will send a ping to your app. The app will return a "1" (Success), and you will see a green checkmark in CPALead. **No credits will be awarded** to real users because the ID is fake.
2. **The "Real Test"**: 
   * Create a test user on Globlync.
   * Note their User ID (e.g., `abc-123`).
   * In your browser, visit: `https://globlync.vercel.app/api/cpa-postback?uid=abc-123&amount=1.00`
   * **Note**: You must be on the CPALead IP (4.69.179.33) for this manual test to work, or temporarily disable the IP check in `route.ts` just for the test.

## 🛠️ Manual Admin Overrides
If a user pays or completes a task but doesn't get their badge (due to network lag), follow these steps in your "Admin Office":
1. **Open Firebase Console**: Go to your project's Firestore Database.
2. **Find the User**: Go to the `workerProfiles` collection and find the user via their email.
3. **Manual Activation**: 
   *   Change `isPro` to `true`.
   *   In the `activeBenefits` array, add a new item: `{ type: "Pro Member (Manual)", expiresAt: "2026-12-31T...", amountPaid: 0 }`.
4. **Result**: The user will see their VIP badge instantly.

## 💳 PayChangu Webhook Setup
1. **Login**: Access your [PayChangu Dashboard](https://app.paychangu.com).
2. **Navigate**: Click **Settings** -> **API Keys & Webhooks**.
3. **Set URL**: In the **Webhook URL** field, enter: `https://globlync.vercel.app/api/paychangu-webhook`
4. **Match Email**: Users must pay using the **same email address** registered on their Globlync profile for automatic Pro activation.

## 🎨 Branding & Style
- **Colors**: Deep Teal (Primary) and Golden Amber (Secondary).
- **Target**: Global Remote Professionals, Tech Freelancers, and Expert Consultants.
