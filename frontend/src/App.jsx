import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

import GoalsList from "./pages/Goals/GoalsList";
import CreateGoal from "./pages/Goals/CreateGoal";

import PortfolioOverview from "./pages/Portfolio/PortfolioOverview";
import CreateInvestment from "./pages/Portfolio/CreateInvestment";
import CreateTransaction from "./pages/Portfolio/CreateTransaction";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layout/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
 
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <GoalsList />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/goals/create"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CreateGoal />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/portfolio"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PortfolioOverview />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/portfolio/create"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CreateInvestment />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions/create"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CreateTransaction />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
