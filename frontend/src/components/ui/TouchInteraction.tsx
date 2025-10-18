import React, { useState, useRef, useEffect } from 'react';

interface TouchButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  hapticFeedback?: boolean;
  longPressAction?: () => void;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  hapticFeedback = true,
  longPressAction,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [rippleStyle, setRippleStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerHapticFeedback = () => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50); // Light vibration for 50ms
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || loading) return;

    setIsPressed(true);
    triggerHapticFeedback();

    // Create ripple effect
    const touch = e.touches[0];
    const button = buttonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      const ripple = {
        top: touch.clientY - rect.top,
        left: touch.clientX - rect.left,
        scale: 1,
      };
      setRippleStyle({
        top: ripple.top,
        left: ripple.left,
        transform: `translate(-50%, -50%) scale(0)`,
      });

      setTimeout(() => {
        setRippleStyle(prev => ({
          ...prev,
          transform: `translate(-50%, -50%) scale(4)`,
        }));
      }, 10);
    }

    // Handle long press
    if (longPressAction) {
      longPressTimerRef.current = setTimeout(() => {
        triggerHapticFeedback();
        longPressAction();
      }, 500); // 500ms for long press
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    setRippleStyle({});

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleClick = () => {
    if (onClick && !disabled && !loading) {
      onClick();
    }
  };

  const getButtonStyles = () => {
    const baseStyles =
      'relative overflow-hidden transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-offset-2';

    const sizeStyles = {
      sm: 'px-4 py-3 min-h-[44px] text-sm',
      md: 'px-6 py-4 min-h-[48px] text-base',
      lg: 'px-8 py-5 min-h-[56px] text-lg',
    };

    const variantStyles = {
      primary: 'bg-brand-primary text-white hover:bg-brand-primary/90 focus:ring-brand-primary',
      secondary:
        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-brand-primary',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost:
        'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-brand-primary',
    };

    const stateStyles = {
      pressed: isPressed && !disabled && !loading ? 'scale-95' : '',
      disabled: disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    };

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${stateStyles.pressed} ${stateStyles.disabled} ${className}`;
  };

  return (
    <button
      ref={buttonRef}
      className={getButtonStyles()}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      disabled={disabled || loading}
      type="button"
    >
      {/* Ripple Effect */}
      <div
        className="absolute w-20 h-20 bg-white opacity-30 rounded-full pointer-events-none"
        style={{
          ...rippleStyle,
          transition: 'transform 0.6s ease-out, opacity 0.6s ease-out',
          opacity: rippleStyle.transform ? 0 : 1,
        }}
      />

      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
        </div>
      )}

      {/* Button Content */}
      <span className={loading ? 'opacity-0' : 'flex items-center justify-center'}>{children}</span>
    </button>
  );
};

interface SwipeCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  swipeThreshold?: number;
  className?: string;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  swipeThreshold = 50,
  className = '',
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    startTime.current = Date.now();
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startX.current;
    const deltaY = currentY - startY.current;

    setTranslateX(deltaX);
    setTranslateY(deltaY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isSwiping) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - startX.current;
    const deltaY = endY - startY.current;
    const deltaTime = Date.now() - startTime.current;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Check if it's a swipe (fast movement or sufficient distance)
    const isSwipe =
      absDeltaX > swipeThreshold ||
      absDeltaY > swipeThreshold ||
      (deltaTime < 300 && (absDeltaX > 20 || absDeltaY > 20));

    if (isSwipe) {
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }

    // Reset position
    setTranslateX(0);
    setTranslateY(0);
    setIsSwiping(false);
  };

  return (
    <div
      className={className}
      style={{
        transform: `translateX(${translateX}px) translateY(${translateY}px)`,
        transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
};

interface DraggableItemProps {
  children: React.ReactNode;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDrag?: (deltaX: number, deltaY: number) => void;
  dragHandle?: boolean;
  className?: string;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  children,
  onDragStart,
  onDragEnd,
  onDrag,
  dragHandle = false,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (dragHandle && !e.currentTarget.closest('[data-drag-handle]')) {
      return;
    }

    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    onDragStart?.();

    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;

    setPosition({ x: newX, y: newY });
    onDrag?.(newX, newY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    onDragEnd?.();
  };

  return (
    <div
      ref={elementRef}
      className={`${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${className}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        zIndex: isDragging ? 1000 : 1,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
};

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
  pullThreshold?: number;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  disabled = false,
  pullThreshold = 80,
  className = '',
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;

    const touch = e.touches[0];
    startY.current = touch.clientY;

    // Only enable pull-to-refresh at the top of the scrollable container
    const container = containerRef.current;
    if (container) {
      const scrollTop = container.scrollTop;
      if (scrollTop > 0) {
        return;
      }
    }

    setIsPulling(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;

    const touch = e.touches[0];
    const deltaY = touch.clientY - startY.current;

    // Only allow pulling down, not up
    if (deltaY > 0) {
      e.preventDefault();
      setPullDistance(Math.min(deltaY * 0.5, pullThreshold * 1.5)); // Dampen the pull effect
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling || disabled || isRefreshing) return;

    setIsPulling(false);

    if (pullDistance >= pullThreshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
  };

  const getRefreshIndicatorOpacity = () => {
    if (isRefreshing) return 1;
    if (!isPulling) return 0;
    return Math.min(pullDistance / pullThreshold, 1);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-y-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
        style={{
          height: `${Math.max(0, pullDistance)}px`,
          opacity: getRefreshIndicatorOpacity(),
          transform: `translateY(${Math.max(-pullDistance, 0)}px)`,
        }}
      >
        {isRefreshing ? (
          <div className="flex items-center space-x-2 py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-primary"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Refreshing...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 py-4">
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {pullDistance >= pullThreshold ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ transform: `translateY(${Math.max(0, pullDistance)}px)` }}>{children}</div>
    </div>
  );
};
