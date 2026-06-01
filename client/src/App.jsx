import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './contexts/AppContext';
import Chatbot from './components/Chatbot/Chatbot.jsx';

// Reusable custom layout skeleton loader
const PageLoader = () => (
  <div className="min-h-screen bg-[#08080a] flex items-center justify-center">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-400 text-xs font-medium uppercase tracking-widest animate-pulse">Loading Cinema Room...</p>
    </div>
  </div>
);

// Protected Gates
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useApp();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const ProfileGatedRoute = ({ children }) => {
  const { activeProfile } = useApp();
  return activeProfile ? children : <Navigate to="/profiles" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useApp();
  return user && user.role === 'admin' ? children : <Navigate to="/browse" replace />;
};

// Lazy Loaded Screens (Code-Splitting performance optimization)
const Landing = lazy(() => import('./pages/Landing/Landing.jsx'));
const Login = lazy(() => import('./pages/Login/Login.jsx'));
const AdminLogin = lazy(() => import('./pages/Login/AdminLogin.jsx'));
const Signup = lazy(() => import('./pages/Signup/Signup.jsx'));
const Profiles = lazy(() => import('./pages/Profile/Profiles.jsx'));
const Home = lazy(() => import('./pages/Home/Home.jsx'));
const Explore = lazy(() => import('./pages/Explore/Explore.jsx'));
const Search = lazy(() => import('./pages/Search/Search.jsx'));
const Details = lazy(() => import('./pages/Details/Details.jsx'));
const Watch = lazy(() => import('./pages/Watch/Watch.jsx'));
const Admin = lazy(() => import('./pages/Admin/Admin.jsx'));
const VideoUpload = lazy(() => import('./pages/VideoUpload.jsx'));
const AdminVideos = lazy(() => import('./pages/AdminVideos.jsx'));

function App() {
  return (
    <div className="min-h-screen bg-[#08080a] text-gray-100 selection:bg-[#e50914] selection:text-white">
      <Chatbot />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/signup" element={<Signup />} />

          {/* Profiles Gate */}
          <Route path="/profiles" element={
            <ProtectedRoute>
              <Profiles />
            </ProtectedRoute>
          } />

          {/* Gated Cinema Pages */}
          <Route path="/browse" element={
            <ProtectedRoute>
              <ProfileGatedRoute>
                <Home />
              </ProfileGatedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/explore" element={
            <ProtectedRoute>
              <ProfileGatedRoute>
                <Explore />
              </ProfileGatedRoute>
            </ProtectedRoute>
          } />

          <Route path="/search" element={
            <ProtectedRoute>
              <ProfileGatedRoute>
                <Search />
              </ProfileGatedRoute>
            </ProtectedRoute>
          } />

          <Route path="/details/:id" element={
            <ProtectedRoute>
              <ProfileGatedRoute>
                <Details />
              </ProfileGatedRoute>
            </ProtectedRoute>
          } />

          <Route path="/watch/:id" element={
            <ProtectedRoute>
              <ProfileGatedRoute>
                <Watch />
              </ProfileGatedRoute>
            </ProtectedRoute>
          } />


          {/* Admin Panel */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminRoute>
                <Admin />
              </AdminRoute>
            </ProtectedRoute>
          } />

          <Route path="/admin/upload" element={
            <ProtectedRoute>
              <AdminRoute>
                <VideoUpload />
              </AdminRoute>
            </ProtectedRoute>
          } />

          <Route path="/admin/videos" element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminVideos />
              </AdminRoute>
            </ProtectedRoute>
          } />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
