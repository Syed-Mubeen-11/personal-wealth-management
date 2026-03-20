import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import api from "../api";

function Goals() {
  const [formData, setFormData] = useState({
    name: "",
    target: "",
    contribution: "",
    deadline: "",
    frequency: "Monthly",
  });

  const [goals, setGoals] = useState([]);
  const [chartData, setChartData] = useState([]);

  const [months, setMonths] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [completionDate, setCompletionDate] = useState("");

  const [suggestedContribution, setSuggestedContribution] = useState(0);
  const [suggestedLabel, setSuggestedLabel] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  /* Load goals from backend API */
  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/goals');
      // Map backend response to frontend format
      const mapped = (res.data.data || res.data || []).map(g => ({
        id: g.id,
        name: g.goal_name,
        target: g.target_amount,
        contribution: g.monthly_contribution,
        deadline: g.target_date,
        frequency: "Monthly",
        progress: g.monthly_contribution && g.target_amount 
          ? Math.min(100, (g.monthly_contribution / g.target_amount) * 100)
          : 0
      }));
      setGoals(mapped);
    } catch (err) {
      console.error("Failed to load goals from API:", err);
      // Fallback to localStorage if API fails
      const stored = localStorage.getItem("goals");
      if (stored) setGoals(JSON.parse(stored));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const formatINR = (num) => "₹" + Number(num || 0).toLocaleString("en-IN");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* Projection logic */

  const previewProjection = async () => {
    const target = parseFloat(formData.target);
    const contribution = parseFloat(formData.contribution);

    if (!target || !contribution || target <= 0 || contribution <= 0) {
      alert("Enter valid positive values for target and contribution.");
      return;
    }

    let monthly = contribution;

    if (formData.frequency === "Weekly") monthly = contribution * 4;
    if (formData.frequency === "Daily") monthly = contribution * 30;
    if (formData.frequency === "Yearly") monthly = contribution / 12;

    const today = new Date();

    try {
      let targetYears = null;
      if (formData.deadline) {
        const deadline = new Date(formData.deadline);
        const monthsLeft =
          (deadline.getFullYear() - today.getFullYear()) * 12 +
          (deadline.getMonth() - today.getMonth());
        if (monthsLeft > 0) {
          targetYears = Math.max(1, Math.ceil(monthsLeft / 12));
        }
      }

      const response = await api.post('/api/simulations/calculate/goal', {
        target_amount: target,
        current_savings: 0,
        monthly_contribution: monthly,
        expected_return_rate: 8,
        target_years: targetYears,
      });

      const result = response.data || {};
      const yearly = result.yearly_projections || [];
      const data = yearly.map((item) => ({
        month: Number(item.year || 0) * 12,
        value: Number(item.total_value || 0),
      }));

      setChartData(data);
      setMonths(result.months_to_goal || (targetYears ? targetYears * 12 : 0));
      setRemaining(Math.max(0, Number(target - (result.projected_value || 0))));

      const completion = new Date(today);
      completion.setMonth(today.getMonth() + (result.months_to_goal || 0));
      setCompletionDate(result.months_to_goal ? completion.toDateString() : "-");
    } catch (err) {
      console.error('Goal simulation preview failed, using local fallback:', err);

      let savings = 0;
      let data = [];
      let month = 0;

      while (savings < target && month < 600) {
        month++;
        savings += monthly;
        data.push({
          month,
          value: savings,
        });
      }

      setChartData(data);
      setMonths(month);
      setRemaining(Math.max(0, target - savings));

      const completion = new Date(today);
      completion.setMonth(today.getMonth() + month);
      setCompletionDate(completion.toDateString());
    }

    /* Suggested contribution */

    if (formData.deadline) {
      const deadline = new Date(formData.deadline);

      const monthsLeft =
        (deadline.getFullYear() - today.getFullYear()) * 12 +
        (deadline.getMonth() - today.getMonth());

      if (monthsLeft > 0) {
        let requiredMonthly = target / monthsLeft;

        let suggestion = requiredMonthly;
        let label = "Monthly";

        if (formData.frequency === "Weekly") {
          suggestion = requiredMonthly / 4;
          label = "Weekly";
        }

        if (formData.frequency === "Daily") {
          suggestion = requiredMonthly / 30;
          label = "Daily";
        }

        if (formData.frequency === "Yearly") {
          suggestion = requiredMonthly * 12;
          label = "Yearly";
        }

        setSuggestedContribution(Math.round(suggestion));
        setSuggestedLabel(label);
      }
    }
  };

  /* Add goal - POST to backend API */

  const addGoal = async () => {
    if (!formData.name) return;

    const exists = goals.find(
      (g) => g.name.toLowerCase() === formData.name.toLowerCase(),
    );

    if (exists) {
      alert("Goal already exists");
      return;
    }

    // Calculate monthly contribution based on frequency
    let monthlyContrib = parseFloat(formData.contribution) || 0;
    if (formData.frequency === "Weekly") monthlyContrib = monthlyContrib * 4;
    if (formData.frequency === "Daily") monthlyContrib = monthlyContrib * 30;
    if (formData.frequency === "Yearly") monthlyContrib = monthlyContrib / 12;

    const payload = {
      goal_name: formData.name,
      goal_type: "custom",
      target_amount: parseFloat(formData.target) || 0,
      target_date: formData.deadline || null,
      monthly_contribution: monthlyContrib,
      status: "active"
    };

    try {
      console.log("Creating goal with payload:", payload);
      const res = await api.post('/goals', payload);
      console.log("Goal created:", res.data);
      
      // Refresh goals from backend
      await fetchGoals();
      
      setFormData({
        name: "",
        target: "",
        contribution: "",
        deadline: "",
        frequency: "Monthly",
      });
      
      alert("Goal saved successfully!");
    } catch (err) {
      console.error("Failed to create goal:", err.response?.data || err.message);
      alert(`Failed to save goal: ${err.response?.data?.detail || err.message}`);
    }
  };

  /* Delete goal - DELETE from backend API */

  const deleteGoal = async (index) => {
    const goal = goals[index];
    if (!goal) return;

    if (goal.id) {
      try {
        await api.delete(`/goals/${goal.id}`);
        console.log("Goal deleted from database");
      } catch (err) {
        console.error("Failed to delete goal:", err.response?.data || err.message);
        alert(`Failed to delete: ${err.response?.data?.detail || err.message}`);
        return;
      }
    }
    
    const updated = [...goals];
    updated.splice(index, 1);
    setGoals(updated);
  };

  /* Summary */

  const totalGoals = goals.length;

  const completedGoals = goals.filter((g) => g.progress >= 100).length;

  const avgProgress =
    goals.length > 0
      ? (goals.reduce((sum, g) => sum + g.progress, 0) / goals.length).toFixed(
          1,
        )
      : 0;

  if (isLoading) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-blue-800 font-bold">Loading your goals...</p>
          </div>
      );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Goals Dashboard</h1>

      {/* Summary cards */}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow border">
          <p className="text-sm text-gray-500">Total Goals</p>
          <p className="text-xl font-bold">{totalGoals}</p>
        </div>

        <div className="bg-white p-4 rounded shadow border">
          <p className="text-sm text-gray-500">Completed Goals</p>
          <p className="text-xl font-bold text-green-600">{completedGoals}</p>
        </div>

        <div className="bg-white p-4 rounded shadow border">
          <p className="text-sm text-gray-500">Average Progress</p>
          <p className="text-xl font-bold">{avgProgress}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL */}

        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Create Goal */}

          <div className="bg-white border rounded-lg p-6 shadow">
            <h2 className="font-semibold mb-4">Create Goal</h2>

            <input
              type="text"
              name="name"
              placeholder="Goal Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border p-3 rounded mb-3"
            />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="number"
                name="target"
                placeholder="Target Amount"
                value={formData.target}
                onChange={handleChange}
                className="border p-3 rounded"
              />

              <input
                type="number"
                name="contribution"
                placeholder="Contribution"
                value={formData.contribution}
                onChange={handleChange}
                className="border p-3 rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="border p-3 rounded"
              />

              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="border p-3 rounded"
              >
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </div>

            <button
              onClick={previewProjection}
              className="w-full bg-blue-600 text-white py-3 rounded mb-2"
            >
              Preview Projection
            </button>

            <button
              onClick={addGoal}
              className="w-full bg-green-600 text-white py-3 rounded"
            >
              Add Goal
            </button>
          </div>

          {/* Goals list */}

          <div className="bg-white border rounded-lg p-6 shadow">
            <h2 className="font-semibold mb-4">Your Goals</h2>

            {goals.length === 0 && (
              <p className="text-gray-500 text-sm">No goals added yet.</p>
            )}

            {goals.map((goal, index) => (
              <div key={index} className="border p-4 rounded mb-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{goal.name}</p>

                    <p className="text-sm text-gray-500">
                      Target: {formatINR(goal.target)}
                    </p>

                    <p className="text-sm text-gray-500">
                      Contribution: {formatINR(goal.contribution)}{" "}
                      {goal.frequency}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteGoal(index)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </div>

                <div className="w-full bg-gray-200 h-3 rounded mt-2">
                  <div
                    className="bg-green-500 h-3 rounded"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>

                <p className="text-sm mt-1">
                  {goal.progress.toFixed(1)}% complete
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}

        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border rounded p-4">
              <p className="text-sm text-gray-500">Estimated Months</p>
              <p className="text-xl font-bold">{months}</p>
            </div>

            <div className="bg-white border rounded p-4">
              <p className="text-sm text-gray-500">Remaining Amount</p>
              <p className="text-xl font-bold text-red-500">
                {formatINR(remaining)}
              </p>
            </div>

            <div className="bg-white border rounded p-4 col-span-2">
              <p className="text-sm text-gray-500">Estimated Completion Date</p>
              <p className="text-lg font-bold">{completionDate || "-"}</p>
            </div>

            <div className="bg-white border rounded p-4 col-span-2">
              <p className="text-sm text-gray-500">
                Suggested {suggestedLabel} Contribution
              </p>
              <p className="text-xl font-bold text-green-600">
                {suggestedContribution ? formatINR(suggestedContribution) : "-"}
              </p>
            </div>
          </div>

          {/* Chart */}

          <div className="bg-white border rounded p-5 shadow">
            <h3 className="font-semibold mb-3">Savings Projection</h3>

            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="month"
                  label={{
                    value: "Months",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />

                <YAxis />

                <Tooltip formatter={(v) => formatINR(v)} />

                <ReferenceLine
                  y={formData.target}
                  stroke="red"
                  strokeDasharray="5 5"
                />

                <Line dataKey="value" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {goals.length > 1 && (
            <div className="bg-white border rounded p-5 shadow">
              <h3 className="font-semibold mb-3">Goal Comparison</h3>

              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={goals.map((g, i) => ({
                    name: g.name + " " + (i + 1),
                    progress: g.progress,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip />

                  <Bar dataKey="progress" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Goals;
