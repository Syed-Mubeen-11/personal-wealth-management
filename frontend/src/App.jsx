import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ProfileRisk from "./components/ProfileRisk.jsx";
import Portfolio from "./components/Portfolio.jsx";
import Transactions from "./components/Transactions.jsx";
import RiskProfile from "./components/RiskProfile.jsx";
import Goals from "./components/Goals.jsx";

import './App.css';

function App() {
  return (
    <Router>
      <Routes>

        {/* Login Page */}
        <Route path="/" element={<Login />} />

        {/* Register Page */}
        <Route path="/register" element={<Register />} />

        {/* Dashboard and Nested Pages */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<ProfileRisk />} />
          <Route path="profile" element={<ProfileRisk />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="riskprofile" element={<RiskProfile />} />
          <Route path="goals" element={<Goals />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;