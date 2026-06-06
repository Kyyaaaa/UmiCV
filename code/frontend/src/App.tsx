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

// Dashboard
import { DashboardOverview } from './pages/dashboard/DashboardOverview';

// CV Management
import { CVDashboard } from './pages/cv/CVDashboard';
import { CVWorkspace } from './pages/cv/CVWorkspace';
import { DiffViewerPage } from './pages/cv/DiffViewerPage';
import { PublishReviewPage } from './pages/cv/PublishReviewPage';

// Workflow
import { ApprovalRequestListPage } from './pages/workflow/ApprovalRequestListPage';
import { ApprovalDetailPage } from './pages/workflow/ApprovalDetailPage';
import { RoleRoute } from './routes/RoleRoute';

// User Management
import { UserListPage } from './pages/users/UserListPage';

// Notifications & Profile
import { NotificationCenterPage } from './pages/notifications/NotificationCenterPage';
import { UserProfilePage } from './pages/profile/UserProfilePage';

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
          
          {
            element: <RoleRoute allowedRoles={['TechLead', 'HR', 'Admin']} />,
            children: [
              { path: "workflow", element: <ApprovalRequestListPage /> },
              { path: "workflow/:id", element: <ApprovalDetailPage /> },
            ]
          },
          
          { path: "users", element: <UserListPage /> },
          
          { path: "notifications", element: <NotificationCenterPage /> },
          { path: "profile", element: <UserProfilePage /> }
        ]
      }
    ]
  },
  {
    path: "/login",
    element: <PublicLayout />,
    children: [
      { index: true, element: <LoginPage /> }
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
