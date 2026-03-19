import React, { useState, useEffect } from "react";
import { runSimulation } from "../services/api";

const SimulationForm = ({ goal, onSimulationComplete }) => {
  const [formData, setFormData] = useState({
    monthlyContribution: goal?.monthly_contribution || 5000,
    expectedReturn: 12,
    targetDate: goal?.target_date || "",
    additionalNotes: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Update form when goal changes
  useEffect(() => {
    if (goal) {
      setFormData(prev => ({
        ...prev,
        monthlyContribution: goal.monthly_contribution || prev.monthlyContribution,
        targetDate: goal.target_date || prev.targetDate
      }));
    }
  }, [goal]);

  // Validate form inputs
  const validateForm = () => {
    const newErrors = {};
    
    if (formData.monthlyContribution < 0) {
      newErrors.monthlyContribution = "Monthly contribution cannot be negative";
    }
    if (formData.monthlyContribution > 1000000) {
      newErrors.monthlyContribution = "Monthly contribution is too high";
    }
    
    if (formData.expectedReturn < 0) {
      newErrors.expectedReturn = "Expected return cannot be negative";
    }
    if (formData.expectedReturn > 30) {
      newErrors.expectedReturn = "Expected return cannot exceed 30%";
    }
    
    if (formData.targetDate) {
      const selectedDate = new Date(formData.targetDate);
      const today = new Date();
      if (selectedDate <= today) {
        newErrors.targetDate = "Target date must be in the future";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "range" ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!goal) {
      alert("Please select a goal first");
      return;
    }
    
    setLoading(true);
    try {
      const response = await runSimulation(goal.id, formData);
      onSimulationComplete(response.data);
    } catch (error) {
      console.error("Simulation failed:", error);
      alert("Failed to run simulation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (!goal) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center text-gray-500">
        Please select a goal to run simulations
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        What-If Scenario Simulator
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Monthly Contribution Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Monthly Contribution
            </label>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {formatCurrency(formData.monthlyContribution)}/month
            </span>
          </div>
          <input
            type="range"
            name="monthlyContribution"
            min="0"
            max="100000"
            step="1000"
            value={formData.monthlyContribution}
            onChange={handleChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>₹0</span>
            <span>₹50k</span>
            <span>₹1L</span>
          </div>
          {errors.monthlyContribution && (
            <p className="mt-1 text-sm text-red-600">{errors.monthlyContribution}</p>
          )}
        </div>

        {/* Expected Return Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Expected Annual Return
            </label>
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              {formData.expectedReturn}%
            </span>
          </div>
          <input
            type="range"
            name="expectedReturn"
            min="0"
            max="30"
            step="0.5"
            value={formData.expectedReturn}
            onChange={handleChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>15%</span>
            <span>30%</span>
          </div>
          {errors.expectedReturn && (
            <p className="mt-1 text-sm text-red-600">{errors.expectedReturn}</p>
          )}
        </div>

        {/* Target Date Picker */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Target Date
          </label>
          <input
            type="date"
            name="targetDate"
            value={formData.targetDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            required
          />
          {errors.targetDate && (
            <p className="mt-1 text-sm text-red-600">{errors.targetDate}</p>
          )}
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Additional Notes (Optional)
          </label>
          <textarea
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            placeholder="Any assumptions or notes about this scenario..."
            rows="2"
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:bg-gray-400"
        >
          {loading ? "Running Simulation..." : "Run Simulation"}
        </button>
      </form>
    </div>
  );
};

export default SimulationForm;