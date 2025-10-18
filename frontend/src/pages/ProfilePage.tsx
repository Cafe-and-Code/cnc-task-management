import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import { authService } from '@services/authService';
import { getCurrentUser, clearAuth } from '@store/slices/authSlice';
import { addNotification } from '@store/slices/uiSlice';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isLoading } = useAppSelector(state => state.auth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    avatarUrl: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await authService.updateProfile(formData);
      dispatch(getCurrentUser());
      setIsEditing(false);
      dispatch(
        addNotification({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile has been updated successfully.',
        })
      );
    } catch (error: any) {
      dispatch(
        addNotification({
          type: 'error',
          title: 'Update Failed',
          message: error.message || 'Failed to update profile.',
        })
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl || '',
      });
    }
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(clearAuth());
      navigate('/auth/login');
    } catch (error: any) {
      dispatch(
        addNotification({
          type: 'error',
          title: 'Logout Failed',
          message: error.message || 'Failed to logout.',
        })
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Profile Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-sm font-medium text-brand-primary hover:text-brand-primary/80"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? <LoadingSpinner size="sm" /> : 'Save'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Avatar */}
              <div className="flex items-center space-x-6">
                <div className="shrink-0">
                  {user.avatarUrl ? (
                    <img
                      className="h-20 w-20 object-cover rounded-full"
                      src={user.avatarUrl}
                      alt="Profile"
                    />
                  ) : (
                    <div className="h-20 w-20 bg-brand-primary rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {user.firstName.charAt(0)}
                        {user.lastName.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex-1">
                    <label
                      htmlFor="avatarUrl"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      id="avatarUrl"
                      name="avatarUrl"
                      value={formData.avatarUrl}
                      onChange={handleChange}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-gray-800 dark:disabled:text-gray-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-gray-800 dark:disabled:text-gray-400"
                  />
                </div>
              </div>

              {/* Read-only Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={user.userName}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={user.role}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={user.organizationName || 'N/A'}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Account Actions
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <button
                onClick={() => {
                  /* TODO: Implement change password */
                }}
                className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Change Password
              </button>

              <button
                onClick={() => {
                  /* TODO: Implement 2FA settings */
                }}
                className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Two-Factor Authentication
              </button>

              <button
                onClick={() => {
                  /* TODO: Implement notification settings */
                }}
                className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Notification Preferences
              </button>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-6">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Account Status
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Account Status
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Verified
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.isEmailVerified
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}
                >
                  {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Member Since
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>

              {user.lastLoginAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Login
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(user.lastLoginAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
