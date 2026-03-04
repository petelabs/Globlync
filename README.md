# Globlync - Evidence-Based Reputation for Skilled Workers

Globlync is a professional platform designed for informal workers (plumbers, electricians, etc.) to build a digital, evidence-based reputation.

## 🚀 Deployment Instructions (Vercel)

1. **Push to GitHub**: Link and push your local code: `git push -u origin main`
2. **Connect to Vercel**: Import your GitHub repository.
3. **Environment Variables**: Add `GOOGLE_GENAI_API_KEY` in Vercel.

## 🔑 Firebase Console Setup (Action Required)

### 1. Enable Passwordless Sign-in
- Go to **Authentication** > **Sign-in method**.
- Enable **Email/Password**.
- Toggle ON **Email link (passwordless sign-in)**.
- Add `globlync.vercel.app` to **Authorized domains**.

### 2. Professional Magic Link Template
Copy and paste this into your Firebase Console (**Templates** > **Passwordless sign-in** > **HTML**):

```html
<div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
  <div style="background-color: #00796B; padding: 24px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Globlync</h1>
  </div>
  <div style="padding: 32px; color: #1a202c; line-height: 1.6;">
    <h2 style="margin-top: 0;">Sign in to your professional profile</h2>
    <p>Hello! Tap the button below to sign in to your Globlync account. This link will expire shortly for your security.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="%LINK%" style="background-color: #FFC107; color: #1a202c; padding: 14px 28px; border-radius: 30px; text-decoration: none; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Sign In to Globlync</a>
    </div>
    <p style="font-size: 12px; color: #718096;">If you didn't request this email, you can safely ignore it.</p>
  </div>
  <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
    <p style="font-size: 10px; color: #a0aec0; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Built by Petediano Tech • Malawi</p>
  </div>
</div>
```

## ✨ Features
- **Verified Job Logging**: Workers log work, and AI verifies photos vs descriptions.
- **TikTok-Style UI**: Modern navigation with a search bar at the top and profile-driven settings.
- **Malawi Skill Discovery**: 20+ categories specifically for the Malawian labor market.
- **Magic Link Auth**: Secure, passwordless entry for busy professionals.
- **Trust Score & Badges**: Real-time calculated reputation system.
- **PWA Ready**: Installable on home screens with professional SEO.
