
# Globlync - Evidence-Based Reputation for Skilled Workers

Globlync is a professional platform designed for informal workers (plumbers, electricians, etc.) to build a digital, evidence-based reputation globally.

## 💳 PayChangu Setup (Action Required)
To enable automatic "Pro" upgrades when someone pays:

1. **PayChangu Dashboard**:
   - Set **Webhook URL** to: `https://globlync.vercel.app/api/paychangu-webhook`
   - Ensure "Receive Webhook Notifications" is **ON**.
   - Copy your **Secret Key** (from the API Keys section).

2. **Vercel Environment Variables**:
   - **PAYCHANGU_SECRET_KEY**: Paste your "Secret Key" from PayChangu here.
   - **FIREBASE_SERVICE_ACCOUNT**: (This is your unique Firebase Backend ID). Go to Firebase Console > Settings > Service Accounts > Generate New Private Key. Paste the ENTIRE JSON content here.
   - **GOOGLE_GENAI_API_KEY**: Add your Gemini API Key.

3. **How Tiers Work (Global Pricing)**:
   - The system automatically detects the tier based on the amount paid (USD):
     - **$2.9**: Gold Pro (30 Days) - https://pay.paychangu.com/SC-PuzKtb
     - **$1.9**: Silver Pro (15 Days) - https://pay.paychangu.com/SC-0siw5Z
     - **$0.9**: Bronze Pro (7 Days) - https://pay.paychangu.com/SC-oz0qsN
   - *Note: Payments are non-refundable and processed automatically.*

## 🎨 Branding & Icons
Your branding files are correctly placed in the `public/` folder:
- `logo.png`
- `icon-192.png`
- `icon-512.png`

## 🚀 Deployment
Connect your GitHub repo to Vercel. Ensure all environment variables are set before your first payment test.
