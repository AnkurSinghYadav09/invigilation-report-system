import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { useAuthStore } from './store/authStore';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const PendingApproval = lazy(() => import('./pages/PendingApproval'));
const InstructorDashboard = lazy(() => import('./pages/instructor/Dashboard'));
const InstructorProfile = lazy(() => import('./pages/instructor/Profile'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminDuties = lazy(() => import('./pages/admin/Duties'));
const AdminInstructors = lazy(() => import('./pages/admin/Instructors'));
const AdminExams = lazy(() => import('./pages/admin/Exams'));
const AdminRooms = lazy(() => import('./pages/admin/Rooms'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Protected Route Component
 * Redirects to login if not authenticated
 */
function ProtectedRoute({ children, requiredRole }) {
  const { user, role, loading } = useAuthStore();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Pending users can only access pending approval page
  if (role === 'pending' && !window.location.pathname.includes('/pending-approval')) {
    return <Navigate to="/pending-approval" replace />;
  }

  // Role-based access control
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/instructor/dashboard'} replace />;
  }

  return children;
}

export default function App() {
  const { initialize, user, role } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            user ? (
              role === 'pending' ? (
                <Navigate to="/pending-approval" replace />
              ) : (
                <Navigate to={role === 'admin' ? '/admin/dashboard' : '/instructor/dashboard'} replace />
              )
            ) : (
              <Login />
            )
          } />

          <Route path="/signup" element={
            user ? (
              role === 'pending' ? (
                <Navigate to="/pending-approval" replace />
              ) : (
                <Navigate to={role === 'admin' ? '/admin/dashboard' : '/instructor/dashboard'} replace />
              )
            ) : (
              <Signup />
            )
          } />

          {/* Root redirect */}
          <Route path="/" element={
            user ? (
              role === 'pending' ? (
                <Navigate to="/pending-approval" replace />
              ) : (
                <Navigate to={role === 'admin' ? '/admin/dashboard' : '/instructor/dashboard'} replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          {/* Pending Approval */}
          <Route
            path="/pending-approval"
            element={
              <ProtectedRoute>
                <PendingApproval />
              </ProtectedRoute>
            }
          />

          {/* Instructor Routes */}
          <Route
            path="/instructor/dashboard"
            element={
              <ProtectedRoute requiredRole="instructor">
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/instructor/profile"
            element={
              <ProtectedRoute requiredRole="instructor">
                <InstructorProfile />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/duties"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDuties />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/instructors"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminInstructors />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/exams"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminExams />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/rooms"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminRooms />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminUsers />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
