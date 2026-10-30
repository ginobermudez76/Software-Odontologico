import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { AppLayout } from './layouts/app-layout';
import { LoginView } from './features/auth/login-view';
import { DashboardView } from './features/dashboard/dashboard-view';
import { PatientList } from './features/patients';
import { AppointmentsCalendar } from './features/appointments';
import { PosCheckout, CashShiftManager } from './features/billing';
import { Odontogram2D } from './features/clinical-records';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginView />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardView />} />
            <Route path="patients" element={<PatientList />} />
            <Route path="appointments" element={<AppointmentsCalendar />} />
            <Route path="billing/pos" element={<PosCheckout />} />
            <Route path="billing/cash-register" element={<CashShiftManager />} />
            <Route path="clinical-records" element={<Odontogram2D />} />
            {/* Rutas dinámicas secundarias */}
            <Route
              path="*"
              element={
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
                  <span className="material-symbols-outlined text-4xl text-teal-600 mb-2">construction</span>
                  <h2 className="text-lg font-semibold text-slate-800">Módulo en Carga Dinámica</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Esta ruta se encuentra registrada dinámicamente y autorizada según su rol.
                  </p>
                </div>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

