import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';

import Dashboard from './pages/Dashboard';
import Incomes from './pages/Incomes';
import Expenses from './pages/Expenses';
import Goals from './pages/Goals';
import Investments from './pages/Investments';
import Analytics from './pages/Analytics';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import Simulation from './pages/Simulation';
import Recommendations from './pages/Recommendations';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/incomes"
          element={
            <ProtectedRoute>
              <Incomes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <Goals />
            </ProtectedRoute>
          }
        />

        <Route
          path="/investments"
          element={
            <ProtectedRoute>
              <Investments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/simulation"
          element={
            <ProtectedRoute>
              <Simulation />
            </ProtectedRoute>
          }
        />

        {/* NEW: Recommendations Page */}
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <Recommendations />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;