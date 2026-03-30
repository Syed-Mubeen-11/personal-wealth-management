import React from "react";

const SuggestionCard = ({
  action,
  symbol,
  quantity,
  estimatedValue,
  driftImpact,
}) => {
  // Safety: Force all values to be numbers to avoid NaN errors
  const val = Number(estimatedValue) || 0;
  const impact = Number(driftImpact) || 0;
  const qty = Number(quantity) || 0;

  const displayAction = action?.toUpperCase() || "ACTION REQUIRED";
  const isBuy =
    displayAction.includes("INCREASE") || displayAction.includes("BUY");

  return (
    <div className="flex items-center justify-between p-4 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full ${
            isBuy ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {displayAction}
        </span>
        <div>
          <p className="font-bold text-gray-900">{symbol || "Asset"}</p>
          <p className="text-sm text-gray-500">{qty} units</p>
        </div>
      </div>

      <div className="text-right">
        <p className="font-bold text-[#1B3C53]">
          $
          {val.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="text-xs text-gray-500">
          Impact:{" "}
          <span
            className={`font-semibold ${impact >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {impact > 0 ? "+" : ""}
            {impact}%
          </span>
        </p>
      </div>
    </div>
  );
};

export default SuggestionCard;
