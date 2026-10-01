# 🏢 Nexmora Management System

A comprehensive Employee & Customer Management System built with modern web technologies.

## 🌟 Features

### Admin Desktop Application
- **Employee Management**: Add, edit, and manage staff accounts
- **Customer Management**: Oversee all client accounts and subscriptions
- **Package Management**: Create and manage service packages
- **Payment Tracking**: Monitor all financial transactions
- **Audit Logs**: Complete system activity tracking
- **Real-time Updates**: Live data synchronization via Supabase Realtime

### Employee Portal (Web Application)
- **Customer Dashboard**: View and manage assigned customers
- **Payment Recording**: Log and track payment transactions
- **Profile Management**: Update personal information
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI Framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Components
- **React Router** - Navigation
- **Lucide Icons** - Icon library

### Backend
- **Supabase** - Database, Authentication, Realtime
- **PostgreSQL** - Database
- **Row Level Security (RLS)** - Data protection
- **Edge Functions** - Server-side logic

### Desktop
- **Electron** - Desktop application framework
- **electron-builder** - Application packaging

## 📁 Project Structure

```
nexmora-monorepo/
├── apps/
│   ├── admin-desktop/          # Electron admin application
│   │   ├── src/
│   │   │   ├── components/     # Reusable components
│   │   │   ├── pages/          # Page components
│   │   │   └── lib/            # Utilities
│   │   └── package.json
│   └── employee-portal/        # Web employee application
│       ├── src/
│       │   ├── components/     # Reusable components
│       │   ├── pages/          # Page components
│       │   └── lib/            # Utilities
│       └── package.json
├── packages/
│   ├── supabase-client/        # Shared Supabase client
│   └── shared-types/           # Shared TypeScript types
├── supabase/
│   ├── functions/              # Edge functions
│   └── migrations/             # Database migrations
└── package.json                # Root package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/nexmora-management-system.git
cd nexmora-management-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create `.env` files in both app directories:

**apps/admin-desktop/.env:**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**apps/employee-portal/.env:**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run the applications**

```bash
# Run Employee Portal (Web)
npm run dev:portal

# Run Admin Desktop (Electron)
npm run dev:admin
```

## 🏗️ Building for Production

### Employee Portal
```bash
cd apps/employee-portal
npm run build
```

### Admin Desktop
```bash
cd apps/admin-desktop
npm run build
npm run build:electron  # Creates desktop installers
```

## 🔐 Security Features

- **Role-Based Access Control (RBAC)**: Admin, Employee roles
- **Row Level Security (RLS)**: Database-level access control
- **Authentication**: Secure login via Supabase Auth
- **Audit Logging**: Complete activity tracking
- **Edge Functions**: Secure server-side operations

## 📊 Database Schema

The system uses Supabase with the following main tables:
- `profiles` - User profiles and employee data
- `customers` - Customer accounts
- `packages` - Service packages
- `payments` - Payment transactions
- `audit_logs` - System activity logs
- `roles` - User roles and permissions

## 🌐 Deployment

### Employee Portal
Deployed to [Vercel/Netlify] - [URL]

### Admin Desktop
Available as downloadable installers - [Release URL]

## 📝 Development Scripts

```bash
# Development
npm run dev:admin      # Run admin desktop
npm run dev:portal     # Run employee portal

# Building
npm run build:admin    # Build admin desktop
npm run build:portal   # Build employee portal

# Linting
npm run lint:admin     # Lint admin desktop
npm run lint:portal    # Lint employee portal
```

## 🤝 Contributing

This is a client project. For internal development:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit pull request

## 📄 License

Proprietary - Client confidential

## 👥 Support

For technical support, contact:
- Email: [YOUR_EMAIL]
- Phone: [YOUR_PHONE]

## 🔄 Version History

- **v1.0.0** - Initial release with core features
  - Employee and Customer management
  - Payment tracking
  - Package management
  - Audit logging
  - Real-time updates

---

**Built with ❤️ using modern web technologies**