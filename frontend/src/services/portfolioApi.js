import api from './api'

export const portfolioApi = {
  // Summary
  summary: () => api.get('/portfolio/summary'),

  // Transactions — primary write interface
  listTransactions:  (params = {}) => api.get('/portfolio/transactions', { params }),
  createTransaction: (data)        => api.post('/portfolio/transactions', data),
  deleteTransaction: (id)          => api.delete(`/portfolio/transactions/${id}`),

  // Investments — read only (derived from transactions)
  listInvestments:  (params = {}) => api.get('/portfolio/investments', { params }),
  getInvestment:    (id)          => api.get(`/portfolio/investments/${id}`),
  getInvestmentTxns: (id)         => api.get(`/portfolio/investments/${id}/transactions`),

  // Market prices
  listMarketPrices: () => api.get('/portfolio/market-prices'),
  refreshPrices:    () => api.post('/portfolio/refresh-prices'),
}
