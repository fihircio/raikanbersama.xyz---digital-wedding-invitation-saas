
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-rose-600 font-serif">
              RaikanBersama<span className="text-gray-400">.xyz</span>
            </Link>
          </div>
          
          {/* Conditional rendering based on authentication status */}
          {user ? (
            // User is logged in - show dashboard
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/catalog" className="text-gray-600 hover:text-rose-600 font-medium transition">Catalog</Link>
              <Link to="/pricing" className="text-gray-600 hover:text-rose-600 font-medium transition">Pricing</Link>
              <Link to="/dashboard" className="text-gray-600 hover:text-rose-600 font-medium transition">Dashboard</Link>
              <Link
                to="/dashboard"
                className="bg-rose-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-rose-700 transition shadow-lg shadow-rose-100"
              >
                Mula Bina Kad
              </Link>
              <button
                onClick={logout}
                className="bg-gray-100 text-gray-700 px-5 py-2 rounded-full font-semibold hover:bg-gray-200 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            // User is not logged in - show login/register
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/catalog" className="text-gray-600 hover:text-rose-600 font-medium transition">Catalog</Link>
              <Link to="/pricing" className="text-gray-600 hover:text-rose-600 font-medium transition">Pricing</Link>
              <Link
                to="/login"
                className="bg-rose-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-rose-700 transition shadow-lg shadow-rose-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-rose-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-rose-700 transition shadow-lg shadow-rose-100"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
