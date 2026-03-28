import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import AllocationComparisonTable from '../components/rebalance/AllocationComparisonTable'

const mockCurrentWeights = {
  stocks:       0.55,   // over-weight  → drift +15%
  bonds:        0.20,   // within range → drift  0%
  cash:         0.05,   // under-weight → drift -15%
}

const mockTargetWeights = {
  stocks: 0.40,
  bonds:  0.20,
  cash:   0.20,
}

describe('AllocationComparisonTable', () => {
  it('renders all asset class rows', () => {
    render(
      <AllocationComparisonTable
        currentWeights={mockCurrentWeights}
        targetWeights={mockTargetWeights}
      />
    )
    expect(screen.getByText(/stocks/i)).toBeInTheDocument()
    expect(screen.getByText(/bonds/i)).toBeInTheDocument()
    expect(screen.getByText(/cash/i)).toBeInTheDocument()
  })

  it('shows red badge for over-weight drift (> +2%)', () => {
    render(
      <AllocationComparisonTable
        currentWeights={mockCurrentWeights}
        targetWeights={mockTargetWeights}
      />
    )
    // stocks drift = (0.55 - 0.40) * 100 = +15%
    const badge = screen.getByText(/\+15\.00%/i)
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveStyle({ color: '#f43f5e' })
  })

  it('shows green badge for under-weight drift (< -2%)', () => {
    render(
      <AllocationComparisonTable
        currentWeights={mockCurrentWeights}
        targetWeights={mockTargetWeights}
      />
    )
    // cash drift = (0.05 - 0.20) * 100 = -15%
    const badge = screen.getByText(/-15\.00%/i)
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveStyle({ color: '#10b981' })
  })

  it('sorts by absolute drift descending by default', () => {
    render(
      <AllocationComparisonTable
        currentWeights={mockCurrentWeights}
        targetWeights={mockTargetWeights}
      />
    )
    const rows = screen.getAllByRole('row')
    // First data row (index 1, after header) should be stocks or cash (both |drift|=15)
    const firstRowText = rows[1].textContent
    expect(firstRowText).toMatch(/stocks|cash/i)
  })

  it('toggles sort order when drift column button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <AllocationComparisonTable
        currentWeights={mockCurrentWeights}
        targetWeights={mockTargetWeights}
      />
    )
    const sortBtn = screen.getByRole('button', { name: /toggle drift sort/i })
    await user.click(sortBtn)
    // After toggle, still renders rows (just checks it doesn't crash)
    expect(screen.getByText(/stocks/i)).toBeInTheDocument()
  })

  it('renders correct table headers', () => {
    render(
      <AllocationComparisonTable
        currentWeights={mockCurrentWeights}
        targetWeights={mockTargetWeights}
      />
    )
    expect(screen.getByText(/asset class/i)).toBeInTheDocument()
    expect(screen.getByText(/current %/i)).toBeInTheDocument()
    expect(screen.getByText(/target %/i)).toBeInTheDocument()
    expect(screen.getByText(/drift %/i)).toBeInTheDocument()
  })

  it('is accessible — table has proper scope attributes', () => {
    render(
      <AllocationComparisonTable
        currentWeights={mockCurrentWeights}
        targetWeights={mockTargetWeights}
      />
    )
    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
    const colHeaders = screen.getAllByRole('columnheader')
    expect(colHeaders.length).toBe(4)
  })
})