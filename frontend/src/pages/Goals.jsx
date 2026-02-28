import React from "react";
import ContributionChart from "../components/ContributionChart";

function Goals() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">
        Goals Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-lg font-semibold">Target Amount</h2>
          <p className="text-2xl font-bold text-blue-600">₹10,00,000</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-lg font-semibold">Current Savings</h2>
          <p className="text-2xl font-bold text-green-600">₹3,50,000</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-lg font-semibold">Target Date</h2>
          <p className="text-2xl font-bold text-red-600">Dec 2027</p>
        </div>

      </div>

      {/* Chart Section */}
      <ContributionChart />

    </div>
  );
}

export default Goals;