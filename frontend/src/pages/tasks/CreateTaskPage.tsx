import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TaskForm from '../../components/tasks/TaskForm';
import { taskService } from '@services/taskService';
import { projectService } from '@services/projectService';
import { userService } from '@services/userService';
import { sprintService } from '@services/sprintService';

interface TeamMember {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  avatarUrl?: string;
  role: string;
}

interface Project {
  id: number;
  name: string;
  key: string;
}

interface Sprint {
  id: number;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
}

interface UserStory {
  id: number;
  title: string;
  status: string;
  storyPoints: number;
}

const CreateTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId?: string }>();
  const currentProjectId = projectId ? parseInt(projectId) : undefined;

  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load projects
        const projectsResponse = await projectService.getProjects();
        const projects = projectsResponse.projects;

        // Load team members if projectId is provided
        let teamMembers: TeamMember[] = [];
        let userStories: UserStory[] = [];
        let sprints: Sprint[] = [];

        if (currentProjectId) {
          try {
            const teamMembersResponse = await taskService.getAvailableTeamMembers(currentProjectId);
            teamMembers = teamMembersResponse.map((member: any) => ({
              id: member.id,
              firstName: member.firstName,
              lastName: member.lastName,
              name: `${member.firstName} ${member.lastName}`,
              avatarUrl: member.avatarUrl,
              role: member.role || 'Team Member',
            }));

            const userStoriesResponse = await taskService.getAvailableUserStories(currentProjectId);
            userStories = userStoriesResponse.map((story: any) => ({
              id: story.id,
              title: story.title,
              status: story.status,
              storyPoints: story.storyPoints,
            }));

            const sprintsResponse = await sprintService.getSprints({ projectId: currentProjectId });
            sprints = sprintsResponse.sprints.map((sprint: any) => ({
              id: sprint.id,
              name: sprint.name,
              status: sprint.status,
              startDate: sprint.StartDate,
              endDate: sprint.EndDate,
            }));
          } catch (err) {
            console.warn('Failed to load project-specific data:', err);
            // Continue without project-specific data
          }
        }

        setProjects(projects);
        setTeamMembers(teamMembers);
        setUserStories(userStories);
        setSprints(sprints);
      } catch (error: any) {
        console.error('Failed to load data:', error);
        setError(error.message || 'Failed to load required data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentProjectId]);

  const handleSubmit = async (taskData: any) => {
    try {
      // Transform form data to match API format
      const apiTaskData = {
        title: taskData.title,
        description: taskData.description,
        userStoryId: taskData.userStoryId,
        assignedToUserId: taskData.assignedToUserId || undefined,
        status: taskData.status || 'ToDo',
        priority: taskData.priority || 'Medium',
        estimatedHours: taskData.estimatedHours || 0,
        dueDate: taskData.dueDate || undefined,
      };

      // Create the task via API
      const createdTask = await taskService.createTask(apiTaskData);
      console.log('Task created successfully:', createdTask);

      // Navigate to the task detail page or back to the board
      if (taskData.projectId) {
        navigate(`/projects/${taskData.projectId}/kanban`);
      } else {
        navigate('/projects');
      }
    } catch (error: any) {
      console.error('Failed to create task:', error);
      setError(error.message || 'Failed to create task');
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">Error: {error}</div>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
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
