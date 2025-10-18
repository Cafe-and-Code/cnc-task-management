import React from 'react';
import { useNavigate } from 'react-router-dom';

export const ProjectListPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your projects and teams</p>
        </div>
        <button
          onClick={handleCreateProject}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
        >
          Create Project
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center">
        <div className="text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-4">No projects yet</p>
          <p>Create your first project to get started with task management.</p>
        </div>
      </div>
    </div>
  );
};
