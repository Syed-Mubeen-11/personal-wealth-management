import { useState } from "react";
import Sidebar from "../components/Sidebar";
import SimulationChart from "../components/SimulationChart";

function Simulation() {

  const [targetDate, setTargetDate] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (monthlyContribution < 0 || expectedReturn < 0) {
      alert("Values cannot be negative");
      return;
    }

    const simulationResult = {
      labels: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
      current: [10000, 20000, 30000, 40000, 50000],
      new: [
        10000 + monthlyContribution * 1,
        20000 + monthlyContribution * 2,
        30000 + monthlyContribution * 3,
        40000 + monthlyContribution * 4,
        50000 + monthlyContribution * 5
      ]
    };

    setResult(simulationResult);
  };

  const saveSimulation = () => {
    alert("Simulation saved successfully!");
  };

  return (
    <div className="flex">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64 p-8 bg-slate-100 min-h-screen w-full">

        <h1 className="text-3xl font-bold mb-6 text-slate-800">
          Wealth Simulation
        </h1>

        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl">

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block font-medium mb-1">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                Monthly Contribution
              </label>
              <input
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Enter monthly amount"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                Expected Return (%)
              </label>
              <input
                type="number"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Expected return rate"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Run Simulation
            </button>

          </form>

        </div>

        {result && (
          <div className="mt-8 bg-white p-6 rounded-xl shadow-md">

            <h2 className="text-xl font-semibold mb-4">
              Simulation Results
            </h2>

            <SimulationChart data={result} />

            <button
              onClick={saveSimulation}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save Simulation
            </button>

          </div>
        )}

      </div>

    </div>
  );
}

export default Simulation;