import React, { useContext } from "react";
import { ThemeContext } from "../context/Themecontext";

const SummaryCard = ({ title, value }) => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div
      className={`rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border group ${
        darkMode
          ? "bg-gray-800 border-gray-700 text-white"
          : "bg-white border-gray-100 text-gray-900"
      }`}
    >
      {/* Title */}
      <p className={`text-sm mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
        {title}
      </p>

      {/* Value + Growth */}
      <div className="flex items-end justify-between">
        <h3 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
          {value}
        </h3>

        {/* <span className="text-sm font-medium text-emerald-500 group-hover:translate-x-1 transition">
          +2.4%
        </span> */}
      </div>
    </div>
  );
};

export default SummaryCard;