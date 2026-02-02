
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CatalogPage from './components/Catalog/CatalogPage';
import PricingPage from './components/Pricing/PricingPage';
import HomePage from './src/pages/HomePage';
import LoginPage from './src/pages/LoginPage';
import RegisterPage from './src/pages/RegisterPage';
import OAuthCallbackPage from './src/pages/OAuthCallbackPage';
import DashboardPage from './src/pages/DashboardPage';
import EditorPage from './src/pages/EditorPage';
import ManageInvitationPage from './src/pages/ManageInvitationPage';
import PublicInvitationPage from './src/pages/PublicInvitationPage';
import ProfilePage from './src/pages/ProfilePage';
import OrdersPage from './src/pages/OrdersPage';
import FavoritesPage from './src/pages/FavoritesPage';
import FAQPage from './src/pages/FAQPage';
import TutorialPage from './src/pages/TutorialPage';
import ContactPage from './src/pages/ContactPage';
import AffiliatePage from './src/pages/AffiliatePage';
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
            <Route path="/" element={<><Navbar /><HomePage /><Footer /></>} />
            <Route path="/catalog" element={<><Navbar /><CatalogPage /><Footer /></>} />
            <Route path="/pricing" element={<><Navbar /><PricingPage /><Footer /></>} />
            <Route path="/faq" element={<><Navbar /><FAQPage /><Footer /></>} />
            <Route path="/tutorial" element={<><Navbar /><TutorialPage /><Footer /></>} />
            <Route path="/contact" element={<><Navbar /><ContactPage /><Footer /></>} />
            <Route path="/affiliates" element={<><Navbar /><AffiliatePage /><Footer /></>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
            <Route path="/i/:slug" element={<PublicInvitationPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Navbar />
                <DashboardPage />
                <Footer />
              </ProtectedRoute>
            } />
            <Route path="/edit/:id" element={<><Navbar /><EditorPage /></>} />
            <Route path="/create" element={<><Navbar /><EditorPage /></>} />
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
                <Footer />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <Navbar />
                <OrdersPage />
                <Footer />
              </ProtectedRoute>
            } />
            <Route path="/favorites" element={
              <ProtectedRoute>
                <Navbar />
                <FavoritesPage />
                <Footer />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
