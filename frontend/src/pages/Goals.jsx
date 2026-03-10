import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getGoals, addGoal, deleteGoal } from '../services/goalService';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    goal_type: '',
    target_amount: '',
    target_date: '',
    monthly_contribution: ''
  });

  const fetchGoals = async () => {
    try {
      const data = await getGoals();
      setGoals(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addGoal({
        ...formData,
        target_amount: parseInt(formData.target_amount),
        monthly_contribution: parseInt(formData.monthly_contribution)
      });
      setFormData({ goal_type: '', target_amount: '', target_date: '', monthly_contribution: '' });
      setShowForm(false);
      fetchGoals();
    } catch (err) { alert("Error adding goal"); }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="ml-64 p-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Financial Goals</h1>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg"
          >
            {showForm ? 'Cancel' : '+ New Goal'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 animate-in fade-in duration-300">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input 
                type="text" placeholder="Goal (e.g. New Car)" required
                className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.goal_type}
                onChange={(e) => setFormData({...formData, goal_type: e.target.value})}
              />
              <input 
                type="number" placeholder="Target Amount" required
                className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.target_amount}
                onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
              />
              <input 
                type="date" required
                className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.target_date}
                onChange={(e) => setFormData({...formData, target_date: e.target.value})}
              />
              <input 
                type="number" placeholder="Monthly Save" required
                className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.monthly_contribution}
                onChange={(e) => setFormData({...formData, monthly_contribution: e.target.value})}
              />
              <button className="md:col-span-4 bg-blue-600 text-white py-2 rounded-lg font-bold">Save Goal</button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                  {goal.status || 'Active'}
                </span>
                <button onClick={() => deleteGoal(goal.id).then(fetchGoals)} className="text-gray-400 hover:text-red-500">✕</button>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{goal.goal_type}</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Target Amount</span>
                  <span className="font-bold">₹{goal.target_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Monthly Target</span>
                  <span className="text-blue-600 font-bold">₹{goal.monthly_contribution.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm pb-2 border-b">
                  <span className="text-gray-500">Target Date</span>
                  <span>{new Date(goal.target_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
          {goals.length === 0 && !showForm && (
            <p className="col-span-full text-center py-10 text-gray-400 italic border-2 border-dashed rounded-2xl">
              No goals set yet. Start dreaming big!
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Goals;