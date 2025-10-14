import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import SprintsPage from './pages/sprints/SprintsPage';
import SprintDetailPage from './pages/sprints/SprintDetailPage';
import UserStoriesPage from './pages/user-stories/UserStoriesPage';
import UserStoryDetailPage from './pages/user-stories/UserStoryDetailPage';
import TasksPage from './pages/tasks/TasksPage';
import TaskDetailPage from './pages/tasks/TaskDetailPage';
import TeamsPage from './pages/teams/TeamsPage';
import TeamDetailPage from './pages/teams/TeamDetailPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';
import ProfilePage from './pages/profile/ProfilePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import GitHubIntegrationPage from './pages/github/GitHubIntegrationPage';
import SecurityPage from './pages/security/SecurityPage';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleBasedRoute from './components/auth/RoleBasedRoute';
import { UserRole } from './types';

function App() {
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.auth);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
          }
        />
        <Route
          path="/forgot-password"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />
          }
        />
        <Route
          path="/reset-password"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPasswordPage />
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Dashboard */}
          <Route path="dashboard" element={<DashboardPage />} />
          
          {/* Projects */}
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          
          {/* Sprints */}
          <Route path="sprints" element={<SprintsPage />} />
          <Route path="sprints/:id" element={<SprintDetailPage />} />
          
          {/* User Stories */}
          <Route path="user-stories" element={<UserStoriesPage />} />
          <Route path="user-stories/:id" element={<UserStoryDetailPage />} />
          
          {/* Tasks */}
          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/:id" element={<TaskDetailPage />} />
          
          {/* Teams */}
          <Route path="teams" element={<TeamsPage />} />
          <Route path="teams/:id" element={<TeamDetailPage />} />
          
          {/* Reports */}
          <Route path="reports" element={<ReportsPage />} />
          
          {/* Settings */}
          <Route path="settings" element={<SettingsPage />} />
          
          {/* Profile */}
          <Route path="profile" element={<ProfilePage />} />
          
          {/* GitHub Integration */}
          <Route path="github" element={<GitHubIntegrationPage />} />
          
          {/* Security */}
          <Route path="security" element={<SecurityPage />} />
          
          {/* Admin Dashboard - Role Based */}
          <Route
            path="admin"
            element={
              <RoleBasedRoute
                allowedRoles={[UserRole.Admin]}
                userRole={user?.role}
              >
                <AdminDashboardPage />
              </RoleBasedRoute>
            }
          />
        </Route>

        {/* 404 Page */}
        <Route
          path="*"
          element={
            <div className="flex flex-col items-center justify-center min-h-screen">
              <h1 className="mb-4 text-4xl font-bold text-gray-900">404</h1>
              <p className="mb-8 text-lg text-gray-600">Page not found</p>
              <a
                href="/"
                className="px-4 py-2 text-white rounded-md bg-primary-600 hover:bg-primary-700"
              >
                Go to Home
              </a>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;