import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminLayout } from './components/admin/AdminLayout';
import { LoginPage } from './pages/admin/LoginPage';
import { DashboardOverviewPage } from './pages/admin/DashboardOverviewPage';
import { LandingPageEditorPage } from './pages/admin/LandingPageEditorPage';
import { AboutEditorPage } from './pages/admin/AboutEditorPage';
import { ServicesPage } from './pages/admin/ServicesPage';
import { ProjectsPage } from './pages/admin/ProjectsPage';
import { SkillsPage } from './pages/admin/SkillsPage';
import { ProcessPage } from './pages/admin/ProcessPage';
import { TestimonialsPage } from './pages/admin/TestimonialsPage';
import { StatisticsPage } from './pages/admin/StatisticsPage';
import { MediaLibraryPage } from './pages/admin/MediaLibraryPage';
import { ContactMessagesPage } from './pages/admin/ContactMessagesPage';
import { WebsiteSettingsPage } from './pages/admin/WebsiteSettingsPage';
import { PublicPortfolioPage } from './pages/public/PublicPortfolioPage';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicPortfolioPage />} />
      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverviewPage />} />
        <Route path="landing-page" element={<LandingPageEditorPage />} />
        <Route path="about" element={<AboutEditorPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="skills" element={<SkillsPage />} />
        <Route path="process" element={<ProcessPage />} />
        <Route path="testimonials" element={<TestimonialsPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="media" element={<MediaLibraryPage />} />
        <Route path="messages" element={<ContactMessagesPage />} />
        <Route path="settings" element={<WebsiteSettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
