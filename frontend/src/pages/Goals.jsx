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

const API_URL = "http://127.0.0.1:8000";

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

  /* =========================
     FETCH GOALS FROM BACKEND
     ========================= */

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await fetch(`${API_URL}/goals/`);
      const data = await res.json();
      setGoals(data);
    } catch (err) {
      console.error("Error loading goals:", err);
    }
  };

  const formatINR = (num) => "₹" + Number(num || 0).toLocaleString("en-IN");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* =========================
     PROJECTION LOGIC
     ========================= */

  const previewProjection = () => {
    const target = parseFloat(formData.target);
    const contribution = parseFloat(formData.contribution);

    if (!target || !contribution) return;

    let monthly = contribution;

    if (formData.frequency === "Weekly") monthly = contribution * 4;
    if (formData.frequency === "Daily") monthly = contribution * 30;
    if (formData.frequency === "Yearly") monthly = contribution / 12;

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
    setRemaining(target - contribution);

    const today = new Date();
    const completion = new Date(today);
    completion.setMonth(today.getMonth() + month);
    setCompletionDate(completion.toDateString());

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

  /* =========================
     ADD GOAL → POST API
     ========================= */

  const addGoal = async () => {
    if (!formData.name) return;

    try {
      const res = await fetch(`${API_URL}/goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          target: parseFloat(formData.target),
          contribution: parseFloat(formData.contribution),
          frequency: formData.frequency,
        }),
      });

      const newGoal = await res.json();

      setGoals([...goals, newGoal]);

      setFormData({
        name: "",
        target: "",
        contribution: "",
        deadline: "",
        frequency: "Monthly",
      });
    } catch (err) {
      console.error("Error creating goal:", err);
    }
  };

  /* =========================
     DELETE GOAL → DELETE API
     ========================= */

  const deleteGoal = async (goalId) => {
    try {
      await fetch(`${API_URL}/goals/${goalId}`, {
        method: "DELETE",
      });

      setGoals(goals.filter((g) => g.id !== goalId));
    } catch (err) {
      console.error("Error deleting goal:", err);
    }
  };

  /* =========================
     SUMMARY
     ========================= */

  const totalGoals = goals.length;

  const completedGoals = goals.filter((g) => g.progress >= 100).length;

  const avgProgress =
    goals.length > 0
      ? (
          goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length
        ).toFixed(1)
      : 0;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Goals Dashboard</h1>

      {/* SUMMARY */}

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

      {/* GOALS LIST */}

      <div className="bg-white border rounded-lg p-6 shadow">
        <h2 className="font-semibold mb-4">Your Goals</h2>

        {goals.length === 0 && (
          <p className="text-gray-500 text-sm">No goals added yet.</p>
        )}

        {goals.map((goal) => (
          <div key={goal.id} className="border p-4 rounded mb-3">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{goal.name}</p>

                <p className="text-sm text-gray-500">
                  Target: {formatINR(goal.target)}
                </p>

                <p className="text-sm text-gray-500">
                  Contribution: {formatINR(goal.contribution)} {goal.frequency}
                </p>
              </div>

              <button
                onClick={() => deleteGoal(goal.id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Goals;
