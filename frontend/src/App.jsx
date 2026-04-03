import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicRoute from './components/auth/PublicRoute'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import GoalsPage from './pages/GoalsPage'
import GoalDetailsPage from './pages/GoalDetailsPage'
import PortfolioPage from './pages/PortfolioPage'
import RecommendationsPage from './pages/RecommendationsPage'
import RebalancePage from './pages/RebalancePage'
import ReportsPage from './pages/ReportsPage'
import { NotFoundPage } from './pages/PlaceholderPages'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard"        element={<DashboardPage />} />
            <Route path="/profile"          element={<ProfilePage />} />
            <Route path="/goals"            element={<GoalsPage />} />
            <Route path="/goals/:id"        element={<GoalDetailsPage />} />
            <Route path="/portfolio"        element={<PortfolioPage />} />
            <Route path="/transactions"     element={<PortfolioPage />} />
            <Route path="/recommendations"  element={<RecommendationsPage />} />
            <Route path="/rebalance"        element={<RebalancePage />} />
            <Route path="/reports"          element={<ReportsPage />} />
          </Route>

          <Route path="/"  element={<Navigate to="/dashboard" replace />} />
          <Route path="*"  element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
