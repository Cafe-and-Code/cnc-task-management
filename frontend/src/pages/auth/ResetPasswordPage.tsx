import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import { authService } from '@services/authService';
import { addNotification } from '@store/slices/uiSlice';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!userId || !token) {
      setError('Invalid reset link. Missing required parameters.');
    }
  }, [userId, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!userId || !token) {
      setError('Invalid reset link');
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(userId, token, formData.newPassword);
      setIsSuccess(true);
      dispatch(
        addNotification({
          type: 'success',
          title: 'Password Reset Successful',
          message: 'Your password has been reset successfully.',
        })
      );
    } catch (error: any) {
      setError(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
          Password Reset Successful!
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Your password has been reset successfully. You can now log in with your new password.
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

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
        Reset Your Password
      </h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
        Enter your new password below.
      </p>

      {error && !isSuccess && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            New Password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            value={formData.newPassword}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter new password"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Password must be at least 8 characters long.
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Confirm new password"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading || !formData.newPassword || !formData.confirmPassword}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Reset Password'}
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
