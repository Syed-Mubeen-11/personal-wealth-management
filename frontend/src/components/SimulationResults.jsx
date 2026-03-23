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

const SimulationResults = ({ goal, simulationData }) => {

  if (!simulationData) {
    return (
      <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
        Run a simulation to see results
      </div>
    );
  }

  const projection =
  simulationData?.results?.projection || simulationData?.projection || [];

  const finalValue = projection[projection.length - 1].portfolio_value;

  const chartData = projection.map(p => ({
    month: p.month,
    value: p.portfolio_value
  }));

  const achieved = finalValue >= goal.target_amount;

  return (
    <div className="bg-white p-6 rounded-xl shadow">

      <h3 className="text-lg font-semibold mb-4">
        Simulation Results
      </h3>

      {/* Final Value */}
      <p className="text-xl font-bold text-green-600 mb-2">
        ₹{finalValue.toLocaleString()}
      </p>

      {/* Goal Status */}
      <p className={achieved ? "text-green-600" : "text-red-600"}>
        {achieved ? "Goal Achievable ✅" : "Goal Not Reached ❌"}
      </p>

      {/* Chart */}
      <div style={{ height: 300 }} className="mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default SimulationResults;