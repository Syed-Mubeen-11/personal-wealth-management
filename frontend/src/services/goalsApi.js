import api from './api'

export const goalsApi = {
  list:        (params = {}) => api.get('/goals', { params }),
  get:         (id)          => api.get(`/goals/${id}`),
  create:      (data)        => api.post('/goals', data),
  update:      (id, data)    => api.put(`/goals/${id}`, data),
  delete:      (id)          => api.delete(`/goals/${id}`),
  simulate:    (goalId, data) => api.post(`/goals/${goalId}/simulate`, data),
  simulations: (goalId)      => api.get(`/goals/${goalId}/simulations`),
}
