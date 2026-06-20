import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Editor from './pages/Editor';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import UserProfile from './pages/UserProfile';
import Analytics from './pages/Analytics';
import Navbar from './components/Navbar';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  return user ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:slug" element={<PostDetail />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/editor" element={<PrivateRoute><Editor /></PrivateRoute>} />
          <Route path="/editor/:id" element={<PrivateRoute><Editor /></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
