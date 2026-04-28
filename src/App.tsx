import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { Toaster } from 'sonner';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Invoices = lazy(() => import('./pages/Invoices'));
const NewInvoice = lazy(() => import('./pages/NewInvoice'));
const Clients = lazy(() => import('./pages/Clients'));
const Login = lazy(() => import('./pages/Login'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const PublicInvoice = lazy(() => import('./pages/PublicInvoice'));
const InvoiceDetail = lazy(() => import('./pages/InvoiceDetail'));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, profile } = useAuth();

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-bg font-display text-4xl animate-pulse">ChasePro</div>;
  if (!user) return <Navigate to="/login" />;
  if (profile && !profile.onboarded && window.location.pathname !== '/onboarding') return <Navigate to="/onboarding" />;

  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-bg font-display text-2xl">Loading...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            
            {/* App Layout Routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
            <Route path="/invoices/new" element={<ProtectedRoute><NewInvoice /></ProtectedRoute>} />
            <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceDetail /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            
            {/* Public Routes */}
            <Route path="/pay/:id" element={<PublicInvoice />} />
            <Route path="/invoice/:id" element={<PublicInvoice />} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </Router>
  );
}
