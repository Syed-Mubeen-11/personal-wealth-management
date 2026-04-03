import api from './api'

const reportsApi = {
  /** GET /api/v1/reports/pdf?scope=full  — returns blob */
  downloadPdf: (scope = 'full') =>
    api.get('/v1/reports/pdf', { params: { scope }, responseType: 'blob' }),

  /** GET /api/v1/reports/csv?type=portfolio|goals|transactions  — returns blob */
  downloadCsv: (type = 'portfolio') =>
    api.get('/v1/reports/csv', { params: { type }, responseType: 'blob' }),
}

export default reportsApi