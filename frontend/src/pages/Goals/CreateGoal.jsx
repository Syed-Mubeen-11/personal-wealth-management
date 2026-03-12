import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function CreateGoal() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    goal_type: "",
    target_amount: "",
    target_date: "",
    monthly_contribution: "",
    status: "active",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post("/goals", formData);

      navigate("/goals");
    } catch (err) {
      alert("Error creating goal");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-white">

      <h1 className="text-3xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Create New Goal
      </h1>

      <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-700 max-w-2xl">

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Goal Type */}
          <div>
            <label className="block text-slate-400 mb-2">Goal Type</label>
            <input
              type="text"
              name="goal_type"
              required
              placeholder="e.g. Retirement, Home, Education"
              className="w-full bg-transparent border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={handleChange}
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-slate-400 mb-2">Target Amount</label>
            <input
              type="number"
              name="target_amount"
              required
              placeholder="Enter target amount"
              className="w-full bg-transparent border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={handleChange}
            />
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-slate-400 mb-2">Target Date</label>
            <input
              type="date"
              name="target_date"
              required
              className="w-full bg-transparent border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={handleChange}
            />
          </div>

          {/* Monthly Contribution */}
          <div>
            <label className="block text-slate-400 mb-2">
              Monthly Contribution
            </label>
            <input
              type="number"
              name="monthly_contribution"
              required
              placeholder="Enter monthly contribution"
              className="w-full bg-transparent border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={handleChange}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-purple-600 to-indigo-600 py-3 rounded-xl font-semibold hover:from-purple-500 hover:to-indigo-500 transition"
          >
            {loading ? "Creating..." : "Create Goal"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default CreateGoal;