import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (!storedUser) {
      navigate("/");
    } else {
      setUsername(storedUser);
    }
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
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <p className="text-purple-700 font-bold text-lg">
          Dashboard content goes here...
        </p>
      </div>

    </div>
  );
};

export default Dashboard;