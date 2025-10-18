import React, { useState } from 'react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  mobilePriority?: 'high' | 'medium' | 'low' | 'hidden';
}

interface ResponsiveTableProps {
  data: any[];
  columns: Column[];
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (row: any) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  data,
  columns,
  className = '',
  emptyMessage = 'No data available',
  loading = false,
  onRowClick,
  sortColumn,
  sortDirection,
  onSort,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSort = (column: Column) => {
    if (!column.sortable || !onSort) return;

    const newDirection = sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(column.key, newDirection);
  };

  const getVisibleColumns = () => {
    if (isMobile) {
      return columns.filter(
        col =>
          !col.mobilePriority || col.mobilePriority === 'high' || col.mobilePriority === 'medium'
      );
    }
    return columns.filter(col => col.mobilePriority !== 'hidden');
  };

  const visibleColumns = getVisibleColumns();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return <div className="text-center py-8 text-gray-500 dark:text-gray-400">{emptyMessage}</div>;
  }

  if (isMobile) {
    // Mobile Card Layout
    return (
      <div className={`space-y-3 ${className}`}>
        {data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            onClick={() => onRowClick?.(row)}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-md transition-shadow"
          >
            {visibleColumns.map(column => (
              <div key={column.key} className="mb-3 last:mb-0">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  {column.label}
                </div>
                <div className={`text-sm text-gray-900 dark:text-white ${column.className || ''}`}>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Desktop Table Layout
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {visibleColumns.map(column => (
              <th
                key={column.key}
                onClick={() => handleSort(column)}
                className={`
                  px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400
                  uppercase tracking-wider
                  ${column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                  ${column.className || ''}
                `}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable && sortColumn === column.key && (
                    <svg
                      className={`w-4 h-4 ${
                        sortDirection === 'asc' ? 'text-brand-primary' : 'text-gray-400'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {sortDirection === 'asc' ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      )}
                    </svg>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              {visibleColumns.map(column => (
                <td
                  key={column.key}
                  className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white ${
                    column.className || ''
                  }`}
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Responsive Table Cell Component for complex data
export const ResponsiveTableCell: React.FC<{
  value: React.ReactNode;
  label?: string;
  priority?: 'high' | 'medium' | 'low' | 'hidden';
  className?: string;
}> = ({ value, label, priority = 'medium', className = '' }) => {
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile && priority === 'hidden') {
    return null;
  }

  if (isMobile && label) {
    return (
      <div className={`mb-2 ${className}`}>
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
          {label}
        </div>
        <div className="text-sm text-gray-900 dark:text-white">{value}</div>
      </div>
    );
  }

  return <div className={className}>{value}</div>;
};

// Responsive Grid Component for data that needs to be displayed in grid format
export const ResponsiveDataGrid: React.FC<{
  data: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  columns?: number;
  gap?: string;
  className?: string;
}> = ({ data, renderItem, columns = 1, gap = 'gap-4', className = '' }) => {
  const [gridColumns, setGridColumns] = useState(columns);

  React.useEffect(() => {
    const updateGridColumns = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setGridColumns(1);
      } else if (width < 1024) {
        setGridColumns(Math.min(columns, 2));
      } else {
        setGridColumns(columns);
      }
    };

    updateGridColumns();
    window.addEventListener('resize', updateGridColumns);
    return () => window.removeEventListener('resize', updateGridColumns);
  }, [columns]);

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-${Math.min(gridColumns, 2)} lg:grid-cols-${gridColumns} ${gap} ${className}`}
    >
      {data.map((item, index) => renderItem(item, index))}
    </div>
  );
};
