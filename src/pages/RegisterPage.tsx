import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const redirect = searchParams.get('redirect');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Basic validation
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama diperlukan';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email diperlukan';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Kata laluan diperlukan';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Kata laluan tidak sepadan';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await register(formData.name, formData.email, formData.password);

      if (result.success) {
        // Redirect to dashboard or requested page
        navigate(redirect || '/dashboard');
      } else {
        setErrors({ general: result.error || 'Pendaftaran gagal' });
      }
    } catch (err) {
      setErrors({ general: 'Terjadi kesalahan. Sila cuba lagi.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-rose-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 font-serif mb-2">
              Daftar Akaun
            </h2>
            <p className="text-gray-600">
              Buat akaun RaikanBersama anda
            </p>
          </div>

          {/* Error Messages */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {Object.values(errors).map((error, index) => (
                <p key={index} className="text-sm">{error}</p>
              ))}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nama Penujang
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Nama lengkap anda"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Kata Laluan
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 pr-10"
                  placeholder="•••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Kata Laluan
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 pr-10"
                  placeholder="•••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-600 border-t-transparent border-r-transparent"></div>
                    <span className="ml-2">Mendaftar...</span>
                  </div>
                ) : (
                  'Daftar'
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">atau</span>
            </div>
          </div>

          {/* Google Register Button */}
          <div>
            <button
              type="button"
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.138-.005-.298-.017-.422-.017-.653.002-.814-.003-.953.006-1.204.002-1.584.006-2.277-.006-3.087.016-3.768-.007-4.215-.018-4.528-.003-5.472-.013-5.97-.021-6.312-.026-6.673.03-7.007-.034-7.743.027-8.009-.03-8.744.021-9.676-.001-10.613-.01-10.847-.026-11.576-.034-11.811-.028-11.992-.019-12.329-.009-12.674-.03-13.263-.023-13.931-.034-14.378-.029-14.723-.031-15.178-.035-15.537-.028-16.136-.034-16.577-.007-16.914-.034-17.499-.021-17.86-.034-18.237-.034-18.683-.034-19.13-.038-19.578-.029-20.003-.035-20.279-.034-20.625-.042-21.374-.041-22.39-.039-23.411-.037-23.949-.071-.25-.089-.511.198-.799-.435-.749-.734-.641-.595-.456-.379-.279-.209-.154-.063-.077-.023-.007-.014-.003-.001-.008-.001-.007-.001-.003-.005-.004-.008-.002-.008-.002-.007-.001-.003-.005-.009-.01-.01-.012-.012-.014-.015-.017-.018-.02-.022-.026-.031-.037-.054-.084-.16-.332-.741-1.467-3.186-4.29-6.692-10.594-14.898-20.994-27.228-33.113-42.597-52.199-60.792-68.772-76.674-82.673-87.259-91.11-93.527-98.553-103.126-110.738-116.229-124.588-136.855-150.409-163.983-181.407-196.996-212.638-228.419-244.087-270.089-296.888-325.001-353.845-381.98-412.017-442.563-504.143-565.129-627.367-694.49-762.389-830.418-868.672-907.229-945.839-984.488-1021.707-1058.978-1126.053-1193.579-1261.649-1329.739-1398.333-1467.62-1537.079-1606.758-1676.891-1747.002-1817.809-1889.001-1960.225-2031.907-2104.436-2177.789-2251.618-2325.679-2399.279-2472.967-2546.391-2619.826-2693.279-2766.855-2840.266-2913.605-2987.249-3060.325-3133.096-3205.836-3278.263-3350.849-3423.653-3496.455-3569.247-3642.207-3715.062-3788.225-3861.309-3934.451-4087.806-4241.679-4395.961-4550.316-4704.827-4859.317-5013.403-5177.396-5341.553-5506.125-5670.751-5835.549-5999.835-6164.543-6329.063-6493.634-6658.378-6823.665-6989.641-7156.897-7324.067-7491.272-7658.349-7825.162-7991.598-8157.605-8323.262-8488.883-8654.053-8818.903-8983.781-9148.812-9314.136-9479.396-9644.841-9810.266-9975.691" fill="#4285F4" />
              </svg>
              <span>Daftar dengan Google</span>
            </button>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Sudah ada akaun?{' '}
              <Link to="/login" className="font-medium text-rose-600 hover:text-rose-500">
                Masuk di sini
              </Link>
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center space-x-4 text-[10px] uppercase tracking-widest text-gray-400">
              <Link to="/privacy" className="hover:text-rose-400 transition">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-rose-400 transition">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;