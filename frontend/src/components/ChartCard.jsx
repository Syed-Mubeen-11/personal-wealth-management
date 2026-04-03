import React, { useState, useEffect, useContext } from "react";
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
  Filler
} from "chart.js";
import { ThemeContext } from "../context/Themecontext";
import API from "../services/api";

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

const ChartCard = ({ title, type, investments = [] }) => {
  const { darkMode } = useContext(ThemeContext);
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const response = await API.get("/investments/historical");
        setHistoricalData(response.data);
      } catch (error) {
        console.error("Failed to fetch historical data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistoricalData();
  }, []);

  // Asset allocation for pie chart
  const assetTypes = {};
  investments.forEach(inv => {
    assetTypes[inv.asset_type] = (assetTypes[inv.asset_type] || 0) + Number(inv.cost_basis || 0);
  });

  const pieData = {
    labels: Object.keys(assetTypes).map(key => key.replace(/_/g, ' ').toUpperCase()),
    datasets: [{
      data: Object.values(assetTypes),
      backgroundColor: ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
      borderWidth: 0
    }]
  };

  // Line chart data from backend or fallback
  const getLineData = () => {
    if (historicalData && historicalData.labels && historicalData.labels.length > 0) {
      return {
        labels: historicalData.labels,
        datasets: [
          {
            label: "Net Worth Growth (₹)",
            data: historicalData.values,
            fill: true,
            backgroundColor: "rgba(99, 102, 241, 0.15)",
            borderColor: "#6366F1",
            pointBackgroundColor: "#6366F1",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#6366F1",
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      };
    }
    
    // Fallback to dummy data if no historical data
    const totalInvested = investments.reduce(
      (sum, inv) => sum + Number(inv.cost_basis || 0),
      0
    );
    const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    const trendData = months.map((_, i) => {
      const ratio = (i + 5) / 10;
      return totalInvested * ratio;
    });
    
    return {
      labels: months,
      datasets: [
        {
          label: "Net Worth Growth (₹)",
          data: trendData,
          fill: true,
          backgroundColor: "rgba(99, 102, 241, 0.15)",
          borderColor: "#6366F1",
          pointBackgroundColor: "#6366F1",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#6366F1",
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: type === "pie",
        position: "bottom",
        labels: {
          color: darkMode ? "#fff" : "#111",
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let value = context.raw;
            return "₹" + value.toLocaleString("en-IN");
          }
        }
      }
    },
    scales: type === "line" ? {
      y: {
        ticks: {
          callback: function(value) {
            return "₹" + value.toLocaleString("en-IN");
          },
          color: darkMode ? "#fff" : "#111"
        },
        grid: {
          color: darkMode ? "#374151" : "#e5e7eb"
        },
        title: {
          display: true,
          text: "Amount (₹)",
          color: darkMode ? "#9ca3af" : "#6b7280"
        }
      },
      x: {
        ticks: {
          color: darkMode ? "#fff" : "#111"
        },
        grid: {
          color: darkMode ? "#374151" : "#e5e7eb"
        },
        title: {
          display: true,
          text: "Month",
          color: darkMode ? "#9ca3af" : "#6b7280"
        }
      }
    } : {}
  };

  if (loading && type === "line") {
    return (
      <div className={`rounded-2xl shadow-sm border p-6 ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
      }`}>
        <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">{title}</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading chart data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl shadow-sm border p-6 ${
      darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
    }`}>
      <h3 className={`text-lg font-semibold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>{title}</h3>
      <div className="h-64">
        {type === "line" ? 
          <Line data={getLineData()} options={options} /> : 
          <Pie data={pieData} options={options} />
        }
      </div>
    </div>
  );
};

export default ChartCard;