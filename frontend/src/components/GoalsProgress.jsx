import React, { useContext } from "react";
import { ThemeContext } from "../context/Themecontext";

const GoalsProgress = () => {
  const { darkMode } = useContext(ThemeContext);

  const goals = [
    { id: 1, name: "Emergency Fund", progress: 70 },
    { id: 2, name: "Vacation", progress: 40 },
  ];

  return (
    <div
      className={`rounded-2xl shadow-sm border p-6 transition-all duration-300 ${
        darkMode
          ? "bg-gray-800 border-gray-700 text-white"
          : "bg-white border-gray-100 text-gray-900"
      }`}
    >
      <h3
        className={`text-lg font-semibold mb-6 ${
          darkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Goals Progress
      </h3>

      <div className="space-y-6">
        {goals.map((goal) => (
          <div key={goal.id}>
            <div className="flex justify-between mb-2">
              <span className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                {goal.name}
              </span>
              <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {goal.progress}%
              </span>
            </div>

            <div
              className={`w-full h-3 rounded-full overflow-hidden ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <div
                className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalsProgress;