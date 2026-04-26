# OpsDelta Deployment Guide

## Current Status
✅ Build complete and tested locally
✅ All branding updated (AutomationFront → OpsDelta)
✅ Integrations configured (Formspree, Calendly, email)
✅ Changes committed to git (commit: 9bf5891)

## Deployment to Vercel

### Option 1: GitHub Integration (Recommended)
1. Push changes to GitHub:
   ```bash
   git push origin main
   ```
   (Note: May require GitHub CLI auth or personal access token)

2. Go to https://vercel.com/dashboard
3. Click "Add New Project"
4. Select "AutomationFront-Landing-Page" repo
5. Vercel will auto-detect Vite config
6. Click Deploy
7. Your app will be live at: `opsdelta-<team-name>.vercel.app`

### Option 2: Direct Upload (No Git Push Needed)
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   cd ~/Documents/automationfront_landing_page/AutomationFront-Landing-Page
   vercel --prod
   ```

3. Follow CLI prompts to link project/create new one
4. Build output is ready in `./dist/`

### Option 3: Manual GitHub Push with Token
```bash
git config --global credential.helper osxkeychain
git push origin main
# Enter GitHub username + personal access token when prompted
```

## Custom Domain Setup (After Vercel Deploy)

1. Buy domain: `opsdelta.io` (if not already owned)
2. In Vercel dashboard:
   - Go to Settings → Domains
   - Add `opsdelta.io`
   - Update DNS records at registrar
3. Full setup guide: https://vercel.com/docs/concepts/get-started/deploy#step-4:-add-a-domain

## Current Config Values
- **Formspree ID:** mdaoepnz ✅
- **Calendly Link:** https://calendly.com/agim-harizaj/15min ✅
- **Contact Email:** agim.harizaj@hotmail.com ✅
- **LinkedIn:** https://www.linkedin.com/in/agim-harizaj/ ✅
- **PDF Footer Domain:** opsdelta.io ✅

## QA Checklist Before Going Live

- [ ] Form submission sends email correctly
- [ ] PDF downloads with OpsDelta branding
- [ ] Calendly link opens in new tab
- [ ] Responsive on mobile (< 375px, 768px, 1024px)
- [ ] All links work (LinkedIn, contact email, Calendly)
- [ ] Page loads in <3 seconds
- [ ] Analytics console logs appear

## Local Testing

```bash
npm run dev
# Visit http://localhost:3000
# Test full flow: audit → results → form submission → PDF download
```

## Build Artifacts

- Production build: `./dist/`
- Ready to deploy immediately
- No additional config needed (Vite already configured)

## Next Steps

1. **Push to GitHub** (enables Vercel auto-deploy on future commits)
2. **Deploy to Vercel** (main or custom domain)
3. **Test all integrations** (form, PDF, Calendly, social links)
4. **Monitor analytics** (check browser console)
5. **Set up domain** (if using custom domain)
6. **Share launch link** with audience
