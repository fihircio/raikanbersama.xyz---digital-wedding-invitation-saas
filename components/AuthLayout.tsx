
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface AuthLayoutProps {
    children: React.ReactNode;
    activeTab: 'login' | 'register';
    title: string;
    subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, activeTab, title, subtitle }) => {
    // Hide Navbar on auth pages
    useEffect(() => {
        const navbar = document.querySelector('nav');
        if (navbar) {
            navbar.style.display = 'none';
        }
        return () => {
            if (navbar) {
                navbar.style.display = '';
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Branding / Logo */}
                <div className="flex justify-center mb-6">
                    <Link to="/" className="flex flex-col items-center group">
                        <div className="relative h-16 w-16 rounded-full overflow-hidden border border-gray-100 shadow-xl shadow-rose-100 mb-2">
                            <img
                                src="/logo.png"
                                alt="RaikanBersama Logo"
                                className="h-full w-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                            />
                        </div>
                        <span className="mt-2 text-2xl font-serif italic font-bold text-gray-900 tracking-tight group-hover:text-rose-600 transition-colors">
                            RaikanBersama
                        </span>
                    </Link>
                </div>

                {/* Breadcrumb */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-rose-600 transition-colors">
                        <ArrowLeftIcon className="w-3 h-3" />
                        Kembali ke Laman Utama
                    </Link>
                </div>

                {/* Main Card */}
                <div className="bg-white py-8 px-4 shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] sm:rounded-[2rem] sm:px-10 border border-gray-100 relative overflow-hidden">

                    {/* Decorative Top Accent */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-400 via-rose-500 to-pink-500"></div>

                    {/* Header Text */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 font-serif italic">{title}</h2>
                        <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-xl mb-8 relative">
                        <Link
                            to="/login"
                            className={`flex-1 text-center py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === 'login'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Masuk
                        </Link>
                        <Link
                            to="/register"
                            className={`flex-1 text-center py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === 'register'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Daftar
                        </Link>
                    </div>

                    {children}
                </div>

                {/* Footer simple */}
                <div className="mt-8 text-center text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} RaikanBersama.xyz. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
