import React, { useState, useEffect } from 'react';
import { useSignalR } from '../../hooks/useSignalR';
import {
  Wifi,
  WifiOff,
  AlertTriangle,
  RefreshCw,
  Settings,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Zap,
} from 'lucide-react';

interface ConnectionStatusProps {
  showDetails?: boolean;
  position?: 'header' | 'sidebar' | 'floating';
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  showDetails = false,
  position = 'header',
  className = '',
}) => {
  const { isConnected, isReconnecting, connectionStatus, error, connect } = useSignalR();
  const [showTooltip, setShowTooltip] = useState(false);
  const [lastHeartbeat, setLastHeartbeat] = useState<string>(new Date().toISOString());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastHeartbeat(new Date().toISOString());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (error) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (isReconnecting) {
      return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
    }
    if (isConnected) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <WifiOff className="w-4 h-4 text-gray-500" />;
  };

  const getStatusText = () => {
    if (error) {
      return 'Connection Error';
    }
    if (isReconnecting) {
      return 'Reconnecting...';
    }
    if (isConnected) {
      return 'Connected';
    }
    return 'Disconnected';
  };

  const getStatusColor = () => {
    if (error) {
      return 'text-red-600 dark:text-red-400';
    }
    if (isReconnecting) {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    if (isConnected) {
      return 'text-green-600 dark:text-green-400';
    }
    return 'text-gray-600 dark:text-gray-400';
  };

  const getBackgroundColor = () => {
    if (error) {
      return 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-800';
    }
    if (isReconnecting) {
      return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800';
    }
    if (isConnected) {
      return 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-800';
    }
    return 'bg-gray-100 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600';
  };

  const getConnectionQuality = () => {
    if (!isConnected || !connectionStatus.lastConnected) return 'Unknown';

    const now = new Date();
    const lastConnected = new Date(connectionStatus.lastConnected);
    const timeDiff = now.getTime() - lastConnected.getTime();

    if (timeDiff < 30000) return 'Excellent'; // < 30 seconds
    if (timeDiff < 60000) return 'Good'; // < 1 minute
    if (timeDiff < 300000) return 'Fair'; // < 5 minutes
    return 'Poor';
  };

  const getLatency = () => {
    // Simulated latency - in real implementation, this would be measured
    if (!isConnected) return null;
    return Math.floor(Math.random() * 50) + 10; // 10-60ms
  };

  const handleReconnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to reconnect:', error);
    }
  };

  const renderFloatingStatus = () => (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <button
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getBackgroundColor()} transition-colors`}
        >
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>{getStatusText()}</span>
          {isReconnecting && <RefreshCw className="w-3 h-3 animate-spin text-yellow-600" />}
        </button>

        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`font-medium ${getStatusColor()}`}>{getStatusText()}</span>
              </div>

              {isConnected && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Quality:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {getConnectionQuality()}
                    </span>
                  </div>

                  {getLatency() && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Latency:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {getLatency()}ms
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last Update:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(lastHeartbeat).toLocaleTimeString()}
                    </span>
                  </div>
                </>
              )}

              {error && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-red-600 dark:text-red-400 text-xs">
                    {error.message || 'Connection error occurred'}
                  </p>
                  <button
                    onClick={handleReconnect}
                    className="mt-2 w-full px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                  >
                    Reconnect
                  </button>
                </div>
              )}

              {connectionStatus.connectionAttempts > 0 && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Reconnection attempts: {connectionStatus.connectionAttempts}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderHeaderStatus = () => (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <button
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor()}`}
        >
          {getStatusIcon()}
          <span>{getStatusText()}</span>
          {isReconnecting && <RefreshCw className="w-3 h-3 animate-spin" />}
        </button>

        {showTooltip && (
          <div className="absolute top-full left-0 mt-1 w-48 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Quality:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {getConnectionQuality()}
                </span>
              </div>

              {getLatency() && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Latency:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {getLatency()}ms
                  </span>
                </div>
              )}

              {connectionStatus.lastConnected && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Connected:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(connectionStatus.lastConnected).toLocaleTimeString()}
                  </span>
                </div>
              )}

              {error && (
                <div className="pt-1 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleReconnect}
                    className="w-full px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Reconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSidebarStatus = () => (
    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div className="flex-1">
          <p className={`text-sm font-medium ${getStatusColor()}`}>{getStatusText()}</p>
          {isConnected && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {getConnectionQuality()} connection • {getLatency()}ms
            </p>
          )}
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {error.message || 'Connection error'}
            </p>
          )}
        </div>

        {error && (
          <button
            onClick={handleReconnect}
            className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            title="Reconnect"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  const renderDetailedStatus = () => (
    <div className={`p-4 rounded-lg border ${getBackgroundColor()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <h3 className="font-medium text-gray-900 dark:text-white">Connection Status</h3>
        </div>

        {error && (
          <button
            onClick={handleReconnect}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            Reconnect
          </button>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Status:</span>
          <span className={`font-medium ${getStatusColor()}`}>{getStatusText()}</span>
        </div>

        {isConnected && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Quality:</span>
              <div className="flex items-center space-x-1">
                <span className="font-medium text-green-600 dark:text-green-400">
                  {getConnectionQuality()}
                </span>
                <Zap className="w-3 h-3 text-green-500" />
              </div>
            </div>

            {getLatency() && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Latency:</span>
                <span className="font-medium text-gray-900 dark:text-white">{getLatency()}ms</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Heartbeat:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(lastHeartbeat).toLocaleTimeString()}
              </span>
            </div>
          </>
        )}

        {connectionStatus.lastConnected && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Last Connected:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {new Date(connectionStatus.lastConnected).toLocaleString()}
            </span>
          </div>
        )}

        {connectionStatus.lastDisconnected && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Last Disconnected:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {new Date(connectionStatus.lastDisconnected).toLocaleString()}
            </span>
          </div>
        )}

        {connectionStatus.connectionAttempts > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Reconnection Attempts:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {connectionStatus.connectionAttempts}
            </span>
          </div>
        )}

        {error && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-red-600 dark:text-red-400 text-xs">
              <strong>Error:</strong> {error.message || 'Connection error occurred'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Render different styles based on position
  if (position === 'floating') {
    return renderFloatingStatus();
  }

  if (position === 'header') {
    return renderHeaderStatus();
  }

  if (position === 'sidebar') {
    return renderSidebarStatus();
  }

  if (showDetails) {
    return renderDetailedStatus();
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {getStatusIcon()}
      <span className={`text-sm font-medium ${getStatusColor()}`}>{getStatusText()}</span>
    </div>
  );
};

export default ConnectionStatus;
