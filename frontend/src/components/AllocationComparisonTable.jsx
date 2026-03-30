import React from "react";

const AllocationComparisonTable = ({
  currentWeights = {},
  targetWeights = {},
}) => {
  // Helper to normalize names (e.g., "Stocks" and "Stock" become the same)
  const normalize = (name) => name.toLowerCase().replace(/s$/, "");

  // Combine all unique categories from both objects
  const assetClasses = [
    ...new Set([...Object.keys(currentWeights), ...Object.keys(targetWeights)]),
  ];

  let rows = assetClasses.map((asset) => {
    const current = currentWeights[asset] || 0;

    // Find the target value even if the backend name is slightly different
    const targetKey = Object.keys(targetWeights).find(
      (tk) => normalize(tk) === normalize(asset),
    );
    const target = targetWeights[targetKey] || 0;

    const drift = current - target;
    return { asset, current, target, drift };
  });

  // Sort by biggest drift first
  rows.sort((a, b) => Math.abs(b.drift) - Math.abs(a.drift));

  const getDriftColor = (drift) => {
    if (drift > 2) return "bg-red-100 text-red-800";
    if (drift < -2) return "bg-green-100 text-green-800";
    return "bg-gray-50 text-gray-600";
  };

  if (rows.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-4">
        No allocation data available yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm mb-6">
      <table className="min-w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-[#1B3C53] text-white">
          <tr>
            <th className="px-4 py-3 font-semibold">Asset Class</th>
            <th className="px-4 py-3 font-semibold">Current %</th>
            <th className="px-4 py-3 font-semibold">Target %</th>
            <th className="px-4 py-3 font-semibold">Drift %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {rows.map((row) => (
            <tr key={row.asset} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900 capitalize">
                {row.asset}
              </td>
              <td className="px-4 py-3">{Number(row.current).toFixed(1)}%</td>
              <td className="px-4 py-3">{Number(row.target).toFixed(1)}%</td>
              <td className={`px-4 py-3 font-bold ${getDriftColor(row.drift)}`}>
                {row.drift > 0 ? "+" : ""}
                {row.drift.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllocationComparisonTable;
