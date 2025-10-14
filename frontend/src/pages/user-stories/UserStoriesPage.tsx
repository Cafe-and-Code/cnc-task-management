import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchUserStories } from '@/store/slices/userStorySlice';

const UserStoriesPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userStories, isLoading, error } = useSelector((state: RootState) => state.userStories) as any;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (selectedProject) {
      dispatch(fetchUserStories(selectedProject));
    }
  }, [dispatch, selectedProject]);

  const handleCreateUserStory = () => {
    // This would open a modal or navigate to a create user story page
    console.log('Create user story');
  };

  const filteredUserStories = userStories.filter((userStory: any) => {
    const matchesSearch = userStory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (userStory.description && userStory.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || userStory.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">User Stories</h1>
        <button
          onClick={handleCreateUserStory}
          className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Create User Story
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
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
            Search User Stories
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search user stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="status-filter" className="block mb-1 text-sm font-medium text-gray-700">
            Filter by Status
          </label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all">All Status</option>
            <option value="Backlog">Backlog</option>
            <option value="Ready">Ready</option>
            <option value="In Progress">In Progress</option>
            <option value="Testing">Testing</option>
            <option value="Done">Done</option>
          </select>
        </div>
      </div>

      {!selectedProject ? (
        <div className="py-12 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No project selected</h3>
          <p className="mt-1 text-sm text-gray-500">Select a project to view its user stories.</p>
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
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredUserStories.map((userStory: any) => (
              <li key={userStory.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
                          userStory.priority === 'Critical' ? 'bg-red-500' :
                          userStory.priority === 'High' ? 'bg-orange-500' :
                          userStory.priority === 'Medium' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }`}>
                          <span className="font-medium text-white">
                            {userStory.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 ml-4">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">{userStory.title}</h3>
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            userStory.status === 'Backlog' ? 'bg-gray-100 text-gray-800' :
                            userStory.status === 'Ready' ? 'bg-blue-100 text-blue-800' :
                            userStory.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            userStory.status === 'Testing' ? 'bg-purple-100 text-purple-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {userStory.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {userStory.projectName} • {userStory.storyPoints} story points • {userStory.priority} priority
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/user-stories/${userStory.id}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </Link>
                      {userStory.status === 'Backlog' && (
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-900">
                          Move to Sprint
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {userStory.description || 'No description provided'}
                    </p>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    Created {new Date(userStory.createdAt).toLocaleDateString()} by {userStory.reporterName}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedProject && filteredUserStories.length === 0 && !isLoading && !error && (
        <div className="py-12 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No user stories</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new user story.</p>
          <div className="mt-6">
            <button
              onClick={handleCreateUserStory}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-5 h-5 mr-2 -ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New User Story
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStoriesPage;