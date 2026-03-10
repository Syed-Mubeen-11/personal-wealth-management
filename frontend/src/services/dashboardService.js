import API from './api';

export const getDashboardData = async () => {
  try {
    const response = await API.get('/dashboard');
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Could not fetch dashboard data";
  }
};