import API from './api';

export const getIncomes = async () => {
  const response = await API.get('/income');
  return response.data;
};

export const addIncome = async (incomeData) => {
  // incomeData must be { source: string, amount: number }
  const response = await API.post('/income', incomeData);
  return response.data;
};

export const deleteIncome = async (id) => {
  // Note: Your route is /api/api/income/{id} based on your previous docs list
  // but usually it's just /income/{id}. I'll use the one from your code snippet:
  const response = await API.delete(`/api/income/${id}`);
  return response.data;
};