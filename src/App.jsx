import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import ConsultantsPage from './pages/ConsultantsPage';
import LeadsPage from './pages/LeadsPage';
import PaymentsPage from './pages/PaymentsPage';
import RegisterPage from './pages/RegisterPage';
import DashboardStats from './pages/DashboardStats';
import LeadHistoryPage from './pages/LeadHistoryPage';
import QuotationsPage from './pages/QuotationsPage';
import CreateQuotationPage from './pages/CreateQuotationPage';
import InvoicesPage from './pages/InvoicesPage';
import QuotationViewPage from './pages/QuotationViewPage';
import PaymentReceiptPage from './pages/PaymentReceiptPage';
import FormalInvoicePage from './pages/FormalInvoicePage';
import ConsultantDetailPage from './pages/ConsultantDetailPage';
import ContactsPage from './pages/ContactsPage';
import ContactDetailPage from './pages/ContactDetailPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-[#3f7abe] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/dashboard/stats" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#1e293b',
            borderRadius: '24px',
            padding: '16px 24px',
            fontSize: '13px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }
        }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="stats" element={<DashboardStats />} />
                    <Route path="leads" element={<LeadsPage />} />
                    <Route path="leads/:id/history" element={<LeadHistoryPage />} />
                    <Route path="quotations" element={<QuotationsPage />} />
                    <Route path="quotations/create" element={<CreateQuotationPage />} />
                    <Route path="quotations/view/:id" element={<QuotationViewPage />} />
                    <Route path="invoices" element={<InvoicesPage />} />
                    <Route path="invoices/view/:id" element={<FormalInvoicePage />} />
                    <Route path="consultants" element={<AdminRoute><ConsultantsPage /></AdminRoute>} />
                    <Route path="consultants/:id" element={<AdminRoute><ConsultantDetailPage /></AdminRoute>} />
                    <Route path="contacts" element={<ContactsPage />} />
                    <Route path="contacts/:id" element={<ContactDetailPage />} />
                    <Route path="payments" element={<PaymentsPage />} />
                    <Route path="payments/receipt/:id" element={<PaymentReceiptPage />} />
                    <Route path="*" element={<Navigate to="stats" />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
