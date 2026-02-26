import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Portfolio from "../pages/Portfolio";
import Transactions from "../pages/Transactions";
import Goals from "../pages/Goals";
import Reports from "../pages/Reports";
import Profile from "../pages/Profile";

const AppRoutes = ({ setIsAuthenticated }) => {

  const token = localStorage.getItem("token");

  return (
    <Routes>

      {/* Public Routes */}

      <Route
        path="/"
        element={token ? <Navigate to="/dashboard" replace /> : 
          <Login setIsAuthenticated={setIsAuthenticated} />}
      />

      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" replace /> : 
          <Login setIsAuthenticated={setIsAuthenticated} />}
      />

      <Route
        path="/register"
        element={token ? <Navigate to="/dashboard" replace /> : 
          <Register />}
      />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<Profile />} />

      </Route>

    </Routes>
  );
};

export default AppRoutes;