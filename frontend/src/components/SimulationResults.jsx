import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { saveSimulation } from "../services/api";
import { formatCurrency, formatChartData } from "../utils/chartData";

const SimulationResults = ({ goal, simulationData, onSave }) => {
  const [saving, setSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!simulationData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center text-gray-500">
        Adjust the sliders and run a simulation to see results
      </div>
    );
  }

  const { currentPlan, newScenario, comparison, parameters } = simulationData;
  const chartData = formatChartData(simulationData);

  // Calculate key metrics
  const currentFinal = currentPlan.values[currentPlan.values.length - 1];
  const newFinal = newScenario.values[newScenario.values.length - 1];
  const difference = newFinal - currentFinal;
  const percentChange = ((difference / currentFinal) * 100).toFixed(1);

  const handleSaveSimulation = async () => {
    if (!scenarioName.trim()) return;
    
    setSaving(true);
    try {
      await saveSimulation(goal.id, {
        name: scenarioName,
        parameters: parameters,
        results: newScenario.values,
        years: comparison.years,
        createdAt: new Date().toISOString()
      });
      
      setSaveSuccess(true);
      setShowSaveDialog(false);
      setScenarioName("");
      setTimeout(() => setSaveSuccess(false), 3000);
      if (onSave) onSave();
    } catch (error) {
      console.error("Failed to save simulation:", error);
      alert("Failed to save simulation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Simulation Results
        </h3>
        <button
          onClick={() => setShowSaveDialog(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          Save This Scenario
        </button>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium mb-3">Save This Scenario</h4>
          <div className="flex gap-3">
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="Enter scenario name..."
              className="flex-1 p-2 border rounded-lg dark:bg-gray-600"
              autoFocus
            />
            <button
              onClick={handleSaveSimulation}
              disabled={saving || !scenarioName.trim()}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setShowSaveDialog(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {saveSuccess && (
        <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-lg">
          Simulation saved successfully!
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600">Current Plan</p>
          <p className="text-xl font-bold text-blue-700">{formatCurrency(currentFinal)}</p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600">New Scenario</p>
          <p className="text-xl font-bold text-green-700">{formatCurrency(newFinal)}</p>
        </div>
        <div className={`p-3 rounded-lg ${difference >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={`text-sm ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Difference
          </p>
          <p className={`text-xl font-bold ${difference >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {difference >= 0 ? '+' : ''}{formatCurrency(Math.abs(difference))}
            <span className="text-sm ml-1">({percentChange}%)</span>
          </p>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 300 }} className="mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => formatCurrency(value, true)} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="currentPlan" 
              stroke="#3B82F6" 
              name="Current Plan"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="newScenario" 
              stroke="#10B981" 
              name="What-If Scenario"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Parameters */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Scenario Parameters:</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <p>Monthly: {formatCurrency(parameters.monthlyContribution)}</p>
          <p>Return: {parameters.expectedReturn}%</p>
          <p>Target: {new Date(parameters.targetDate).toLocaleDateString()}</p>
          <p>Years: {comparison.years.length}</p>
        </div>
      </div>
    </div>
  );
};

export default SimulationResults;