import React, { useState } from 'react';
import api from '../api';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function SimulatorCharts() {
    const [formData, setFormData] = useState({ monthly_investment: 1000, years: 10 });
    const [result, setResult] = useState(null);
    const [whatIfResult, setWhatIfResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const runSimulation = (investment, setTargetResult) => {
        return new Promise((resolve, reject) => {
            api.post(`/simulate/start/?monthly_investment=${investment}&years=${formData.years}`)
                .then(res => {
                    const taskId = res.data.task_id;
                    let attempts = 0;
                    const maxAttempts = 30; // 30 seconds timeout

                    const interval = setInterval(() => {
                        attempts++;
                        api.get(`/simulate/result/${taskId}`)
                            .then(pollRes => {
                                if (pollRes.data.status === 'Completed') {
                                    clearInterval(interval);
                                    setTargetResult(pollRes.data.result);
                                    resolve(pollRes.data.result);
                                } else if (attempts >= maxAttempts) {
                                    clearInterval(interval);
                                    reject(new Error('Simulation timed out'));
                                }
                            })
                            .catch(err => {
                                clearInterval(interval);
                                reject(err);
                            });
                    }, 1000);
                })
                .catch(reject);
        });
    };

    const handleSimulate = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        setWhatIfResult(null);
        try {
            await runSimulation(formData.monthly_investment, setResult);
        } catch (err) {
            console.error(err);
            setError('Simulation failed. Please check the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleWhatIf = async () => {
        setLoading(true);
        setError(null);
        try {
            const increasedInvestment = parseFloat(formData.monthly_investment) * 1.5;
            await runSimulation(increasedInvestment, setWhatIfResult);
        } catch (err) {
            console.error(err);
            setError('What-If simulation failed.');
        } finally {
            setLoading(false);
        }
    };

    const saveSimulation = async () => {
        try {
            await api.post('/simulations', {
                monthly_investment: formData.monthly_investment,
                years: formData.years,
                result
            });
            alert('Simulation saved successfully');
        } catch {
            alert('Saving failed');
        }
    };

    const yearsLabel = result?.year_by_year?.map(r => `Year ${r.year}`) ?? [];
    const valuesData = result?.year_by_year?.map(r => r.value) ?? [];
    const whatIfValues = whatIfResult?.year_by_year?.map(r => r.value) ?? [];

    const chartData = {
        labels: yearsLabel,
        datasets: [
            {
                label: 'Current Plan',
                data: valuesData,
                borderColor: 'rgb(37,99,235)',
                backgroundColor: 'rgba(37,99,235,0.15)',
                tension: 0.3,
                fill: true
            },
            ...(whatIfValues.length > 0 ? [{
                label: 'What-If Scenario (+50%)',
                data: whatIfValues,
                borderColor: 'rgb(16,185,129)',
                backgroundColor: 'rgba(16,185,129,0.15)',
                tension: 0.3,
                fill: true
            }] : [])
        ]
    };

    return (
        <div className="max-w-6xl mx-auto p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Simulator Charts</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Controls */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <label className="block text-gray-700 font-bold mb-2">Monthly Investment ($)</label>
                    <input
                        type="number"
                        value={formData.monthly_investment}
                        onChange={e => setFormData({ ...formData, monthly_investment: e.target.value })}
                        className="w-full border p-3 rounded mb-4"
                        min="1"
                    />

                    <label className="block text-gray-700 font-bold mb-2">Duration (Years)</label>
                    <input
                        type="number"
                        value={formData.years}
                        onChange={e => setFormData({ ...formData, years: e.target.value })}
                        className="w-full border p-3 rounded mb-6"
                        min="1"
                        max="50"
                    />

                    <button
                        onClick={handleSimulate}
                        disabled={loading}
                        className="w-full py-3 mb-3 rounded font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Running...' : 'Run Simulation'}
                    </button>

                    <button
                        onClick={handleWhatIf}
                        disabled={loading}
                        className="w-full py-3 mb-3 rounded font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading ? 'Running...' : 'Run What-If Scenario'}
                    </button>

                    {result && (
                        <button
                            onClick={saveSimulation}
                            className="w-full py-3 rounded font-bold text-white bg-purple-600 hover:bg-purple-700"
                        >
                            Save Simulation
                        </button>
                    )}

                    {error && (
                        <p className="mt-4 text-red-500 text-sm">{error}</p>
                    )}
                </div>

                {/* Results */}
                <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    {result ? (
                        <>
                            {/* Summary Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-6 border-b pb-4">
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-bold">Total Projected Wealth</p>
                                    <p className="text-2xl font-extrabold text-green-600">
                                        ${result.total_wealth?.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-bold">Total Invested</p>
                                    <p className="text-2xl font-extrabold text-blue-600">
                                        ${result.total_invested != null
                                            ? result.total_invested.toLocaleString()
                                            : (formData.monthly_investment * 12 * formData.years).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-bold">Estimated Profit</p>
                                    <p className="text-2xl font-extrabold text-purple-600">
                                        ${result.estimated_profit != null
                                            ? result.estimated_profit.toLocaleString()
                                            : (result.total_wealth - formData.monthly_investment * 12 * formData.years).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="h-80">
                                <Line
                                    data={chartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { position: 'top' },
                                            title: {
                                                display: true,
                                                text: 'Projected Wealth Growth Over Time'
                                            }
                                        },
                                        scales: {
                                            y: {
                                                ticks: {
                                                    callback: val => `$${val.toLocaleString()}`
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="h-80 flex flex-col items-center justify-center text-gray-400">
                            {loading
                                ? <p className="animate-pulse">Running simulation...</p>
                                : <p>Enter details and click Run Simulation</p>
                            }
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SimulatorCharts;
