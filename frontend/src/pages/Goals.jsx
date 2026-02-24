import React, { useState, useEffect } from 'react';
import api from '../api';

function Goals() {
    const [goals, setGoals] = useState([]);
    const [formData, setFormData] = useState({ target_name: '', target_amount: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => { fetchGoals(); }, []);

    const fetchGoals = async () => {
        try {
            const res = await api.get('/goals/progress/');
            setGoals(res.data);
        } catch (err) { console.error("Failed to fetch goals"); }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/goals/', formData);
            alert("Goal Added Successfully!");
            setFormData({ target_name: '', target_amount: '' });
            fetchGoals();
        } catch (err) { alert("Failed to add goal."); }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Delete this goal?")) return;
        try {
            await api.delete(`/goals/${id}`);
            fetchGoals();
        } catch (err) { alert("Failed to delete goal."); }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-[#1B3C53] mb-8">Financial Goals</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                <h2 className="text-xl font-bold text-[#1B3C53] mb-4">Set a New Goal</h2>
                <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Goal Name</label>
                        <input type="text" name="target_name" required placeholder="e.g. Dream Car" value={formData.target_name} onChange={handleChange} className="w-full border p-3 rounded bg-gray-50 focus:ring-2 focus:ring-[#234C6A] outline-none" />
                    </div>
                    <div className="w-48">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Target Amount ($)</label>
                        <input type="number" name="target_amount" required placeholder="5000" value={formData.target_amount} onChange={handleChange} className="w-full border p-3 rounded bg-gray-50 focus:ring-2 focus:ring-[#234C6A] outline-none" />
                    </div>
                    <button type="submit" disabled={loading} className="bg-[#1B3C53] text-white px-6 py-3 rounded font-bold hover:bg-[#234C6A] transition">
                        {loading ? "..." : "+ Add Goal"}
                    </button>
                </form>
            </div>

            <div className="grid gap-6">
                {goals.map((goal) => (
                    <div key={goal.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-bold text-gray-800">{goal.target_name}</h3>
                            <button onClick={() => handleDelete(goal.id)} className="text-red-500 text-sm hover:underline font-bold">Delete</button>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Current Savings: ${goal.current_balance?.toLocaleString()}</span>
                            <span>Target: ${goal.target_amount?.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div className={`h-4 rounded-full transition-all duration-500 ${goal.percent_complete >= 100 ? 'bg-green-500' : 'bg-[#234C6A]'}`} style={{ width: `${goal.percent_complete}%` }}></div>
                        </div>
                        <p className="text-right text-xs text-gray-500 mt-1 font-bold">{goal.percent_complete}% Completed</p>
                    </div>
                ))}
                {goals.length === 0 && <p className="text-center text-gray-500 mt-4 italic">No goals set yet. Add one above!</p>}
            </div>
        </div>
    );
}
export default Goals;