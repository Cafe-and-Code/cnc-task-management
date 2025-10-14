import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';

const ReportsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth) as any;
  const [activeReport, setActiveReport] = useState('burndown');

  // In a real implementation, we would fetch report data from the backend
  useEffect(() => {
    // This would be where we fetch report data
  }, [dispatch]);

  const reportTypes = [
    { id: 'burndown', name: 'Sprint Burndown', description: 'Track progress of sprints' },
    { id: 'burnup', name: 'Sprint Burnup', description: 'Track scope and progress' },
    { id: 'velocity', name: 'Velocity Chart', description: 'Track team velocity across sprints' },
    { id: 'cumulative', name: 'Cumulative Flow', description: 'Track work in progress' },
    { id: 'tasks', name: 'Task Distribution', description: 'View task status distribution' },
    { id: 'time', name: 'Time Tracking', description: 'Track time spent on tasks' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate and view various reports for your projects.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Report Types</h3>
              <div className="mt-4 space-y-1">
                {reportTypes.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setActiveReport(report.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                      activeReport === report.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {report.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {reportTypes.find(r => r.id === activeReport)?.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {reportTypes.find(r => r.id === activeReport)?.description}
              </p>
            </div>
            <div className="px-4 py-5 border-t border-gray-200 sm:p-6">
              {/* Report Filters */}
              <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-3">
                <div>
                  <label htmlFor="project-select" className="block mb-1 text-sm font-medium text-gray-700">
                    Select Project
                  </label>
                  <select
                    id="project-select"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">All Projects</option>
                    <option value="1">Project Alpha</option>
                    <option value="2">Project Beta</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="team-select" className="block mb-1 text-sm font-medium text-gray-700">
                    Select Team
                  </label>
                  <select
                    id="team-select"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">All Teams</option>
                    <option value="1">Team Alpha</option>
                    <option value="2">Team Beta</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="date-range" className="block mb-1 text-sm font-medium text-gray-700">
                    Date Range
                  </label>
                  <select
                    id="date-range"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="last30">Last 30 Days</option>
                    <option value="last90">Last 90 Days</option>
                    <option value="last6months">Last 6 Months</option>
                    <option value="lastyear">Last Year</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mb-4">
                <button className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  Generate Report
                </button>
              </div>

              {/* Report Content Placeholder */}
              <div className="mt-6">
                <div className="flex items-center justify-center h-64 rounded-lg bg-gray-50">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No Report Data</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Select filters and click "Generate Report" to view the report.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;