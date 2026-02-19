import React from "react";
import SummaryCard from "../components/SummaryCard";
import ChartCard from "../components/ChartCard";
import TransactionsTable from "../components/TransactionsTable";
import GoalsProgress from "../components/GoalsProgress";

const Dashboard = () => {
  return (
    <div className="space-y-8">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Good Morning, Mubeen 👋
          </h2>
          <p className="text-gray-500 mt-1">
            Here’s your financial overview for today.
          </p>
        </div>

        <div className="mt-4 md:mt-0">
          <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700 transition">
            + Add Transaction
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <SummaryCard title="Total Net Worth" value="$120,000" />
        <SummaryCard title="Investments" value="$80,000" />
        <SummaryCard title="Income" value="$5,500" />
        <SummaryCard title="Expenses" value="$2,300" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="Net Worth Growth" type="line" />
        <ChartCard title="Asset Allocation" type="pie" />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TransactionsTable />
        <GoalsProgress />
      </div>
    </div>
  );
};

export default Dashboard;
