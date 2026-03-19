import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// 🔥 Attach token automatically to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;

// ADD THESE 4 FUNCTIONS at the end of your existing api.js
export const runSimulation = (goalId, simulationParams) => {
  return API.post(`/goals/${goalId}/simulate`, simulationParams);
};

export const saveSimulation = (goalId, simulationData) => {
  return API.post(`/goals/${goalId}/simulations`, simulationData);
};

export const getSavedSimulations = (goalId) => {
  return API.get(`/goals/${goalId}/simulations`);
};

export const deleteSimulation = (goalId, simulationId) => {
  return API.delete(`/goals/${goalId}/simulations/${simulationId}`);
};