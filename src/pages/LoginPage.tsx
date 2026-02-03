import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const redirect = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(email, password);

      if (result.success) {
        // Redirect to dashboard or requested page
        navigate(redirect || '/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
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
              Selamat Datang
            </h2>
            <p className="text-gray-600">
              Masuk ke akaun RaikanBersama anda
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Kata Laluan
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 pr-10"
                  placeholder="••••••••"
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
                    <span className="ml-2">Memproses...</span>
                  </div>
                ) : (
                  'Masuk'
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

          {/* Google Login Button */}
          <div>
            <button
              type="button"
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.138-.005-.298-.017-.422-.017-.653.002-.814-.003-.953.006-1.204.002-1.584.006-2.277-.006-3.087.016-3.768-.007-4.215-.018-4.528-.003-5.472-.013-5.97-.021-6.312-.026-6.673.03-7.007-.034-7.743.027-8.009-.03-8.744.021-9.676-.001-10.613-.01-10.847-.026-11.576-.034-11.811-.028-11.992-.019-12.329-.009-12.674-.03-13.263-.023-13.931-.034-14.378-.029-14.723-.031-15.178-.035-15.537-.028-16.136-.034-16.577-.007-16.914-.034-17.499-.021-17.86-.034-18.237-.034-18.683-.034-19.13-.038-19.578-.029-20.003-.035-20.279-.034-20.625-.042-21.374-.041-22.098-.047-22.39-.039-23.411-.037-23.949-.071-.25-.089-.511.198-.799-.435-.749-.734-.641-.595-.456-.379-.279-.209-.154-.063-.077-.023.007-.014-.003-.001-.008-.001-.007-.001-.003-.005-.004-.008-.002-.008-.002-.007-.001-.003-.005-.009-.01-.01-.012-.012-.014-.015-.017-.018-.018-.02-.022-.026-.031-.037-.054-.084-.16-.332-.741-1.467-3.186-4.29-6.692-10.594-14.898-20.994-27.228-33.113-42.597-52.199-60.792-68.772-76.674-82.673-87.259-91.11-93.527-98.553-103.126-110.738-116.229-124.588-136.855-150.409-163.983-181.407-196.996-212.638-228.419-244.087-270.089-296.888-325.001-353.845-381.98-412.017-442.563-504.143-565.129-627.367-694.49-762.389-830.418-868.672-907.229-945.839-984.488-1021.707-1058.978-1126.053-1193.579-1261.649-1329.739-1398.333-1467.62-1537.079-1606.758-1676.891-1747.002-1817.809-1889.001-1960.225-2031.907-2104.436-2177.789-2251.618-2325.679-2399.279-2472.967-2546.391-2619.826-2693.279-2766.855-2840.266-2913.605-2987.249-3060.325-3133.096-3205.836-3278.263-3350.849-3423.653-3496.455-3569.247-3642.207-3715.062-3788.225-3861.309-3934.451-4087.806-4241.679-4395.961-4550.316-4704.827-4859.317-5013.403-5177.396-5341.553-5506.125-5670.751-5835.549-5999.835-6164.543-6329.063-6493.634-6658.378-6823.665-6989.641-7156.897-7324.067-7491.272-7658.349-7825.162-7991.598-8157.605-8323.262-8488.883-8654.053-8818.903-8983.781-9148.812-9314.136-9479.396-9644.841-9810.266-9975.691-10141.49-10307.263-10473.073-10638.669-10804.615-11170.807-11537.69-11904.01-12270.444-12636.888-13003.549-13370.699-13737.831-14104.719-14471.517-14838.39-15215.531-15592.959-15970.861-16348.518-16726.384-17104.069-17481.403-17858.498-18235.525-18612.247-18989.269-19366.137-19742.967-20119.629-20496.382-20872.854-21249.417-21626.087-22002.925-22379.981-22757.073-23134.189-23508.863-23883.643-24258.593-24633.641-25008.966-25384.467-25760.29-26136.178-26512.208-26888.269-27244.449-27600.973-27957.577-28304.597-28651.509-28998.541-29345.608-29692.729-30028.888-30365.283-31001.807-31638.575-32275.817-32913.341-33551.349-34189.357-34827.391-35463.652-36099.797-36736.037-37372.413-38008.644-38644.771-39281.016-39917.289-40553.562-41189.923-41826.347-42462.791-43099.236-43735.641-44372.148-45008.449-45644.689-46280.931-46917.375-47553.817-48190.279-48826.742-49463.449-50100.239-50736.812-51373.517-52010.313-52646.837-53283.517-53920.228-54556.939-55193.228-55829.475-56465.822-57102.169-57738.516-58374.914-59011.311-59647.849-60284.387-60920.824-61557.281-62193.711-62830.298-63466.885-64103.472-64740.059-65376.411-66012.629-66648.847-67285.065-67921.283-68557.501-69193.719-69829.937-70466.269-71102.417-71738.565-72374.801-73011.037-73647.273-74283.509-74919.745-75555.981-76192.217-76828.453-77464.689-78100.925-78737.161-79373.397-80009.633-80645.929-81282.225-81918.521-82554.841-83191.229-83827.617-84463.977-85100.337-85736.697-86373.057-87009.417-87645.841-88282.225-88918.521-89554.841-90191.229-90827.617-91463.977-92100.337-92736.697-93473.057-94209.417-94945.841-95682.225-96418.521-98054.841-98691.229-99327.617-99963.977" fill="#4285F4" />
              </svg>
              <span>Teruskan dengan Google</span>
            </button>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Belum ada akaun?{' '}
              <Link to="/register" className="font-medium text-rose-600 hover:text-rose-500">
                Daftar sekarang
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

export default LoginPage;