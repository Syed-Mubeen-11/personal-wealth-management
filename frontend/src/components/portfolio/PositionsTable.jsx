import React from "react";

// Added 'rebalanceData' to the props
function PositionsTable({
  positions,
  currentPage,
  totalPages,
  onPageChange,
  onManagePositions,
  onSell,
  rebalanceData,
}) {
  const formatCurrency = (val) => {
    return val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatPercent = (val) => {
    const prefix = val >= 0 ? "+" : "";
    return `${prefix}${val.toFixed(2)}%`;
  };

  // Helper function to calculate drift and return the right icon
  const renderDriftIndicator = (symbol, assetType) => {
    // If rebalance data is loading or missing, show a neutral placeholder
    if (
      !rebalanceData ||
      !rebalanceData.currentWeights ||
      !rebalanceData.targetWeights
    ) {
      return (
        <span className="text-gray-300 ml-2" title="Calculating drift...">
          -
        </span>
      );
    }

    // F2-6 Note: The API returns keys like "Stocks", "Bonds". We need to map the row's asset type.
    // If your API returns exactly what's in 'assetType', great. If not, you might need a mapping here.
    // For now, we'll try to look up the asset class based on a generic guess or fallback to symbol
    const assetClassKey = assetType || "Stocks"; // Fallback for safety

    const current = rebalanceData.currentWeights[assetClassKey] || 0;
    const target = rebalanceData.targetWeights[assetClassKey] || 0;
    const drift = current - target;

    // F2-6 Tailwind + CSS Tooltip implementation
    if (drift > 2) {
      // Overweight = Red Up Arrow
      return (
        <div className="group relative inline-block ml-2 cursor-help">
          <span className="text-red-500 font-bold">↑</span>
          <div className="opacity-0 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 group-hover:opacity-100 transition-opacity pointer-events-none">
            Drift: +{drift.toFixed(1)}% (Overweight)
          </div>
        </div>
      );
    } else if (drift < -2) {
      // Underweight = Green Down Arrow
      return (
        <div className="group relative inline-block ml-2 cursor-help">
          <span className="text-green-500 font-bold">↓</span>
          <div className="opacity-0 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 group-hover:opacity-100 transition-opacity pointer-events-none">
            Drift: {drift.toFixed(1)}% (Underweight)
          </div>
        </div>
      );
    } else {
      // Balanced = Gray Dash
      return (
        <div className="group relative inline-block ml-2 cursor-help">
          <span className="text-gray-400 font-bold">-</span>
          <div className="opacity-0 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 group-hover:opacity-100 transition-opacity pointer-events-none">
            Drift: {drift > 0 ? "+" : ""}
            {drift.toFixed(1)}% (Balanced)
          </div>
        </div>
      );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">Investments Table</h3>
        {onManagePositions && (
          <button
            onClick={onManagePositions}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Manage Positions
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Units
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Avg. Buy Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Current Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Market Value
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Gain/Loss
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {positions.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  No positions yet. Buy some assets to get started!
                </td>
              </tr>
            ) : (
              positions.map((pos, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-900">
                        {pos.symbol}
                      </span>
                      {/* INSERTING THE DRIFT INDICATOR HERE */}
                      {renderDriftIndicator(pos.symbol, pos.asset_type)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {pos.company_name || pos.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                    {pos.units}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                    ${formatCurrency(pos.avg_buy_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                    ${formatCurrency(pos.current_price)}
                    {pos.is_live && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800">
                        <span className="w-1.5 h-1.5 mr-1 bg-green-500 rounded-full animate-pulse"></span>
                        Live
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 font-medium">
                    ${formatCurrency(pos.market_value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span
                      className={`font-semibold ${pos.gain_loss >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      ${formatCurrency(Math.abs(pos.gain_loss))} (
                      {formatPercent(pos.gain_loss_percent)})
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => onSell && onSell(pos)}
                      className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
                    >
                      Sell
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 flex justify-center items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => onPageChange(i + 1)}
              className={`px-3 py-1 text-sm rounded ${
                currentPage === i + 1
                  ? "bg-teal-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default PositionsTable;
