import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Toaster } from 'sonner';
import { PayrollPage } from './components/payroll/PayrollPage';
import { CrewPortal } from './components/crews/CrewPortal';
import { InventoryPage } from './components/inventory/InventoryPage';
import { ConfiguratorPage } from './components/configurator/ConfiguratorPage'; 
import { DashboardPage } from './components/dashboard/DashboardPage';
import { LoginPage } from './components/auth/LoginPage';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/inventory/:containerId" element={<InventoryPage />} />
                <Route path="/crews" element={<CrewPortal />} />
                <Route path="/payroll" element={<PayrollPage />} />
                <Route path="/configurator" element={<ConfiguratorPage />} />
              </Route>
            </Route>
          </Routes>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;