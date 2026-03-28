import React from "react";

function PortfolioSummary({ investments = [] }) {

  const totalInvested = investments.reduce(
    (sum, inv) => sum + Number(inv.cost_basis || 0),
    0
  );

  const totalValue = investments.reduce(
    (sum, inv) => sum + Number(inv.current_value || inv.cost_basis || 0),
    0
  );

  const profit = totalValue - totalInvested;

  return (

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold">Total Invested</h2>
        <p className="text-2xl font-bold">₹{totalInvested}</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold">Portfolio Value</h2>
        <p className="text-2xl font-bold">₹{totalValue}</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold">Profit / Loss</h2>
        <p className="text-2xl font-bold">₹{profit}</p>
      </div>



    </div>

  );
}

export default PortfolioSummary;