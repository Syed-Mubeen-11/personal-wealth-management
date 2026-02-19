import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- IMPORT PAGES ---
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Portfolio from './pages/Portfolio';
import Goals from './pages/Goals';
import Simulator from './pages/Simulator'; 
import AIAdvice from './pages/AIAdvice';   // <--- 1. IMPORT ADDED
import Navbar from './components/Navbar';

function PrivateRoute({ children }) {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Private Routes */}
                <Route path="/dashboard" element={<PrivateRoute><Navbar /><Dashboard /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Navbar /><Profile /></PrivateRoute>} />
                <Route path="/portfolio" element={<PrivateRoute><Navbar /><Portfolio /></PrivateRoute>} />
                <Route path="/goals" element={<PrivateRoute><Navbar /><Goals /></PrivateRoute>} />
                <Route path="/simulator" element={<PrivateRoute><Navbar /><Simulator /></PrivateRoute>} />
                
                {/* --- 2. ROUTE ADDED HERE --- */}
                            <Route path="/ai-advice" element={<PrivateRoute><Navbar /><AIAdvice /></PrivateRoute>} />
                {/* Default Redirect */}
                <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
        </Router>
    );
}

export default App;