import api from './api'

export const recommendationsApi = {
  // GET /api/v1/recommendations
  list: (limit = 10, offset = 0) =>
    api.get('/v1/recommendations', { params: { limit, offset } }),

  // POST /api/v1/recommendations/generate
  generate: () =>
    api.post('/v1/recommendations/generate'),

  // PATCH /api/v1/recommendations/:id/read
  markRead: (id) =>
    api.patch(`/v1/recommendations/${id}/read`),

  // GET /api/v1/recommendations/rebalance
  getRebalance: () =>
    api.get('/v1/recommendations/rebalance'),
}

export const reportsApi = {
  // GET /api/v1/reports/pdf
  downloadPdf: () =>
    api.get('/v1/reports/pdf', { responseType: 'blob' }),

  // GET /api/v1/reports/csv
  downloadCsv: (type = 'portfolio') =>
    api.get('/v1/reports/csv', { params: { type }, responseType: 'blob' }),
}

export const simulationsApi = {
  // GET /api/v1/simulations
  list: (limit = 10, offset = 0) =>
    api.get('/v1/simulations', { params: { limit, offset } }),
}
