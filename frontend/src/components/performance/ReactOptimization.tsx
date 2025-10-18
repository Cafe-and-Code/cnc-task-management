import React, {
  memo,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState,
  ComponentType,
  ReactNode,
  DependencyList
} from 'react'

// Enhanced memo wrapper with custom comparison
export const smartMemo = <P extends object>(
  Component: ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean,
  displayName?: string
) => {
  const MemoizedComponent = memo(Component, areEqual)
  MemoizedComponent.displayName = displayName || `memo(${Component.displayName || Component.name})`
  return MemoizedComponent
}

// Deep comparison utility for complex props
export const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (a.constructor !== b.constructor) return false

    let length, i, keys
    if (Array.isArray(a)) {
      length = a.length
      if (length !== b.length) return false
      for (i = length; i-- > 0;) {
        if (!deepEqual(a[i], b[i])) return false
      }
      return true
    }

    keys = Object.keys(a)
    length = keys.length
    if (length !== Object.keys(b).length) return false

    for (i = length; i-- > 0;) {
      const key = keys[i]
      if (!deepEqual(a[key], b[key])) return false
    }

    return true
  }

  // Naïve comparison for primitives
  return a !== a && b !== b ? false : a === b
}

// Shallow comparison utility
export const shallowEqual = (objA: any, objB: any): boolean => {
  if (Object.is(objA, objB)) {
    return true
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i]
    if (!Object.prototype.hasOwnProperty.call(objB, key) || !Object.is(objA[key], objB[key])) {
      return false
    }
  }

  return true
}

// Optimized callback hook with deep comparison
export const useDeepCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList
): T => {
  const ref = useRef<T>(callback)
  const refDeps = useRef<DependencyList>(deps)

  // Update ref if callback or deps changed (deep comparison)
  if (!deepEqual(deps, refDeps.current) || ref.current !== callback) {
    ref.current = callback
    refDeps.current = [...deps]
  }

  return useCallback(((...args) => ref.current(...args)) as T, [ref])
}

// Optimized memo hook with deep comparison
export const useDeepMemo = <T>(factory: () => T, deps: DependencyList): T => {
  const ref = useRef<{ deps: DependencyList; value: T }>()

  if (!ref.current || !deepEqual(deps, ref.current.deps)) {
    ref.current = { deps: [...deps], value: factory() }
  }

  return ref.current.value
}

// Stable reference hook for complex objects
export const useStableRef = <T>(value: T): { readonly current: T } => {
  const ref = useRef<T>(value)

  if (!deepEqual(value, ref.current)) {
    ref.current = value
  }

  return ref
}

// Virtual list component with optimized rendering
interface VirtualListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  itemHeight: number
  containerHeight: number
  overscan?: number
  getKey?: (item: T, index: number) => string | number
}

export const VirtualList = memo(<T,>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  overscan = 5,
  getKey = (_, index) => index
}: VirtualListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )
    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length])

  const visibleItems = useMemo(() => {
    const items_ = []
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      if (i < items.length) {
        items_.push({
          item: items[i],
          index: i,
          key: getKey(items[i], i)
        })
      }
    }
    return items_
  }, [visibleRange, items, getKey])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  const totalHeight = items.length * itemHeight

  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, key }) => (
          <div
            key={key}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  )
})

VirtualList.displayName = 'VirtualList'

// Optimized image component with lazy loading and intersection observer
interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  placeholder?: string
  onLoad?: () => void
  onError?: () => void
  lazy?: boolean
  threshold?: number
}

export const OptimizedImage = memo<OptimizedImageProps>(({
  src,
  alt,
  width,
  height,
  className,
  placeholder,
  onLoad,
  onError,
  lazy = true,
  threshold = 0.1
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(!lazy)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!lazy || !imgRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [lazy, threshold])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    onError?.()
  }, [onError])

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 ${className}`}>
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    )
  }

  return (
    <div ref={imgRef} className={className} style={{ width, height }}>
      {!isLoaded && placeholder && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse">
          {placeholder}
        </div>
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  )
})

OptimizedImage.displayName = 'OptimizedImage'

// Debounced callback hook
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: DependencyList = []
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay)
  }) as T, [callback, delay, ...deps])
}

// Throttled callback hook
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: DependencyList = []
): T => {
  const lastRunRef = useRef<number>(0)

  return useCallback(((...args) => {
    if (Date.now() - lastRunRef.current >= delay) {
      callback(...args)
      lastRunRef.current = Date.now()
    }
  }) as T, [callback, delay, ...deps])
}

// Optimized list component with key extraction
interface OptimizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  getKey: (item: T, index: number) => string | number
  className?: string
}

export const OptimizedList = memo(<T,>({
  items,
  renderItem,
  getKey,
  className
}: OptimizedListProps<T>) => {
  const memoizedItems = useMemo(() => items, [items])

  return (
    <div className={className}>
      {memoizedItems.map((item, index) => (
        <React.Fragment key={getKey(item, index)}>
          {renderItem(item, index)}
        </React.Fragment>
      ))}
    </div>
  )
})

OptimizedList.displayName = 'OptimizedList'

// Performance monitoring hook
export const useRenderPerformance = (componentName: string) => {
  const renderCountRef = useRef(0)
  const lastRenderTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    renderCountRef.current += 1
    const now = Date.now()
    const timeSinceLastRender = now - lastRenderTimeRef.current
    lastRenderTimeRef.current = now

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `${componentName} rendered ${renderCountRef.current} times. ` +
        `Time since last render: ${timeSinceLastRender}ms`
      )
    }
  })

  return {
    renderCount: renderCountRef.current,
    timeSinceLastRender: Date.now() - lastRenderTimeRef.current
  }
}

// Batch state updates hook
export const useBatchedUpdates = () => {
  const [, forceUpdate] = useState({})

  return useCallback(() => {
    // Use unstable_batchedUpdates if available (React 18)
    if ('unstable_batchedUpdates' in React) {
      (React as any).unstable_batchedUpdates(() => {
        forceUpdate({})
      })
    } else {
      forceUpdate({})
    }
  }, [])
}

// Component that prevents unnecessary re-renders
export const RenderOnce: React.FC<{
  children: ReactNode
  condition?: boolean
}> = memo(({ children, condition = true }) => {
  return condition ? <>{children}</> : null
})

RenderOnce.displayName = 'RenderOnce'

// Higher-order component for performance optimization
export const withPerformanceOptimization = <P extends object>(
  Component: ComponentType<P>,
  options: {
    memo?: boolean
    areEqual?: (prevProps: P, nextProps: P) => boolean
    displayName?: string
  } = {}
) => {
  const { memo: shouldMemo = true, areEqual, displayName } = options

  let OptimizedComponent = Component

  if (shouldMemo) {
    OptimizedComponent = smartMemo(Component, areEqual, displayName)
  }

  return OptimizedComponent
}

// Performance context for monitoring
interface PerformanceContextValue {
  markComponentRender: (componentName: string) => void
  getComponentStats: (componentName: string) => { renders: number; lastRender: number }
}

export const PerformanceContext = React.createContext<PerformanceContextValue>({
  markComponentRender: () => {},
  getComponentStats: () => ({ renders: 0, lastRender: 0 })
})

export const PerformanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const statsRef = useRef<Map<string, { renders: number; lastRender: number }>>(new Map())

  const markComponentRender = useCallback((componentName: string) => {
    const stats = statsRef.current.get(componentName) || { renders: 0, lastRender: 0 }
    statsRef.current.set(componentName, {
      renders: stats.renders + 1,
      lastRender: Date.now()
    })
  }, [])

  const getComponentStats = useCallback((componentName: string) => {
    return statsRef.current.get(componentName) || { renders: 0, lastRender: 0 }
  }, [])

  const contextValue = useMemo(() => ({
    markComponentRender,
    getComponentStats
  }), [markComponentRender, getComponentStats])

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  )
}

export default {
  smartMemo,
  deepEqual,
  shallowEqual,
  useDeepCallback,
  useDeepMemo,
  useStableRef,
  VirtualList,
  OptimizedImage,
  useDebouncedCallback,
  useThrottledCallback,
  OptimizedList,
  useRenderPerformance,
  useBatchedUpdates,
  RenderOnce,
  withPerformanceOptimization,
  PerformanceProvider
}