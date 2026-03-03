import React from "react";

const RiskProfile = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-purple-200 to-purple-400 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-purple-700 mb-6">Risk Profile</h2>
        <p className="text-gray-700 mb-2">Risk Level: Moderate</p>
        <p className="text-gray-700 mb-2">Investment Strategy: Balanced</p>
      </div>
    </div>
  );
};

export default RiskProfile;