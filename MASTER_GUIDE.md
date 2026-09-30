# Nexmora Centralized Management System
**Master Guide & Testing Walkthrough**

This document serves as the master reference for running, testing, and deploying the Nexmora centralized enterprise management software.

## 🏗 System Architecture
Nexmora is built as an **npm workspaces monorepo** with two primary frontends that share a single backend and security context.

1. **Backend**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions). All security is enforced at the database level via Row Level Security (RLS).
2. **Admin Desktop** (`apps/admin-desktop`): An Electron/React application for administrators to manage employees and system settings.
3. **Employee Portal** (`apps/employee-portal`): A React web application for employees to manage customers and record payments.

---

## 🚀 Running the Development Servers

Open a terminal in the root directory (`Nexmora`) and run the following commands:

**To run the Admin Desktop:**
```bash
npm run dev:admin
```
*(This launches on http://localhost:5174)*

**To run the Employee Portal:**
```bash
npm run dev:portal
```
*(This launches on http://localhost:5173)*

---

## 🧪 Testing the Complete Workflow

Follow these exact steps to test the entire lifecycle of the application:

### Step 1: The Master Admin (Supabase Dashboard)
Because our system is secure and closed-registration, the very first Admin must be bootstrapped manually.
1. Go to your Supabase Dashboard -> **Authentication** -> **Add User**.
2. Create `admin@nexmora.com` and a password. Copy their generated **UID**.
3. Go to the **SQL Editor** in Supabase and run:
   ```sql
   INSERT INTO public.profiles (id, first_name, last_name, email, role_id, account_status)
   VALUES ('PASTE_UID_HERE', 'Super', 'Admin', 'admin@nexmora.com', '11111111-1111-1111-1111-111111111111', 'ACTIVE');
   ```

### Step 2: Admin Operations (Admin Desktop)
1. Open the **Admin Desktop** (`http://localhost:5174`) and log in with the `admin@nexmora.com` account.
2. Navigate to the **Employees** tab.
3. Click **Add Employee**. Fill out the details (e.g., `employee1@nexmora.com`). 
4. *What happens under the hood:* This triggers the `create-employee` Edge Function. It bypasses RLS using the Service Role Key to securely create a Supabase Auth user and Profile simultaneously, preventing privilege escalation.
5. Watch the table update instantly via Supabase Realtime!

### Step 3: Employee Operations (Employee Portal)
1. Open the **Employee Portal** (`http://localhost:5173`) in a separate browser or incognito window.
2. Log in using the `employee1@nexmora.com` account you just created.
3. Navigate to the **Customers** tab.
4. Click **Add Customer** and fill out the details.
5. Navigate to the **Payments** tab to view or log payments.
6. Check your **My Profile** tab to see the employee details.

### Step 4: Testing Real-time Sync
1. Put the Admin Desktop and Employee Portal side-by-side on your screen.
2. As the employee, add a new customer or log a payment.
3. Watch as the Admin dashboard updates instantly without needing to refresh the page.

---

## 📦 Packaging for Production

When you are ready to distribute this software to your 1,200 employees, you will package the two applications separately.

### 1. Building the Admin Desktop (Electron .exe)
The Admin app is designed to run natively on Windows/Mac. You will need to wrap the Vite build in Electron.
1. Run `npm run build:admin`
2. Configure `electron-builder` in your `apps/admin-desktop/package.json` to target Windows (`.exe`) or macOS (`.dmg`).
3. Run `npx electron-builder` to generate the installer files.
4. Distribute the `.exe` to your Admins.

### 2. Deploying the Web Apps (Vercel)
Both apps are static Vite builds, so each one is deployed as its own Vercel project from this repo. Netlify and Cloudflare Pages work too, and each app ships a `public/_redirects` file for them.

| Setting | Employee Portal | Admin (web) |
|---|---|---|
| Root Directory | `apps/employee-portal` | `apps/admin-desktop` |
| Install Command | `cd ../.. && npm ci` | `cd ../.. && npm ci` |
| Build Command | `cd ../.. && npm run build:portal` | `cd ../.. && npm run build:admin` |
| Output Directory | `dist` | `dist` |

1. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to each project's Environment Variables. `.env` files are not committed; copy `.env.example`.
2. Each app's `vercel.json` rewrites all paths to `index.html` so that client-side routes (e.g. `/dashboard`) still work on refresh.
3. Deploy the edge function: `npx supabase functions deploy create-employee`.
4. In Supabase -> Authentication -> URL Configuration, add both deployed URLs (e.g. `portal.nexmora.com`, `admin.nexmora.com`).
