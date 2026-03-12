import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function GoalsList() {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await api.get("/goals");
      setGoals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this goal?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/goals/${id}`);

      // Remove from UI without reload
      setGoals(goals.filter((goal) => goal.id !== id));
    } catch (err) {
      alert("Error deleting goal");
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400";
      case "paused":
        return "bg-yellow-500/20 text-yellow-400";
      case "completed":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="space-y-8 text-white">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Investment Goals
        </h1>

        <Link
          to="/goals/create"
          className="px-5 py-2 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition"
        >
          + Add Goal
        </Link>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-700 p-6">

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="border-b border-slate-700 text-slate-400">
              <tr>
                <th className="py-3">Type</th>
                <th>Target</th>
                <th>Date</th>
                <th>Monthly</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {goals.map((goal) => (
                <tr
                  key={goal.id}
                  className="border-b border-slate-800 hover:bg-slate-800/50 transition"
                >
                  <td className="py-4 capitalize">
                    {goal.goal_type}
                  </td>

                  <td>₹ {goal.target_amount}</td>
                  <td>{goal.target_date}</td>
                  <td>₹ {goal.monthly_contribution}</td>

                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                        goal.status
                      )}`}
                    >
                      {goal.status}
                    </span>
                  </td>

                  <td>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="text-red-400 hover:text-red-300 transition font-medium"
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default GoalsList;