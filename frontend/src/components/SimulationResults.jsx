import React, { useContext } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import API from "../services/api";
import { ThemeContext } from "../context/Themecontext";

const SimulationResults = ({ goal, simulationData, savedSimulations, onSave }) => {
  const { darkMode } = useContext(ThemeContext);
  const [saving, setSaving] = React.useState(false);

  if (!simulationData && (!savedSimulations || savedSimulations.length === 0)) {
    return (
      <div className={`p-6 rounded-xl shadow text-center h-full flex items-center justify-center ${
        darkMode ? "bg-gray-800 text-gray-400" : "bg-white text-gray-500"
      }`}>
        Run a simulation to see results or view history
      </div>
    );
  }

  const projection =
    simulationData?.results?.projection || simulationData?.projection || [];

  const finalValue = projection.length > 0 ? projection[projection.length - 1].portfolio_value : 0;

  const chartData = projection.map(p => ({
    month: p.month,
    value: p.portfolio_value
  }));

  const achieved = finalValue >= goal.target_amount;

  const handleSaveSimulation = async () => {
    if (!simulationData) return;

    setSaving(true);
    try {
      const scenario_name = prompt("Enter scenario name:", "My Simulation") || "Untitled Scenario";
      const months = projection.length;
      const years = Math.ceil(months / 12);

      await API.post("/simulations/", null, {
        params: {
          scenario_name: scenario_name,
          monthly_contribution: simulationData.assumptions?.monthly_contribution || goal.monthly_contribution,
          years: years,
          expected_return: simulationData.assumptions?.expected_return || 12,
          goal_id: goal.id
        }
      });

      alert("Simulation saved successfully!");
      if (onSave) onSave();
    } catch (err) {
      alert("Failed to save simulation");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`p-6 rounded-xl shadow h-full ${darkMode ? "bg-gray-800" : "bg-white"}`}>

      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
          Simulation Results
        </h3>
        {simulationData && (
          <button
            onClick={handleSaveSimulation}
            disabled={saving}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
          >
            {saving ? "Saving..." : "Save Scenario"}
          </button>
        )}
      </div>

      {simulationData && (
        <div className="mb-8">
          {/* Final Value */}
          <p className="text-xl font-bold text-green-600 mb-2">
            ₹{finalValue.toLocaleString('en-IN')}
          </p>

          {/* Goal Status */}
          <p className={`font-semibold ${achieved ? "text-green-600" : "text-red-500"}`}>
            {achieved ? "Goal Achievable ✅" : "Goal Not Reached ❌"}
          </p>

          {/* Chart */}
          <div style={{ height: 250 }} className="mt-4">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={darkMode ? "#374151" : "#e5e7eb"}
                />
                <XAxis
                  dataKey="month"
                  stroke={darkMode ? "#9ca3af" : "#6b7280"}
                  label={{
                    value: 'Months',
                    position: 'bottom',
                    offset: 0,
                    fill: darkMode ? "#9ca3af" : "#6b7280"
                  }}
                />
                <YAxis
                  stroke={darkMode ? "#9ca3af" : "#6b7280"}
                  label={{
                    value: '₹',
                    angle: -90,
                    position: 'left',
                    fill: darkMode ? "#9ca3af" : "#6b7280"
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? "#1f2937" : "#fff",
                    borderColor: darkMode ? "#374151" : "#e5e7eb",
                    color: darkMode ? "#f9fafb" : "#111827"
                  }}
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Portfolio Value']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Saved Simulations History */}
      {savedSimulations && savedSimulations.length > 0 && (
        <div className="mt-6">
          <h4 className={`font-semibold mb-3 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Saved Scenarios
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {savedSimulations.map(sim => (
              <div
                key={sim.id}
                className={`p-3 border rounded-lg flex justify-between items-center text-sm ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div>
                  <p className={`font-medium ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
                    {sim.scenario_name}
                  </p>
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    ₹{sim.assumptions?.monthly_contribution}/mo at {sim.assumptions?.expected_return}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-indigo-500 font-bold">
                    ₹{sim.results?.projection?.[sim.results.projection.length - 1]?.portfolio_value?.toLocaleString('en-IN')}
                  </p>
                  <p className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    {new Date(sim.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default SimulationResults;