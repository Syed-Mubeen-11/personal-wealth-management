import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GoalChart from "../components/GoalChart";

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  // Sample goal chart data
  const dailyContribution = [
    { period: "Mon", amount: 500 },
    { period: "Tue", amount: 700 },
    { period: "Wed", amount: 650 },
    { period: "Thu", amount: 800 },
    { period: "Fri", amount: 900 },
    { period: "Sat", amount: 750 },
    { period: "Sun", amount: 1000 },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (!storedUser) navigate("/");
    else setUsername(storedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-purple-200 to-purple-400 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-purple-700">
          Welcome, {username} 👋
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      {/* Goal Charts */}
      <GoalChart data={dailyContribution} title="Daily Contribution" />
      <GoalChart data={dailyContribution} title="Weekly Contribution" />
      <GoalChart data={dailyContribution} title="Monthly Contribution" />
      <GoalChart data={dailyContribution} title="Yearly Contribution" />
    </div>
  );
};

export default Dashboard;