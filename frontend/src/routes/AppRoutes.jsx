import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Portfolio from "../pages/Portfolio";
import Transactions from "../pages/Transactions";
import Goals from "../pages/Goals";
import Reports from "../pages/Reports";
import Profile from "../pages/Profile";

const AppRoutes = ({ isAuthenticated, setIsAuthenticated }) => {
  return (
    <Routes>

  {/* Public Routes */}
  <Route
    path="/"
    element={<Login setIsAuthenticated={setIsAuthenticated} />}
  />
  
  <Route
    path="/login"
    element={<Login setIsAuthenticated={setIsAuthenticated} />}
  />
   {/* 👇 NEW REGISTER ROUTE */}
      <Route
        path="/register"
        element={<Register />}
      />
  {/* Protected Routes Group */}
  <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>

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
