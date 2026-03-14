import React, { useState } from 'react';
import api from '../api';
import { Line } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
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

function Simulator() {

    const [formData, setFormData] = useState({
        monthly_investment: 1000,
        years: 10
    });

    const [result, setResult] = useState(null);
    const [whatIfResult, setWhatIfResult] = useState(null);
    const [loading, setLoading] = useState(false);


    const runSimulation = async (investment, setTargetResult) => {

        try {

            const res = await api.post(`/simulate/start/?monthly_investment=${investment}&years=${formData.years}`);

            const taskId = res.data.task_id;

            const interval = setInterval(async () => {

                const pollRes = await api.get(`/simulate/result/${taskId}`);

                if (pollRes.data.status === 'Completed') {

                    clearInterval(interval);
                    setTargetResult(pollRes.data.result);
                    setLoading(false);

                }

            }, 1000);

        } catch (err) {

            console.error(err);
            setLoading(false);

        }

    };


    const handleSimulate = async () => {

        setLoading(true);
        setResult(null);
        setWhatIfResult(null);

        runSimulation(formData.monthly_investment, setResult);

    };


    const handleWhatIf = async () => {

        setLoading(true);

        const increasedInvestment = formData.monthly_investment * 1.5;

        runSimulation(increasedInvestment, setWhatIfResult);

    };


    const saveSimulation = async () => {

        try {

            await api.post("/simulations", {

                monthly_investment: formData.monthly_investment,
                years: formData.years,
                result: result

            });

            alert("Simulation saved successfully");

        } catch (err) {

            alert("Saving failed");

        }

    };


    const yearsLabel =
        result && result.year_by_year
            ? result.year_by_year.map(r => `Year ${r.year}`)
            : [];

    const valuesData =
        result && result.year_by_year
            ? result.year_by_year.map(r => r.value)
            : [];

    const whatIfValues =
        whatIfResult && whatIfResult.year_by_year
            ? whatIfResult.year_by_year.map(r => r.value)
            : [];


    const chartData = {

        labels: yearsLabel,

        datasets: [

            {
                label: 'Current Plan',
                data: valuesData,
                borderColor: 'rgb(37,99,235)',
                backgroundColor: 'rgba(37,99,235,0.3)',
                tension: 0.3
            },

            {
                label: 'What-If Plan',
                data: whatIfValues,
                borderColor: 'rgb(16,185,129)',
                backgroundColor: 'rgba(16,185,129,0.3)',
                tension: 0.3
            }

        ]

    };


    return (

        <div className="max-w-6xl mx-auto p-8 bg-gray-50 min-h-screen">

            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                Wealth Growth Simulator
            </h1>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">

                    <label className="block text-gray-700 font-bold mb-2">
                        Monthly Investment ($)
                    </label>

                    <input
                        type="number"
                        value={formData.monthly_investment}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                monthly_investment: e.target.value
                            })
                        }
                        className="w-full border p-3 rounded mb-4"
                    />

                    <label className="block text-gray-700 font-bold mb-2">
                        Duration (Years)
                    </label>

                    <input
                        type="number"
                        value={formData.years}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                years: e.target.value
                            })
                        }
                        className="w-full border p-3 rounded mb-6"
                    />


                    <button
                        onClick={handleSimulate}
                        className="w-full py-3 mb-3 rounded font-bold text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Run Simulation
                    </button>


                    <button
                        onClick={handleWhatIf}
                        className="w-full py-3 mb-3 rounded font-bold text-white bg-green-600 hover:bg-green-700"
                    >
                        Run What-If Scenario
                    </button>


                    {result && (
                        <button
                            onClick={saveSimulation}
                            className="w-full py-3 rounded font-bold text-white bg-purple-600 hover:bg-purple-700"
                        >
                            Save Simulation
                        </button>
                    )}

                </div>



                <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">

                    {result ? (

                        <>

                            <div className="mb-6 border-b pb-4">

                                <p className="text-gray-500 text-sm uppercase font-bold">
                                    Total Projected Wealth
                                </p>

                                <p className="text-4xl font-extrabold text-green-600">
                                    ${result.total_wealth?.toLocaleString()}
                                </p>

                            </div>


                            <div className="h-80">

                                <Line
                                    data={chartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { position: 'top' }
                                        }
                                    }}
                                />

                            </div>

                        </>

                    ) : (

                        <div className="h-80 flex flex-col items-center justify-center text-gray-400">

                            <p>Enter details and click Run Simulation</p>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}


export default Simulator;