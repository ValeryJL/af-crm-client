import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './context/AuthContext.tsx'
import { MainLayout } from './layouts/MainLayout.tsx'
import { Dashboard } from './pages/Dashboard.tsx'
import { Login } from './pages/Login.tsx'
import { Setup } from './pages/Setup.tsx'
import { Technicians as Users } from './pages/Technicians.tsx'
import { Services } from './pages/Services.tsx'
import { CalendarView } from './pages/CalendarView.tsx'
import { Settings } from './pages/Settings.tsx'
import { RegisterInvited } from './pages/RegisterInvitedPage.tsx'
import { ServiceDetail } from './pages/ServiceDetail.tsx'
import { ServiceUnavailable } from './pages/ServiceUnavailable.tsx'
import { useAuth } from './context/AuthContext.tsx'
import apiClient from './api/client'
import type { ReactNode } from 'react'

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const SetupCheck = ({ children }: { children: ReactNode }) => {
  const [setupRequired, setSetupRequired] = useState<boolean | null>(null);
  const [isApiDown, setIsApiDown] = useState<boolean>(false);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const response = await apiClient.get('/auth/setup-status');
        setIsApiDown(false);
        if (response.data.setupRequired) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setSetupRequired(true);
        } else {
          setSetupRequired(false);
        }
      } catch (error: any) {
        console.error('Failed to check setup status:', error);
        const status = error.response?.status;

        // If it's a 502, 503, 504 or network error (!status)
        if (!status || (status >= 502 && status <= 504)) {
          setIsApiDown(true);
          setSetupRequired(false);
        } else if (status === 401 || status === 404) {
          setSetupRequired(true);
        } else {
          setSetupRequired(false);
        }
      }
    };
    checkSetup();
  }, []);

  if (setupRequired === null && !isApiDown) return null;

  const currentPath = window.location.pathname;

  if (isApiDown && currentPath !== '/unavailable') {
    return <Navigate to="/unavailable" replace />;
  }

  if (!isApiDown && currentPath === '/unavailable') {
    return <Navigate to="/" replace />;
  }

  if (setupRequired && currentPath !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  if (!setupRequired && !isApiDown && currentPath === '/setup') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <SetupCheck>
          <Routes>
            <Route path="/setup" element={<Setup />} />
            <Route path="/unavailable" element={<ServiceUnavailable />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterInvited />} />
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </SetupCheck>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
