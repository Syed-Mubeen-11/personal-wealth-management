import React, { useState } from "react";
import profileImg from "../assets/profile.png";

function Profile() {
  const [risk, setRisk] = useState("moderate");

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">

      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Profile & Risk Management
      </h1>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <img
            src={profileImg}
            alt="Profile"
            className="w-20 h-20 rounded-full border"
          />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Mubeen
            </h2>
            <p className="text-gray-500 text-sm">
              mubeen@email.com
            </p>
          </div>
        </div>

        <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition">
          Edit Profile
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT SIDE */}
        <div className="space-y-8">

          {/* Personal Details */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800">
          User Profile Details
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          Keep your information up to date
        </p>
      </div>

      <div className="space-y-6">

        {/* Full Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-2">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Enter your full name"
            className="border border-gray-300 rounded-xl px-4 py-3
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-2">
            Email Address
          </label>
          <input
            type="email"
            placeholder="Enter your email address"
            className="border border-gray-300 rounded-xl px-4 py-3
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            placeholder="Enter your phone number"
            className="border border-gray-300 rounded-xl px-4 py-3
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/* Date of Birth */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            className="border border-gray-300 rounded-xl px-4 py-3
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/* Address */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-2">
            Residential Address
          </label>
          <textarea
            rows="3"
            placeholder="Enter your residential address"
            className="border border-gray-300 rounded-xl px-4 py-3
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
          />
        </div>

      </div>

    </div>

          {/* KYC Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">
                KYC Status
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Your KYC verification is completed.
              </p>
            </div>

            <span className="text-green-600 font-medium">
              ✓ Completed
            </span>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-8">

          {/* Risk Selection */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold mb-6">
              Risk Profile Selection
            </h3>

            <div className="space-y-4">

              {["conservative", "moderate", "aggressive"].map((level) => (
                <div
                  key={level}
                  onClick={() => setRisk(level)}
                  className={`cursor-pointer border rounded-xl p-4 transition ${
                    risk === level
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-gray-200 hover:border-indigo-400"
                  }`}
                >
                  <p className="font-medium capitalize">
                    {level}
                  </p>
                  <p className="text-sm text-gray-500">
                    {level === "conservative" &&
                      "Prioritizes capital preservation, low risk."}
                    {level === "moderate" &&
                      "Balanced growth with diversified risk."}
                    {level === "aggressive" &&
                      "Seeks higher growth with higher volatility."}
                  </p>
                </div>
              ))}

            </div>
          </div>

          {/* Risk Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold mb-4">
              Risk Assessment Summary
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {risk === "conservative" &&
                "A conservative investor focuses on capital protection and stable returns."}
              {risk === "moderate" &&
                "A moderate investor balances risk and growth through diversification."}
              {risk === "aggressive" &&
                "An aggressive investor accepts market volatility for higher potential returns."}
            </p>
          </div>

        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="flex justify-end gap-4 mt-10">
        <button className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-100">
          Cancel
        </button>
        <button className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition">
          Save Changes
        </button>
      </div>

    </div>
  );
}

export default Profile;
