import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '../hooks/redux';

interface RealtimeEvent {
  type: 'task_updated' | 'project_updated' | 'sprint_updated' | 'user_activity' | 'notification';
  data: any;
  timestamp: number;
}

interface TaskUpdateEvent {
  taskId: string;
  changes: any;
  updatedBy: string;
  timestamp: number;
}

interface TaskMoveEvent {
  taskId: string;
  fromStatus: string;
  toStatus: string;
  movedBy: string;
  timestamp: number;
}

interface TaskCreateEvent {
  task: any;
  createdBy: string;
  timestamp: number;
}

interface TaskDeleteEvent {
  taskId: string;
  taskTitle: string;
  deletedBy: string;
  timestamp: number;
}

interface BoardUpdateEvent {
  boardId: string;
  changes: any;
  updatedBy: string;
  timestamp: number;
}

interface UserPresenceEvent {
  userId: string;
  userName: string;
  isOnline: boolean;
  currentTaskId?: string;
  lastSeen: string;
}

interface RealtimeCallbacks {
  onTaskUpdate?: (data: TaskUpdateEvent) => void;
  onTaskMove?: (data: TaskMoveEvent) => void;
  onTaskCreate?: (data: TaskCreateEvent) => void;
  onTaskDelete?: (data: TaskDeleteEvent) => void;
  onBoardUpdate?: (data: BoardUpdateEvent) => void;
  onUserPresence?: (data: UserPresenceEvent) => void;
  onProjectUpdate?: (data: any) => void;
  onSprintUpdate?: (data: any) => void;
  onUserActivity?: (data: any) => void;
  onNotification?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

class RealtimeService {
  private socket: Socket | null = null;
  private callbacks: RealtimeCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(authToken: string, callbacks: RealtimeCallbacks = {}) {
    this.callbacks = callbacks;

    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    try {
      this.socket = io(import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001', {
        auth: {
          token: authToken,
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to connect to websocket server:', error);
      this.callbacks.onError?.(error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to websocket server');
      this.reconnectAttempts = 0;
      this.callbacks.onConnect?.();
    });

    this.socket.on('disconnect', reason => {
      console.log('Disconnected from websocket server:', reason);
      this.callbacks.onDisconnect?.();
    });

    this.socket.on('connect_error', error => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.callbacks.onError?.(error);
      }
    });

    // Real-time event listeners
    this.socket.on('task_updated', (data: TaskUpdateEvent) => {
      console.log('Task update received:', data);
      this.callbacks.onTaskUpdate?.(data);
    });

    this.socket.on('task_moved', (data: TaskMoveEvent) => {
      console.log('Task move received:', data);
      this.callbacks.onTaskMove?.(data);
    });

    this.socket.on('task_created', (data: TaskCreateEvent) => {
      console.log('Task creation received:', data);
      this.callbacks.onTaskCreate?.(data);
    });

    this.socket.on('task_deleted', (data: TaskDeleteEvent) => {
      console.log('Task deletion received:', data);
      this.callbacks.onTaskDelete?.(data);
    });

    this.socket.on('board_updated', (data: BoardUpdateEvent) => {
      console.log('Board update received:', data);
      this.callbacks.onBoardUpdate?.(data);
    });

    this.socket.on('user_presence_updated', (data: UserPresenceEvent) => {
      console.log('User presence updated:', data);
      this.callbacks.onUserPresence?.(data);
    });

    this.socket.on('project_updated', data => {
      console.log('Project update received:', data);
      this.callbacks.onProjectUpdate?.(data);
    });

    this.socket.on('sprint_updated', data => {
      console.log('Sprint update received:', data);
      this.callbacks.onSprintUpdate?.(data);
    });

    this.socket.on('user_activity', data => {
      console.log('User activity received:', data);
      this.callbacks.onUserActivity?.(data);
    });

    this.socket.on('notification', data => {
      console.log('Notification received:', data);
      this.callbacks.onNotification?.(data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.callbacks = {};
  }

  subscribeToProject(projectId: string) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe_project', { projectId });
    }
  }

  unsubscribeFromProject(projectId: string) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe_project', { projectId });
    }
  }

  subscribeToUser(userId: string) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe_user', { userId });
    }
  }

  subscribeToNotifications() {
    if (this.socket?.connected) {
      this.socket.emit('subscribe_notifications');
    }
  }

  joinRoom(room: string) {
    if (this.socket?.connected) {
      this.socket.emit('join_room', { room });
    }
  }

  leaveRoom(room: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_room', { room });
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  sendEvent(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot send event:', event);
    }
  }

  // Kanban board specific methods
  joinBoard(boardId: string) {
    this.joinRoom(`board_${boardId}`);
  }

  leaveBoard(boardId: string) {
    this.leaveRoom(`board_${boardId}`);
  }

  updateTask(taskId: string, changes: any) {
    this.sendEvent('update_task', { taskId, changes });
  }

  moveTask(taskId: string, fromStatus: string, toStatus: string) {
    this.sendEvent('move_task', { taskId, fromStatus, toStatus });
  }

  createTask(task: any) {
    this.sendEvent('create_task', { task });
  }

  deleteTask(taskId: string) {
    this.sendEvent('delete_task', { taskId });
  }

  updatePresence(taskId?: string) {
    this.sendEvent('update_presence', { taskId });
  }

  broadcastBoardUpdate(boardId: string, changes: any) {
    this.sendEvent('board_update', { boardId, changes });
  }

  // Connection health and monitoring
  getConnectionInfo() {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      socketId: this.socket?.id,
    };
  }

  async ping() {
    if (this.socket?.connected) {
      return new Promise(resolve => {
        const timeout = setTimeout(() => resolve(false), 5000);

        this.socket.emit('ping', () => {
          clearTimeout(timeout);
          resolve(true);
        });
      });
    }
    return false;
  }
}

// Singleton instance
export const realtimeService = new RealtimeService();

// Hook for using real-time service in React components
export const useRealtime = (callbacks: RealtimeCallbacks = {}) => {
  const { user, isAuthenticated } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated && user?.token) {
      realtimeService.connect(user.token, callbacks);

      return () => {
        realtimeService.disconnect();
      };
    }
  }, [isAuthenticated, user?.token]);

  return {
    isConnected: realtimeService.isConnected(),
    subscribeToProject: realtimeService.subscribeToProject.bind(realtimeService),
    unsubscribeFromProject: realtimeService.unsubscribeFromProject.bind(realtimeService),
    subscribeToUser: realtimeService.subscribeToUser.bind(realtimeService),
    subscribeToNotifications: realtimeService.subscribeToNotifications.bind(realtimeService),
    joinRoom: realtimeService.joinRoom.bind(realtimeService),
    leaveRoom: realtimeService.leaveRoom.bind(realtimeService),
    sendEvent: realtimeService.sendEvent.bind(realtimeService),
  };
};
