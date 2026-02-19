import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GoalTracker() {
  const [goals, setGoals] = useState([]);
  const [targetName, setTargetName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  const fetchGoals = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/goals/progress/');
      setGoals(response.data);
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const addGoal = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/goals/', {
        target_name: targetName,
        target_amount: parseFloat(targetAmount)
      });
      setTargetName('');
      setTargetAmount('');
      fetchGoals();
    } catch (error) {
      alert("Please login first!");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Goal Tracker</h1>
      
      <form onSubmit={addGoal} className="bg-white p-6 rounded shadow-md mb-8 flex gap-4">
        <input 
          type="text" placeholder="Goal Name (e.g. Car)" 
          value={targetName} onChange={(e) => setTargetName(e.target.value)}
          className="border p-2 flex-1 rounded" required 
        />
        <input 
          type="number" placeholder="Target Amount" 
          value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)}
          className="border p-2 w-32 rounded" required 
        />
        <button className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700">Add Goal</button>
      </form>

      <div className="space-y-4">
        {goals.map((goal, index) => (
          <div key={index} className="bg-white p-6 rounded shadow border">
            <div className="flex justify-between mb-2">
              <span className="font-bold text-lg">{goal.target_name}</span>
              <span className="text-gray-600">${goal.current_balance} / ${goal.target_amount}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-green-500 h-4 rounded-full transition-all duration-500" 
                style={{ width: `${goal.percent_complete}%` }}
              ></div>
            </div>
            <p className="text-right text-sm mt-1 text-green-600 font-bold">{goal.percent_complete}% Complete</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GoalTracker;