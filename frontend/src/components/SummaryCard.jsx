import React from "react";

const SummaryCard = ({ title, value }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group">
      
      <p className="text-sm text-gray-500 mb-2">
        {title}
      </p>

      <div className="flex items-end justify-between">
        <h3 className="text-2xl font-bold text-gray-900">
          {value}
        </h3>

        {/* Small growth indicator */}
        <span className="text-sm font-medium text-emerald-500 group-hover:translate-x-1 transition">
          +2.4%
        </span>
      </div>

    </div>
  );
};

export default SummaryCard;
