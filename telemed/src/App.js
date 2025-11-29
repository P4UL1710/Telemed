import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import PublicHome from './pages/PublicHome';
import Appointment from './pages/Appointment';
import Consult from './pages/Consult';
import VideoCall from './pages/VideoCall';
import ChatRoom from './pages/ChatRoom';
import LoadingSpinner from './components/Common/LoadingSpinner';
import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return currentUser ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return !currentUser ? children : <Navigate to="/home" />;
};

// Home Route Component (shows different content based on auth status)
const HomeRoute = () => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // If user is authenticated, show dashboard
  if (currentUser) {
    return (
      <Layout>
        <Home />
      </Layout>
    );
  }
  
  // If user is not authenticated, show public landing page
  return <PublicHome />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      
      {/* Home Route - Dynamic based on auth status */}
      <Route path="/" element={<HomeRoute />} />
      <Route path="/home" element={<HomeRoute />} />
      
      {/* Protected Routes */}
      <Route path="/appointment" element={
        <ProtectedRoute>
          <Layout>
            <Appointment />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/consult" element={
        <ProtectedRoute>
          <Layout>
            <Consult />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/video-call" element={
        <ProtectedRoute>
          <Layout>
            <VideoCall />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/chatroom" element={
        <ProtectedRoute>
          <Layout>
            <ChatRoom />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Catch all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#333',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;