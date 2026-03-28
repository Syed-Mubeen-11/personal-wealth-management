import React from "react";
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

const SimulationResults = ({ goal, simulationData, savedSimulations, onSave }) => {

  const [saving, setSaving] = React.useState(false);

  if (!simulationData && (!savedSimulations || savedSimulations.length === 0)) {
    return (
      <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500 h-full flex items-center justify-center">
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
      // Assuming simulationData comes from a manual run
      // We need to pass the same params as in the POST /simulations/
      // Scenario name can be provided by user or default
      const scenario_name = prompt("Enter scenario name:", "My Simulation") || "Untitled Scenario";
      
      // Calculate years from projection
      const months = projection.length;
      const years = Math.ceil(months / 12);

      // Assumptions usually come from simulationData if we added them there
      // or we can infer them from what was sent to runSimulation
      // For now we'll assume the backend wants the assumptions stored
      
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
    <div className="bg-white p-6 rounded-xl shadow h-full">

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
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
          <p className={`font-semibold ${achieved ? "text-green-600" : "text-red-600"}`}>
            {achieved ? "Goal Achievable ✅" : "Goal Not Reached ❌"}
          </p>

          {/* Chart */}
          <div style={{ height: 250 }} className="mt-4">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" label={{ value: 'Months', position: 'bottom', offset: 0 }} />
                <YAxis label={{ value: '₹', angle: -90, position: 'left' }} />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Portfolio Value']} />
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
          <h4 className="font-semibold text-gray-700 mb-3 text-sm">Saved Scenarios</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {savedSimulations.map(sim => (
              <div key={sim.id} className="p-3 border rounded-lg bg-gray-50 flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium text-gray-800">{sim.scenario_name}</p>
                  <p className="text-gray-500 text-xs">
                    ₹{sim.assumptions?.monthly_contribution}/mo at {sim.assumptions?.expected_return}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-indigo-600 font-bold">
                    ₹{sim.results?.projection?.[sim.results.projection.length - 1]?.portfolio_value?.toLocaleString('en-IN')}
                  </p>
                  <p className="text-gray-400 text-[10px]">
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