import React, { useEffect, useState, useCallback } from 'react';
import { realtimeService } from '../../services/realtimeService';
import { toast } from 'react-hot-toast';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee?: {
    id: string;
    name: string;
  };
  storyPoints: number;
  teamId: string;
  updatedAt: string;
}

interface RealtimeUpdateManagerProps {
  boardId: string;
  currentUserId: string;
  tasks: Task[];
  onTasksUpdate: (tasks: Task[]) => void;
  onTaskUpdate?: (taskId: string, changes: any) => void;
  onTaskMove?: (taskId: string, fromStatus: string, toStatus: string) => void;
  onTaskCreate?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  children?: React.ReactNode;
}

interface PendingUpdate {
  id: string;
  type: 'update' | 'move' | 'create' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
}

export const RealtimeUpdateManager: React.FC<RealtimeUpdateManagerProps> = ({
  boardId,
  currentUserId,
  tasks,
  onTasksUpdate,
  onTaskUpdate,
  onTaskMove,
  onTaskCreate,
  onTaskDelete,
  children,
}) => {
  const [pendingUpdates, setPendingUpdates] = useState<PendingUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdateId, setLastUpdateId] = useState<string>('');

  // Optimistic update helpers
  const createOptimisticUpdate = useCallback((type: PendingUpdate['type'], data: any) => {
    const updateId = `${type}_${Date.now()}_${Math.random()}`;

    setPendingUpdates(prev => [
      ...prev,
      {
        id: updateId,
        type,
        data,
        timestamp: Date.now(),
        retryCount: 0,
      },
    ]);

    return updateId;
  }, []);

  const removePendingUpdate = useCallback((updateId: string) => {
    setPendingUpdates(prev => prev.filter(update => update.id !== updateId));
  }, []);

  const retryPendingUpdates = useCallback(async () => {
    const failedUpdates = pendingUpdates.filter(update => update.retryCount < 3);

    for (const update of failedUpdates) {
      try {
        switch (update.type) {
          case 'update':
            realtimeService.updateTask(update.data.taskId, update.data.changes);
            break;
          case 'move':
            realtimeService.moveTask(
              update.data.taskId,
              update.data.fromStatus,
              update.data.toStatus
            );
            break;
          case 'create':
            realtimeService.createTask(update.data.task);
            break;
          case 'delete':
            realtimeService.deleteTask(update.data.taskId);
            break;
        }

        removePendingUpdate(update.id);
      } catch (error) {
        console.error('Failed to retry update:', error);
        setPendingUpdates(prev =>
          prev.map(u => (u.id === update.id ? { ...u, retryCount: u.retryCount + 1 } : u))
        );
      }
    }
  }, [pendingUpdates, removePendingUpdate]);

  // Handle task updates from other users
  const handleTaskUpdate = useCallback(
    (event: any) => {
      if (event.updatedBy === currentUserId) {
        // This is our own update, just remove any pending update
        const pendingUpdate = pendingUpdates.find(
          u => u.type === 'update' && u.data.taskId === event.taskId
        );
        if (pendingUpdate) {
          removePendingUpdate(pendingUpdate.id);
        }
        return;
      }

      // Apply the update from another user
      const updatedTasks = tasks.map(task =>
        task.id === event.taskId ? { ...task, ...event.changes, updatedAt: event.timestamp } : task
      );

      onTasksUpdate(updatedTasks);
      onTaskUpdate?.(event.taskId, event.changes);

      // Show notification for updates from other users
      toast.success(
        `${event.updatedBy} updated "${tasks.find(t => t.id === event.taskId)?.title}"`,
        {
          id: `task_update_${event.taskId}`,
          duration: 3000,
        }
      );
    },
    [currentUserId, tasks, onTasksUpdate, onTaskUpdate, pendingUpdates, removePendingUpdate]
  );

  // Handle task moves from other users
  const handleTaskMove = useCallback(
    (event: any) => {
      if (event.movedBy === currentUserId) {
        // This is our own move, remove any pending update
        const pendingUpdate = pendingUpdates.find(
          u => u.type === 'move' && u.data.taskId === event.taskId
        );
        if (pendingUpdate) {
          removePendingUpdate(pendingUpdate.id);
        }
        return;
      }

      // Apply the move from another user
      const movedTasks = tasks.map(task =>
        task.id === event.taskId
          ? { ...task, status: event.toStatus, updatedAt: event.timestamp }
          : task
      );

      onTasksUpdate(movedTasks);
      onTaskMove?.(event.taskId, event.fromStatus, event.toStatus);

      // Show notification for moves from other users
      toast.success(
        `${event.movedBy} moved "${tasks.find(t => t.id === event.taskId)?.title}" to ${event.toStatus}`,
        {
          id: `task_move_${event.taskId}`,
          duration: 3000,
        }
      );
    },
    [currentUserId, tasks, onTasksUpdate, onTaskMove, pendingUpdates, removePendingUpdate]
  );

  // Handle task creation from other users
  const handleTaskCreate = useCallback(
    (event: any) => {
      if (event.createdBy === currentUserId) {
        // This is our own creation, remove any pending update
        const pendingUpdate = pendingUpdates.find(
          u => u.type === 'create' && u.data.task.id === event.task.id
        );
        if (pendingUpdate) {
          removePendingUpdate(pendingUpdate.id);
        }
        return;
      }

      // Add the new task from another user
      const newTasks = [...tasks, event.task];
      onTasksUpdate(newTasks);
      onTaskCreate?.(event.task);

      // Show notification for creations from other users
      toast.success(`${event.createdBy} created "${event.task.title}"`, {
        id: `task_create_${event.task.id}`,
        duration: 3000,
      });
    },
    [currentUserId, tasks, onTasksUpdate, onTaskCreate, pendingUpdates, removePendingUpdate]
  );

  // Handle task deletion from other users
  const handleTaskDelete = useCallback(
    (event: any) => {
      if (event.deletedBy === currentUserId) {
        // This is our own deletion, remove any pending update
        const pendingUpdate = pendingUpdates.find(
          u => u.type === 'delete' && u.data.taskId === event.taskId
        );
        if (pendingUpdate) {
          removePendingUpdate(pendingUpdate.id);
        }
        return;
      }

      // Remove the deleted task from another user
      const updatedTasks = tasks.filter(task => task.id !== event.taskId);
      onTasksUpdate(updatedTasks);
      onTaskDelete?.(event.taskId);

      // Show notification for deletions from other users
      toast.success(`${event.deletedBy} deleted "${event.taskTitle}"`, {
        id: `task_delete_${event.taskId}`,
        duration: 3000,
      });
    },
    [currentUserId, tasks, onTasksUpdate, onTaskDelete, pendingUpdates, removePendingUpdate]
  );

  // Handle connection events
  const handleConnect = useCallback(() => {
    setIsConnected(true);
    console.log('Real-time connected');

    // Retry any pending updates
    if (pendingUpdates.length > 0) {
      setTimeout(() => retryPendingUpdates(), 1000);
    }
  }, [pendingUpdates, retryPendingUpdates]);

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    console.log('Real-time disconnected');
  }, []);

  const handleConnectionLost = useCallback(() => {
    console.log('Real-time connection lost');
    toast.error('Connection lost. Updates will be synced when reconnected.', {
      duration: 5000,
    });
  }, []);

  const handleConnectionRestored = useCallback(() => {
    console.log('Real-time connection restored');
    toast.success('Connection restored. Syncing updates...', {
      duration: 3000,
    });
  }, []);

  // Set up real-time event listeners
  useEffect(() => {
    if (!boardId) return;

    // Register event handlers
    realtimeService.on('connected', handleConnect);
    realtimeService.on('disconnected', handleDisconnect);
    realtimeService.on('connectionLost', handleConnectionLost);
    realtimeService.on('connectionRestored', handleConnectionRestored);
    realtimeService.on('task_updated', handleTaskUpdate);
    realtimeService.on('task_moved', handleTaskMove);
    realtimeService.on('task_created', handleTaskCreate);
    realtimeService.on('task_deleted', handleTaskDelete);

    // Join the board room
    realtimeService.joinBoard(boardId);

    // Set initial connection state
    setIsConnected(realtimeService.isConnected());

    return () => {
      // Clean up event handlers
      realtimeService.off('connected', handleConnect);
      realtimeService.off('disconnected', handleDisconnect);
      realtimeService.off('connectionLost', handleConnectionLost);
      realtimeService.off('connectionRestored', handleConnectionRestored);
      realtimeService.off('task_updated', handleTaskUpdate);
      realtimeService.off('task_moved', handleTaskMove);
      realtimeService.off('task_created', handleTaskCreate);
      realtimeService.off('task_deleted', handleTaskDelete);

      // Leave the board room
      realtimeService.leaveBoard(boardId);
    };
  }, [
    boardId,
    handleConnect,
    handleDisconnect,
    handleConnectionLost,
    handleConnectionRestored,
    handleTaskUpdate,
    handleTaskMove,
    handleTaskCreate,
    handleTaskDelete,
  ]);

  // Optimistic update methods
  const optimisticUpdateTask = useCallback(
    (taskId: string, changes: any) => {
      // Apply optimistic update immediately
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, ...changes, updatedAt: new Date().toISOString() } : task
      );
      onTasksUpdate(updatedTasks);

      // Create pending update
      const updateId = createOptimisticUpdate('update', { taskId, changes });

      // Send to server
      if (isConnected) {
        realtimeService.updateTask(taskId, changes);
      } else {
        toast.error('Offline. Update will be synced when reconnected.', {
          duration: 3000,
        });
      }

      return updateId;
    },
    [tasks, onTasksUpdate, isConnected, createOptimisticUpdate]
  );

  const optimisticMoveTask = useCallback(
    (taskId: string, fromStatus: string, toStatus: string) => {
      // Apply optimistic move immediately
      const movedTasks = tasks.map(task =>
        task.id === taskId
          ? { ...task, status: toStatus, updatedAt: new Date().toISOString() }
          : task
      );
      onTasksUpdate(movedTasks);

      // Create pending update
      const updateId = createOptimisticUpdate('move', { taskId, fromStatus, toStatus });

      // Send to server
      if (isConnected) {
        realtimeService.moveTask(taskId, fromStatus, toStatus);
      } else {
        toast.error('Offline. Move will be synced when reconnected.', {
          duration: 3000,
        });
      }

      return updateId;
    },
    [tasks, onTasksUpdate, isConnected, createOptimisticUpdate]
  );

  const optimisticCreateTask = useCallback(
    (task: Task) => {
      // Apply optimistic creation immediately
      const newTasks = [...tasks, task];
      onTasksUpdate(newTasks);

      // Create pending update
      const updateId = createOptimisticUpdate('create', { task });

      // Send to server
      if (isConnected) {
        realtimeService.createTask(task);
      } else {
        toast.error('Offline. Task will be created when reconnected.', {
          duration: 3000,
        });
      }

      return updateId;
    },
    [tasks, onTasksUpdate, isConnected, createOptimisticUpdate]
  );

  const optimisticDeleteTask = useCallback(
    (taskId: string) => {
      const taskToDelete = tasks.find(t => t.id === taskId);
      if (!taskToDelete) return null;

      // Apply optimistic deletion immediately
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      onTasksUpdate(updatedTasks);

      // Create pending update
      const updateId = createOptimisticUpdate('delete', { taskId });

      // Send to server
      if (isConnected) {
        realtimeService.deleteTask(taskId);
      } else {
        toast.error('Offline. Deletion will be synced when reconnected.', {
          duration: 3000,
        });
      }

      return updateId;
    },
    [tasks, onTasksUpdate, isConnected, createOptimisticUpdate]
  );

  // Clean up old pending updates (older than 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      setPendingUpdates(prev => prev.filter(update => update.timestamp > fiveMinutesAgo));
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const contextValue = {
    isConnected,
    pendingUpdates: pendingUpdates.length,
    optimisticUpdateTask,
    optimisticMoveTask,
    optimisticCreateTask,
    optimisticDeleteTask,
  };

  return (
    <>
      {children}

      {/* Connection status indicator */}
      {!isConnected && (
        <div className="fixed bottom-4 right-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 z-50">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-red-700 dark:text-red-400">
              Connection lost - Working offline
            </span>
          </div>
          {pendingUpdates.length > 0 && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">
              {pendingUpdates.length} update{pendingUpdates.length !== 1 ? 's' : ''} pending sync
            </div>
          )}
        </div>
      )}
    </>
  );
};

// Hook for using the real-time update manager
export const useRealtimeUpdates = () => {
  const [updateContext, setUpdateContext] = useState<any>(null);

  return {
    updateContext,
    setUpdateContext,
  };
};
