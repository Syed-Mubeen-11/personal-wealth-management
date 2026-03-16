import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const Dashboard = () => {

  const lineData = [
    { name: "Jan", value: 100000 },
    { name: "Feb", value: 140000 },
    { name: "Mar", value: 130000 },
    { name: "Apr", value: 170000 },
    { name: "May", value: 190000 },
    { name: "Jun", value: 210000 },
  ];

  const pieData = [
    { name: "Stocks", value: 40 },
    { name: "Crypto", value: 20 },
    { name: "Savings", value: 25 },
    { name: "Gold", value: 15 },
  ];

  const COLORS = ["#C084FC", "#06B6D4", "#10B981", "#F97316"];

  return (

    <div className="min-h-screen bg-[#020617] text-white p-8">

      {/* HEADER */}

      <div className="bg-[#0B1E3B]/60 backdrop-blur-md p-4 rounded-xl mb-10 flex justify-between items-center">

        <h2 className="text-2xl font-semibold text-[#E5E7EB]">
          Dashboard Overview
        </h2>

        <p className="text-gray-400">
          Profile
        </p>

      </div>


      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">

        {/* Portfolio */}

        <div className="bg-[#0B1E3B] p-6 rounded-2xl shadow-lg hover:scale-105 transition duration-300">

          <p className="text-[#CBD5E1]">
            Total Portfolio
          </p>

          <h3 className="text-3xl font-bold mt-2 text-[#C084FC]">
            ₹ 2,50,000
          </h3>

        </div>


        {/* Goals */}

        <div className="bg-[#0B1E3B] p-6 rounded-2xl shadow-lg hover:scale-105 transition duration-300">

          <p className="text-[#CBD5E1]">
            Active Goals
          </p>

          <h3 className="text-3xl font-bold mt-2 text-[#F472B6]">
            4
          </h3>

        </div>


        {/* Investments */}

        <div className="bg-[#0B1E3B] p-6 rounded-2xl shadow-lg hover:scale-105 transition duration-300">

          <p className="text-[#CBD5E1]">
            Investments
          </p>

          <h3 className="text-3xl font-bold mt-2 text-[#C084FC]">
            ₹ 80,000
          </h3>

        </div>


        {/* Risk */}

        <div className="bg-[#0B1E3B] p-6 rounded-2xl shadow-lg hover:scale-105 transition duration-300">

          <p className="text-[#CBD5E1]">
            Risk Profile
          </p>

          <h3 className="text-3xl font-bold mt-2 text-[#60A5FA]">
            Moderate
          </h3>

        </div>

      </div>



      {/* CHARTS */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Portfolio Growth */}

        <div className="bg-[#0B1E3B] p-6 rounded-2xl shadow-lg hover:scale-105 transition duration-300">

          <h3 className="text-lg font-semibold mb-4 text-[#E5E7EB]">
            Portfolio Growth
          </h3>

          <ResponsiveContainer width="100%" height={250}>

            <LineChart data={lineData}>

              <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />

              <XAxis dataKey="name" stroke="#CBD5E1" />

              <YAxis stroke="#CBD5E1" />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#C084FC"
                strokeWidth={3}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>



        {/* Asset Allocation */}

        <div className="bg-[#0B1E3B] p-6 rounded-2xl shadow-lg hover:scale-105 transition duration-300">

          <h3 className="text-lg font-semibold mb-4 text-[#E5E7EB]">
            Asset Allocation
          </h3>

          <ResponsiveContainer width="100%" height={250}>

            <PieChart>

              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label
              >

                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}

              </Pie>

              <Legend />

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>

  );
};

export default Dashboard;