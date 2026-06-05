import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

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

// User Management
import { UserListPage } from './pages/users/UserListPage';

// Notifications & Profile
import { NotificationCenterPage } from './pages/notifications/NotificationCenterPage';
import { UserProfilePage } from './pages/profile/UserProfilePage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Private Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<PrivateLayout />}>
              <Route path="/" element={<DashboardOverview />} />
              
              {/* CV Management */}
              <Route path="/cv" element={<CVDashboard />} />
              <Route path="/cv/:id/workspace" element={<CVWorkspace />} />

              <Route path="/cv/:id/diff" element={<DiffViewerPage />} />
              <Route path="/cv/:id/publish" element={<PublishReviewPage />} />
              
              {/* Workflow & Approval */}
              <Route path="/workflow" element={<ApprovalRequestListPage />} />
              <Route path="/workflow/:id" element={<ApprovalDetailPage />} />
              
              {/* User Management */}
              <Route path="/users" element={<UserListPage />} />
              
              {/* Notifications & Profile */}
              <Route path="/notifications" element={<NotificationCenterPage />} />
              <Route path="/profile" element={<UserProfilePage />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
