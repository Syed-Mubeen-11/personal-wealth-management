import React, { useState } from "react";
import "../ProfileRisk.css";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfileRisk() {
  const navigate = useNavigate();
  const [risk, setRisk] = useState("Moderate");
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dob: "",
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Save profile data to localStorage
    localStorage.setItem("userProfile", JSON.stringify({ ...profile, risk }));
    alert("Profile saved successfully!");
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1B3C53] text-white flex flex-col p-6 hidden md:flex">
        <h2 className="text-2xl font-bold mb-10">WealthTracker</h2>
        <nav className="flex-1 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-[#234C6A] rounded-lg">
            <span>Profile & Risk</span>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 p-3 text-gray-300 hover:text-white w-full text-left"
          >
            Dashboard
          </button>
        </nav>
        <button
          onClick={() => {
            localStorage.removeItem("jwt");
            navigate("/login");
          }}
          className="flex items-center gap-3 p-3 text-red-300 hover:text-red-100 mt-auto"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-[#1B3C53] hover:text-[#234C6A]"
          >
            <ArrowLeft size={20} /> Back
          </button>
          <h1 className="text-3xl font-bold text-[#1B3C53]">Profile & Risk Management</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-[#1B3C53] mb-4">User Profile Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleProfileChange}
                  placeholder="John Doe"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#234C6A]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  placeholder="john@example.com"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#234C6A]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  placeholder="+91 9876543210"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#234C6A]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Residential Address</label>
                <input
                  type="text"
                  name="address"
                  value={profile.address}
                  onChange={handleProfileChange}
                  placeholder="Enter your address"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#234C6A]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={profile.dob}
                  onChange={handleProfileChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#234C6A]"
                />
              </div>
            </div>
          </div>

          {/* Risk Profile Section */}
          <div className="space-y-6">
            {/* Risk Selection */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#1B3C53] mb-4">Risk Profile Selection</h2>

              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="Conservative"
                    checked={risk === "Conservative"}
                    onChange={(e) => setRisk(e.target.value)}
                    className="w-4 h-4 text-[#234C6A]"
                  />
                  <span className="ml-3 font-medium text-gray-700">Conservative</span>
                </label>

                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="Moderate"
                    checked={risk === "Moderate"}
                    onChange={(e) => setRisk(e.target.value)}
                    className="w-4 h-4 text-[#234C6A]"
                  />
                  <span className="ml-3 font-medium text-gray-700">Moderate</span>
                </label>

                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="Aggressive"
                    checked={risk === "Aggressive"}
                    onChange={(e) => setRisk(e.target.value)}
                    className="w-4 h-4 text-[#234C6A]"
                  />
                  <span className="ml-3 font-medium text-gray-700">Aggressive</span>
                </label>
              </div>
            </div>

            {/* Risk Assessment Summary */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#1B3C53] mb-4">Risk Assessment Summary</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Selected Profile:</strong> <span className="text-[#234C6A] font-semibold">{risk}</span>
                </p>
                <p className="text-gray-600 mt-3">
                  {risk === "Conservative" &&
                    "Low risk strategy focusing on capital protection and stable returns."}
                  {risk === "Moderate" &&
                    "Balanced growth with moderate risk exposure for long-term wealth building."}
                  {risk === "Aggressive" &&
                    "High growth investment strategy with higher risk for experienced investors."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-end">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 border border-[#1B3C53] text-[#1B3C53] rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#234C6A] text-white rounded-lg hover:bg-[#1B3C53] font-medium"
          >
            Save Changes
          </button>
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          © 2026 Infosys Wealth Manager. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
