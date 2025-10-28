import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './hooks/redux.ts';
import { AppLayout } from './components/layout/AppLayout.tsx';
import { AuthLayout } from './components/layout/AuthLayout.tsx';
import { ProtectedRoute } from './components/auth/ProtectedRoute.tsx';
import { LoginPage } from './pages/auth/LoginPage.tsx';
import { RegisterPage } from './pages/auth/RegisterPage.tsx';
import { EmailVerificationPage } from './pages/auth/EmailVerificationPage.tsx';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage.tsx';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { ProjectsPage } from './pages/projects/ProjectsPage.tsx';
import { ProjectDetailPage } from './pages/projects/ProjectDetailPage.tsx';
import { ProjectFormPage } from './pages/projects/ProjectFormPage.tsx';
import { ProductBacklogPage } from './pages/backlog/ProductBacklogPage.tsx';
import { SprintsPage } from './pages/sprints/SprintsPage.tsx';
import CreateTaskPage from './pages/tasks/CreateTaskPage.tsx';
import { KanbanBoardPage } from './pages/kanban/KanbanBoardPage.tsx';
import { LoadingSpinner } from './components/ui/LoadingSpinner.tsx';

function App() {
  const { isAuthenticated, isLoading, token } = useAppSelector(state => state.auth);

  // Show loading during initial authentication check
  if (isLoading || (token && !isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route
        path="/auth"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthLayout />}
      >
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="verify-email" element={<EmailVerificationPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Route>

      {/* Protected app routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/new" element={<ProjectFormPage />} />
        <Route path="projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="projects/:projectId/edit" element={<ProjectFormPage />} />
        <Route path="projects/:projectId/backlog" element={<ProductBacklogPage />} />
        <Route path="projects/:projectId/sprints" element={<SprintsPage />} />
        <Route path="projects/:projectId/tasks/new" element={<CreateTaskPage />} />
        <Route path="projects/:projectId/kanban" element={<KanbanBoardPage />} />
        <Route path="tasks/new" element={<CreateTaskPage />} />
        {/* Add more routes as we implement them */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/auth/login'} replace />}
      />
    </Routes>
  );
}

export default App;
