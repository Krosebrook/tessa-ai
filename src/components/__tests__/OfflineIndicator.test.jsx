/**
 * Tests for OfflineIndicator component
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import OfflineIndicator from '../OfflineIndicator';

describe('OfflineIndicator', () => {
  // Store original navigator
  const originalNavigator = window.navigator;

  afterEach(() => {
    // Restore original navigator
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  it('should not render when online', () => {
    Object.defineProperty(window, 'navigator', {
      value: { onLine: true },
      configurable: true,
      writable: true,
    });

    const { container } = render(<OfflineIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('should render offline message when offline', () => {
    Object.defineProperty(window, 'navigator', {
      value: { onLine: false },
      configurable: true,
      writable: true,
    });

    render(<OfflineIndicator />);
    expect(screen.getByText(/no internet connection/i)).toBeInTheDocument();
  });

  it('should have proper ARIA attributes', () => {
    Object.defineProperty(window, 'navigator', {
      value: { onLine: false },
      configurable: true,
      writable: true,
    });

    render(<OfflineIndicator />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  it('should display wifi off icon when offline', () => {
    Object.defineProperty(window, 'navigator', {
      value: { onLine: false },
      configurable: true,
      writable: true,
    });

    const { container } = render(<OfflineIndicator />);
    // Check for the presence of an SVG (icon)
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
