import React from "react";
import ContributionChart from "../components/ContributionChart";

function Goals() {
  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Goals Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow hover:shadow-md transition-shadow duration-300">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Target Amount
          </h2>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            ₹10,00,000
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow hover:shadow-md transition-shadow duration-300">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Current Savings
          </h2>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
            ₹3,50,000
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow hover:shadow-md transition-shadow duration-300">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Target Date
          </h2>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
            Dec 2027
          </p>
        </div>

      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-md transition-shadow duration-300">
        <ContributionChart />
      </div>

    </div>
  );
}

export default Goals;