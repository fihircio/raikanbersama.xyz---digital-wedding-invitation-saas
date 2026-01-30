
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group relative">
              <div className="relative h-12 w-12 rounded-full overflow-hidden border border-gray-100 shadow-inner">
                {/* Vignette Overlay */}
                <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_15px_rgba(0,0,0,0.15)] rounded-full"></div>
                <img
                  src="/logo.png"
                  alt="RaikanBersama Logo"
                  className="h-full w-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </Link>
          </div>

          {/* Conditional rendering based on authentication status */}
          {user ? (
            // User is logged in - show dashboard and profile menu
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/catalog" className="text-gray-600 hover:text-rose-600 font-medium transition">Catalog</Link>
              <Link to="/pricing" className="text-gray-600 hover:text-rose-600 font-medium transition">Pricing</Link>
              <Link to="/tutorial" className="text-gray-600 hover:text-rose-600 font-medium transition">Tutorial</Link>
              <Link to="/faq" className="text-gray-600 hover:text-rose-600 font-medium transition">FAQ</Link>
              <Link to="/contact" className="text-gray-600 hover:text-rose-600 font-medium transition">Hubungi</Link>
              <Link to="/dashboard" className="text-gray-600 hover:text-rose-600 font-medium transition">Dashboard</Link>
              <Link
                to="/create"
                className="bg-rose-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-rose-700 transition shadow-lg shadow-rose-100"
              >
                Mula Bina Kad
              </Link>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-semibold hover:bg-gray-200 transition"
                >
                  <UserCircleIcon className="w-5 h-5" />
                  <span>{user.name?.split(' ')[0] || 'Profile'}</span>
                  <svg className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 animate-slide-up">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                      <p className="text-xs text-rose-600 font-bold mt-1 uppercase">{user.membership_tier}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      Profile Settings
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                      </svg>
                      Order History
                    </Link>

                    <Link
                      to="/favorites"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                      </svg>
                      My Favorites
                    </Link>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // User is not logged in - show login/register
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/catalog" className="text-gray-600 hover:text-rose-600 font-medium transition">Catalog</Link>
              <Link to="/pricing" className="text-gray-600 hover:text-rose-600 font-medium transition">Pricing</Link>
              <Link to="/tutorial" className="text-gray-600 hover:text-rose-600 font-medium transition">Tutorial</Link>
              <Link to="/faq" className="text-gray-600 hover:text-rose-600 font-medium transition">FAQ</Link>
              <Link to="/contact" className="text-gray-600 hover:text-rose-600 font-medium transition">Hubungi</Link>
              <Link to="/login" className="text-gray-600 hover:text-rose-600 font-medium transition">Login</Link>
              <Link
                to="/catalog"
                className="bg-rose-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-rose-700 transition shadow-lg shadow-rose-100"
              >
                Mula Bina Kad
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-rose-600 p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {user ? (
              <div className="space-y-2">
                <Link to="/catalog" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-rose-600 transition">Catalog</Link>
                <Link to="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-rose-600 transition">Pricing</Link>
                <Link to="/tutorial" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-rose-600 transition">Tutorial</Link>
                <Link to="/faq" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-rose-600 transition">FAQ</Link>
                <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-rose-600 transition">Hubungi</Link>
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-rose-600 transition">Dashboard</Link>
                <Link to="/create" onClick={() => setIsMobileMenuOpen(false)} className="block mx-4 mt-4 px-4 py-2 bg-rose-600 text-white text-center rounded-full font-semibold hover:bg-rose-700 transition">Mula Bina Kad</Link>

                <div className="border-t border-gray-200 mt-4 pt-4 px-4">
                  <div className="mb-3">
                    <p className="text-sm font-bold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                    <p className="text-xs text-rose-600 font-bold mt-1 uppercase">{user.membership_tier}</p>
                  </div>
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm text-gray-700 hover:text-rose-600 transition">Profile Settings</Link>
                  <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm text-gray-700 hover:text-rose-600 transition">Order History</Link>
                  <Link to="/favorites" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm text-gray-700 hover:text-rose-600 transition">My Favorites</Link>
                  <button onClick={() => { setIsMobileMenuOpen(false); logout(); }} className="block w-full text-left py-2 text-sm text-red-600 hover:text-red-700 transition">Logout</button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Link to="/catalog" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-rose-600 transition">Catalog</Link>
                <Link to="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-rose-600 transition">Pricing</Link>
                <Link to="/tutorial" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-rose-600 transition">Tutorial</Link>
                <Link to="/faq" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-rose-600 transition">FAQ</Link>
                <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-rose-600 transition">Hubungi</Link>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-rose-600 transition">Login</Link>
                <Link to="/catalog" onClick={() => setIsMobileMenuOpen(false)} className="block mx-4 mt-4 px-4 py-2 bg-rose-600 text-white text-center rounded-full font-semibold hover:bg-rose-700 transition">Mula Bina Kad</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
