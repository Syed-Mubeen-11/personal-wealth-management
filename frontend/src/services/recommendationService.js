import API from './api';

export const fetchRecommendations = async () => {
  const response = await API.get('/recommendations/');
  return response.data;
};