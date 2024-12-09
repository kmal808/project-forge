import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Toaster } from 'sonner';
import { PayrollPage } from './components/payroll/PayrollPage';
import { CrewPortal } from './components/crews/CrewPortal';
import { InventoryPage } from './components/inventory/InventoryPage';
import { ConfiguratorPage } from './components/configurator/ConfiguratorPage'; 
import { LoginPage } from './components/auth/LoginPage';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <>
      <ThemeProvider>
        <Router>
          <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/inventory" replace />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/crews" element={<CrewPortal />} />
                <Route path="/payroll" element={<PayrollPage />} />
                <Route path="/configurator" element={<ConfiguratorPage />} />
              </Route>
            </Route>
          </Routes>
          </AuthProvider>
        </Router>
      </ThemeProvider>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
