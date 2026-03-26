import api from '../api';

export const fetchRecommendations = async (params = {}) => {
  const response = await api.get('/api/v1/recommendations/', { params });
  return response.data;
};

export const markRecommendationAsRead = async (id) => {
  const response = await api.patch(`/api/v1/recommendations/${id}/read`);
  return response.data;
};
