import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider } from './contexts/AuthProvider';
import { useAuth } from './contexts/useAuth';
import { AdminLayout } from './components/admin/AdminLayout';
import { LoginPage } from './pages/admin/LoginPage';
import { DashboardOverviewPage } from './pages/admin/DashboardOverviewPage';
import { LandingPageEditorPage } from './pages/admin/LandingPageEditorPage';
import { HeroEditorPage } from './pages/admin/HeroEditorPage';
import { AboutEditorPage } from './pages/admin/AboutEditorPage';
import { ServicesPage } from './pages/admin/ServicesPage';
import { ProjectsPage } from './pages/admin/ProjectsPage';
import { SkillsPage } from './pages/admin/SkillsPage';
import { ProcessPage } from './pages/admin/ProcessPage';
import { TestimonialsPage } from './pages/admin/TestimonialsPage';
import { StatisticsPage } from './pages/admin/StatisticsPage';
import { NavigationManagerPage } from './pages/admin/NavigationManagerPage';
import { ContactSettingsPage } from './pages/admin/ContactSettingsPage';
import { SeoSettingsPage } from './pages/admin/SeoSettingsPage';
import { PublishingHistoryPage } from './pages/admin/PublishingHistoryPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';
import { MediaLibraryPage } from './pages/admin/MediaLibraryPage';
import { ContactMessagesPage } from './pages/admin/ContactMessagesPage';
import { WebsiteSettingsPage } from './pages/admin/WebsiteSettingsPage';
import { PublicPortfolioPage } from './pages/public/PublicPortfolioPage';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-[#f6b7d2]">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-[#f04796] animate-ping" />
          <span className="text-sm font-medium tracking-wide">Loading session...</span>
        </div>
      </div>
    );
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
        <Route path="hero" element={<HeroEditorPage />} />
        <Route path="about" element={<AboutEditorPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="skills" element={<SkillsPage />} />
        <Route path="process" element={<ProcessPage />} />
        <Route path="testimonials" element={<TestimonialsPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="navigation" element={<NavigationManagerPage />} />
        <Route path="contact" element={<ContactSettingsPage />} />
        <Route path="messages" element={<ContactMessagesPage />} />
        <Route path="media" element={<MediaLibraryPage />} />
        <Route path="seo" element={<SeoSettingsPage />} />
        <Route path="settings" element={<WebsiteSettingsPage />} />
        <Route path="history" element={<PublishingHistoryPage />} />
        <Route path="profile" element={<AdminProfilePage />} />
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
