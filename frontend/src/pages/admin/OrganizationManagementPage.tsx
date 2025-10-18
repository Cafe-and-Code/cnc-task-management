import React, { useState, useEffect } from 'react';
import {
  Building,
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  CreditCard,
  Settings,
  Shield,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Eye,
  Download,
  Upload,
  RefreshCw,
  BarChart3,
  Database,
  FileText,
  UserPlus,
  UserCheck,
  UserX,
  ChevronDown,
  Crown,
  Zap,
} from 'lucide-react';

// Types
interface Organization {
  id: string;
  name: string;
  displayName: string;
  domain: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  plan: 'free' | 'starter' | 'professional' | 'enterprise' | 'custom';
  status: 'active' | 'inactive' | 'suspended' | 'trial' | 'past_due';
  billing: {
    plan: string;
    price: number;
    billingCycle: 'monthly' | 'yearly';
    nextBillingDate: string;
    paymentMethod: string;
    cardLast4?: string;
    trialEndsAt?: string;
  };
  usage: {
    users: number;
    maxUsers: number;
    projects: number;
    maxProjects: number;
    storage: number;
    maxStorage: number;
    apiCalls: number;
    maxApiCalls: number;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    website: string;
  };
  admin: {
    name: string;
    email: string;
    userId: string;
  };
  security: {
    twoFactorRequired: boolean;
    ssoEnabled: boolean;
    ipWhitelistEnabled: boolean;
    lastSecurityScan: string;
    securityScore: number;
  };
  integrations: {
    github: boolean;
    slack: boolean;
    jira: boolean;
    activeDirectory: boolean;
    custom: boolean;
  };
  createdAt: string;
  updatedAt: string;
  lastActivity: string;
  health: {
    score: number;
    issues: number;
    criticalIssues: number;
    lastCheck: string;
  };
  statistics: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalTasks: number;
    completedTasks: number;
    totalSprints: number;
    activeSprints: number;
    avgProjectDuration: number;
    teamProductivity: number;
  };
}

interface OrgFilters {
  search: string;
  plan: string;
  status: string;
  industry: string;
  size: string;
  billingCycle: string;
  dateRange: string;
}

const OrganizationManagementPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<OrgFilters>({
    search: '',
    plan: '',
    status: '',
    industry: '',
    size: '',
    billingCycle: '',
    dateRange: '30',
  });
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrgs, setTotalOrgs] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [orgStats, setOrgStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
    trial: 0,
    past_due: 0,
    enterprise: 0,
    professional: 0,
    starter: 0,
    free: 0,
    newThisMonth: 0,
    churnedThisMonth: 0,
    totalRevenue: 0,
    avgRevenuePerOrg: 0,
  });

  const orgsPerPage = 20;

  // Mock data
  useEffect(() => {
    const industries = [
      'Manufacturing',
      'Technology',
      'Healthcare',
      'Finance',
      'Education',
      'Retail',
      'Construction',
      'Consulting',
      'Logistics',
      'Real Estate',
    ];

    const sizes: Organization['size'][] = ['startup', 'small', 'medium', 'large', 'enterprise'];
    const plans: Organization['plan'][] = [
      'free',
      'starter',
      'professional',
      'enterprise',
      'custom',
    ];
    const statuses: Organization['status'][] = [
      'active',
      'inactive',
      'suspended',
      'trial',
      'past_due',
    ];

    const mockOrganizations: Organization[] = Array.from({ length: 50 }, (_, i) => {
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      const plan = plans[Math.floor(Math.random() * plans.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const industry = industries[Math.floor(Math.random() * industries.length)];

      const maxUsers =
        size === 'startup'
          ? 5
          : size === 'small'
            ? 25
            : size === 'medium'
              ? 100
              : size === 'large'
                ? 500
                : 1000;
      const maxProjects =
        size === 'startup'
          ? 10
          : size === 'small'
            ? 50
            : size === 'medium'
              ? 200
              : size === 'large'
                ? 1000
                : 5000;
      const maxStorage =
        size === 'startup'
          ? 1
          : size === 'small'
            ? 10
            : size === 'medium'
              ? 100
              : size === 'large'
                ? 1000
                : 10000;
      const maxApiCalls =
        size === 'startup'
          ? 1000
          : size === 'small'
            ? 10000
            : size === 'medium'
              ? 100000
              : size === 'large'
                ? 1000000
                : 10000000;

      const prices = { free: 0, starter: 29, professional: 99, enterprise: 299, custom: 999 };
      const price = prices[plan];

      return {
        id: `org-${i + 1}`,
        name: `organization${i + 1}`,
        displayName: `${industry} Corp ${i + 1}`,
        domain: `org${i + 1}.example.com`,
        industry,
        size,
        plan,
        status,
        billing: {
          plan: plan.charAt(0).toUpperCase() + plan.slice(1),
          price,
          billingCycle: Math.random() > 0.5 ? 'monthly' : 'yearly',
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          paymentMethod: 'card',
          cardLast4: `${Math.floor(Math.random() * 9000) + 1000}`,
          trialEndsAt:
            status === 'trial'
              ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
              : undefined,
        },
        usage: {
          users: Math.floor(Math.random() * maxUsers),
          maxUsers,
          projects: Math.floor(Math.random() * maxProjects),
          maxProjects,
          storage: Math.floor(Math.random() * maxStorage * 1024 * 1024 * 1024),
          maxStorage: maxStorage * 1024 * 1024 * 1024,
          apiCalls: Math.floor(Math.random() * maxApiCalls),
          maxApiCalls,
        },
        contact: {
          email: `contact@org${i + 1}.example.com`,
          phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          address: `${Math.floor(Math.random() * 9999)} Main St`,
          city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][i % 5],
          country: 'United States',
          website: `https://org${i + 1}.example.com`,
        },
        admin: {
          name: `Admin User ${i + 1}`,
          email: `admin@org${i + 1}.example.com`,
          userId: `admin-${i + 1}`,
        },
        security: {
          twoFactorRequired: Math.random() > 0.5,
          ssoEnabled: Math.random() > 0.7,
          ipWhitelistEnabled: Math.random() > 0.8,
          lastSecurityScan: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          securityScore: Math.floor(Math.random() * 40) + 60,
        },
        integrations: {
          github: Math.random() > 0.5,
          slack: Math.random() > 0.4,
          jira: Math.random() > 0.6,
          activeDirectory: Math.random() > 0.8,
          custom: Math.random() > 0.9,
        },
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        health: {
          score: Math.floor(Math.random() * 40) + 60,
          issues: Math.floor(Math.random() * 10),
          criticalIssues: Math.floor(Math.random() * 3),
          lastCheck: new Date().toISOString(),
        },
        statistics: {
          totalProjects: Math.floor(Math.random() * 100) + 10,
          activeProjects: Math.floor(Math.random() * 50) + 5,
          completedProjects: Math.floor(Math.random() * 50) + 5,
          totalTasks: Math.floor(Math.random() * 500) + 50,
          completedTasks: Math.floor(Math.random() * 400) + 50,
          totalSprints: Math.floor(Math.random() * 50) + 5,
          activeSprints: Math.floor(Math.random() * 10) + 1,
          avgProjectDuration: Math.floor(Math.random() * 60) + 15,
          teamProductivity: Math.floor(Math.random() * 40) + 60,
        },
      };
    });

    setOrganizations(mockOrganizations);
    setTotalOrgs(mockOrganizations.length);

    // Calculate stats
    const stats = {
      total: mockOrganizations.length,
      active: mockOrganizations.filter(org => org.status === 'active').length,
      inactive: mockOrganizations.filter(org => org.status === 'inactive').length,
      suspended: mockOrganizations.filter(org => org.status === 'suspended').length,
      trial: mockOrganizations.filter(org => org.status === 'trial').length,
      past_due: mockOrganizations.filter(org => org.status === 'past_due').length,
      enterprise: mockOrganizations.filter(org => org.plan === 'enterprise').length,
      professional: mockOrganizations.filter(org => org.plan === 'professional').length,
      starter: mockOrganizations.filter(org => org.plan === 'starter').length,
      free: mockOrganizations.filter(org => org.plan === 'free').length,
      newThisMonth: 8,
      churnedThisMonth: 3,
      totalRevenue: mockOrganizations.reduce((sum, org) => sum + org.billing.price, 0),
      avgRevenuePerOrg:
        mockOrganizations.reduce((sum, org) => sum + org.billing.price, 0) /
        mockOrganizations.length,
    };
    setOrgStats(stats);
    setLoading(false);
  }, []);

  // Filter organizations
  const filteredOrgs = organizations.filter(org => {
    const matchesSearch =
      !filters.search ||
      org.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      org.displayName.toLowerCase().includes(filters.search.toLowerCase()) ||
      org.domain.toLowerCase().includes(filters.search.toLowerCase()) ||
      org.contact.email.toLowerCase().includes(filters.search.toLowerCase());

    const matchesPlan = !filters.plan || org.plan === filters.plan;
    const matchesStatus = !filters.status || org.status === filters.status;
    const matchesIndustry = !filters.industry || org.industry === filters.industry;
    const matchesSize = !filters.size || org.size === filters.size;
    const matchesBillingCycle =
      !filters.billingCycle || org.billing.billingCycle === filters.billingCycle;

    const matchesDateRange = () => {
      if (!filters.dateRange) return true;
      const days = parseInt(filters.dateRange);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      return new Date(org.createdAt) >= startDate;
    };

    return (
      matchesSearch &&
      matchesPlan &&
      matchesStatus &&
      matchesIndustry &&
      matchesSize &&
      matchesBillingCycle &&
      matchesDateRange()
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrgs.length / orgsPerPage);
  const paginatedOrgs = filteredOrgs.slice(
    (currentPage - 1) * orgsPerPage,
    currentPage * orgsPerPage
  );

  const handleOrgSelection = (orgId: string) => {
    setSelectedOrgs(prev =>
      prev.includes(orgId) ? prev.filter(id => id !== orgId) : [...prev, orgId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrgs.length === paginatedOrgs.length) {
      setSelectedOrgs([]);
    } else {
      setSelectedOrgs(paginatedOrgs.map(org => org.id));
    }
  };

  const handleStatusChange = async (orgId: string, newStatus: Organization['status']) => {
    setOrganizations(prev =>
      prev.map(org =>
        org.id === orgId ? { ...org, status: newStatus, updatedAt: new Date().toISOString() } : org
      )
    );
  };

  const handlePlanChange = async (orgId: string, newPlan: Organization['plan']) => {
    const prices = { free: 0, starter: 29, professional: 99, enterprise: 299, custom: 999 };
    const price = prices[newPlan];

    setOrganizations(prev =>
      prev.map(org =>
        org.id === orgId
          ? {
              ...org,
              plan: newPlan,
              billing: {
                ...org.billing,
                plan: newPlan.charAt(0).toUpperCase() + newPlan.slice(1),
                price,
              },
              usage: {
                ...org.usage,
                maxUsers:
                  newPlan === 'free'
                    ? 5
                    : newPlan === 'starter'
                      ? 25
                      : newPlan === 'professional'
                        ? 100
                        : newPlan === 'enterprise'
                          ? 500
                          : 1000,
                maxProjects:
                  newPlan === 'free'
                    ? 10
                    : newPlan === 'starter'
                      ? 50
                      : newPlan === 'professional'
                        ? 200
                        : newPlan === 'enterprise'
                          ? 1000
                          : 5000,
                maxStorage:
                  newPlan === 'free'
                    ? 1
                    : newPlan === 'starter'
                      ? 10
                      : newPlan === 'professional'
                        ? 100
                        : newPlan === 'enterprise'
                          ? 1000
                          : 10000,
                maxApiCalls:
                  newPlan === 'free'
                    ? 1000
                    : newPlan === 'starter'
                      ? 10000
                      : newPlan === 'professional'
                        ? 100000
                        : newPlan === 'enterprise'
                          ? 1000000
                          : 10000000,
              },
              updatedAt: new Date().toISOString(),
            }
          : org
      )
    );
  };

  const handleDeleteOrg = async (orgId: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this organization? This action cannot be undone.'
      )
    ) {
      setOrganizations(prev => prev.filter(org => org.id !== orgId));
      setSelectedOrgs(prev => prev.filter(id => id !== orgId));
      setTotalOrgs(prev => prev - 1);
    }
  };

  const getPlanColor = (plan: Organization['plan']) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      starter: 'bg-green-100 text-green-800',
      professional: 'bg-blue-100 text-blue-800',
      enterprise: 'bg-purple-100 text-purple-800',
      custom: 'bg-yellow-100 text-yellow-800',
    };
    return colors[plan];
  };

  const getStatusColor = (status: Organization['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      trial: 'bg-yellow-100 text-yellow-800',
      past_due: 'bg-orange-100 text-orange-800',
    };
    return colors[status];
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Organization Management</h1>
        <p className="text-gray-600">Manage organizations, billing, and system-wide settings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Organizations</p>
              <p className="text-2xl font-bold text-gray-900">{orgStats.total}</p>
              <p className="text-xs text-green-600">+{orgStats.newThisMonth} this month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{orgStats.active}</p>
              <p className="text-xs text-gray-500">
                {Math.round((orgStats.active / orgStats.total) * 100)}% of total
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Enterprise</p>
              <p className="text-2xl font-bold text-gray-900">{orgStats.enterprise}</p>
              <p className="text-xs text-gray-500">Premium tier</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(orgStats.totalRevenue)}
              </p>
              <p className="text-xs text-gray-500">
                {formatCurrency(orgStats.avgRevenuePerOrg)} avg/org
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search organizations..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  value={filters.search}
                  onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-lg border ${
                  showFilters
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown
                  className={`w-4 h-4 ml-2 transform ${showFilters ? 'rotate-180' : ''}`}
                />
              </button>

              {selectedOrgs.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedOrgs.length} organization{selectedOrgs.length !== 1 ? 's' : ''}{' '}
                    selected
                  </span>
                  <button
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    Bulk Actions
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>

              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Organization
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.plan}
                    onChange={e => setFilters(prev => ({ ...prev, plan: e.target.value }))}
                  >
                    <option value="">All Plans</option>
                    <option value="free">Free</option>
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.status}
                    onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="trial">Trial</option>
                    <option value="past_due">Past Due</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.industry}
                    onChange={e => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                  >
                    <option value="">All Industries</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.size}
                    onChange={e => setFilters(prev => ({ ...prev, size: e.target.value }))}
                  >
                    <option value="">All Sizes</option>
                    <option value="startup">Startup</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Cycle
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.billingCycle}
                    onChange={e => setFilters(prev => ({ ...prev, billingCycle: e.target.value }))}
                  >
                    <option value="">All Cycles</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.dateRange}
                    onChange={e => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Organizations Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={
                      selectedOrgs.length === paginatedOrgs.length && paginatedOrgs.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Health
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOrgs.map(org => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedOrgs.includes(org.id)}
                      onChange={() => handleOrgSelection(org.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{org.displayName}</div>
                      <div className="text-sm text-gray-500">{org.contact.email}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {org.industry} • {org.size}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(org.plan)}`}
                      >
                        {org.plan.charAt(0).toUpperCase() + org.plan.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatCurrency(org.billing.price)}/{org.billing.billingCycle.slice(0, -2)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(org.status)}`}
                    >
                      {org.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-600">Users:</span>
                        <span className="font-medium">
                          {org.usage.users}/{org.usage.maxUsers}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-600">Projects:</span>
                        <span className="font-medium">
                          {org.usage.projects}/{org.usage.maxProjects}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Storage:</span>
                        <span className="font-medium">
                          {formatBytes(org.usage.storage)}/{formatBytes(org.usage.maxStorage)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`text-sm font-medium ${getHealthColor(org.health.score)}`}>
                        {org.health.score}%
                      </div>
                      {org.health.criticalIssues > 0 && (
                        <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{org.health.issues} issues</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(org.billing.price)}
                    <div className="text-xs text-gray-500">{org.billing.billingCycle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedOrg(org);
                          setShowViewModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrg(org);
                          setShowEditModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit Organization"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <select
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                        value={org.plan}
                        onChange={e =>
                          handlePlanChange(org.id, e.target.value as Organization['plan'])
                        }
                      >
                        <option value="free">Free</option>
                        <option value="starter">Starter</option>
                        <option value="professional">Professional</option>
                        <option value="enterprise">Enterprise</option>
                        <option value="custom">Custom</option>
                      </select>
                      <button
                        onClick={() => handleDeleteOrg(org.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Organization"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * orgsPerPage + 1} to{' '}
              {Math.min(currentPage * orgsPerPage, filteredOrgs.length)} of {filteredOrgs.length}{' '}
              results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span>...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`px-3 py-1 rounded-lg ${
                      currentPage === totalPages
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Details Modal */}
      {showViewModal && selectedOrg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Organization Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Organization Info */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Organization Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Basic Details</h4>
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Display Name:</dt>
                            <dd className="text-sm text-gray-900">{selectedOrg.displayName}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Domain:</dt>
                            <dd className="text-sm text-gray-900">{selectedOrg.domain}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Industry:</dt>
                            <dd className="text-sm text-gray-900">{selectedOrg.industry}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Size:</dt>
                            <dd className="text-sm text-gray-900 capitalize">{selectedOrg.size}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Created:</dt>
                            <dd className="text-sm text-gray-900">
                              {new Date(selectedOrg.createdAt).toLocaleDateString()}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Email:</dt>
                            <dd className="text-sm text-gray-900">{selectedOrg.contact.email}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Phone:</dt>
                            <dd className="text-sm text-gray-900">{selectedOrg.contact.phone}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Address:</dt>
                            <dd className="text-sm text-gray-900">{selectedOrg.contact.address}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">City:</dt>
                            <dd className="text-sm text-gray-900">{selectedOrg.contact.city}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Website:</dt>
                            <dd className="text-sm text-gray-900">{selectedOrg.contact.website}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Users</h4>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Current:</span>
                          <span className="text-lg font-bold text-gray-900">
                            {selectedOrg.usage.users}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Limit:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedOrg.usage.maxUsers}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(selectedOrg.usage.users / selectedOrg.usage.maxUsers) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Projects</h4>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Current:</span>
                          <span className="text-lg font-bold text-gray-900">
                            {selectedOrg.usage.projects}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Limit:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedOrg.usage.maxProjects}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${(selectedOrg.usage.projects / selectedOrg.usage.maxProjects) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Storage</h4>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Used:</span>
                          <span className="text-lg font-bold text-gray-900">
                            {formatBytes(selectedOrg.usage.storage)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Limit:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatBytes(selectedOrg.usage.maxStorage)}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-600 h-2 rounded-full"
                              style={{
                                width: `${(selectedOrg.usage.storage / selectedOrg.usage.maxStorage) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedOrg.statistics.totalProjects}
                        </div>
                        <div className="text-sm text-gray-600">Total Projects</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedOrg.statistics.activeProjects}
                        </div>
                        <div className="text-sm text-gray-600">Active Projects</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedOrg.statistics.totalTasks}
                        </div>
                        <div className="text-sm text-gray-600">Total Tasks</div>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {selectedOrg.statistics.avgProjectDuration}d
                        </div>
                        <div className="text-sm text-gray-600">Avg Duration</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Billing Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Current Plan:</span>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(selectedOrg.plan)}`}
                          >
                            {selectedOrg.plan.charAt(0).toUpperCase() + selectedOrg.plan.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Price:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(selectedOrg.billing.price)}/
                            {selectedOrg.billing.billingCycle.slice(0, -2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Next Billing:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(selectedOrg.billing.nextBillingDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Payment Method:</span>
                          <span className="text-sm font-medium text-gray-900">
                            Card ending in {selectedOrg.billing.cardLast4}
                          </span>
                        </div>
                        {selectedOrg.billing.trialEndsAt && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Trial Ends:</span>
                            <span className="text-sm font-medium text-yellow-600">
                              {new Date(selectedOrg.billing.trialEndsAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Security Score:</span>
                          <span
                            className={`text-lg font-bold ${getHealthColor(selectedOrg.security.securityScore)}`}
                          >
                            {selectedOrg.security.securityScore}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">2FA Required:</span>
                          <span
                            className={`text-sm ${selectedOrg.security.twoFactorRequired ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {selectedOrg.security.twoFactorRequired ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">SSO Enabled:</span>
                          <span
                            className={`text-sm ${selectedOrg.security.ssoEnabled ? 'text-green-600' : 'text-gray-600'}`}
                          >
                            {selectedOrg.security.ssoEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">IP Whitelist:</span>
                          <span
                            className={`text-sm ${selectedOrg.security.ipWhitelistEnabled ? 'text-green-600' : 'text-gray-600'}`}
                          >
                            {selectedOrg.security.ipWhitelistEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Last Scan:</span>
                          <span className="text-sm text-gray-900">
                            {new Date(selectedOrg.security.lastSecurityScan).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Integrations</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">GitHub:</span>
                          <span
                            className={`text-sm ${selectedOrg.integrations.github ? 'text-green-600' : 'text-gray-600'}`}
                          >
                            {selectedOrg.integrations.github ? 'Connected' : 'Not Connected'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Slack:</span>
                          <span
                            className={`text-sm ${selectedOrg.integrations.slack ? 'text-green-600' : 'text-gray-600'}`}
                          >
                            {selectedOrg.integrations.slack ? 'Connected' : 'Not Connected'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Jira:</span>
                          <span
                            className={`text-sm ${selectedOrg.integrations.jira ? 'text-green-600' : 'text-gray-600'}`}
                          >
                            {selectedOrg.integrations.jira ? 'Connected' : 'Not Connected'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Active Directory:</span>
                          <span
                            className={`text-sm ${selectedOrg.integrations.activeDirectory ? 'text-green-600' : 'text-gray-600'}`}
                          >
                            {selectedOrg.integrations.activeDirectory
                              ? 'Connected'
                              : 'Not Connected'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationManagementPage;
