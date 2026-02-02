import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processOAuthCallback = async () => {
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refreshToken');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setErrorMessage(error === 'oauth_failed' ? 'Google login gagal. Sila cuba lagi.' : 'Ralat berlaku semasa proses Google.');
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        return;
      }

      if (!token || !refreshToken) {
        setStatus('error');
        setErrorMessage('Token tidak sah. Sila cuba lagi.');
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        return;
      }

      // Handle OAuth callback
      const result = await handleOAuthCallback(token, refreshToken);

      if (result.success) {
        setStatus('success');
        // Redirect to dashboard after successful login
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Ralat berlaku semasa memproses OAuth.');
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    processOAuthCallback();
  }, [searchParams, handleOAuthCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-rose-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Loading State */}
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 border-t-transparent mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 font-serif mb-2">
                Memproses...
              </h2>
              <p className="text-gray-600">
                Sila tunggu sebentar...
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 font-serif mb-2">
                Berjaya!
              </h2>
              <p className="text-gray-600">
                Anda telah berjaya masuk. Mengalihkan ke dashboard...
              </p>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 font-serif mb-2">
               Ralat Berlaku
              </h2>
              <p className="text-gray-600 mb-4">
                {errorMessage}
              </p>
              <p className="text-sm text-gray-500">
                Anda akan dialihkan ke halaman log masuk dalam beberapa saat...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
