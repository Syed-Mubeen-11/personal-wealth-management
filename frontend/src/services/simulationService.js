import api from "./api";

export const runSimulation = async (data) => {
  try {
    const response = await api.post("/simulate", data);
    return response.data;
  } catch (error) {
    console.error("Simulation error:", error);
    return null;
  }
};