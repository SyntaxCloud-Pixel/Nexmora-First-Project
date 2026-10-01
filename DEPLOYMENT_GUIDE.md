# 🚀 Deployment & Distribution Guide

## 📋 Project Overview
This is a monorepo containing two applications:
- **Admin Desktop** (Electron app) - For administrators
- **Employee Portal** (Web app) - For employees

## 🗂️ Step 1: Clean & Prepare Git Repository

### 1.1 Clean up node_modules from git
```bash
# Remove node_modules from git tracking
git rm -r --cached node_modules
git rm -r --cached apps/admin-desktop/node_modules
git rm -r --cached apps/employee-portal/node_modules
git rm -r --cached packages/supabase-client/node_modules
git rm -r --cached node_modules/admin-desktop
```

### 1.2 Add all new files
```bash
git add .
git add .gitignore
```

### 1.3 Commit changes
```bash
git commit -m "Add professional UI with Tailwind CSS and shadcn/ui components

- Installed and configured Tailwind CSS across both apps
- Added shadcn/ui components (Button, Card, Dialog, Input, Badge, Table, Toast, Spinner, Skeleton, Select)
- Built responsive layouts with professional sidebar navigation
- Redesigned Dashboard pages with statistics cards and quick actions
- Replaced raw HTML tables with professional data grids
- Added search functionality and loading states
- Integrated toast notifications for user feedback
- Added .gitignore to exclude node_modules and build artifacts"
```

## 🌐 Step 2: Set Up GitHub Repository

### 2.1 Create a new GitHub repository
1. Go to [github.com](https://github.com) and sign in
2. Click the "+" icon → "New repository"
3. Name it something like `nexmora-management-system`
4. Make it **Private** (since this is client work)
5. Don't initialize with README (we already have one)
6. Click "Create repository"

### 2.2 Connect your local repository to GitHub
```bash
# Add the remote repository (replace with your actual URL)
git remote set-url origin https://github.com/YOUR_USERNAME/nexmora-management-system.git

# Push to GitHub
git push -u origin master
```

## 🏗️ Step 3: Build the Applications

### 3.1 Build Employee Portal (Web App)
```bash
# Navigate to employee portal
cd apps/employee-portal

# Install dependencies
npm install

# Build for production
npm run build

# The built files will be in apps/employee-portal/dist/
```

### 3.2 Build Admin Desktop (Electron App)
```bash
# Navigate to admin desktop
cd apps/admin-desktop

# Install dependencies
npm install

# Build the React app
npm run build

# Package as Electron app (if electron-builder is configured)
npm run build:electron
```

## 🌍 Step 4: Deploy Employee Portal to Web

### Option A: Vercel (Recommended - Free & Easy)
1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "New Project"
3. Import your GitHub repository
4. Set the **Root Directory** to `apps/employee-portal`
5. Click "Deploy"
6. Vercel will give you a URL like `https://nexmora-portal.vercel.app`

### Option B: Netlify (Also Free)
1. Go to [netlify.com](https://netlify.com) and sign up
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub
4. Set **Build command** to `cd apps/employee-portal && npm run build`
5. Set **Publish directory** to `apps/employee-portal/dist`
6. Click "Deploy site"

### Option C: GitHub Pages (Free)
1. Go to your repository on GitHub
2. Settings → Pages
3. Set **Source** to "GitHub Actions"
4. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Employee Portal

on:
  push:
    branches: [ master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd apps/employee-portal && npm install
      - run: cd apps/employee-portal && npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./apps/employee-portal/dist
```

## 💻 Step 5: Package Admin Desktop App

### 5.1 Configure Electron Builder
Add this to `apps/admin-desktop/package.json`:

```json
{
  "build": {
    "appId": "com.nexmora.admin",
    "productName": "Nexmora Admin",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*"
    ],
    "win": {
      "target": ["nsis"]
    },
    "mac": {
      "target": ["dmg"]
    },
    "linux": {
      "target": ["AppImage"]
    }
  }
}
```

### 5.2 Build Installer
```bash
cd apps/admin-desktop
npm run build:electron
```

This will create installers in `apps/admin-desktop/release/`:
- Windows: `.exe` installer
- Mac: `.dmg` file
- Linux: `.AppImage` file

## 📦 Step 6: Distribution to Client

### For Employee Portal (Web App):
1. **Provide the URL**: Give your client the deployed URL (e.g., `https://nexmora-portal.vercel.app`)
2. **Custom Domain**: Add a custom domain like `portal.nexmora.com` (requires domain purchase)
3. **Authentication**: Client can access via the login page with credentials you create

### For Admin Desktop (Electron App):
1. **Download Files**: Upload the installers to a file sharing service:
   - Google Drive
   - Dropbox
   - WeTransfer
   - GitHub Releases

2. **Create GitHub Release**:
   ```bash
   # Tag the version
   git tag v1.0.0
   git push origin v1.0.0

   # Go to GitHub → Releases → Create new release
   # Upload the installers from apps/admin-desktop/release/
   ```

3. **Provide Download Link**: Share the release URL with your client

## 🔐 Step 7: Security Configuration

### Important: Supabase Configuration
1. **NEVER commit** `.env` files to GitHub
2. Provide your client with:
   - Supabase project URL
   - Supabase Anon Key (safe for frontend)
   - Instructions to set up their own Supabase project
3. **Service Role Key** should only be used in Edge Functions, never in frontend

### Environment Variables Template
Create `.env.example` files:

**apps/admin-desktop/.env.example:**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**apps/employee-portal/.env.example:**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📝 Step 8: Client Setup Instructions

Create a `README.md` for your client:

```markdown
# Nexmora Management System - Setup Guide

## Prerequisites
- Internet connection
- Modern web browser (Chrome, Firefox, Safari, Edge)
- For Admin Desktop: Windows 10+, macOS 10.13+, or Linux

## Employee Portal Access
1. Visit: [YOUR_DEPLOYED_URL]
2. Log in with credentials provided by administrator
3. Access your dashboard, customers, and payments

## Admin Desktop Installation
1. Download the installer for your operating system:
   - Windows: [DOWNLOAD_LINK]
   - Mac: [DOWNLOAD_LINK]
   - Linux: [DOWNLOAD_LINK]

2. Run the installer and follow the prompts
3. Launch the application
4. Log in with admin credentials

## Support
For technical support, contact: [YOUR_EMAIL]
```

## 🔄 Step 9: Future Updates

### To Update Employee Portal:
1. Make changes to code
2. Commit and push to GitHub
3. Vercel/Netlify will auto-deploy

### To Update Admin Desktop:
1. Make changes to code
2. Build new version
3. Create new GitHub Release
4. Client downloads new installer

## 📊 Step 10: Monitoring & Maintenance

### Recommended Actions:
1. **Monitor Supabase**: Check database usage and performance
2. **Error Tracking**: Consider adding Sentry for error monitoring
3. **Backup**: Regular Supabase database backups
4. **Security**: Keep dependencies updated with `npm audit fix`

## 🎯 Summary Checklist

- [ ] Clean git repository
- [ ] Add .gitignore
- [ ] Commit all changes
- [ ] Create GitHub repository
- [ ] Push to GitHub
- [ ] Build employee portal
- [ ] Deploy employee portal to Vercel/Netlify
- [ ] Build admin desktop app
- [ ] Create GitHub release with installers
- [ ] Provide client with URLs and download links
- [ ] Set up Supabase project for client
- [ ] Create setup documentation for client
- [ ] Test both applications before handoff

## 💡 Pro Tips

1. **Use Branch Protection**: Protect your main branch on GitHub
2. **Automated Testing**: Add CI/CD for automated testing
3. **Custom Domain**: Add a custom domain for professional appearance
4. **Analytics**: Add Google Analytics for usage tracking
5. **Documentation**: Keep comprehensive documentation for client

## 🆘 Common Issues & Solutions

### Issue: Build fails
**Solution**: Clear node_modules and reinstall
```bash
rm -rf node_modules
npm install
```

### Issue: Supabase connection error
**Solution**: Check environment variables and Supabase project status

### Issue: Electron app won't open
**Solution**: Check that all dependencies are installed and build is successful

---

**Need Help?** Contact: [YOUR_EMAIL] | [YOUR_PHONE]
```

## 🚀 Quick Start Commands

```bash
# Install all dependencies
npm install

# Run employee portal locally
cd apps/employee-portal
npm run dev

# Run admin desktop locally
cd apps/admin-desktop
npm run dev

# Build for production
npm run build:admin
npm run build:portal

# Deploy to Vercel
# (Via Vercel dashboard or CLI)
```