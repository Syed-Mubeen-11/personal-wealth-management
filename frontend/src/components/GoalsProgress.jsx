import React from "react";

const GoalsProgress = () => {
  const goals = [
    { id: 1, name: "Emergency Fund", progress: 70 },
    { id: 2, name: "Vacation", progress: 40 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Goals Progress
      </h3>

      <div className="space-y-6">
        {goals.map((goal) => (
          <div key={goal.id}>
            
            <div className="flex justify-between mb-2">
              <span className="text-gray-700 font-medium">
                {goal.name}
              </span>
              <span className="text-sm text-gray-500">
                {goal.progress}%
              </span>
            </div>

            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
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
