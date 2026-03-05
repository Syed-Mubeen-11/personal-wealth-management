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

function Goals() {
<<<<<<< HEAD
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

  /* Load stored goals */

  useEffect(() => {
    const stored = localStorage.getItem("goals");
    if (stored) setGoals(JSON.parse(stored));
  }, []);

  /* Save goals */

  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals));
  }, [goals]);

  const formatINR = (num) => "₹" + Number(num || 0).toLocaleString("en-IN");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* Projection logic */

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

  /* Add goal */

  const addGoal = () => {
    if (!formData.name) return;

    const exists = goals.find(
      (g) => g.name.toLowerCase() === formData.name.toLowerCase(),
=======
    // State Variables
    const [goals, setGoals] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedGoals, setSelectedGoals] = useState([]);
    
    // Form state for Add/Edit modal
    const [formData, setFormData] = useState({
        goal_name: '',
        goal_type: 'custom',
        target_amount: '',
        target_date: '',
        monthly_contribution: '',
        status: 'active'
    });
    const [editingGoalId, setEditingGoalId] = useState(null);

    // Goal type and status options
    const goalTypes = ['retirement', 'home', 'education', 'custom', 'travel'];
    const goalStatuses = ['active', 'paused', 'completed'];

    // Fetch goals when page, search, or filters change
    useEffect(() => {
        fetchGoals();
    }, [currentPage, searchTerm, filterStatus, filterType]);

    const fetchGoals = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', currentPage);
            params.append('limit', 5);
            if (searchTerm) params.append('search', searchTerm);
            if (filterStatus) params.append('status', filterStatus);
            if (filterType) params.append('type', filterType);

            const res = await api.get(`/goals?${params.toString()}`);
            setGoals(res.data.data);
            setTotalPages(res.data.total_pages);
        } catch (err) {
            console.error("Failed to fetch goals", err);
        }
        setLoading(false);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    const handleStatusFilterChange = (e) => {
        setFilterStatus(e.target.value);
        setCurrentPage(1);
    };

    const handleTypeFilterChange = (e) => {
        setFilterType(e.target.value);
        setCurrentPage(1);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openAddModal = () => {
        setFormData({
            goal_name: '',
            goal_type: 'custom',
            target_amount: '',
            target_date: '',
            monthly_contribution: '',
            status: 'active'
        });
        setEditingGoalId(null);
        setShowModal(true);
    };

    const openEditModal = (goal) => {
        setFormData({
            goal_name: goal.goal_name,
            goal_type: goal.goal_type,
            target_amount: goal.target_amount,
            target_date: goal.target_date || '',
            monthly_contribution: goal.monthly_contribution,
            status: goal.status
        });
        setEditingGoalId(goal.id);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                target_amount: parseFloat(formData.target_amount) || 0,
                monthly_contribution: parseFloat(formData.monthly_contribution) || 0
            };

            if (editingGoalId) {
                await api.put(`/goals/${editingGoalId}`, payload);
            } else {
                await api.post('/goals', payload);
            }
            setShowModal(false);
            fetchGoals();
        } catch (err) {
            alert("Failed to save goal.");
            console.error(err);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this goal?")) return;
        try {
            await api.delete(`/goals/${id}`);
            fetchGoals();
        } catch (err) {
            alert("Failed to delete goal.");
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedGoals(goals.map(g => g.id));
        } else {
            setSelectedGoals([]);
        }
    };

    const handleSelectGoal = (id) => {
        if (selectedGoals.includes(id)) {
            setSelectedGoals(selectedGoals.filter(gId => gId !== id));
        } else {
            setSelectedGoals([...selectedGoals, id]);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            active: 'bg-green-100 text-green-800',
            paused: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-blue-100 text-blue-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    const getTypePill = (type) => {
        return (
            <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium capitalize">
                {type}
            </span>
        );
    };

    // Pagination handlers
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const renderPaginationButtons = () => {
        const buttons = [];
        for (let i = 1; i <= totalPages; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => goToPage(i)}
                    className={`px-3 py-1 mx-1 rounded ${currentPage === i ? 'bg-[#1B3C53] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    {i}
                </button>
            );
        }
        return buttons;
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[#1B3C53]">Financial Goals</h1>
            </div>

            {/* Header Controls */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-4 items-center">
                        {/* Search Input */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search goals..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-[#234C6A] outline-none"
                            />
                            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Status Filter */}
                        <select
                            value={filterStatus}
                            onChange={handleStatusFilterChange}
                            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#234C6A] outline-none"
                        >
                            <option value="">All Statuses</option>
                            {goalStatuses.map(status => (
                                <option key={status} value={status} className="capitalize">{status}</option>
                            ))}
                        </select>

                        {/* Type Filter */}
                        <select
                            value={filterType}
                            onChange={handleTypeFilterChange}
                            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#234C6A] outline-none"
                        >
                            <option value="">All Types</option>
                            {goalTypes.map(type => (
                                <option key={type} value={type} className="capitalize">{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Add Goal Button */}
                    <button
                        onClick={openAddModal}
                        className="bg-[#1B3C53] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#234C6A] transition flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Goal
                    </button>
                </div>
            </div>

            {/* Goals Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedGoals.length === goals.length && goals.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Goal Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Target Amount</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Target Date</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Monthly Contribution</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : goals.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                        No goals found. Click "+ Add Goal" to create one.
                                    </td>
                                </tr>
                            ) : (
                                goals.map((goal) => (
                                    <tr key={goal.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedGoals.includes(goal.id)}
                                                onChange={() => handleSelectGoal(goal.id)}
                                                className="rounded border-gray-300"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{goal.goal_name}</td>
                                        <td className="px-4 py-3">{getTypePill(goal.goal_type)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(goal.target_amount)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{formatDate(goal.target_date)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(goal.monthly_contribution)}</td>
                                        <td className="px-4 py-3">{getStatusBadge(goal.status)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(goal)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(goal.id)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 0 && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Previous
                            </button>
                            {renderPaginationButtons()}
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Goal Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[#1B3C53]">
                                {editingGoalId ? 'Edit Goal' : 'Add New Goal'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name *</label>
                                <input
                                    type="text"
                                    name="goal_name"
                                    value={formData.goal_name}
                                    onChange={handleFormChange}
                                    required
                                    placeholder="e.g., Retirement Fund"
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#234C6A] outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Goal Type</label>
                                    <select
                                        name="goal_type"
                                        value={formData.goal_type}
                                        onChange={handleFormChange}
                                        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#234C6A] outline-none"
                                    >
                                        {goalTypes.map(type => (
                                            <option key={type} value={type} className="capitalize">{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleFormChange}
                                        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#234C6A] outline-none"
                                    >
                                        {goalStatuses.map(status => (
                                            <option key={status} value={status} className="capitalize">{status}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount ($) *</label>
                                <input
                                    type="number"
                                    name="target_amount"
                                    value={formData.target_amount}
                                    onChange={handleFormChange}
                                    required
                                    step="0.01"
                                    min="0"
                                    placeholder="1500000.00"
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#234C6A] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                                <input
                                    type="date"
                                    name="target_date"
                                    value={formData.target_date}
                                    onChange={handleFormChange}
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#234C6A] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Contribution ($)</label>
                                <input
                                    type="number"
                                    name="monthly_contribution"
                                    value={formData.monthly_contribution}
                                    onChange={handleFormChange}
                                    step="0.01"
                                    min="0"
                                    placeholder="500.00"
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#234C6A] outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-[#1B3C53] text-white rounded-lg hover:bg-[#234C6A] disabled:bg-gray-400"
                                >
                                    {loading ? 'Saving...' : (editingGoalId ? 'Update Goal' : 'Create Goal')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
>>>>>>> ad43553ea46cf5f625624fe6f951d1b9debc0b58
    );

    if (exists) {
      alert("Goal already exists");
      return;
    }

    const progress = (formData.contribution / formData.target) * 100;

    const newGoal = {
      name: formData.name,
      target: formData.target,
      contribution: formData.contribution,
      frequency: formData.frequency,
      progress: progress > 100 ? 100 : progress,
    };

    setGoals([...goals, newGoal]);

    setFormData({
      name: "",
      target: "",
      contribution: "",
      deadline: "",
      frequency: "Monthly",
    });
  };

  /* Delete goal */

  const deleteGoal = (index) => {
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

<<<<<<< HEAD
export default Goals;
=======
export default Goals;
>>>>>>> ad43553ea46cf5f625624fe6f951d1b9debc0b58
