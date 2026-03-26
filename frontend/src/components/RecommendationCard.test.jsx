import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecommendationCard from './RecommendationCard';

/* Mock Recharts to avoid SVG/ResizeObserver issues in JSOM */
jest.mock('recharts', () => {
  const OriginalRecharts = jest.requireActual('recharts');
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
    BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
    Pie: ({ children }) => <div data-testid="pie">{children}</div>,
    Bar: ({ children }) => <div data-testid="bar">{children}</div>,
  };
});

describe('RecommendationCard Component', () => {
  const mockProps = {
    id: 1,
    title: 'Moderate Risk',
    recommendationText: 'Increase your exposure to equities.',
    createdAt: '2026-03-24T10:00:00Z',
    suggestedAllocation: {
      Stocks: 0.35,
      Bonds: 0.50,
      Cash: 0.15
    },
    isRead: false,
    onMarkAsRead: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders fields correctly', () => {
    render(<RecommendationCard {...mockProps} />);
    
    expect(screen.getByText('Moderate Risk')).toBeInTheDocument();
    expect(screen.getByText('Increase your exposure to equities.')).toBeInTheDocument();
    
    // Check if Mark as Read is present
    expect(screen.getByRole('button', { name: /mark as read/i })).toBeInTheDocument();
    
    // Check if default Pie chart is rendered
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  test('renders in read state correctly', () => {
    render(<RecommendationCard {...mockProps} isRead={true} />);
    
    // Should not have the "Mark as Read" button, but instead the "Read" indicator
    expect(screen.queryByRole('button', { name: /mark as read/i })).not.toBeInTheDocument();
    expect(screen.getByText('Read')).toBeInTheDocument();
  });

  test('chart/bar toggle works', () => {
    render(<RecommendationCard {...mockProps} />);
    
    // Initially PieChart is there
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();

    // Find toggle button
    const toggleBtn = screen.getByRole('button', { name: /toggle chart view/i });
    
    // Switch to Bar
    fireEvent.click(toggleBtn);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
    
    // Switch back to Pie
    fireEvent.click(toggleBtn);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  test('mark as read callback is triggered', () => {
    render(<RecommendationCard {...mockProps} />);
    
    const markReadBtn = screen.getByRole('button', { name: /mark as read/i });
    fireEvent.click(markReadBtn);
    
    expect(mockProps.onMarkAsRead).toHaveBeenCalledTimes(1);
    expect(mockProps.onMarkAsRead).toHaveBeenCalledWith(1);
  });

  test('collapsible expansion panel works', () => {
    render(<RecommendationCard {...mockProps} />);
    
    const toggleBtn = screen.getByRole('button', { name: /view full breakdown/i });
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    
    // Open
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/hide full breakdown/i)).toBeInTheDocument();
    expect(screen.getByText('Bonds')).toBeInTheDocument(); // Table row
    
    // Close
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText(/view full breakdown/i)).toBeInTheDocument();
  });
  
  test('handles percentage values appropriately', () => {
    const propsPercentage = {
      ...mockProps,
      suggestedAllocation: {
        Stocks: 35,
        Bonds: 50,
        Cash: 15
      }
    };
    render(<RecommendationCard {...propsPercentage} />);
    
    // Expand to see values
    const toggleBtn = screen.getByRole('button', { name: /view full breakdown/i });
    fireEvent.click(toggleBtn);
    
    // We should see 50.0% instead of 5000%
    expect(screen.getByText('50.0%')).toBeInTheDocument();
    expect(screen.getByText('35.0%')).toBeInTheDocument();
    expect(screen.getByText('15.0%')).toBeInTheDocument();
  });
});
