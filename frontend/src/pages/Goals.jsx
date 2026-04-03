import React, { useEffect, useState } from "react";
import ContributionChart from "../components/ContributionChart";
import SimulationForm from "../components/SimulationForm";
import SimulationResults from "../components/SimulationResults";
import API, { getSavedSimulations } from "../services/api";

function Goals() {
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  
  const [simulationResult, setSimulationResult] = useState(null);
  const [savedSimulations, setSavedSimulations] = useState([]);

  const [formData, setFormData] = useState({
    goal_type: "",
    target_amount: "",
    monthly_contribution: "",
    target_date: ""
  });

  const [editId, setEditId] = useState(null);

  // Fetch Goals
  const fetchGoals = async () => {
    try {
      const res = await API.get("/goals/");
      setGoals(res.data);
      if (res.data.length > 0) {
        setSelectedGoal(res.data[0]);
      } else {
        setSelectedGoal(null);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        window.location.href = "/login";
      } else {
        console.error("Failed to fetch goals", err);
      }
    }
  };

  // Fetch saved simulations
  const fetchSavedSimulations = async (goalId) => {
    try {
      const res = await getSavedSimulations(goalId);
      setSavedSimulations(res.data);
    } catch (err) {
      console.error("Failed to fetch saved simulations", err);
    }
  };

  useEffect(() => {
    if (selectedGoal) {
      fetchSavedSimulations(selectedGoal.id);
      setSimulationResult(null);
    }
  }, [selectedGoal]);

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const createGoal = async (e) => {
    e.preventDefault();
    try {
      await API.post("/goals/", formData);
      fetchGoals();
      setFormData({
        goal_type: "",
        target_amount: "",
        monthly_contribution: "",
        target_date: ""
      });
    } catch (error) {
      console.error(error);
    }
  };

  const updateGoal = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/goals/${editId}`, formData);
      setEditId(null);
      setFormData({
        goal_type: "",
        target_amount: "",
        monthly_contribution: "",
        target_date: ""
      });
      fetchGoals();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteGoal = async (id) => {
    try {
      await API.delete(`/goals/${id}`);
      fetchGoals();
    } catch (error) {
      console.error(error);
    }
  };


  // Edit button
  const handleEdit = (goal) => {
    setEditId(goal.id);
    setFormData({
      goal_type: goal.goal_type,
      target_amount: goal.target_amount,
      monthly_contribution: goal.monthly_contribution,
      target_date: goal.target_date
    });
  };

  // ===== NEW: Handle simulation completion =====
  const handleSimulationComplete = (result) => {
    setSimulationResult(result);
  };

  const goalSummary = selectedGoal;

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Goals Dashboard
      </h1>

      {/* SUMMARY CARDS */}
      {goalSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Goal Code
            </h2>
            <p className="text-2xl font-bold text-purple-600 mt-2">
              G-{goalSummary.id}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Goal Type
            </h2>
            <p className="text-2xl font-bold text-indigo-500 mt-2">
              {goalSummary.goal_type}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Target Amount
            </h2>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              ₹{goalSummary.target_amount}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Monthly Contribution
            </h2>
            <p className="text-2xl font-bold text-green-600 mt-2">
              ₹{goalSummary.monthly_contribution}
            </p>
          </div>
        </div>
      )}

      {/* GOAL SELECTOR */}
      <div className="mb-6">
        <label className="mr-3 font-semibold text-gray-700 dark:text-gray-300">
          Select Goal:
        </label>
        <select
          value={selectedGoal?.id || ""}
          onChange={(e) => {
            const goal = goals.find(g => g.id === Number(e.target.value));
            setSelectedGoal(goal);
          }}
          className="border p-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        >
          {goals.map(goal => (
            <option key={goal.id} value={goal.id}>
              G-{goal.id} | {goal.goal_type}
            </option>
          ))}
        </select>
      </div>

      {/* ===== NEW: SIMULATION SECTION - Two Column Layout ===== */}
      {selectedGoal && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left Column - Simulation Form (Dev 2) */}
          <SimulationForm 
            goal={selectedGoal}
            onSimulationComplete={handleSimulationComplete}
          />
          
          {/* Right Column - Simulation Results (Dev 3) */}
          <SimulationResults 
            goal={selectedGoal}
            simulationData={simulationResult}
            savedSimulations={savedSimulations}
            onSave={() => fetchSavedSimulations(selectedGoal.id)}
          />
        </div>
      )}

      {/* CONTRIBUTION CHART */}
      {selectedGoal && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-8">
          <h2 className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400">
            Contribution Breakdown
          </h2>
          <ContributionChart goal={selectedGoal} />
        </div>
      )}

      {/* CREATE / EDIT GOAL FORM */}
      <form
        onSubmit={editId ? updateGoal : createGoal}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-8"
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {editId ? "Edit Goal" : "Create Goal"}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <select
            name="goal_type"
            value={formData.goal_type}
            onChange={handleChange}
            className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          >
            <option value="">Select Goal</option>
            <option value="retirement">Retirement</option>
            <option value="home">Home</option>
            <option value="education">Education</option>
            <option value="custom">Custom</option>
          </select>

          <input
            type="number"
            name="target_amount"
            placeholder="Target Amount"
            value={formData.target_amount}
            onChange={handleChange}
            className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />

          <input
            type="number"
            name="monthly_contribution"
            placeholder="Monthly Contribution"
            value={formData.monthly_contribution}
            onChange={handleChange}
            className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />

          <input
            type="date"
            name="target_date"
            value={formData.target_date}
            onChange={handleChange}
            className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {editId ? "Update Goal" : "Create Goal"}
        </button>
      </form>

      {/* GOALS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const progress = Math.min(
            (goal.monthly_contribution / goal.target_amount) * 100,
            100
          );

          return (
            <div
              key={goal.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow"
            >
              <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                G-{goal.id} | {goal.goal_type}
              </h2>

              <p className="text-gray-700 dark:text-gray-300">Target Amount: ₹{goal.target_amount}</p>
              <p className="text-gray-700 dark:text-gray-300">Monthly Contribution: ₹{goal.monthly_contribution}</p>
              <p className="text-gray-700 dark:text-gray-300">Target Date: {goal.target_date}</p>

              {/* PROGRESS BAR */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                  {progress.toFixed(1)}% progress
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleEdit(goal)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Goals;