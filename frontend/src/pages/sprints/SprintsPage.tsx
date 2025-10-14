import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchSprints } from '@/store/slices/sprintSlice';

const SprintsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const sprintState = useSelector((state: RootState) => state.sprints) as any;
  const sprints = sprintState?.sprints || [];
  const isLoading = sprintState?.isLoading || false;
  const error = sprintState?.error || null;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  useEffect(() => {
    if (selectedProject) {
      dispatch(fetchSprints(selectedProject));
    }
  }, [dispatch, selectedProject]);

  const handleCreateSprint = () => {
    // This would open a modal or navigate to a create sprint page
    console.log('Create sprint');
  };

  const filteredSprints = sprints.filter((sprint: any) =>
    sprint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sprint.goal && sprint.goal.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Sprints</h1>
        <button
          onClick={handleCreateSprint}
          className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Create Sprint
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
        <div>
          <label htmlFor="project-select" className="block mb-1 text-sm font-medium text-gray-700">
            Select Project
          </label>
          <select
            id="project-select"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Select a project</option>
            {/* This would be populated with actual projects from the store */}
            <option value="1">Project Alpha</option>
            <option value="2">Project Beta</option>
          </select>
        </div>
        <div>
          <label htmlFor="search" className="block mb-1 text-sm font-medium text-gray-700">
            Search Sprints
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search sprints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {!selectedProject ? (
        <div className="py-12 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No project selected</h3>
          <p className="mt-1 text-sm text-gray-500">Select a project to view its sprints.</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="px-4 py-3 text-red-700 border border-red-200 rounded bg-red-50">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSprints.map((sprint: any) => (
            <div key={sprint.id} className="overflow-hidden bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
                      sprint.status === 'Active' ? 'bg-green-500' :
                      sprint.status === 'Completed' ? 'bg-blue-500' :
                      sprint.status === 'Planned' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}>
                      <span className="font-medium text-white">
                        {sprint.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{sprint.name}</h3>
                    <p className="text-sm text-gray-500">{sprint.projectName}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{sprint.goal || 'No goal set'}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    sprint.status === 'Active' ? 'bg-green-100 text-green-800' :
                    sprint.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                    sprint.status === 'Planned' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {sprint.status}
                  </span>
                </div>
                <div className="flex items-center mt-4 text-sm text-gray-500">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-1a1 1 0 100-2h1a4 4 0 014 4v6a4 4 0 01-4 4H6a4 4 0 01-4-4V7a4 4 0 014-4z" clipRule="evenodd" />
                  </svg>
                  Capacity: {sprint.capacity} story points
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50">
                <div className="flex justify-between">
                  <Link
                    to={`/sprints/${sprint.id}`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                  >
                    View Details
                  </Link>
                  {sprint.status === 'Planned' && (
                    <button className="text-sm font-medium text-green-600 hover:text-green-900">
                      Start Sprint
                    </button>
                  )}
                  {sprint.status === 'Active' && (
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-900">
                      Complete Sprint
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProject && filteredSprints.length === 0 && !isLoading && !error && (
        <div className="py-12 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No sprints</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new sprint.</p>
          <div className="mt-6">
            <button
              onClick={handleCreateSprint}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-5 h-5 mr-2 -ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Sprint
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintsPage;