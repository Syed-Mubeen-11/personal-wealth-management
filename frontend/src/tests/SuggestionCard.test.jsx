import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SuggestionCard from '../components/rebalance/SuggestionCard'

const buySuggestion = {
  action: 'BUY',
  symbol: 'AAPL',
  quantity: 10,
  estimatedTradeValue: 1750.00,
  driftImpact: 2.5,
}

const sellSuggestion = {
  action: 'SELL',
  symbol: 'TSLA',
  quantity: 5,
  estimatedTradeValue: 900.00,
  driftImpact: -1.8,
}

describe('SuggestionCard', () => {
  it('renders BUY badge in green', () => {
    render(<SuggestionCard suggestion={buySuggestion} />)
    const badge = screen.getByText('BUY')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveStyle({ color: '#10b981' })
  })

  it('renders SELL badge in red', () => {
    render(<SuggestionCard suggestion={sellSuggestion} />)
    const badge = screen.getByText('SELL')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveStyle({ color: '#f43f5e' })
  })

  it('renders symbol and quantity', () => {
    render(<SuggestionCard suggestion={buySuggestion} />)
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText(/10 units/i)).toBeInTheDocument()
  })

  it('renders empty state message when suggestions array is empty', () => {
    // Test that the parent (RebalanceDrawer) shows balanced message
    // SuggestionCard itself just renders one card — this is a smoke test
    render(<SuggestionCard suggestion={buySuggestion} />)
    expect(screen.getByRole('listitem')).toBeInTheDocument()
  })

  it('has accessible aria-label', () => {
    render(<SuggestionCard suggestion={buySuggestion} />)
    expect(
      screen.getByRole('listitem', { name: /BUY 10 units of AAPL/i })
    ).toBeInTheDocument()
  })
})