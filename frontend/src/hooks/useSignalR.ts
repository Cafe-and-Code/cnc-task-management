import { useState, useEffect, useCallback, useRef } from 'react';
import {
  signalRService,
  RealtimeEvent,
  ConnectionStatus,
  NotificationEvent,
  PresenceInfo,
  CollaborationEvent,
} from '../services/signalrService';

export interface UseSignalROptions {
  autoConnect?: boolean;
  reconnectOnMount?: boolean;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: any) => void;
}

export interface UseSignalRReturn {
  isConnected: boolean;
  isReconnecting: boolean;
  connectionStatus: ConnectionStatus;
  lastEvent?: RealtimeEvent;
  error: any;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendEvent: (type: string, data: any) => void;
  subscribe: (eventType: string, callback: (data: any) => void) => () => void;
}

export function useSignalR(options: UseSignalROptions = {}): UseSignalRReturn {
  const {
    autoConnect = true,
    reconnectOnMount = false,
    onConnected,
    onDisconnected,
    onError,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isReconnecting: false,
    connectionAttempts: 0,
  });
  const [lastEvent, setLastEvent] = useState<RealtimeEvent>();
  const [error, setError] = useState<any>(null);
  const subscriptionsRef = useRef<Array<() => void>>([]);

  const connect = useCallback(async () => {
    try {
      setError(null);
      await signalRService.start();
    } catch (err) {
      setError(err);
      onError?.(err);
      throw err;
    }
  }, [onError]);

  const disconnect = useCallback(async () => {
    try {
      await signalRService.stop();
    } catch (err) {
      setError(err);
      onError?.(err);
    }
  }, [onError]);

  const sendEvent = useCallback((type: string, data: any) => {
    const event: RealtimeEvent = {
      type,
      data,
      timestamp: new Date().toISOString(),
      userId: 'current-user', // This should come from auth context
      userName: 'Current User', // This should come from auth context
    };
    signalRService.queueEvent(event);
  }, []);

  const subscribe = useCallback((eventType: string, callback: (data: any) => void) => {
    const unsubscribe = signalRService.subscribe(eventType, data => {
      setLastEvent({
        type: eventType,
        data,
        timestamp: new Date().toISOString(),
        userId: '',
        userName: '',
      });
      callback(data);
    });

    subscriptionsRef.current.push(unsubscribe);
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Subscribe to connection status changes
    const unsubscribeStatus = signalRService.subscribe(
      'connection-status-changed',
      (status: ConnectionStatus) => {
        setConnectionStatus(status);
        setIsConnected(status.isConnected);
        setIsReconnecting(status.isReconnecting);

        if (status.isConnected && !isConnected) {
          onConnected?.();
        } else if (!status.isConnected && isConnected) {
          onDisconnected?.();
        }
      }
    );

    // Subscribe to connection errors
    const unsubscribeError = signalRService.subscribe('connection-error', data => {
      setError(data.error);
      onError?.(data.error);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeError();
    };
  }, [isConnected, onConnected, onDisconnected, onError]);

  useEffect(() => {
    if (autoConnect || reconnectOnMount) {
      connect();
    }

    return () => {
      subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
      subscriptionsRef.current = [];
    };
  }, [autoConnect, reconnectOnMount, connect]);

  return {
    isConnected,
    isReconnecting,
    connectionStatus,
    lastEvent,
    error,
    connect,
    disconnect,
    sendEvent,
    subscribe,
  };
}

// Specialized hooks for specific use cases
export function useTaskUpdates(taskId?: string) {
  const { subscribe } = useSignalR();
  const [taskUpdates, setTaskUpdates] = useState<any[]>([]);

  useEffect(() => {
    if (!taskId) return;

    const unsubscribes = [
      subscribe('task-updated', data => {
        if (data.taskId === taskId) {
          setTaskUpdates(prev => [...prev, data]);
        }
      }),
      subscribe('task-status-changed', data => {
        if (data.taskId === taskId) {
          setTaskUpdates(prev => [...prev, data]);
        }
      }),
      subscribe('task-assigned', data => {
        if (data.taskId === taskId) {
          setTaskUpdates(prev => [...prev, data]);
        }
      }),
      subscribe('task-completed', data => {
        if (data.taskId === taskId) {
          setTaskUpdates(prev => [...prev, data]);
        }
      }),
    ];

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [taskId, subscribe]);

  return taskUpdates;
}

export function useNotifications() {
  const { subscribe } = useSignalR();
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribe('notification', (notification: NotificationEvent) => {
      setNotifications(prev => [notification, ...prev]);
      if (!notification.isRead) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return unsubscribe;
  }, [subscribe]);

  const markAsRead = useCallback(async (notificationId: string) => {
    await signalRService.markNotificationAsRead(notificationId);
    setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n)));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await signalRService.markAllNotificationsAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}

export function usePresence() {
  const { subscribe } = useSignalR();
  const [presence, setPresence] = useState<Map<string, PresenceInfo>>(new Map());

  useEffect(() => {
    const unsubscribes = [
      subscribe('user-connected', (data: PresenceInfo) => {
        setPresence(prev => {
          const newMap = new Map(prev);
          newMap.set(data.userId, data);
          return newMap;
        });
      }),
      subscribe('user-disconnected', (data: PresenceInfo) => {
        setPresence(prev => {
          const newMap = new Map(prev);
          newMap.set(data.userId, { ...data, status: 'offline' });
          return newMap;
        });
      }),
      subscribe('user-presence-updated', (data: PresenceInfo) => {
        setPresence(prev => {
          const newMap = new Map(prev);
          newMap.set(data.userId, data);
          return newMap;
        });
      }),
    ];

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [subscribe]);

  const getUserPresence = useCallback(
    (userId: string) => {
      return presence.get(userId);
    },
    [presence]
  );

  const getOnlineUsers = useCallback(() => {
    return Array.from(presence.values()).filter(p => p.status !== 'offline');
  }, [presence]);

  return {
    presence,
    getUserPresence,
    getOnlineUsers,
  };
}

export function useCollaboration(entityId: string, entityType: 'task' | 'comment' | 'document') {
  const { subscribe } = useSignalR();
  const [collaborators, setCollaborators] = useState<Map<string, CollaborationEvent>>(new Map());

  useEffect(() => {
    const unsubscribes = [
      subscribe('user-typing', (data: CollaborationEvent) => {
        if (data.entityId === entityId && data.entityType === entityType) {
          setCollaborators(prev => {
            const newMap = new Map(prev);
            if (data.data.typing) {
              newMap.set(data.userId, data);
            } else {
              newMap.delete(data.userId);
            }
            return newMap;
          });
        }
      }),
      subscribe('user-viewing', (data: CollaborationEvent) => {
        if (data.entityId === entityId && data.entityType === entityType) {
          setCollaborators(prev => {
            const newMap = new Map(prev);
            if (data.data.viewing) {
              newMap.set(data.userId, data);
            } else {
              newMap.delete(data.userId);
            }
            return newMap;
          });
        }
      }),
      subscribe('user-editing', (data: CollaborationEvent) => {
        if (data.entityId === entityId && data.entityType === entityType) {
          setCollaborators(prev => {
            const newMap = new Map(prev);
            if (data.data.editing) {
              newMap.set(data.userId, data);
            } else {
              newMap.delete(data.userId);
            }
            return newMap;
          });
        }
      }),
    ];

    return () => {
      unsubscribes.forEach(unsub => unsub());
      setCollaborators(new Map());
    };
  }, [entityId, entityType, subscribe]);

  const sendTypingStatus = useCallback(
    (isTyping: boolean) => {
      signalRService.sendTypingStatus(entityId, entityType, isTyping);
    },
    [entityId, entityType]
  );

  const sendViewingStatus = useCallback(() => {
    signalRService.sendViewingStatus(entityId, entityType);
  }, [entityId, entityType]);

  const sendEditingStatus = useCallback(
    (isEditing: boolean) => {
      signalRService.sendEditingStatus(entityId, entityType, isEditing);
    },
    [entityId, entityType]
  );

  const sendCursorPosition = useCallback(
    (position: { x: number; y: number }) => {
      signalRService.sendCursorPosition(entityId, entityType, position);
    },
    [entityId, entityType]
  );

  return {
    collaborators: Array.from(collaborators.values()),
    sendTypingStatus,
    sendViewingStatus,
    sendEditingStatus,
    sendCursorPosition,
  };
}

export function useActivityFeed(projectId?: string, teamId?: string) {
  const { subscribe } = useSignalR();
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = subscribe('activity-feed-updated', data => {
      if ((!projectId || data.projectId === projectId) && (!teamId || data.teamId === teamId)) {
        setActivities(prev => [data, ...prev.slice(0, 49)]); // Keep last 50 activities
      }
    });

    return unsubscribe;
  }, [projectId, teamId, subscribe]);

  return activities;
}

export default useSignalR;
