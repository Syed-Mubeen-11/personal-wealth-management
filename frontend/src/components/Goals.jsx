import React, { useState } from "react";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [goalType, setGoalType] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");

  const handleAddGoal = (e) => {
    e.preventDefault();

    const newGoal = {
      id: Date.now(),
      goalType,
      targetAmount: Number(targetAmount),
      monthlyContribution: Number(monthlyContribution),
      saved: 0
    };

    setGoals([...goals, newGoal]);

    setGoalType("");
    setTargetAmount("");
    setMonthlyContribution("");
  };

  const handleAddMonth = (id) => {
    const updatedGoals = goals.map((goal) => {
      if (goal.id === id) {
        return {
          ...goal,
          saved: goal.saved + goal.monthlyContribution
        };
      }
      return goal;
    });

    setGoals(updatedGoals);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-purple-700 mb-6">
        Financial Goals 🎯
      </h2>

      {/* Create Goal */}
      <div className="bg-gradient-to-r from-sky-100 to-purple-100 p-6 rounded-2xl shadow mb-8">
        <h3 className="text-lg font-semibold mb-4 text-purple-700">
          Create New Goal
        </h3>

        <form onSubmit={handleAddGoal} className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Goal Type (Car, House...)"
            value={goalType}
            onChange={(e) => setGoalType(e.target.value)}
            className="p-3 rounded-lg border"
            required
          />

          <input
            type="number"
            placeholder="Target Amount"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className="p-3 rounded-lg border"
            required
          />

          <input
            type="number"
            placeholder="Monthly Contribution"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            className="p-3 rounded-lg border"
            required
          />

          <button
            type="submit"
            className="col-span-3 bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700"
          >
            Add Goal
          </button>
        </form>
      </div>

      {/* Goal Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = Math.min(
            (goal.saved / goal.targetAmount) * 100,
            100
          );

          return (
            <div
              key={goal.id}
              className="bg-white p-6 rounded-2xl shadow-lg border"
            >
              <h3 className="text-xl font-bold text-purple-700 mb-2">
                {goal.goalType}
              </h3>

              <p className="text-gray-600">
                Target: ₹{goal.targetAmount.toLocaleString()}
              </p>

              <p className="text-gray-600 mb-3">
                Saved: ₹{goal.saved.toLocaleString()}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Progress: {progress.toFixed(1)}%
              </p>

              <button
                onClick={() => handleAddMonth(goal.id)}
                className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600"
              >
                Add Monthly Contribution
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Goals;