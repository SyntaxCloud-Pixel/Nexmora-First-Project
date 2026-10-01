# 🔧 Complete Guide: Building Admin Desktop Installer

## 📋 Prerequisites Check

Before building the installer, make sure you have:
- ✅ Node.js installed
- ✅ Electron installed (`npm install electron --save-dev`)
- ✅ electron-builder installed (`npm install electron-builder --save-dev`)
- ✅ Your React app builds successfully (`npm run build`)

## 🚀 Step-by-Step Building Process

### **Step 1: Build the React Application**
```bash
cd apps/admin-desktop
npm run build
```

**What this does:**
- Compiles your TypeScript code
- Bundles your React application
- Creates optimized production files
- Outputs everything to the `dist/` folder

**Verify it worked:**
- Check that `apps/admin-desktop/dist/` folder exists
- You should see `index.html` and other compiled files

### **Step 2: Build the Windows Installer**
```bash
npm run package:win
```

**What this does:**
1. Takes your built React app from `dist/`
2. Packages it with the Electron runtime
3. Creates a Windows installer (`.exe` file)
4. Creates desktop shortcuts and Start Menu entries
5. Outputs everything to `apps/admin-desktop/release/`

**What you'll get:**
- `Nexmora Admin Setup 1.0.0.exe` - The installer your client downloads
- `Nexmora Admin-win32-x64/` - Unpacked application files
- `builder-effective-config.yaml` - Build configuration details

### **Step 3: Test the Installer**
```bash
# Go to the release folder
cd release

# Run the installer (Windows)
# Double-click: "Nexmora Admin Setup 1.0.0.exe"
```

**Testing checklist:**
- [ ] Installer opens without errors
- [ ] You can choose installation directory
- [ ] Desktop shortcut is created
- [ ] Start Menu shortcut is created
- [ ] Application launches successfully
- [ ] All features work correctly

## 🌍 Building for Different Operating Systems

### **Windows (Current Setup)**
```bash
npm run package:win
```
**Output:** `.exe` installer file
**Size:** ~80-120 MB (includes Electron runtime)

### **macOS**
```bash
npm run package:mac
```
**Output:** `.dmg` disk image file
**Size:** ~90-130 MB

### **Linux**
```bash
npm run package:linux
```
**Output:** `.AppImage` file
**Size:** ~85-125 MB

### **All Platforms at Once**
```bash
npm run package:all
```
**Output:** Installers for Windows, Mac, and Linux
**Time:** Takes longer (builds all three)

## 🎨 Customizing the Installer

### **Adding App Icons**

1. **Create Icons Folder:**
```bash
mkdir apps/admin-desktop/build
```

2. **Add Icon Files:**
- `build/icon.ico` (Windows - 256x256 pixels)
- `build/icon.icns` (Mac - 1024x1024 pixels)
- `build/icon.png` (Linux - 512x512 pixels)

3. **Use Online Tools:**
- Windows: [ICO Converter](https://icoconvert.com/)
- Mac: [ICNS Converter](https://cloudconvert.com/png-to-icns)
- Linux: Use any PNG editor

### **Customizing Installer Behavior**

Your current configuration includes:

```json
"nsis": {
  "oneClick": false,                          // Show installation wizard
  "allowToChangeInstallationDirectory": true, // Let user choose where to install
  "createDesktopShortcut": true,             // Add desktop shortcut
  "createStartMenuShortcut": true             // Add Start Menu shortcut
}
```

**Other options you can add:**
```json
"nsis": {
  "oneClick": false,
  "allowToChangeInstallationDirectory": true,
  "createDesktopShortcut": true,
  "createStartMenuShortcut": true,
  "perMachine": true,                          // Install for all users
  "allowElevation": true,                     // Request admin permissions
  "installerIcon": "build/installer-icon.ico", // Custom installer icon
  "uninstallerIcon": "build/uninstaller-icon.ico", // Custom uninstaller icon
  "license": "LICENSE.txt",                   // Show license agreement
  "artifactName": "${productName}-${version}.${ext}" // Custom output filename
}
```

## 📦 Understanding the Build Process

### **What electron-builder Does:**

1. **Reads Configuration:** 
   - Looks at `"build"` section in package.json
   - Reads file inclusion patterns
   - Checks platform-specific settings

2. **Creates Application Structure:**
   ```
   Nexmora Admin/
   ├── app/                    # Your React app
   ├── electron/               # Electron runtime
   ├── resources/              # Icons and assets
   └── package.json            # Dependencies
   ```

3. **Packages for Target Platform:**
   - **Windows:** Creates NSIS installer
   - **Mac:** Creates DMG disk image
   - **Linux:** Creates AppImage

4. **Optimizes and Compresses:**
   - Minifies JavaScript
   - Compresses assets
   - Creates executable
   - Adds uninstaller

### **Build Output Structure:**

```
apps/admin-desktop/release/
├── Nexmora Admin Setup 1.0.0.exe        # Main installer
├── Nexmora Admin-win32-x64/              # Unpacked version
│   ├── Nexmora Admin.exe                 # Application executable
│   ├── resources/                        # App resources
│   └── ...                               # Other files
└── builder-effective-config.yaml         # Build details
```

## 🔧 Troubleshooting Common Issues

### **Issue: "Command not found: electron-builder"**
**Solution:**
```bash
npm install electron-builder --save-dev
```

### **Issue: "Cannot find module 'electron'"**
**Solution:**
```bash
npm install electron --save-dev
```

### **Issue: Build fails with "dist folder not found"**
**Solution:**
```bash
# Build the React app first
npm run build
# Then package
npm run package:win
```

### **Issue: Installer is too large**
**Solution:**
- Check if you're including unnecessary files
- Use `files` array in package.json to exclude
- Consider using electron-forge for smaller builds

### **Issue: App opens but shows blank screen**
**Solution:**
- Check that `dist/index.html` exists
- Verify Electron main.js points to correct path
- Check browser console for errors

## 📤 Sharing the Installer with Your Client

### **Option 1: Direct File Sharing**
1. Build the installer: `npm run package:win`
2. Upload `release/Nexmora Admin Setup 1.0.0.exe` to:
   - Google Drive
   - Dropbox
   - WeTransfer
   - OneDrive
3. Share the download link with your client

### **Option 2: GitHub Releases (Recommended)**
```bash
# Tag the version
git tag v1.0.0
git push origin v1.0.0

# Go to GitHub → Your Repository → Releases
# Click "Create new release"
# Upload the .exe file from release/ folder
# Share the release URL with client
```

### **Option 3: Automatic Deployment**
Set up GitHub Actions to automatically build and release:
```yaml
# .github/workflows/build.yml
name: Build Electron App

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd apps/admin-desktop && npm install
      - run: cd apps/admin-desktop && npm run build
      - run: cd apps/admin-desktop && npm run package:win
      - uses: softprops/action-gh-release@v1
        with:
          files: apps/admin-desktop/release/*.exe
```

## 🎯 Client Installation Instructions

Provide your client with these instructions:

### **Windows Installation:**
1. Download `Nexmora Admin Setup 1.0.0.exe`
2. Double-click the file
3. Choose installation directory (default: `C:\Program Files\Nexmora Admin`)
4. Click "Install"
5. Wait for installation to complete
6. Launch from desktop shortcut or Start Menu

### **First Run Setup:**
1. Launch the application
2. You'll see the login screen
3. Enter Supabase credentials (provided separately)
4. Start using the system!

### **Uninstallation:**
- Go to Settings → Apps → Installed Apps
- Find "Nexmora Admin"
- Click "Uninstall"
- Or run uninstaller from installation directory

## 🔐 Security Considerations

### **Before Distribution:**
1. **Code Signing:** Consider code signing for Windows (prevents security warnings)
2. **Check Dependencies:** Ensure no malicious packages
3. **Environment Variables:** Never commit `.env` files
4. **Database Security:** Use Supabase RLS policies

### **Code Signing (Optional but Recommended):**
```bash
# For Windows (requires certificate)
npm install --save-dev @electron/windows-signer

# Add to package.json build config:
"win": {
  "certificateFile": "path/to/certificate.pfx",
  "certificatePassword": "your-password"
}
```

## 📊 Build Optimization Tips

### **Reduce Installer Size:**
1. **Exclude unnecessary files:**
```json
"files": [
  "dist/**/*",
  "electron/**/*",
  "package.json",
  "!dist/*.map",           // Exclude source maps
  "!node_modules/**/test/**" // Exclude test files
]
```

2. **Use compression:**
```json
"compression": "maximum"
```

3. **asar archive:**
```json
"asar": true,
"asarUnpack": [
  "node_modules/some-module" // Unpack specific modules if needed
]
```

## 🎉 Quick Reference Commands

```bash
# Development
npm run dev                    # Start dev server
npm run electron               # Run Electron in dev mode

# Building
npm run build                  # Build React app
npm run package:win            # Build Windows installer
npm run package:mac            # Build Mac installer
npm run package:linux          # Build Linux installer
npm run package:all            # Build all platforms

# Testing
npm run lint                   # Check for code issues
npm run preview                # Preview built app in browser
```

## 📞 Support Resources

- **Electron Documentation:** [electronjs.org/docs](https://electronjs.org/docs)
- **electron-builder:** [electron.build](https://www.electron.build/)
- **Troubleshooting:** [GitHub Issues](https://github.com/electron-userland/electron-builder/issues)

## ✅ Pre-Distribution Checklist

Before sharing with your client:

- [ ] App builds successfully (`npm run build`)
- [ ] Installer creates without errors (`npm run package:win`)
- [ ] Installer runs correctly on test machine
- [ ] All features work in installed version
- [ ] Database connection works
- [ ] Authentication functions properly
- [ ] Realtime updates work
- [ ] No console errors in production build
- [ ] App icon displays correctly
- [ ] Desktop shortcuts work
- [ ] Uninstaller works correctly

---

**Pro Tip:** Always test the installer on a clean machine (different from your development machine) before sharing with your client!