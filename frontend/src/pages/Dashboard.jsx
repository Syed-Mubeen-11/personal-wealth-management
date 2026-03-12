function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <h3 className="text-slate-400">Total Portfolio</h3>
        <p className="text-2xl font-bold mt-2 text-purple-400">₹ 2,50,000</p>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <h3 className="text-slate-400">Active Goals</h3>
        <p className="text-2xl font-bold mt-2 text-pink-400">4</p>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <h3 className="text-slate-400">Risk Profile</h3>
        <p className="text-2xl font-bold mt-2 text-indigo-400">Moderate</p>
      </div>

    </div>
  );
}

export default Dashboard;