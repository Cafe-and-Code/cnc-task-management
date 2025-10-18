import React, { useEffect } from 'react';
import { useAppSelector } from '@hooks/redux';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme } = useAppSelector(state => state.ui);

  useEffect(() => {
    // Apply theme to document root
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  return <>{children}</>;
};
