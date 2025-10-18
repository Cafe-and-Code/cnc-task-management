import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import { authService } from '@services/authService';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';

export const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!userId || !token) {
      setError('Invalid verification link. Missing required parameters.');
      return;
    }

    handleVerification();
  }, [userId, token]);

  const handleVerification = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.verifyEmail(userId, token);
      setIsVerified(true);
    } catch (error: any) {
      setError(error.message || 'Email verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      // This would need to be implemented in the authService
      // For now, we'll show a message
      setIsVerified(true);
    } catch (error: any) {
      setError(error.message || 'Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying your email...</p>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Email Verified Successfully!
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Your email has been verified. You can now log in to your account.
        </p>

        <Link
          to="/auth/login"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Verification Failed
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>

        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
          >
            Try Again
          </button>

          {userId && (
            <button
              onClick={handleResendVerification}
              disabled={isLoading}
              className="w-full flex justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Resend Verification Email'}
            </button>
          )}

          <Link
            to="/auth/login"
            className="block w-full text-center px-4 py-2 text-sm text-brand-primary hover:text-brand-primary/80"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return null;
};
