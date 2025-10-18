import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with default medium size', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('generic');
    expect(spinner).toHaveClass('w-6', 'h-6');
  });

  it('should render with small size', () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = screen.getByRole('generic');
    expect(spinner).toHaveClass('w-4', 'h-4');
  });

  it('should render with large size', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByRole('generic');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('should render with extra large size', () => {
    render(<LoadingSpinner size="xl" />);
    const spinner = screen.getByRole('generic');
    expect(spinner).toHaveClass('w-12', 'h-12');
  });

  it('should apply custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    const spinner = screen.getByRole('generic');
    expect(spinner).toHaveClass('custom-class');
  });

  it('should have animation classes', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('generic');
    expect(spinner).toHaveClass('animate-spin', 'rounded-full', 'border-2');
  });

  it('should have correct border classes', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('generic');
    expect(spinner).toHaveClass('border-gray-300', 'border-t-brand-primary');
  });
});
