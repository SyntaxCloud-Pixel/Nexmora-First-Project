# 🌐 Vercel Deployment Guide for Employee Portal

## 📋 Prerequisites
- GitHub account with your project pushed
- Vercel account (free)
- Supabase project URL and Anon Key

## 🚀 Step-by-Step Deployment

### 1. Push Your Code to GitHub (if not done)
```bash
git add .
git commit -m "Ready for deployment"
git push origin master
```

### 2. Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Sign up with GitHub (recommended)
4. Authorize Vercel to access your repositories

### 3. Import Your Project
1. After signup, you'll see the dashboard
2. Click "Add New Project" or "Import Project"
3. Find your repository: `nexmora-management-system`
4. Click "Import"

### 4. Configure Project Settings

**Basic Settings:**
- **Project Name:** `nexmora-employee-portal`
- **Framework Preset:** Vite (should auto-detect)
- **Root Directory:** `apps/employee-portal`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

**Environment Variables:**
Click "Environment Variables" → "Add New":
```
Name: VITE_SUPABASE_URL
Value: your_supabase_project_url

Name: VITE_SUPABASE_ANON_KEY  
Value: your_supabase_anon_key
```

### 5. Deploy
1. Click "Deploy"
2. Wait for the build (1-2 minutes)
3. You'll see a live URL: `https://nexmora-employee-portal.vercel.app`

### 6. Test Your Deployment
- Open the provided URL
- Test login functionality
- Check all features work
- Test on mobile device

## 🔧 Post-Deployment Configuration

### Add Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `portal.nexmora.com`)
4. Follow DNS instructions

### Automatic Deployments
Vercel automatically deploys when you push to GitHub:
```bash
# Make changes
git add .
git commit -m "Update employee portal"
git push origin master

# Vercel automatically builds and deploys!
```

## 🐛 Troubleshooting

### Build Fails
**Problem:** Build fails with errors
**Solution:**
- Check that `npm run build` works locally
- Verify environment variables are set correctly
- Check Vercel build logs for specific errors

### Environment Variables Not Working
**Problem:** App can't connect to Supabase
**Solution:**
- Verify variable names start with `VITE_`
- Check values are correct (no extra spaces)
- Redeploy after adding variables

### White Screen After Deployment
**Problem:** App loads but shows blank screen
**Solution:**
- Check browser console for errors
- Verify build output directory is correct
- Check that index.html exists in dist folder

### Routing Issues
**Problem:** Refreshing pages shows 404
**Solution:**
- Vercel handles this automatically for Vite
- If issues persist, add `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 📊 Monitoring

### View Build Logs
1. Go to your project on Vercel
2. Click "Deployments"
3. Click on any deployment to see logs

### Analytics
1. Go to Analytics tab
2. View visitor stats, performance, etc.

## 🔄 Updating Your App

### Make Changes Locally
```bash
# Make your changes
cd apps/employee-portal
# Edit files...

# Test locally
npm run dev

# Commit and push
git add .
git commit -m "Add new feature"
git push origin master
```

### Automatic Deployment
- Vercel detects the push
- Automatically builds and deploys
- Your site updates within 1-2 minutes

## 🔒 Security

### Environment Variables Security
- ✅ Environment variables are encrypted
- ✅ Never exposed in client-side code
- ✅ Only accessible to your build process

### HTTPS/SSL
- ✅ Automatic HTTPS certificate
- ✅ No additional configuration needed
- ✅ Secure by default

## 💡 Pro Tips

### Preview Deployments
Every GitHub pull request gets a preview URL:
- Test changes before merging
- Share preview URLs with team
- Automatic cleanup after 7 days

### Branch Previews
Deploy different branches separately:
- Main branch: production URL
- Feature branches: preview URLs
- Easy A/B testing

### Performance Optimization
Vercel automatically:
- Optimizes images
- Minifies code
- Caches assets
- Uses global CDN

## 📞 Support Resources

- **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Vercel Community:** [vercel.com/community](https://vercel.com/community)
- **Status Page:** [vercel-status.com](https://vercel-status.com)

## ✅ Deployment Checklist

Before considering deployment complete:

- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] Build settings configured correctly
- [ ] Environment variables added
- [ ] Initial deployment successful
- [ ] Live URL accessible
- [ ] Login functionality works
- [ ] All features tested
- [ ] Mobile responsiveness checked
- [ ] Custom domain configured (if desired)
- [ ] Team members invited (if needed)

---

**Your Employee Portal is now live!** Share the Vercel URL with your employees and they can start using it immediately.