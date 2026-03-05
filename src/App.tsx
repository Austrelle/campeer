// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PendingPage from './pages/PendingPage';
import HomePage from './pages/HomePage';
import TaskFeedPage from './pages/TaskFeedPage';
import PostTaskPage from './pages/PostTaskPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import FeedbackPage from './pages/FeedbackPage';
import AdminDashboard from './pages/AdminDashboard';
import TermsPage from './pages/TermsPage';
import Layout from './components/Layout';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { userProfile, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!userProfile) return <Navigate to="/login" replace />;
  if (!userProfile.isApproved) return <Navigate to="/pending" replace />;
  if (adminOnly && userProfile.role !== 'admin') return <Navigate to="/home" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { userProfile, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (userProfile?.isApproved) return <Navigate to={userProfile.role === 'admin' ? '/admin' : '/home'} replace />;
  return <>{children}</>;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-sky-500/30 border-t-sky-500 animate-spin" />
        <span className="text-slate-400 text-sm font-body">Loading CAMPEER...</span>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/pending" element={<PendingPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/home" element={<ProtectedRoute><Layout><HomePage /></Layout></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><Layout><TaskFeedPage /></Layout></ProtectedRoute>} />
      <Route path="/post-task" element={<ProtectedRoute><Layout><PostTaskPage /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
      <Route path="/about" element={<ProtectedRoute><Layout><AboutPage /></Layout></ProtectedRoute>} />
      <Route path="/feedback" element={<ProtectedRoute><Layout><FeedbackPage /></Layout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
      <Route path="/terms-inside" element={<ProtectedRoute><Layout><TermsPage /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}