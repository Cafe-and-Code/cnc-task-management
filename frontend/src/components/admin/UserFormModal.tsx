import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Building,
  Users,
  Shield,
  AlertCircle,
} from 'lucide-react';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: any) => Promise<void>;
  user?: any;
  mode: 'create' | 'edit';
}

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  role: string;
  status: string;
  organization: string;
  team: string;
  department: string;
  phone: string;
  location: string;
  permissions: string[];
  twoFactorEnabled: boolean;
  emailVerified: boolean;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSubmit, user, mode }) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    role: 'viewer',
    status: 'active',
    organization: '',
    team: '',
    department: '',
    phone: '',
    location: '',
    permissions: [],
    twoFactorEnabled: false,
    emailVerified: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableRoles = [
    { value: 'admin', label: 'Administrator', description: 'Full system access' },
    { value: 'manager', label: 'Manager', description: 'Can manage projects and teams' },
    { value: 'developer', label: 'Developer', description: 'Can work on tasks and projects' },
    { value: 'tester', label: 'Tester', description: 'Can test and review tasks' },
    { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
  ];

  const availablePermissions = [
    'read_projects',
    'write_projects',
    'delete_projects',
    'manage_teams',
    'manage_users',
    'view_reports',
    'manage_settings',
    'api_access',
  ];

  const organizations = ['CNC Manufacturing', 'Tech Solutions Inc', 'Engineering Corp'];

  const teams = [
    'Development Team',
    'Project Management',
    'Quality Assurance',
    'Operations',
    'Maintenance',
  ];

  const departments = ['IT', 'Operations', 'Engineering', 'Quality', 'Maintenance', 'Management'];

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        password: '',
        confirmPassword: '',
        role: user.role || 'viewer',
        status: user.status || 'active',
        organization: user.organization || '',
        team: user.team || '',
        department: user.department || '',
        phone: user.phone || '',
        location: user.location || '',
        permissions: user.permissions || [],
        twoFactorEnabled: user.twoFactorEnabled || false,
        emailVerified: user.emailVerified || false,
      });
    } else {
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
        role: 'viewer',
        status: 'active',
        organization: '',
        team: '',
        department: '',
        phone: '',
        location: '',
        permissions: [],
        twoFactorEnabled: false,
        emailVerified: false,
      });
    }
    setErrors({});
  }, [user, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Password validation (only for create mode or when password is being changed)
    if (mode === 'create' || formData.password) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password =
          'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    // Organization validation
    if (!formData.organization) {
      newErrors.organization = 'Organization is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle error (show error message)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePermissionToggle = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {mode === 'create' ? 'Create New User' : 'Edit User'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.email}
                      onChange={e => handleInputChange('email', e.target.value)}
                      placeholder="user@example.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.phone}
                      onChange={e => handleInputChange('phone', e.target.value)}
                      placeholder="+1-555-0123"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.firstName}
                    onChange={e => handleInputChange('firstName', e.target.value)}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.lastName}
                    onChange={e => handleInputChange('lastName', e.target.value)}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.location}
                      onChange={e => handleInputChange('location', e.target.value)}
                      placeholder="New York, USA"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.department}
                    onChange={e => handleInputChange('department', e.target.value)}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Organization Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.organization ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.organization}
                      onChange={e => handleInputChange('organization', e.target.value)}
                    >
                      <option value="">Select Organization</option>
                      {organizations.map(org => (
                        <option key={org} value={org}>
                          {org}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.organization && (
                    <p className="mt-1 text-sm text-red-600">{errors.organization}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.team}
                      onChange={e => handleInputChange('team', e.target.value)}
                    >
                      <option value="">Select Team</option>
                      {teams.map(team => (
                        <option key={team} value={team}>
                          {team}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.status}
                    onChange={e => handleInputChange('status', e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Role and Permissions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Role and Permissions</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <div className="space-y-2">
                  {availableRoles.map(role => (
                    <label
                      key={role.value}
                      className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={formData.role === role.value}
                        onChange={e => handleInputChange('role', e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{role.label}</div>
                        <div className="text-sm text-gray-500">{role.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Permissions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availablePermissions.map(permission => (
                    <label key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission)}
                        onChange={() => handlePermissionToggle(permission)}
                        className="mr-2 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">
                        {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
              <div className="space-y-4">
                {mode === 'create' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className={`w-full pr-10 pl-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.password ? 'border-red-500' : 'border-gray-300'
                          }`}
                          value={formData.password}
                          onChange={e => handleInputChange('password', e.target.value)}
                          placeholder="Enter password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className={`w-full pr-10 pl-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                          value={formData.confirmPassword}
                          onChange={e => handleInputChange('confirmPassword', e.target.value)}
                          placeholder="Confirm password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </>
                )}

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.emailVerified}
                      onChange={e => handleInputChange('emailVerified', e.target.checked)}
                      className="mr-3 rounded border-gray-300"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Email Verified</span>
                      <p className="text-xs text-gray-500">Mark this user's email as verified</p>
                    </div>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.twoFactorEnabled}
                      onChange={e => handleInputChange('twoFactorEnabled', e.target.checked)}
                      className="mr-3 rounded border-gray-300"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Two-Factor Authentication
                      </span>
                      <p className="text-xs text-gray-500">Enable 2FA for this user</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Password Requirements (for create mode) */}
            {mode === 'create' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">
                      Password Requirements
                    </h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• At least 8 characters long</li>
                      <li>• Contains at least one uppercase letter</li>
                      <li>• Contains at least one lowercase letter</li>
                      <li>• Contains at least one number</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create User' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
