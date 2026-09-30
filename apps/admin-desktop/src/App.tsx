import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from 'supabase-client';
import { ToastProvider } from './components/ui/Toast';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { Customers } from './pages/Customers';
import { Packages } from './pages/Packages';
import { Payments } from './pages/Payments';
import { AuditLogs } from './pages/AuditLogs';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/audit-logs" element={<AuditLogs />} />
              </Route>
            </Route>
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
