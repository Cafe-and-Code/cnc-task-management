import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface VirtualScrollItem<T = any> {
  id: string | number;
  data: T;
  height?: number;
}

interface VirtualScrollProps<T = any> {
  items: VirtualScrollItem<T>[];
  itemHeight: number | ((index: number, data: T) => number);
  containerHeight: number;
  renderItem: (item: VirtualScrollItem<T>, index: number) => React.ReactNode;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  className?: string;
  estimatedItemHeight?: number;
  enableDynamicHeight?: boolean;
}

export const VirtualScroll = <T extends any>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  onScroll,
  className = '',
  estimatedItemHeight = 50,
  enableDynamicHeight = false,
}: VirtualScrollProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: containerHeight });
  const [itemHeights, setItemHeights] = useState<Map<number, number>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate item heights (for dynamic height items)
  const calculateItemHeight = useCallback(
    (index: number, data: T): number => {
      if (typeof itemHeight === 'function') {
        return itemHeight(index, data);
      }
      return itemHeight;
    },
    [itemHeight]
  );

  // Update item heights cache
  const updateItemHeight = useCallback((index: number, height: number) => {
    setItemHeights(prev => {
      const newHeights = new Map(prev);
      newHeights.set(index, height);
      return newHeights;
    });
  }, []);

  // Calculate total height of all items
  const totalHeight = useMemo(() => {
    if (enableDynamicHeight && itemHeights.size > 0) {
      let height = 0;
      for (let i = 0; i < items.length; i++) {
        height += itemHeights.get(i) || estimatedItemHeight;
      }
      return height;
    }

    return items.length * (typeof itemHeight === 'number' ? itemHeight : estimatedItemHeight);
  }, [items.length, itemHeight, itemHeights, estimatedItemHeight, enableDynamicHeight]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (enableDynamicHeight && itemHeights.size > 0) {
      let startIdx = 0;
      let endIdx = 0;
      let accumulatedHeight = 0;

      // Find start index
      for (let i = 0; i < items.length; i++) {
        const itemH = itemHeights.get(i) || estimatedItemHeight;
        if (accumulatedHeight + itemH > scrollTop) {
          startIdx = Math.max(0, i - overscan);
          break;
        }
        accumulatedHeight += itemH;
      }

      // Find end index
      accumulatedHeight = 0;
      for (let i = startIdx; i < items.length; i++) {
        const itemH = itemHeights.get(i) || estimatedItemHeight;
        accumulatedHeight += itemH;
        if (accumulatedHeight > containerSize.height + overscan * estimatedItemHeight) {
          endIdx = Math.min(items.length - 1, i + overscan);
          break;
        }
        endIdx = i;
      }

      return { start: startIdx, end: endIdx };
    }

    const itemHeightNum = typeof itemHeight === 'number' ? itemHeight : estimatedItemHeight;
    const start = Math.max(0, Math.floor(scrollTop / itemHeightNum) - overscan);
    const visibleCount = Math.ceil(containerSize.height / itemHeightNum);
    const end = Math.min(items.length - 1, start + visibleCount + overscan * 2);

    return { start, end };
  }, [
    scrollTop,
    items.length,
    itemHeight,
    containerSize.height,
    overscan,
    itemHeights,
    estimatedItemHeight,
    enableDynamicHeight,
  ]);

  // Calculate offset for dynamic items
  const getItemOffset = useCallback(
    (index: number): number => {
      if (enableDynamicHeight && itemHeights.size > 0) {
        let offset = 0;
        for (let i = 0; i < index; i++) {
          offset += itemHeights.get(i) || estimatedItemHeight;
        }
        return offset;
      }

      const itemHeightNum = typeof itemHeight === 'number' ? itemHeight : estimatedItemHeight;
      return index * itemHeightNum;
    },
    [itemHeight, itemHeights, estimatedItemHeight, enableDynamicHeight]
  );

  // Handle scroll events
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = e.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);
    },
    [onScroll]
  );

  // Update container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Render visible items
  const visibleItems = useMemo(() => {
    const items_ = [];
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      if (i < items.length) {
        items_.push({
          ...items[i],
          index: i,
          offset: getItemOffset(i),
        });
      }
    }
    return items_;
  }, [visibleRange, items, getItemOffset]);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className}`}
      style={{ height: containerHeight }}
    >
      <div
        ref={scrollElementRef}
        className="overflow-y-auto overflow-x-hidden h-full"
        onScroll={handleScroll}
        style={{ height: '100%' }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleItems.map(item => (
            <VirtualScrollItemWrapper
              key={item.id}
              item={item}
              index={item.index}
              offset={item.offset}
              renderItem={renderItem}
              onHeightChange={enableDynamicHeight ? updateItemHeight : undefined}
              containerWidth={containerSize.width}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface VirtualScrollItemWrapperProps<T = any> {
  item: VirtualScrollItem<T> & { index: number; offset: number };
  renderItem: (item: VirtualScrollItem<T>, index: number) => React.ReactNode;
  offset: number;
  onHeightChange?: (index: number, height: number) => void;
  containerWidth: number;
}

const VirtualScrollItemWrapper = <T extends any>({
  item,
  renderItem,
  offset,
  onHeightChange,
  containerWidth,
}: VirtualScrollItemWrapperProps<T>) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const [isMeasured, setIsMeasured] = useState(false);

  useEffect(() => {
    if (itemRef.current && onHeightChange && !isMeasured) {
      const height = itemRef.current.getBoundingClientRect().height;
      onHeightChange(item.index, height);
      setIsMeasured(true);
    }
  }, [item.index, onHeightChange, isMeasured]);

  return (
    <div
      ref={itemRef}
      style={{
        position: 'absolute',
        top: offset,
        left: 0,
        right: 0,
        width: containerWidth,
      }}
    >
      {renderItem(item, item.index)}
    </div>
  );
};

// Grid Virtual Scrolling Component
interface VirtualGridProps<T = any> {
  items: VirtualScrollItem<T>[];
  itemHeight: number;
  itemWidth: number;
  containerHeight: number;
  containerWidth: number;
  gap?: number;
  renderItem: (item: VirtualScrollItem<T>, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export const VirtualGrid = <T extends any>({
  items,
  itemHeight,
  itemWidth,
  containerHeight,
  containerWidth,
  gap = 0,
  renderItem,
  overscan = 2,
  className = '',
}: VirtualGridProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const columnsCount = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const rowsCount = Math.ceil(items.length / columnsCount);
  const totalHeight = rowsCount * itemHeight + (rowsCount - 1) * gap;

  const visibleRows = useMemo(() => {
    const startRow = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - overscan);
    const visibleRowCount = Math.ceil(containerHeight / (itemHeight + gap));
    const endRow = Math.min(rowsCount - 1, startRow + visibleRowCount + overscan * 2);

    return { start: startRow, end: endRow };
  }, [scrollTop, containerHeight, itemHeight, gap, overscan, rowsCount]);

  const visibleItems = useMemo(() => {
    const items_ = [];
    for (let row = visibleRows.start; row <= visibleRows.end; row++) {
      for (let col = 0; col < columnsCount; col++) {
        const index = row * columnsCount + col;
        if (index < items.length) {
          items_.push({
            ...items[index],
            index,
            row,
            col,
            top: row * (itemHeight + gap),
            left: col * (itemWidth + gap),
          });
        }
      }
    }
    return items_;
  }, [visibleRows, columnsCount, items, itemHeight, itemWidth, gap]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
    setScrollLeft(e.currentTarget.scrollLeft);
  }, []);

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{ height: containerHeight, width: containerWidth }}
    >
      <div
        className="overflow-auto h-full w-full"
        onScroll={handleScroll}
        style={{ height: '100%', width: '100%' }}
      >
        <div style={{ height: totalHeight, width: containerWidth, position: 'relative' }}>
          {visibleItems.map(item => (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                top: item.top,
                left: item.left,
                width: itemWidth,
                height: itemHeight,
              }}
            >
              {renderItem(item, item.index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Hook for virtual scrolling
export const useVirtualScroll = ({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 5,
}: {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(itemCount - 1, start + visibleCount + overscan * 2);

    return { start, end };
  }, [scrollTop, itemCount, itemHeight, containerHeight, overscan]);

  const totalHeight = itemCount * itemHeight;

  const getItemStyle = useCallback(
    (index: number) => ({
      position: 'absolute' as const,
      top: index * itemHeight,
      left: 0,
      right: 0,
      height: itemHeight,
    }),
    [itemHeight]
  );

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleRange,
    totalHeight,
    getItemStyle,
    handleScroll,
    scrollTop,
  };
};

export default VirtualScroll;
