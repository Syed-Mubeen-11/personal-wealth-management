import React, { useState } from "react";
import "./ProfileRisk.css";

export default function ProfileRisk() {
  const [risk, setRisk] = useState("Moderate");

  return (
    <div className="dashboard">

      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="logo">Wealth Manager</h2>
        <ul>
          <li className="active">Profile & Risk</li>
          <li>Goals</li>
          <li>Portfolio & Transactions</li>
          <li>Recommendations & Reports</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h1>Profile & Risk Management</h1>

        <div className="content-grid">

          {/* Profile Form */}
          <div className="card">
            <h2>User Profile Details</h2>

            <label>Full Name</label>
            <input type="text" placeholder="John Doe" />

            <label>Email Address</label>
            <input type="email" placeholder="john@example.com" />

            <label>Phone Number</label>
            <input type="text" placeholder="+91 9876543210" />

            <label>Residential Address</label>
            <input type="text" placeholder="Enter Address" />

            <label>Date of Birth</label>
            <input type="date" />
          </div>

          {/* Risk Section */}
          <div>
            <div className="card">
              <h2>Risk Profile Selection</h2>

              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="Conservative"
                    checked={risk === "Conservative"}
                    onChange={(e) => setRisk(e.target.value)}
                  />
                  Conservative
                </label>

                <label>
                  <input
                    type="radio"
                    value="Moderate"
                    checked={risk === "Moderate"}
                    onChange={(e) => setRisk(e.target.value)}
                  />
                  Moderate
                </label>

                <label>
                  <input
                    type="radio"
                    value="Aggressive"
                    checked={risk === "Aggressive"}
                    onChange={(e) => setRisk(e.target.value)}
                  />
                  Aggressive
                </label>
              </div>
            </div>

            <div className="card">
              <h2>Risk Assessment Summary</h2>
              <p>
                Selected Profile: <strong>{risk}</strong>
              </p>
              <p>
                {risk === "Conservative" &&
                  "Low risk strategy focusing on capital protection."}
                {risk === "Moderate" &&
                  "Balanced growth with moderate risk exposure."}
                {risk === "Aggressive" &&
                  "High growth investment strategy with higher risk."}
              </p>
            </div>
          </div>
        </div>

        <div className="buttons">
          <button className="cancel-btn">Cancel</button>
          <button className="save-btn">Save Changes</button>
        </div>

        <footer>© 2026 Infosys Wealth Manager. All rights reserved.</footer>
      </div>
    </div>
  );
}
