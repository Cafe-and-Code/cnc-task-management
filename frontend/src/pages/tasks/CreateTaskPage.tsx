import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TaskForm from '../components/tasks/TaskForm';

interface TeamMember {
  id: string;
  name: string;
  avatarUrl?: string;
  role: string;
}

interface Project {
  id: string;
  name: string;
  key: string;
}

interface Sprint {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
}

const CreateTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId?: string }>();

  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    setTimeout(() => {
      const mockProjects: Project[] = [
        { id: 'proj-1', name: 'CNC Task Management System', key: 'CNCTMS' },
        { id: 'proj-2', name: 'Mobile App Development', key: 'MAD' },
        { id: 'proj-3', name: 'Website Redesign', key: 'WR' },
      ];

      const mockTeamMembers: TeamMember[] = [
        {
          id: 'user-1',
          name: 'John Doe',
          avatarUrl: 'https://picsum.photos/seed/john/40/40.jpg',
          role: 'Developer',
        },
        {
          id: 'user-2',
          name: 'Jane Smith',
          avatarUrl: 'https://picsum.photos/seed/jane/40/40.jpg',
          role: 'Product Manager',
        },
        { id: 'user-3', name: 'Alice Johnson', role: 'UX Designer' },
        {
          id: 'user-4',
          name: 'Bob Wilson',
          avatarUrl: 'https://picsum.photos/seed/bob/40/40.jpg',
          role: 'Developer',
        },
        { id: 'user-5', name: 'Carol Davis', role: 'QA Engineer' },
      ];

      const mockSprints: Sprint[] = [
        {
          id: 'sprint-1',
          name: 'Sprint 1 - Foundation',
          status: 'active',
          startDate: '2024-01-08',
          endDate: '2024-01-22',
        },
        {
          id: 'sprint-2',
          name: 'Sprint 2 - Core Features',
          status: 'planned',
          startDate: '2024-01-23',
          endDate: '2024-02-06',
        },
        {
          id: 'sprint-3',
          name: 'Sprint 3 - Enhancement',
          status: 'planned',
          startDate: '2024-02-07',
          endDate: '2024-02-21',
        },
      ];

      setProjects(mockProjects);
      setTeamMembers(mockTeamMembers);
      setSprints(mockSprints);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleSubmit = (taskData: any) => {
    // In a real implementation, this would call the API to create the task
    console.log('Creating task:', taskData);

    // Simulate API call
    setTimeout(() => {
      // Navigate to the task detail page or back to the board
      if (taskData.projectId) {
        navigate(`/projects/${taskData.projectId}/kanban`);
      } else {
        navigate('/projects');
      }
    }, 1000);
  };

  const handleCancel = () => {
    if (projectId) {
      navigate(`/projects/${projectId}/kanban`);
    } else {
      navigate('/projects');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={handleCancel}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Task
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {projectId
                  ? `Adding task to project ${projects.find(p => p.id === projectId)?.name}`
                  : 'Create a new task'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TaskForm
          initialData={{ projectId }}
          projects={projects}
          teamMembers={teamMembers}
          sprints={sprints}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEditing={false}
          isLoading={false}
          className="w-full"
        />
      </main>
    </div>
  );
};

export default CreateTaskPage;
