import React, { useState, useEffect } from 'react';

interface DeviceInfo {
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  devicePixelRatio: number;
  touchSupport: boolean;
  orientation: string;
  connection: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  } | null;
  memory: {
    deviceMemory: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  } | null;
  hardwareConcurrency: number;
}

interface TestResult {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export const MobileTestingSuite: React.FC<{
  onTestComplete?: (results: TestResult[]) => void;
  className?: string;
}> = ({ onTestComplete, className = '' }) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    collectDeviceInfo();
  }, []);

  const collectDeviceInfo = () => {
    const info: DeviceInfo = {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      devicePixelRatio: window.devicePixelRatio,
      touchSupport: 'ontouchstart' in window,
      orientation: window.screen.orientation?.type || 'unknown',
      connection: (navigator as any).connection
        ? {
            effectiveType: (navigator as any).connection.effectiveType,
            downlink: (navigator as any).connection.downlink,
            rtt: (navigator as any).connection.rtt,
          }
        : null,
      memory: (performance as any).memory
        ? {
            deviceMemory: (navigator as any).deviceMemory,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          }
        : null,
      hardwareConcurrency: navigator.hardwareConcurrency || 4,
    };
    setDeviceInfo(info);
  };

  const runTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setTestResults([]);

    const tests: TestResult[] = [];

    // Test 1: Viewport Size
    const viewportTest = testViewportSize();
    tests.push(viewportTest);
    setProgress(10);

    // Test 2: Touch Support
    const touchTest = testTouchSupport();
    tests.push(touchTest);
    setProgress(20);

    // Test 3: Performance
    const performanceTest = await testPerformance();
    tests.push(performanceTest);
    setProgress(30);

    // Test 4: Network
    const networkTest = testNetworkCapability();
    tests.push(networkTest);
    setProgress(40);

    // Test 5: Storage
    const storageTest = await testStorageCapability();
    tests.push(storageTest);
    setProgress(50);

    // Test 6: PWA Features
    const pwaTest = testPWAFeatures();
    tests.push(pwaTest);
    setProgress(60);

    // Test 7: Responsive Design
    const responsiveTest = testResponsiveDesign();
    tests.push(responsiveTest);
    setProgress(70);

    // Test 8: Accessibility
    const accessibilityTest = testAccessibility();
    tests.push(accessibilityTest);
    setProgress(80);

    // Test 9: Gesture Support
    const gestureTest = await testGestureSupport();
    tests.push(gestureTest);
    setProgress(90);

    // Test 10: Offline Support
    const offlineTest = await testOfflineSupport();
    tests.push(offlineTest);
    setProgress(100);

    setTestResults(tests);
    setIsRunning(false);
    onTestComplete?.(tests);
  };

  const testViewportSize = (): TestResult => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width <= 768;

    if (width < 320) {
      return {
        id: 'viewport',
        name: 'Viewport Width',
        status: 'fail',
        message: `Viewport width (${width}px) is below minimum supported width (320px)`,
        details: { width, height, isMobile },
      };
    }

    return {
      id: 'viewport',
      name: 'Viewport Size',
      status: isMobile ? 'pass' : 'warning',
      message: `Viewport: ${width}x${height}px - ${isMobile ? 'Mobile' : 'Desktop'} detected`,
      details: { width, height, isMobile },
    };
  };

  const testTouchSupport = (): TestResult => {
    const hasTouch = 'ontouchstart' in window;
    const maxTouchPoints = navigator.maxTouchPoints || 0;

    if (!hasTouch) {
      return {
        id: 'touch',
        name: 'Touch Support',
        status: 'warning',
        message: 'No touch support detected - mobile experience may be limited',
        details: { hasTouch, maxTouchPoints },
      };
    }

    return {
      id: 'touch',
      name: 'Touch Support',
      status: 'pass',
      message: `Touch support available (${maxTouchPoints} touch points)`,
      details: { hasTouch, maxTouchPoints },
    };
  };

  const testPerformance = async (): Promise<TestResult> => {
    return new Promise(resolve => {
      // Test animation performance
      const start = performance.now();
      let frames = 0;
      let animationId: number;

      const countFrame = () => {
        frames++;
        if (performance.now() - start >= 1000) {
          cancelAnimationFrame(animationId);
          const fps = frames;

          if (fps < 30) {
            resolve({
              id: 'performance',
              name: 'Animation Performance',
              status: 'fail',
              message: `Low FPS detected: ${fps}fps (minimum 30fps recommended)`,
              details: {
                fps,
                deviceMemory: (navigator as any).deviceMemory,
                cores: navigator.hardwareConcurrency,
              },
            });
          } else if (fps < 50) {
            resolve({
              id: 'performance',
              name: 'Animation Performance',
              status: 'warning',
              message: `Moderate FPS: ${fps}fps (50+fps recommended for smooth experience)`,
              details: {
                fps,
                deviceMemory: (navigator as any).deviceMemory,
                cores: navigator.hardwareConcurrency,
              },
            });
          } else {
            resolve({
              id: 'performance',
              name: 'Animation Performance',
              status: 'pass',
              message: `Good performance: ${fps}fps`,
              details: {
                fps,
                deviceMemory: (navigator as any).deviceMemory,
                cores: navigator.hardwareConcurrency,
              },
            });
          }
        } else {
          animationId = requestAnimationFrame(countFrame);
        }
      };

      animationId = requestAnimationFrame(countFrame);
    });
  };

  const testNetworkCapability = (): TestResult => {
    const connection = (navigator as any).connection;

    if (!connection) {
      return {
        id: 'network',
        name: 'Network Information',
        status: 'warning',
        message: 'Network Information API not available',
        details: { connectionAvailable: false },
      };
    }

    const { effectiveType, downlink, rtt } = connection;

    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      return {
        id: 'network',
        name: 'Network Speed',
        status: 'warning',
        message: `Slow connection detected: ${effectiveType} (${downlink}Mbps, ${rtt}ms)`,
        details: { effectiveType, downlink, rtt },
      };
    }

    return {
      id: 'network',
      name: 'Network Speed',
      status: 'pass',
      message: `Good connection: ${effectiveType} (${downlink}Mbps, ${rtt}ms)`,
      details: { effectiveType, downlink, rtt },
    };
  };

  const testStorageCapability = async (): Promise<TestResult> => {
    try {
      // Test localStorage
      const testKey = 'mobile-test-key';
      const testValue = 'test-data';
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      if (retrieved !== testValue) {
        return {
          id: 'storage',
          name: 'Local Storage',
          status: 'fail',
          message: 'LocalStorage is not working properly',
          details: { available: false },
        };
      }

      // Test IndexedDB
      const indexedDBAvailable = 'indexedDB' in window;

      return {
        id: 'storage',
        name: 'Storage Capability',
        status: 'pass',
        message: 'Storage capabilities available',
        details: {
          localStorage: true,
          indexedDB: indexedDBAvailable,
        },
      };
    } catch (error) {
      return {
        id: 'storage',
        name: 'Storage Capability',
        status: 'fail',
        message: `Storage error: ${error}`,
        details: { error: error.toString() },
      };
    }
  };

  const testPWAFeatures = (): TestResult => {
    const features = {
      serviceWorker: 'serviceWorker' in navigator,
      manifest: !!document.querySelector('link[rel="manifest"]'),
      installPrompt: 'onbeforeinstallprompt' in window,
      pushNotifications: 'PushManager' in window,
      backgroundSync: 'serviceWorker' in navigator && 'SyncManager' in window,
    };

    const availableFeatures = Object.values(features).filter(Boolean).length;
    const totalFeatures = Object.keys(features).length;

    if (availableFeatures === 0) {
      return {
        id: 'pwa',
        name: 'PWA Features',
        status: 'fail',
        message: 'No PWA features available',
        details: features,
      };
    }

    if (availableFeatures < totalFeatures / 2) {
      return {
        id: 'pwa',
        name: 'PWA Features',
        status: 'warning',
        message: `Limited PWA support (${availableFeatures}/${totalFeatures} features)`,
        details: features,
      };
    }

    return {
      id: 'pwa',
      name: 'PWA Features',
      status: 'pass',
      message: `Good PWA support (${availableFeatures}/${totalFeatures} features)`,
      details: features,
    };
  };

  const testResponsiveDesign = (): TestResult => {
    const width = window.innerWidth;
    const hasViewportMeta = document.querySelector('meta[name="viewport"]') !== null;

    if (!hasViewportMeta) {
      return {
        id: 'responsive',
        name: 'Responsive Design',
        status: 'fail',
        message: 'Viewport meta tag is missing',
        details: { hasViewportMeta, width },
      };
    }

    const isResponsive = width <= 768;
    const hasMediaQueries = window.matchMedia('(max-width: 768px)').media !== 'not all';

    if (!hasMediaQueries) {
      return {
        id: 'responsive',
        name: 'Responsive Design',
        status: 'warning',
        message: 'Media queries may not be supported',
        details: { hasViewportMeta, width, hasMediaQueries },
      };
    }

    return {
      id: 'responsive',
      name: 'Responsive Design',
      status: 'pass',
      message: 'Responsive design properly implemented',
      details: { hasViewportMeta, width, hasMediaQueries, isResponsive },
    };
  };

  const testAccessibility = (): TestResult => {
    const checks = {
      hasLang: document.documentElement.lang !== '',
      hasTitle: document.title !== '',
      properHeadings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0,
      hasAltTexts: Array.from(document.querySelectorAll('img')).every(img => img.alt !== ''),
      semanticHTML:
        document.querySelectorAll('main, nav, header, footer, section, article').length > 0,
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;

    if (passedChecks < totalChecks / 2) {
      return {
        id: 'accessibility',
        name: 'Accessibility',
        status: 'fail',
        message: `Poor accessibility (${passedChecks}/${totalChecks} checks passed)`,
        details: checks,
      };
    }

    if (passedChecks < totalChecks) {
      return {
        id: 'accessibility',
        name: 'Accessibility',
        status: 'warning',
        message: `Some accessibility issues (${passedChecks}/${totalChecks} checks passed)`,
        details: checks,
      };
    }

    return {
      id: 'accessibility',
      name: 'Accessibility',
      status: 'pass',
      message: `Good accessibility (${passedChecks}/${totalChecks} checks passed)`,
      details: checks,
    };
  };

  const testGestureSupport = async (): Promise<TestResult> => {
    return new Promise(resolve => {
      const hasTouch = 'ontouchstart' in window;
      const hasPointerEvents = 'PointerEvent' in window;

      if (!hasTouch) {
        resolve({
          id: 'gestures',
          name: 'Gesture Support',
          status: 'warning',
          message: 'Touch events not available - gesture support limited',
          details: { hasTouch, hasPointerEvents },
        });
        return;
      }

      // Test touch event responsiveness
      const testElement = document.createElement('div');
      testElement.style.position = 'absolute';
      testElement.style.top = '-1000px';
      document.body.appendChild(testElement);

      let touchStartFired = false;
      testElement.addEventListener('touchstart', () => {
        touchStartFired = true;
      });

      // Simulate touch event
      const touchEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [
          new Touch({
            identifier: 0,
            target: testElement,
            clientX: 0,
            clientY: 0,
          }),
        ],
      });

      testElement.dispatchEvent(touchEvent);

      setTimeout(() => {
        document.body.removeChild(testElement);

        resolve({
          id: 'gestures',
          name: 'Gesture Support',
          status: touchStartFired ? 'pass' : 'warning',
          message: touchStartFired
            ? 'Touch events working properly'
            : 'Touch events may not be working correctly',
          details: { hasTouch, hasPointerEvents, touchStartFired },
        });
      }, 100);
    });
  };

  const testOfflineSupport = async (): Promise<TestResult> => {
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasIndexedDB = 'indexedDB' in window;
    const hasApplicationCache = 'applicationCache' in window;

    if (!hasServiceWorker) {
      return {
        id: 'offline',
        name: 'Offline Support',
        status: 'warning',
        message: 'Service Worker not available - limited offline functionality',
        details: { hasServiceWorker, hasIndexedDB, hasApplicationCache },
      };
    }

    // Test service worker registration
    try {
      const registration = await navigator.serviceWorker.getRegistration();

      if (registration) {
        return {
          id: 'offline',
          name: 'Offline Support',
          status: 'pass',
          message: 'Service Worker registered and active',
          details: {
            hasServiceWorker,
            hasIndexedDB,
            hasApplicationCache,
            swScope: registration.scope,
            swState: registration.active?.state,
          },
        };
      } else {
        return {
          id: 'offline',
          name: 'Offline Support',
          status: 'warning',
          message: 'Service Worker API available but not registered',
          details: { hasServiceWorker, hasIndexedDB, hasApplicationCache },
        };
      }
    } catch (error) {
      return {
        id: 'offline',
        name: 'Offline Support',
        status: 'fail',
        message: `Service Worker error: ${error}`,
        details: { hasServiceWorker, hasIndexedDB, hasApplicationCache, error: error.toString() },
      };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'fail':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'fail':
        return '❌';
      default:
        return '❓';
    }
  };

  const passedTests = testResults.filter(t => t.status === 'pass').length;
  const warningTests = testResults.filter(t => t.status === 'warning').length;
  const failedTests = testResults.filter(t => t.status === 'fail').length;

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 ${className}`}
    >
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Mobile Testing Suite
        </h3>

        {/* Device Info */}
        {deviceInfo && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Device Information
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>
                Screen: {deviceInfo.viewport.width}x{deviceInfo.viewport.height}
              </div>
              <div>Touch: {deviceInfo.touchSupport ? 'Yes' : 'No'}</div>
              <div>DPR: {deviceInfo.devicePixelRatio}</div>
              <div>CPU Cores: {deviceInfo.hardwareConcurrency}</div>
            </div>
          </div>
        )}

        {/* Progress */}
        {isRunning && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Running Tests...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Results</span>
              <span
                className={`
                ${failedTests > 0 ? 'text-red-600' : warningTests > 0 ? 'text-yellow-600' : 'text-green-600'}
              `}
              >
                {passedTests} passed, {warningTests} warnings, {failedTests} failed
              </span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {testResults.map(test => (
                <div
                  key={test.id}
                  className={`p-2 rounded-lg text-xs ${getStatusColor(test.status)}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{test.name}</span>
                    <span>{getStatusIcon(test.status)}</span>
                  </div>
                  <div>{test.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={runTests}
            disabled={isRunning}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isRunning ? 'Running...' : 'Run Tests'}
          </button>
          {testResults.length > 0 && (
            <button
              onClick={() => setTestResults([])}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Device Detection Hook
export const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isChrome: false,
    isFirefox: false,
  });

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const width = window.innerWidth;

    const info = {
      isMobile: width <= 768,
      isTablet: width > 768 && width <= 1024,
      isDesktop: width > 1024,
      isIOS: /iphone|ipad|ipod/.test(userAgent),
      isAndroid: /android/.test(userAgent),
      isSafari: /safari/.test(userAgent) && !/chrome/.test(userAgent),
      isChrome: /chrome/.test(userAgent),
      isFirefox: /firefox/.test(userAgent),
    };

    setDeviceInfo(info);
  }, []);

  return deviceInfo;
};
