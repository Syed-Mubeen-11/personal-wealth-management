import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const Goals = () => {

  const targetAmount = 500000;
  const achievedAmount = 210000;
  const remainingAmount = targetAmount - achievedAmount;
  const targetDate = "31 Dec 2026";

  const dailyData = [
    { name: "Mon", amount: 2000 },
    { name: "Tue", amount: 2500 },
    { name: "Wed", amount: 3000 },
    { name: "Thu", amount: 2200 },
    { name: "Fri", amount: 3500 },
    { name: "Sat", amount: 4000 },
    { name: "Sun", amount: 1500 },
  ];

  const weeklyData = [
    { name: "Week 1", amount: 15000 },
    { name: "Week 2", amount: 20000 },
    { name: "Week 3", amount: 18000 },
    { name: "Week 4", amount: 25000 },
  ];

  const monthlyData = [
    { name: "Jan", amount: 10000 },
    { name: "Feb", amount: 15000 },
    { name: "Mar", amount: 12000 },
    { name: "Apr", amount: 18000 },
    { name: "May", amount: 20000 },
    { name: "Jun", amount: 22000 },
    { name: "Jul", amount: 25000 },
    { name: "Aug", amount: 24000 },
    { name: "Sep", amount: 26000 },
    { name: "Oct", amount: 28000 },
    { name: "Nov", amount: 30000 },
    { name: "Dec", amount: 35000 },
  ];

  const yearlyData = [
    { name: "2022", amount: 120000 },
    { name: "2023", amount: 180000 },
    { name: "2024", amount: 210000 },
    { name: "2025", amount: 260000 },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">

      {/* HEADER */}

      <div className="bg-[#0B1E3B]/60 backdrop-blur-md p-4 rounded-xl mb-10 flex justify-between items-center">

        <h2 className="text-2xl font-semibold text-[#E5E7EB]">
          Goals Dashboard
        </h2>

        <p className="text-gray-400">
          Progress
        </p>

      </div>


      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">

        <div className="bg-[#0B1E3B] p-6 rounded-2xl shadow-lg hover:scale-105 transition">

          <p className="text-[#CBD5E1]">
            Target Amount
          </p>

          <h3 className="text-3xl font-bold mt-2 text-[#C084FC]">
            ₹{targetAmount}
          </h3>

        </div>

        <div className="bg-[#0B1E3B] p-6 rounded-2xl shadow-lg hover:scale-105 transition">

          <p className="text-[#CBD5E1]">
            Achieved
          </p>

          <h3 className="text-3xl font-bold mt-2 text-[#F472B6]">
            ₹{achievedAmount}
          </h3>

        </div>

        <div className="bg-[#0B1E3B] p-6 rounded-2xl shadow-lg hover:scale-105 transition">

          <p className="text-[#CBD5E1]">
            Remaining
          </p>

          <h3 className="text-3xl font-bold mt-2 text-[#60A5FA]">
            ₹{remainingAmount}
          </h3>

        </div>

        <div className="bg-[#0B1E3B] p-6 rounded-2xl shadow-lg hover:scale-105 transition">

          <p className="text-[#CBD5E1]">
            Target Date
          </p>

          <h3 className="text-3xl font-bold mt-2 text-[#C084FC]">
            {targetDate}
          </h3>

        </div>

      </div>



      {/* DAILY CHART */}

      <div className="bg-[#0B1E3B] p-6 rounded-2xl shadow-lg mb-10">

        <h3 className="text-lg font-semibold mb-4 text-[#E5E7EB]">
          Daily Contribution
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData}>
            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#CBD5E1" />
            <YAxis stroke="#CBD5E1" />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#C084FC" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>

      </div>



      {/* WEEKLY CHART */}

      <div className="bg-[#0B1E3B] p-6 rounded-2xl shadow-lg mb-10">

        <h3 className="text-lg font-semibold mb-4 text-[#E5E7EB]">
          Weekly Contribution
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyData}>
            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#CBD5E1" />
            <YAxis stroke="#CBD5E1" />
            <Tooltip />
            <Bar dataKey="amount" fill="#F472B6" />
          </BarChart>
        </ResponsiveContainer>

      </div>



      {/* MONTHLY CHART */}

      <div className="bg-[#0B1E3B] p-6 rounded-2xl shadow-lg mb-10">

        <h3 className="text-lg font-semibold mb-4 text-[#E5E7EB]">
          Monthly Contribution
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#CBD5E1" />
            <YAxis stroke="#CBD5E1" />
            <Tooltip />
            <Bar dataKey="amount" fill="#C084FC" />
          </BarChart>
        </ResponsiveContainer>

      </div>



      {/* YEARLY CHART */}

      <div className="bg-[#0B1E3B] p-6 rounded-2xl shadow-lg">

        <h3 className="text-lg font-semibold mb-4 text-[#E5E7EB]">
          Yearly Contribution
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={yearlyData}>
            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#CBD5E1" />
            <YAxis stroke="#CBD5E1" />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#60A5FA" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
};

export default Goals;