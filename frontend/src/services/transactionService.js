import API from './api';

export const getTransactions = async () => {
  const response = await API.get('/transactions/');
  return response.data;
};

export const addTransaction = async (transactionData) => {
  const response = await API.post('/transactions/', transactionData);
  return response.data;
};