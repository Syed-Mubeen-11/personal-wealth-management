import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import RecommendationCard from '../components/recommendations/RecommendationCard'

// Mock the useMarkAsRead hook
vi.mock('../hooks/useRecommendations', () => ({
  useMarkAsRead: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

const makeWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

const mockRec = {
  id: 1,
  title: 'Increase Bond Allocation',
  recommendation_text: 'Based on your moderate risk profile, consider increasing bonds.',
  created_at: '2026-03-01T10:00:00Z',
  is_read: false,
  asset_class: 'bonds',
  suggested_allocation: {
    stocks: 0.40,
    bonds:  0.35,
    cash:   0.15,
    real_estate: 0.10,
  },
}

describe('RecommendationCard', () => {
  it('renders title and recommendation text', () => {
    render(<RecommendationCard rec={mockRec} />, { wrapper: makeWrapper() })
    expect(screen.getByText('Increase Bond Allocation')).toBeInTheDocument()
    expect(screen.getByText(/consider increasing bonds/i)).toBeInTheDocument()
  })

  it('renders pie chart by default', () => {
    render(<RecommendationCard rec={mockRec} />, { wrapper: makeWrapper() })
    expect(screen.getByLabelText(/pie chart view/i)).toBeInTheDocument()
  })

  it('switches to bar chart view on toggle', async () => {
    const user = userEvent.setup()
    render(<RecommendationCard rec={mockRec} />, { wrapper: makeWrapper() })
    const barBtn = screen.getByLabelText(/bar chart view/i)
    await user.click(barBtn)
    expect(barBtn).toBeInTheDocument()
  })

  it('shows "View Full Breakdown" button', () => {
    render(<RecommendationCard rec={mockRec} />, { wrapper: makeWrapper() })
    expect(screen.getByText(/view full breakdown/i)).toBeInTheDocument()
  })

  it('expands breakdown panel on click', async () => {
    const user = userEvent.setup()
    render(<RecommendationCard rec={mockRec} />, { wrapper: makeWrapper() })
    await user.click(screen.getByText(/view full breakdown/i))
    expect(screen.getByText(/stocks/i)).toBeInTheDocument()
    expect(screen.getByText(/bonds/i)).toBeInTheDocument()
  })

  it('shows "Mark as Read" button when is_read is false', () => {
    render(<RecommendationCard rec={mockRec} />, { wrapper: makeWrapper() })
    expect(screen.getByRole('button', { name: /mark.*as read/i })).toBeInTheDocument()
  })

  it('does not show "Mark as Read" when already read', () => {
    render(
      <RecommendationCard rec={{ ...mockRec, is_read: true }} />,
      { wrapper: makeWrapper() }
    )
    expect(screen.queryByRole('button', { name: /mark.*as read/i })).not.toBeInTheDocument()
    expect(screen.getByText(/read/i)).toBeInTheDocument()
  })
})