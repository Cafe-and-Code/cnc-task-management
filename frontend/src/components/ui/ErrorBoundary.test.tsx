import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorBoundary } from './ErrorBoundary';

// Mock console.error to avoid test output noise
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test children</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test children')).toBeInTheDocument();
  });

  it('should catch and display error when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/We're sorry, but something unexpected happened/)).toBeInTheDocument();
  });

  it('should display custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should show error details in development mode', () => {
    const originalEnv = import.meta.env.DEV;
    Object.defineProperty(import.meta, 'env', { value: { DEV: true } });

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error Details (Development Mode)')).toBeInTheDocument();

    // Restore original env
    Object.defineProperty(import.meta, 'env', { value: { DEV: originalEnv } });
  });

  it('should not show error details in production mode', () => {
    const originalEnv = import.meta.env.DEV;
    Object.defineProperty(import.meta, 'env', { value: { DEV: false } });

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Error Details (Development Mode)')).not.toBeInTheDocument();

    // Restore original env
    Object.defineProperty(import.meta, 'env', { value: { DEV: originalEnv } });
  });

  it('should reset error state when "Try Again" button is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.click(tryAgainButton);

    // Rerender with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should call window.location.reload when "Reload Page" button is clicked', () => {
    const originalReload = window.location.reload;
    window.location.reload = jest.fn();

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByText('Reload Page');
    fireEvent.click(reloadButton);

    expect(window.location.reload).toHaveBeenCalledTimes(1);

    // Restore original function
    window.location.reload = originalReload;
  });

  it('should have a link to homepage', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const homepageLink = screen.getByText('Go to Homepage');
    expect(homepageLink).toBeInTheDocument();
    expect(homepageLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('should log error to console', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      'Uncaught error:',
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('should have proper styling and structure', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Check main container
    const container = screen.getByText('Something went wrong').closest('div');
    expect(container).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center');

    // Check error icon container
    const iconContainer = screen.getByRole('img', { hidden: true })?.closest('div');
    expect(iconContainer).toHaveClass('w-16', 'h-16', 'bg-red-100', 'rounded-full');

    // Check buttons container
    const buttonsContainer = screen.getByText('Try Again').closest('div');
    expect(buttonsContainer).toHaveClass('space-y-4');
  });
});
