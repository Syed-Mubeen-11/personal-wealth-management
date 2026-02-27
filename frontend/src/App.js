import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";

// Temporary Dashboard placeholder
const Dashboard = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <h1 className="text-3xl font-bold">Welcome to Dashboard 🚀</h1>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>

        {/* Default Route → Login */}
        <Route path="/" element={<Login />} />

        {/* Register Route */}
        <Route path="/register" element={<Register />} />

        {/* Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;