import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [income] = useState(50000);
  const [expenses] = useState(20000);
  const savings = income - expenses;
  const progress = 60;

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
        <h1 className="text-3xl font-bold text-purple-700">Welcome, {username} 👋</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg">Logout</button>
      </div>

      {/* Summary */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-gray-500">Total Income</h2>
          <p className="text-2xl font-bold text-green-600">₹{income}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-gray-500">Total Expenses</h2>
          <p className="text-2xl font-bold text-red-600">₹{expenses}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-gray-500">Savings</h2>
          <p className="text-2xl font-bold text-blue-600">₹{savings}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-gray-500">Remaining Balance</h2>
          <p className="text-2xl font-bold text-purple-600">₹{savings}</p>
        </div>
      </div>

      <p className="text-purple-700 font-bold">Additional dashboard content can be added here...</p>
    </div>
  );
};

export default Dashboard;