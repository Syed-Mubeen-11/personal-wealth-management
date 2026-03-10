import API from './api';

export const getPortfolio = async () => {
  const response = await API.get('/investments/portfolio');
  return response.data;
};

export const addInvestment = async (data) => {
  const response = await API.post('/investments/', data);
  return response.data;
};

export const deleteInvestment = async (id) => {
  const response = await API.delete(`/investments/${id}`);
  return response.data;
};

export const getAnalytics = async () => {
  const response = await API.get('/investments/analytics');
  return response.data;
};