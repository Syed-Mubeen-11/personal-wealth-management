import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function ContributionChart({ goal }) {

  if (!goal) {
    return <p className="text-gray-500">No goal selected</p>;
  }

  const monthly = Number(goal.monthly_contribution);

  const data = [
    {
      name: "Daily",
      amount: (monthly / 30).toFixed(0)
    },
    {
      name: "Weekly",
      amount: (monthly / 4.3).toFixed(0)
    },
    {
      name: "Monthly",
      amount: monthly
    },
    {
      name: "Yearly",
      amount: monthly * 12
    }
  ];

  return (

    <ResponsiveContainer width="100%" height={300}>

      <BarChart data={data}>

        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="name" />

        <YAxis />

        <Tooltip />

        <Bar
          dataKey="amount"
          fill="#3b82f6"
          radius={[5, 5, 0, 0]}
        />

      </BarChart>

    </ResponsiveContainer>

  );
}

export default ContributionChart;