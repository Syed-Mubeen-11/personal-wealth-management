import React, { useContext } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ThemeContext } from "../context/Themecontext";

const data = [
  { name: "Jan", monthly: 20000 },
  { name: "Feb", monthly: 25000 },
  { name: "Mar", monthly: 30000 },
  { name: "Apr", monthly: 35000 },
  { name: "May", monthly: 40000 },
];

function ContributionChart() {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div
      className={`p-5 rounded-xl shadow transition-all duration-300 ${
        darkMode
          ? "bg-gray-800 border border-gray-700 text-white"
          : "bg-white border border-gray-100 text-gray-900"
      }`}
    >
      <h2 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
        Monthly Contribution Growth
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={darkMode ? "#374151" : "#e5e7eb"}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: darkMode ? "#f9fafb" : "#111827" }}
          />
          <YAxis
            tick={{ fill: darkMode ? "#f9fafb" : "#111827" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? "#1f2937" : "#fff",
              border: "none",
              color: darkMode ? "#f9fafb" : "#111827",
            }}
          />
          <Line
            type="monotone"
            dataKey="monthly"
            stroke={darkMode ? "#6366F1" : "#2563eb"}
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ContributionChart;