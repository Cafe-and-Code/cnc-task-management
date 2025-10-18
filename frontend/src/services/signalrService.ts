import * as signalR from '@microsoft/signalr';

export interface RealtimeEvent {
  type: string;
  data: any;
  timestamp: string;
  userId: string;
  userName: string;
  projectId?: string;
  taskId?: string;
  teamId?: string;
}

export interface ConnectionStatus {
  isConnected: boolean;
  isReconnecting: boolean;
  lastConnected?: string;
  lastDisconnected?: string;
  connectionAttempts: number;
}

export interface NotificationEvent {
  id: string;
  type:
    | 'task_assigned'
    | 'task_completed'
    | 'comment_added'
    | 'mention'
    | 'deadline_reminder'
    | 'system';
  title: string;
  message: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  entityId?: string;
  entityType?: 'task' | 'project' | 'team' | 'comment';
  actionUrl?: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface PresenceInfo {
  userId: string;
  userName: string;
  userAvatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: string;
  currentActivity?: string;
  location?: string; // page/component they're viewing
}

export interface CollaborationEvent {
  type: 'user_typing' | 'user_viewing' | 'user_editing' | 'cursor_move' | 'selection_change';
  userId: string;
  userName: string;
  userAvatar?: string;
  entityId: string;
  entityType: 'task' | 'comment' | 'document';
  data: {
    cursor?: { x: number; y: number };
    selection?: { start: number; end: number };
    typing?: boolean;
    viewing?: boolean;
    editing?: boolean;
    content?: string;
  };
  timestamp: string;
}

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private connectionStatus: ConnectionStatus = {
    isConnected: false,
    isReconnecting: false,
    connectionAttempts: 0,
  };
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private eventQueue: RealtimeEvent[] = [];
  private isProcessingQueue = false;

  constructor() {
    this.setupConnection();
  }

  private setupConnection() {
    const token = localStorage.getItem('authToken');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/realtime`, {
        accessTokenFactory: () => token || '',
        withCredentials: true,
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true,
        logMessageContent: process.env.NODE_ENV === 'development',
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.setupEventHandlers();
    this.setupConnectionEvents();
  }

  private setupEventHandlers() {
    if (!this.connection) return;

    // Task-related events
    this.connection.on('TaskUpdated', (data: RealtimeEvent) => {
      this.broadcastEvent('task-updated', data);
    });

    this.connection.on('TaskStatusChanged', (data: RealtimeEvent) => {
      this.broadcastEvent('task-status-changed', data);
    });

    this.connection.on('TaskAssigned', (data: RealtimeEvent) => {
      this.broadcastEvent('task-assigned', data);
    });

    this.connection.on('TaskCompleted', (data: RealtimeEvent) => {
      this.broadcastEvent('task-completed', data);
    });

    // Comment-related events
    this.connection.on('CommentAdded', (data: RealtimeEvent) => {
      this.broadcastEvent('comment-added', data);
    });

    this.connection.on('CommentUpdated', (data: RealtimeEvent) => {
      this.broadcastEvent('comment-updated', data);
    });

    // Project-related events
    this.connection.on('ProjectUpdated', (data: RealtimeEvent) => {
      this.broadcastEvent('project-updated', data);
    });

    this.connection.on('TeamMemberAdded', (data: RealtimeEvent) => {
      this.broadcastEvent('team-member-added', data);
    });

    // Notification events
    this.connection.on('Notification', (data: NotificationEvent) => {
      this.broadcastEvent('notification', data);
      this.handleNotification(data);
    });

    // Presence events
    this.connection.on('UserConnected', (data: PresenceInfo) => {
      this.broadcastEvent('user-connected', data);
    });

    this.connection.on('UserDisconnected', (data: PresenceInfo) => {
      this.broadcastEvent('user-disconnected', data);
    });

    this.connection.on('UserPresenceUpdated', (data: PresenceInfo) => {
      this.broadcastEvent('user-presence-updated', data);
    });

    // Collaboration events
    this.connection.on('UserTyping', (data: CollaborationEvent) => {
      this.broadcastEvent('user-typing', data);
    });

    this.connection.on('UserViewing', (data: CollaborationEvent) => {
      this.broadcastEvent('user-viewing', data);
    });

    this.connection.on('UserEditing', (data: CollaborationEvent) => {
      this.broadcastEvent('user-editing', data);
    });

    // Activity feed events
    this.connection.on('ActivityFeedUpdated', (data: RealtimeEvent) => {
      this.broadcastEvent('activity-feed-updated', data);
    });

    // System events
    this.connection.on('SystemMaintenance', (data: RealtimeEvent) => {
      this.broadcastEvent('system-maintenance', data);
    });

    this.connection.on('SystemMessage', (data: RealtimeEvent) => {
      this.broadcastEvent('system-message', data);
    });

    // Error handling
    this.connection.on('Error', (error: any) => {
      console.error('SignalR error:', error);
      this.broadcastEvent('connection-error', { error, timestamp: new Date().toISOString() });
    });
  }

  private setupConnectionEvents() {
    if (!this.connection) return;

    this.connection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
      this.updateConnectionStatus({
        isConnected: false,
        isReconnecting: true,
        lastDisconnected: new Date().toISOString(),
        connectionAttempts: this.reconnectAttempts++,
      });
    });

    this.connection.onreconnected(() => {
      console.log('SignalR reconnected');
      this.updateConnectionStatus({
        isConnected: true,
        isReconnecting: false,
        lastConnected: new Date().toISOString(),
        connectionAttempts: 0,
      });
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.processEventQueue();
    });

    this.connection.onclose(() => {
      console.log('SignalR connection closed');
      this.updateConnectionStatus({
        isConnected: false,
        isReconnecting: false,
        lastDisconnected: new Date().toISOString(),
        connectionAttempts: this.reconnectAttempts,
      });
      this.stopHeartbeat();

      // Attempt manual reconnection if auto-reconnect fails
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(
          () => {
            this.reconnectAttempts++;
            this.start();
          },
          this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
        );
      }
    });
  }

  private broadcastEvent(eventType: string, data: any) {
    const subscribers = this.subscribers.get(eventType);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in subscriber for ${eventType}:`, error);
        }
      });
    }
  }

  private updateConnectionStatus(status: Partial<ConnectionStatus>) {
    this.connectionStatus = { ...this.connectionStatus, ...status };
    this.broadcastEvent('connection-status-changed', this.connectionStatus);
  }

  private handleNotification(notification: NotificationEvent) {
    // Handle browser notifications if permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        data: { actionUrl: notification.actionUrl },
      });
    }

    // Update notification count in UI
    this.broadcastEvent('new-notification', notification);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(async () => {
      if (this.connection?.state === signalR.HubConnectionState.Connected) {
        try {
          await this.connection.send('Heartbeat');
        } catch (error) {
          console.error('Heartbeat failed:', error);
        }
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private processEventQueue() {
    if (this.isProcessingQueue || this.eventQueue.length === 0) return;

    this.isProcessingQueue = true;
    const events = [...this.eventQueue];
    this.eventQueue = [];

    events.forEach(event => {
      this.broadcastEvent(event.type, event);
    });

    this.isProcessingQueue = false;
  }

  // Public methods
  async start(): Promise<void> {
    if (!this.connection) {
      throw new Error('SignalR connection not initialized');
    }

    try {
      await this.connection.start();
      this.updateConnectionStatus({
        isConnected: true,
        lastConnected: new Date().toISOString(),
      });
      this.startHeartbeat();
      this.processEventQueue();
    } catch (error) {
      console.error('Failed to start SignalR connection:', error);
      this.updateConnectionStatus({
        isConnected: false,
        lastDisconnected: new Date().toISOString(),
      });
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.stopHeartbeat();
      this.updateConnectionStatus({
        isConnected: false,
        lastDisconnected: new Date().toISOString(),
      });
    }
  }

  async invoke(methodName: string, ...args: any[]): Promise<any> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR connection is not established');
    }

    try {
      return await this.connection.invoke(methodName, ...args);
    } catch (error) {
      console.error(`Error invoking ${methodName}:`, error);
      throw error;
    }
  }

  // Subscription management
  subscribe(eventType: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    this.subscribers.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(eventType);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(eventType);
        }
      }
    };
  }

  // Task methods
  async subscribeToTask(taskId: string): Promise<void> {
    await this.invoke('SubscribeToTask', taskId);
  }

  async unsubscribeFromTask(taskId: string): Promise<void> {
    await this.invoke('UnsubscribeFromTask', taskId);
  }

  async sendTaskUpdate(taskId: string, updates: any): Promise<void> {
    await this.invoke('SendTaskUpdate', taskId, updates);
  }

  // Project methods
  async subscribeToProject(projectId: string): Promise<void> {
    await this.invoke('SubscribeToProject', projectId);
  }

  async unsubscribeFromProject(projectId: string): Promise<void> {
    await this.invoke('UnsubscribeFromProject', projectId);
  }

  // Team methods
  async subscribeToTeam(teamId: string): Promise<void> {
    await this.invoke('SubscribeToTeam', teamId);
  }

  async unsubscribeFromTeam(teamId: string): Promise<void> {
    await this.invoke('UnsubscribeFromTeam', teamId);
  }

  // Collaboration methods
  async sendTypingStatus(entityId: string, entityType: string, isTyping: boolean): Promise<void> {
    await this.invoke('SendTypingStatus', entityId, entityType, isTyping);
  }

  async sendViewingStatus(entityId: string, entityType: string): Promise<void> {
    await this.invoke('SendViewingStatus', entityId, entityType);
  }

  async sendEditingStatus(entityId: string, entityType: string, isEditing: boolean): Promise<void> {
    await this.invoke('SendEditingStatus', entityId, entityType, isEditing);
  }

  async sendCursorPosition(
    entityId: string,
    entityType: string,
    position: { x: number; y: number }
  ): Promise<void> {
    await this.invoke('SendCursorPosition', entityId, entityType, position);
  }

  // Presence methods
  async updatePresence(status: PresenceInfo['status'], activity?: string): Promise<void> {
    await this.invoke('UpdatePresence', status, activity);
  }

  async updateLocation(location: string): Promise<void> {
    await this.invoke('UpdateLocation', location);
  }

  // Notification methods
  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.invoke('MarkNotificationAsRead', notificationId);
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.invoke('MarkAllNotificationsAsRead');
  }

  // Utility methods
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected || false;
  }

  getConnectionState(): signalR.HubConnectionState {
    return this.connection?.state || signalR.HubConnectionState.Disconnected;
  }

  // Queue events when disconnected
  queueEvent(event: RealtimeEvent): void {
    if (!this.isConnected()) {
      this.eventQueue.push(event);
    } else {
      this.broadcastEvent(event.type, event);
    }
  }
}

// Create singleton instance
export const signalRService = new SignalRService();

export default signalRService;
