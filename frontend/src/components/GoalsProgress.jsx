import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../context/Themecontext";
import API from "../services/api";

const GoalsProgress = () => {
  const { darkMode } = useContext(ThemeContext);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await API.get("/goals/");
        setGoals(res.data);
      } catch (err) {
        console.error("Failed to fetch goals", err);
      }
    };
    fetchGoals();
  }, []);

  return (
    <div className={`rounded-2xl shadow-sm border p-6 ${
      darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
    }`}>
      <h3 className={`text-lg font-semibold mb-6 ${
        darkMode ? "text-white" : "text-gray-900"
      }`}>
        Goals Progress
      </h3>

      <div className="space-y-6">
        {goals.length === 0 ? (
          <div className={`text-center py-8 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}>
            No goals found. Add a goal to track your progress!
          </div>
        ) : (
          goals.map(goal => {
            // Calculate progress using monthly contribution (what your Goals page uses)
            const progress = Math.min(
              (goal.monthly_contribution / goal.target_amount) * 100,
              100
            );
            
            return (
              <div key={goal.id}>
                <div className="flex justify-between mb-2">
                  <span className={`text-sm font-medium capitalize ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    {goal.goal_type}
                  </span>
                  <span className={`text-sm font-semibold ${
                    darkMode ? "text-indigo-400" : "text-indigo-600"
                  }`}>
                    {progress.toFixed(1)}%
                  </span>
                </div>

                <div className={`w-full h-3 rounded-full overflow-hidden ${
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                }`}>
                  <div
                    className="h-3 rounded-full bg-indigo-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex justify-between mt-1">
                  <span className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}>
                    Target: ₹{goal.target_amount?.toLocaleString()}
                  </span>
                  <span className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}>
                    Monthly: ₹{goal.monthly_contribution?.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GoalsProgress;