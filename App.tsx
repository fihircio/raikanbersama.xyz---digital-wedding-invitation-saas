
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import CatalogPage from './components/Catalog/CatalogPage';
import PricingPage from './components/Pricing/PricingPage';
import HomePage from './src/pages/HomePage';
import LoginPage from './src/pages/LoginPage';
import RegisterPage from './src/pages/RegisterPage';
import DashboardPage from './src/pages/DashboardPage';
import EditorPage from './src/pages/EditorPage';
import ManageInvitationPage from './src/pages/ManageInvitationPage';
import PublicInvitationPage from './src/pages/PublicInvitationPage';
import ProfilePage from './src/pages/ProfilePage';
import OrdersPage from './src/pages/OrdersPage';
import FavoritesPage from './src/pages/FavoritesPage';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 border-t-transparent border-r-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="min-h-screen">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<><Navbar /><HomePage /></>} />
            <Route path="/catalog" element={<><Navbar /><CatalogPage /></>} />
            <Route path="/pricing" element={<><Navbar /><PricingPage /></>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/i/:slug" element={<PublicInvitationPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Navbar />
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/edit/:id" element={
              <ProtectedRoute>
                <Navbar />
                <EditorPage />
              </ProtectedRoute>
            } />
            <Route path="/create" element={
              <ProtectedRoute>
                <Navbar />
                <EditorPage />
              </ProtectedRoute>
            } />
            <Route path="/manage/:id" element={
              <ProtectedRoute>
                <Navbar />
                <ManageInvitationPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Navbar />
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <Navbar />
                <OrdersPage />
              </ProtectedRoute>
            } />
            <Route path="/favorites" element={
              <ProtectedRoute>
                <Navbar />
                <FavoritesPage />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
