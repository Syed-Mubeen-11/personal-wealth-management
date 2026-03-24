import api from './api'

export const marketApi = {
  // Live market indices (S&P, NASDAQ, DOW, Gold, Oil)
  getIndices:     () => api.get('/market/indices'),

  // Bulk refresh ALL user portfolio positions in one call
  bulkRefresh:    () => api.post('/market/bulk-refresh'),

  // Single symbol price
  getPrice:       (symbol) => api.get(`/market/price/${symbol}`),

  // Stored prices in DB
  storedPrices:   () => api.get('/market/stored-prices'),

  // Legacy alias
  refreshPortfolio: () => api.post('/market/bulk-refresh'),
}

export const dashboardApi = {
  // Single call returns portfolio + goals + transactions + user
  summary: () => api.get('/dashboard/summary'),
}
