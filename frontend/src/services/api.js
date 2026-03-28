import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

// 🔥 Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ⚡ Handle Unauthorized (401) errors universally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);


export default API;

/* =========================================================
   🔧 HELPER FUNCTION
   Converts target date → years for backend
========================================================= */
const calculateYears = (targetDate) => {
  if (!targetDate) return 10; // fallback

  const today = new Date();
  const target = new Date(targetDate);

  const diffTime = target - today;
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365);

  return Math.max(1, Math.round(diffYears));
};

/* =========================================================
   🚀 RUN SIMULATION (MAIN FUNCTION)
========================================================= */
export const runSimulation = (goalId, data) => {
  const years = calculateYears(data.targetDate);

  return API.post("/simulations/", null, {
    params: {
      scenario_name: "What-If Scenario",
      monthly_contribution: data.monthlyContribution,
      years: years,
      expected_return: data.expectedReturn,
      goal_id: goalId
    }
  });
};

/* =========================================================
   📊 GET SAVED SIMULATIONS (OPTIONAL)
   (only works if backend supports GET /simulations)
========================================================= */
export const getSavedSimulations = (goalId) => {
  return API.get(`/simulations/?goal_id=${goalId}`);
};

/* =========================================================
   ❌ REMOVED (NOT IN YOUR BACKEND)
   - saveSimulation
   - deleteSimulation
========================================================= */