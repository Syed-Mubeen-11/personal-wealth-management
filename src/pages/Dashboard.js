import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [income] = useState(50000);
  const [expenses] = useState(20000);
  const savings = income - expenses;
  const progress = 60;

  useEffect(() => {
    const storedUser = localStorage.getItem("username");

    if (!storedUser) {
      navigate("/"); // redirect if not logged in
    } else {
      setUsername(storedUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-purple-200 to-purple-400 p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-purple-700">
          Welcome, {username} 👋
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-gray-500">Total Income</h2>
          <p className="text-2xl font-bold text-green-600">₹{income}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-gray-500">Total Expenses</h2>
          <p className="text-2xl font-bold text-red-600">₹{expenses}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-gray-500">Savings</h2>
          <p className="text-2xl font-bold text-blue-600">₹{savings}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-gray-500">Remaining Balance</h2>
          <p className="text-2xl font-bold text-purple-600">₹{savings}</p>
        </div>
      </div>

      {/* Add Transaction */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
        <h2 className="text-xl font-bold mb-4 text-purple-700">
          Add Transaction
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          <input
            type="number"
            placeholder="Amount"
            className="border p-2 rounded-lg"
          />
          <select className="border p-2 rounded-lg">
            <option>Income</option>
            <option>Expense</option>
          </select>
          <input
            type="text"
            placeholder="Category"
            className="border p-2 rounded-lg"
          />
          <button className="bg-purple-600 text-white rounded-lg px-4">
            Add
          </button>
        </div>
      </div>

      {/* Goal Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
        <h2 className="text-xl font-bold mb-4 text-purple-700">
          Add Financial Goal
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Goal Name"
            className="border p-2 rounded-lg"
          />
          <input
            type="number"
            placeholder="Target Amount"
            className="border p-2 rounded-lg"
          />
          <input
            type="date"
            className="border p-2 rounded-lg"
          />
        </div>
        <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg">
          Save Goal
        </button>
      </div>

      {/* Goal Progress */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
        <h2 className="text-xl font-bold mb-4 text-purple-700">
          Goal Progress
        </h2>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-green-500 h-4 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="mt-2 text-gray-600">{progress}% Completed</p>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-purple-700">
          Recent Transactions
        </h2>
        <p className="text-gray-500">No transactions yet.</p>
      </div>

    </div>
  );
}

export default Dashboard;