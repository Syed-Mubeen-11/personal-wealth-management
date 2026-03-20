import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- IMPORT GLOBAL LAYOUT ---
import Layout from './components/Layout';

// --- IMPORT PAGES ---
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile'; 
import Portfolio from './pages/Portfolio';
import Goals from './pages/Goals';
import Simulator from './pages/Simulator';
import AIAdvice from './pages/AIAdvice';

// --- SECURE ROUTE WRAPPER ---
// Updated to check for 'jwt' matching your new login logic!
function PrivateRoute({ children }) {
    const token = localStorage.getItem('jwt');
    return token ? children : <Navigate to="/login" />;
}

export default function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes (Full screen, no sidebar) */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Private Routes (Wrapped inside the new Global Sidebar Layout) */}
                <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                
                <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
                <Route path="/portfolio" element={<PrivateRoute><Layout><Portfolio /></Layout></PrivateRoute>} />
                <Route path="/goals" element={<PrivateRoute><Layout><Goals /></Layout></PrivateRoute>} />
                <Route path="/simulator" element={<PrivateRoute><Layout><Simulator /></Layout></PrivateRoute>} />
                <Route path="/simulator-full" element={<PrivateRoute><Layout><Simulator /></Layout></PrivateRoute>} />
                <Route path="/ai-advice" element={<PrivateRoute><Layout><AIAdvice /></Layout></PrivateRoute>} />

                {/* Catch-all Redirect */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}