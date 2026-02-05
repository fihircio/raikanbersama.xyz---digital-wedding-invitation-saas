import React, { useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../../components/AuthLayout';
import ReCAPTCHA from 'react-google-recaptcha';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
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
    const newErrors: { [key: string]: string } = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Nama diperlukan';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email diperlukan';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak sah';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Kata laluan diperlukan';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Kata laluan mestilah sekurang-kurangnya 6 aksara';
    }

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Kata laluan tidak sepadan';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!recaptchaToken) {
      setErrors({ general: 'Sila lengkapkan reCAPTCHA.' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await register(formData.name, formData.email, formData.password, recaptchaToken || undefined);

      if (result.success) {
        navigate(redirect || '/dashboard');
      } else {
        setErrors({ general: result.error || 'Pendaftaran gagal' });
      }
    } catch (err) {
      setErrors({ general: 'Ralat berlaku. Sila cuba lagi.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      activeTab="register"
      title="Daftar Akaun"
      subtitle="Buat akaun RaikanBersama anda"
    >
      {/* Error Messages */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex flex-col gap-1 text-sm font-medium animate-shake">
          {Object.values(errors).map((error, index) => (
            <div key={index} className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
            Nama
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-50/50 transition-all font-medium"
              placeholder="Nama Lengkap"
            />
          </div>
          {errors.name && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
            Email
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-50/50 transition-all font-medium"
              placeholder="email@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
            Kata Laluan
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-50/50 transition-all font-medium"
              placeholder="•••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
            Konfirmasi Kata Laluan
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              required
              className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-50/50 transition-all font-medium"
              placeholder="•••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{errors.confirmPassword}</p>}
        </div>


        {/* Google reCAPTCHA v2 - Checkbox */}
        <div className="flex justify-center">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={(token) => setRecaptchaToken(token)}
            onExpired={() => setRecaptchaToken(null)}
          />
        </div>


        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-rose-200 text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white border-t-transparent border-r-transparent"></div>
                <span className="ml-2">Mendaftar...</span>
              </div>
            ) : (
              'Daftar Akaun'
            )}
          </button>
        </div>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-400 font-medium">atau daftar guna</span>
        </div>
      </div>

      {/* Google Register Button */}
      <div>
        <button
          type="button"
          onClick={loginWithGoogle}
          className="group w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-gray-200 rounded-xl shadow-sm bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all duration-200"
        >
          <svg className="h-5 w-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.138-.005-.298-.017-.422-.017-.653.002-.814-.003-.953.006-1.204.002-1.584.006-2.277-.006-3.087.016-3.768-.007-4.215-.018-4.528-.003-5.472-.013-5.97-.021-6.312-.026-6.673.03-7.007-.034-7.743.027-8.009-.03-8.744.021-9.676-.001-10.613-.01-10.847-.026-11.576-.034-11.811-.028-11.992-.019-12.329-.009-12.674-.03-13.263-.023-13.931-.034-14.378-.029-14.723-.031-15.178-.035-15.537-.028-16.136-.034-16.577-.007-16.914-.034-17.499-.021-17.86-.034-18.237-.034-18.683-.034-19.13-.038-19.578-.029-20.003-.035-20.279-.034-20.625-.042-21.374-.041-22.098-.047-22.39-.039-23.411-.037-23.949-.071-.25-.089-.511.198-.799-.435-.749-.734-.641-.595-.456-.379-.279-.209-.154-.063-.077-.023.007-.014-.003-.001-.008-.001-.007-.001-.003-.005-.004-.008-.002-.008-.002-.007-.001-.003-.005-.009-.01-.01-.012-.012-.014-.015-.017-.018-.018-.02-.022-.026-.031-.037-.054-.084-.16-.332-.741-1.467-3.186-4.29-6.692-10.594-14.898-20.994-27.228-33.113-42.597-52.199-60.792-68.772-76.674-82.673-87.259-91.11-93.527-98.553-103.126-110.738-116.229-124.588-136.855-150.409-163.983-181.407-196.996-212.638-228.419-244.087-270.089-296.888-325.001-353.845-381.98-412.017-442.563-504.143-565.129-627.367-694.49-762.389-830.418-868.672-907.229-945.839-984.488-1021.707-1058.978-1126.053-1193.579-1261.649-1329.739-1398.333-1467.62-1537.079-1606.758-1676.891-1747.002-1817.809-1889.001-1960.225-2031.907-2104.436-2177.789-2251.618-2325.679-2399.279-2472.967-2546.391-2619.826-2693.279-2766.855-2840.266-2913.605-2987.249-3060.325-3133.096-3205.836-3278.263-3350.849-3423.653-3496.455-3569.247-3642.207-3715.062-3788.225-3861.309-3934.451-4087.806-4241.679-4395.961-4550.316-4704.827-4859.317-5013.403-5177.396-5341.553-5506.125-5670.751-5835.549-5999.835-6164.543-6329.063-6493.634-6658.378-6823.665-6989.641-7156.897-7324.067-7491.272-7658.349-7825.162-7991.598-8157.605-8323.262-8488.883-8654.053-8818.903-8983.781-9148.812-9314.136-9479.396-9644.841-9810.266-9975.691" fill="#4285F4" />
          </svg>
          <span className="font-semibold text-gray-700">Teruskan dengan Google</span>
        </button>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;