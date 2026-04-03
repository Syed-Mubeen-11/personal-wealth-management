import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// --- IMPORT GLOBAL LAYOUT ---
import Layout from "./components/Layout";

// --- IMPORT PAGES ---
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Portfolio from "./pages/Portfolio";
import Goals from "./pages/Goals";
import Simulator from "./pages/Simulator";
import AIAdvice from "./pages/AIAdvice";
import Recommendations from "./pages/Recommendations";
import Reports from "./pages/Reports";

// --- SECURE ROUTE WRAPPER ---
// Updated to check for 'jwt' matching your new login logic!
function PrivateRoute({ children }) {
  const token = localStorage.getItem("jwt");
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes (Full screen, no sidebar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Root redirects to login (login page will redirect to dashboard if already authenticated) */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Layout>
                <Profile />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/portfolio"
          element={
            <PrivateRoute>
              <Layout>
                <Portfolio />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <PrivateRoute>
              <Layout>
                <Goals />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/simulator"
          element={
            <PrivateRoute>
              <Layout>
                <Simulator />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/simulator-full"
          element={
            <PrivateRoute>
              <Layout>
                <Simulator />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/ai-advice"
          element={
            <PrivateRoute>
              <Layout>
                <AIAdvice />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <PrivateRoute>
              <Layout>
                <Recommendations />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <Layout>
                <Reports />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
