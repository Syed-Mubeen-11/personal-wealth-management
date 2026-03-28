import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Portfolio from "../pages/Portfolio";
import Transactions from "../pages/Transactions";
import Goals from "../pages/Goals";
import Reports from "../pages/Reports";
import Profile from "../pages/Profile";
import SIPCalculator from "../pages/SIPCalculator";
import Recommendations from "../pages/Recommendations";  // ✅ Add this import

const AppRoutes = ({ isAuthenticated, setIsAuthenticated }) => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" />
            : <Login setIsAuthenticated={setIsAuthenticated} />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" />
            : <Register />
        }
      />

      {/* Protected Routes */}
      {isAuthenticated && (
        <>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/sip-calculator" element={<SIPCalculator />} />
          <Route path="/recommendations" element={<Recommendations />} />  {/* ✅ Add this route */}
        </>
      )}

      {/* Redirect unknown routes */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
};

export default AppRoutes;