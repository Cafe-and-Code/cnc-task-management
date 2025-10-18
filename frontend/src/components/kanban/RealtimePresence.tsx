import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Users, Eye, Edit3, Clock } from 'lucide-react';
import { realtimeService } from '../../services/realtimeService';

interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen: string;
  currentTaskId?: string;
  currentAction?: 'viewing' | 'editing' | 'idle';
}

interface RealtimePresenceProps {
  boardId: string;
  currentUserId: string;
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export const RealtimePresence: React.FC<RealtimePresenceProps> = ({
  boardId,
  currentUserId,
  className = '',
  showDetails = true,
  compact = false,
}) => {
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'reconnecting'
  >('disconnected');

  useEffect(() => {
    // Set up real-time event handlers
    const handleConnect = () => {
      setIsConnected(true);
      setConnectionStatus('connected');
      console.log('Connected to real-time service');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
      setConnectedUsers([]);
    };

    const handleConnectionLost = () => {
      setConnectionStatus('reconnecting');
    };

    const handleConnectionRestored = () => {
      setConnectionStatus('connected');
      setIsConnected(true);
    };

    const handleUserPresence = (data: any) => {
      setConnectedUsers(prev => {
        const updatedUsers = prev.filter(user => user.id !== data.userId);

        if (data.isOnline) {
          updatedUsers.push({
            id: data.userId,
            name: data.userName,
            avatarUrl: data.avatarUrl,
            isOnline: true,
            lastSeen: data.lastSeen,
            currentTaskId: data.currentTaskId,
            currentAction: data.currentAction || 'viewing',
          });
        }

        return updatedUsers.sort((a, b) => {
          // Current user first, then online users, then recently active
          if (a.id === currentUserId) return -1;
          if (b.id === currentUserId) return 1;
          if (a.isOnline && !b.isOnline) return -1;
          if (!a.isOnline && b.isOnline) return 1;
          return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
        });
      });
    };

    // Register event handlers
    realtimeService.on('connected', handleConnect);
    realtimeService.on('disconnected', handleDisconnect);
    realtimeService.on('connectionLost', handleConnectionLost);
    realtimeService.on('connectionRestored', handleConnectionRestored);
    realtimeService.on('userPresenceUpdated', handleUserPresence);

    // Join the board room
    if (boardId) {
      realtimeService.joinBoard(boardId);
    }

    // Set initial connection status
    setIsConnected(realtimeService.isConnected());
    setConnectionStatus(realtimeService.isConnected() ? 'connected' : 'connecting');

    return () => {
      // Clean up event handlers
      realtimeService.off('connected', handleConnect);
      realtimeService.off('disconnected', handleDisconnect);
      realtimeService.off('connectionLost', handleConnectionLost);
      realtimeService.off('connectionRestored', handleConnectionRestored);
      realtimeService.off('userPresenceUpdated', handleUserPresence);

      // Leave the board room
      if (boardId) {
        realtimeService.leaveBoard(boardId);
      }
    };
  }, [boardId, currentUserId]);

  const activeUsers = connectedUsers.filter(user => user.isOnline && user.id !== currentUserId);
  const onlineCount = activeUsers.length;

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'connecting':
      case 'reconnecting':
        return <Wifi className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-500" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  const getActionIcon = (action?: string) => {
    switch (action) {
      case 'editing':
        return <Edit3 className="w-3 h-3" />;
      case 'viewing':
        return <Eye className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {getConnectionIcon()}
        {onlineCount > 0 && (
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{onlineCount}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          {getConnectionIcon()}
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {getConnectionText()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">{onlineCount} online</span>
        </div>
      </div>

      {/* Users List */}
      {showDetails && (
        <div className="max-h-64 overflow-y-auto">
          {connectedUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No other users on this board</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {connectedUsers.map(user => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    user.id === currentUserId ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                          user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.name}
                          {user.id === currentUserId && (
                            <span className="text-xs text-gray-500 ml-1">(You)</span>
                          )}
                        </p>
                        {user.currentAction && user.isOnline && (
                          <div className="flex items-center space-x-1 text-gray-500">
                            {getActionIcon(user.currentAction)}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {user.isOnline ? (
                          <>
                            {user.currentAction === 'editing'
                              ? 'Editing task'
                              : user.currentAction === 'viewing'
                                ? 'Viewing board'
                                : 'Active'}
                            {user.currentTaskId && (
                              <span className="ml-1 text-blue-600 dark:text-blue-400">
                                (Task #{user.currentTaskId.slice(-4)})
                              </span>
                            )}
                          </>
                        ) : (
                          <>Last seen {formatLastSeen(user.lastSeen)}</>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div className="flex items-center space-x-2">
                    {user.isOnline && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      {showDetails && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Real-time updates active</span>
            <span>{connectedUsers.length} total users</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for using presence in components
export const usePresence = (boardId: string, currentUserId: string) => {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleUserPresence = (data: any) => {
      setActiveUsers(prev => {
        const updatedUsers = prev.filter(user => user.id !== data.userId);

        if (data.isOnline && data.userId !== currentUserId) {
          updatedUsers.push({
            id: data.userId,
            name: data.userName,
            avatarUrl: data.avatarUrl,
            isOnline: true,
            lastSeen: data.lastSeen,
            currentTaskId: data.currentTaskId,
            currentAction: data.currentAction || 'viewing',
          });
        }

        return updatedUsers;
      });
    };

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => {
      setIsConnected(false);
      setActiveUsers([]);
    };

    realtimeService.on('userPresenceUpdated', handleUserPresence);
    realtimeService.on('connected', handleConnect);
    realtimeService.on('disconnected', handleDisconnect);

    return () => {
      realtimeService.off('userPresenceUpdated', handleUserPresence);
      realtimeService.off('connected', handleConnect);
      realtimeService.off('disconnected', handleDisconnect);
    };
  }, [boardId, currentUserId]);

  const updatePresence = (taskId?: string, action?: 'viewing' | 'editing' | 'idle') => {
    realtimeService.updatePresence(taskId);
  };

  return {
    activeUsers,
    isConnected,
    onlineCount: activeUsers.length,
    updatePresence,
  };
};
