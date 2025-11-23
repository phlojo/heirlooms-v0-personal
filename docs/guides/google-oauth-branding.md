# Google OAuth Consent Screen Branding Setup

## Overview

By default, Google OAuth shows your Supabase project URL (`.supabase.co`) on the consent screen, which doesn't inspire trust and can make your app susceptible to phishing attempts. This guide will help you customize it to show your app name "Heirlooms" and your logo.

---

## Prerequisites

- Google Cloud Project with OAuth configured (you already have this)
- Your app logo ready:
  - Format: JPG, PNG, or BMP
  - Size: Square format at 120px × 120px (recommended)
  - Max file size: 1MB
  - Should represent Heirlooms distinctively

---

## Step 1: Configure Branding in Google Cloud Console

### Access the Branding Page

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project from the dropdown
3. Navigate to **Menu > Google Auth platform > Branding**
   - Direct link: https://console.cloud.google.com/auth/branding

### Set Your App Name

1. Under **App Information**, find the **App name** field
2. Enter: `Heirlooms`
3. Important notes:
   - The name must distinctively represent your business
   - Avoid names that could be confused with Google or other brands
   - The app name will be displayed on the consent screen **only after verification**

### Upload Your Logo

1. In the **App logo** section, click **Upload** or **Change logo**
2. Select your Heirlooms logo file
3. The logo should:
   - Represent your app clearly
   - Be square (120px × 120px ideal)
   - Be under 1MB in size
   - Be in JPG, PNG, or BMP format
4. Click **Save**

### Add User Support Email

1. Under **App Information**, find **User support email**
2. Enter your support email (e.g., `support@heirlooms.app`)

### Add Developer Contact Information

1. Scroll to **Developer contact information**
2. Add your contact email for Google to reach you about your app

---

## Step 2: Verify Your Brand (Required)

**Important**: Your app name and logo will NOT appear on the consent screen until you complete brand verification.

### Why Verification is Required

- Google requires verification to prevent phishing and brand impersonation
- Without verification, users will still see your Supabase URL
- Verification may take **several business days** (typically 3-5 business days)

### Start the Verification Process

1. On the same Branding page, look for the **Verification** section
2. Click **Start verification** or visit: https://console.cloud.google.com/auth/verification
3. Follow the prompts to submit your verification request

### What Google Checks

- Your app's legitimacy
- Domain ownership (if applicable)
- Brand authenticity
- Privacy policy and terms of service

### Verification Requirements

You may need to provide:
- A link to your privacy policy
- A link to your terms of service
- Proof of domain ownership
- Business documentation (if applicable)

---

## Step 3: Set Up Custom Domain (Highly Recommended)

Setting up a custom domain significantly improves user trust and reduces the risk of successful phishing attempts.

### Why Custom Domain Matters

Instead of showing:
\`\`\`
*.supabase.co wants to access your Google Account
\`\`\`

Show:
\`\`\`
auth.heirlooms.app wants to access your Google Account
\`\`\`

### Steps to Set Up Custom Domain

1. **Configure in Supabase**:
   - Go to your [Supabase Dashboard](https://supabase.com/dashboard)
   - Navigate to **Project Settings > Custom Domains**
   - Follow the guide: https://supabase.com/docs/guides/platform/custom-domains

2. **Recommended Domain Patterns**:
   - `auth.heirlooms.app` (if your app is at `heirlooms.app`)
   - `api.heirlooms.app` (alternative)

3. **Update OAuth Configuration**:
   - After setting up the custom domain, update your OAuth redirect URIs in Google Cloud Console
   - Go to https://console.cloud.google.com/auth/clients
   - Edit your OAuth client
   - Update **Authorized redirect URIs** to use your custom domain

---

## Step 4: Verify Scopes Configuration

Make sure you have the correct scopes configured to avoid unnecessary verification delays.

### Required Scopes

Go to https://console.cloud.google.com/auth/scopes and verify these are enabled:

- `openid` (add manually if missing)
- `.../auth/userinfo.email` (usually added by default)
- `.../auth/userinfo.profile` (usually added by default)

### Important Note

- Only use these basic scopes unless you need additional Google API access
- Adding sensitive or restricted scopes requires additional verification
- More scopes = longer verification process

---

## Step 5: Update Your Application

Once verification is complete, no code changes are needed! Your branding will automatically appear.

### Optional: Add Environment Variable for Client ID

If you want to reference your app name in code:

\`\`\`env
NEXT_PUBLIC_APP_NAME="Heirlooms"
\`\`\`

Then use it in your login component:

\`\`\`typescript
// components/login-module.tsx
const appName = process.env.NEXT_PUBLIC_APP_NAME || "our app"

// In your UI
<p>Sign in to {appName} with Google</p>
\`\`\`

---

## Verification Timeline

| Stage | Estimated Time |
|-------|----------------|
| Submit verification request | Immediate |
| Google review begins | 1-2 business days |
| Verification completion | 3-5 business days total |
| Branding goes live | Immediate after approval |

---

## Troubleshooting

### "Unverified app" warning still shows

**Causes**:
1. Verification is still pending
2. App is in testing mode (limited to test users)
3. Scopes were changed after verification

**Solutions**:
- Check verification status in Google Cloud Console
- Ensure app is in "Production" mode (not "Testing")
- Re-submit verification if scopes changed

### Logo doesn't appear

**Causes**:
1. App not yet verified
2. Logo file doesn't meet requirements
3. Changes haven't propagated yet

**Solutions**:
- Wait for verification approval
- Re-upload logo ensuring it meets size/format requirements
- Clear browser cache and test in incognito mode

### Users still see Supabase URL

**Causes**:
1. Custom domain not configured
2. OAuth client using wrong redirect URI
3. Old session cached

**Solutions**:
- Set up custom domain (see Step 3)
- Update OAuth redirect URIs to use custom domain
- Have users clear cookies and sign in again

---

## Current Status Checklist

Use this checklist to track your progress:

- [ ] Google Cloud project created
- [ ] OAuth client configured
- [ ] App name set to "Heirlooms"
- [ ] Logo uploaded (120px × 120px)
- [ ] Support email added
- [ ] Developer contact added
- [ ] Verification request submitted
- [ ] Verification approved (pending)
- [ ] Custom domain configured (optional but recommended)
- [ ] OAuth redirect URIs updated with custom domain
- [ ] Scopes verified (openid, email, profile)
- [ ] Testing completed

---

## Resources

- **Google Cloud Console**: https://console.cloud.google.com
- **Auth Platform Branding**: https://console.cloud.google.com/auth/branding
- **OAuth Clients**: https://console.cloud.google.com/auth/clients
- **Verification**: https://console.cloud.google.com/auth/verification
- **Supabase Custom Domains Guide**: https://supabase.com/docs/guides/platform/custom-domains
- **Supabase Google Auth Guide**: https://supabase.com/docs/guides/auth/social-login/auth-google

---

## Need Help?

If you encounter issues during setup:

1. Check the [Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2)
2. Review [Supabase Auth documentation](https://supabase.com/docs/guides/auth)
3. Contact Google Cloud Support for verification issues
4. Contact Supabase support for custom domain issues

---

**Last Updated**: January 2025  
**Status**: Ready for implementation
