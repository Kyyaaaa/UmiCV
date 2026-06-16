import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';

// Providers & Guards
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { PrivateLayout } from './layouts/PrivateLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Dashboard
import { DashboardOverview } from './pages/dashboard/DashboardOverview';

// CV Management
import { CVDashboard } from './pages/cv/CVDashboard';
import { CVWorkspace } from './pages/cv/CVWorkspace';
import { DiffViewerPage } from './pages/cv/DiffViewerPage';
import { PublishReviewPage } from './pages/cv/PublishReviewPage';
import { QuickCVMockup } from './pages/cv/QuickCVMockup';
import { CVViewerPage } from './pages/cv/CVViewerPage';

// Workflow
import { ApprovalRequestListPage } from './pages/workflow/ApprovalRequestListPage';
import { ApprovalDetailPage } from './pages/workflow/ApprovalDetailPage';
import { RoleRoute } from './routes/RoleRoute';

// User Management
import { UserListPage } from './pages/users/UserListPage';
import { DepartmentListPage } from './pages/departments/DepartmentListPage';
import { ProjectListPage } from './pages/projects/ProjectListPage';

// Notifications & Profile
import { NotificationCenterPage } from './pages/notifications/NotificationCenterPage';
import { UserProfilePage } from './pages/profile/UserProfilePage';

// Batch Request
import { BatchRequestListPage } from './pages/batch-requests/BatchRequestListPage';
import { BatchRequestDetailPage } from './pages/batch-requests/BatchRequestDetailPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <PrivateLayout />,
        children: [
          { index: true, element: <DashboardOverview /> },
          
          { path: "cv", element: <CVDashboard /> },
          { path: "cv/:id/workspace", element: <CVWorkspace /> },
          { path: "cv/:id/diff", element: <DiffViewerPage /> },
          { path: "cv/:id/publish", element: <PublishReviewPage /> },
          { path: "cv/:id/view", element: <CVViewerPage /> },
          { path: "mockup/edit-cv", element: <QuickCVMockup /> },
          
          {
            element: <RoleRoute allowedRoles={['TechLead', 'HR', 'Admin']} />,
            children: [
              { path: "workflow", element: <ApprovalRequestListPage /> },
              { path: "workflow/:id", element: <ApprovalDetailPage /> },
            ]
          },
          
          {
            element: <RoleRoute allowedRoles={['HR', 'Admin']} />,
            children: [
              { path: "hr/batch-requests", element: <BatchRequestListPage /> },
              { path: "hr/batch-requests/:id", element: <BatchRequestDetailPage /> },
            ]
          },
          
          {
            element: <RoleRoute allowedRoles={['Admin']} />,
            children: [
              { path: "users", element: <UserListPage /> },
              { path: "departments", element: <DepartmentListPage /> },
              { path: "projects", element: <ProjectListPage /> },
            ]
          },
          
          { path: "notifications", element: <NotificationCenterPage /> },
          { path: "profile", element: <UserProfilePage /> }
        ]
      }
    ]
  },
  {
    element: <PublicLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> }
    ]
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
