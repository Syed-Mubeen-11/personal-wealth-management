import React, { useContext } from "react";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { ThemeContext } from "../context/Themecontext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const ChartCard = ({ title, type }) => {
  const { darkMode } = useContext(ThemeContext);

  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Net Worth",
        data: [10000, 15000, 14000, 20000, 22000, 25000],
        fill: true,
        backgroundColor: darkMode
          ? "rgba(99,102,241,0.2)"
          : "rgba(99,102,241,0.1)",
        borderColor: "#6366F1",
        tension: 0.4,
        pointRadius: 4,
      },
    ],
  };

  const pieData = {
    labels: ["Stocks", "Crypto", "Savings", "Real Estate"],
    datasets: [
      {
        data: [40, 20, 25, 15],
        backgroundColor: ["#6366F1", "#10B981", "#F59E0B", "#EF4444"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: type === "pie",
        position: "bottom",
        labels: {
          color: darkMode ? "#f9fafb" : "#111827", // text color for dark/light mode
        },
      },
      tooltip: {
        titleColor: darkMode ? "#f9fafb" : "#111827",
        bodyColor: darkMode ? "#f9fafb" : "#111827",
        backgroundColor: darkMode ? "#1f2937" : "#fff",
      },
    },
    scales:
      type === "line"
        ? {
            x: {
              ticks: {
                color: darkMode ? "#f9fafb" : "#111827",
              },
              grid: {
                color: darkMode ? "#374151" : "#e5e7eb",
              },
            },
            y: {
              ticks: {
                color: darkMode ? "#f9fafb" : "#111827",
              },
              grid: {
                color: darkMode ? "#374151" : "#e5e7eb",
              },
            },
          }
        : {},
  };

  return (
    <div
      className={`rounded-2xl shadow-sm border p-6 hover:shadow-md transition-all duration-300 ${
        darkMode
          ? "bg-gray-800 border-gray-700 text-white"
          : "bg-white border-gray-100 text-gray-900"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3
          className={`text-lg font-semibold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </h3>
      </div>

      <div className="h-64">
        {type === "line" ? <Line data={lineData} options={options} /> : <Pie data={pieData} options={options} />}
      </div>
    </div>
  );
};

export default ChartCard;