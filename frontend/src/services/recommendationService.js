import API from './api';

// Use this to match Recommendations.jsx
export const getRecommendations = async () => {
  const response = await API.get('/v1/recommendations');
  return response.data;
};

// Aliasing it as fetchRecommendations to support SmartAdvisor.jsx if needed
export const fetchRecommendations = getRecommendations;

// Task F1-7: Mark as read logic
export const markAsRead = async (id) => {
  const response = await API.patch(`/v1/recommendations/${id}/read`);
  return response.data;
};