import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import { authService } from '@services/authService';
import { addNotification } from '@store/slices/uiSlice';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';

export const ForgotPasswordPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading } = useAppSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
      dispatch(
        addNotification({
          type: 'success',
          title: 'Reset Email Sent',
          message: 'If an account with that email exists, you will receive a password reset email.',
        })
      );
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email');
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Check Your Email</h2>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We've sent a password reset link to {email}. The link will expire in 24 hours.
        </p>

        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Didn't receive the email? Check your spam folder or try again.
          </p>

          <button
            onClick={() => {
              setIsSubmitted(false);
              setError(null);
            }}
            className="w-full flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
          >
            Try Again
          </button>

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

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
        Forgot Your Password?
      </h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter your email address"
          />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Send Reset Link'}
          </button>
        </div>

        <div className="text-center">
          <Link
            to="/auth/login"
            className="text-brand-primary hover:text-brand-primary/80 text-sm font-medium"
          >
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};
