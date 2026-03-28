import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Reports = () => {
    const [portfolioSummary, setPortfolioSummary] = useState(null);
    const [goals, setGoals] = useState([]);
    const [simulations, setSimulations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('gain_loss');
    const [sortDirection, setSortDirection] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRow, setExpandedRow] = useState(null);
    const [downloadingPDF, setDownloadingPDF] = useState(false);
    const [downloadingCSV, setDownloadingCSV] = useState(false);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [portfolioRes, goalsRes, simulationsRes] = await Promise.all([
                api.get('/investments/summary'),
                api.get('/goals/'),
                api.get('/simulations/')
            ]);
            setPortfolioSummary(portfolioRes.data);
            setGoals(goalsRes.data);
            setSimulations(simulationsRes.data);
        } catch (error) {
            console.error('Failed to fetch reports data', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = async () => {
        setDownloadingPDF(true);
        try {
            const response = await api.get('/reports/pdf', {
                params: { scope: 'full' },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            const date = new Date().toISOString().split('T')[0];
            link.href = url;
            link.setAttribute('download', `wealth-report-${date}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('PDF download failed', error);
            alert('Failed to download PDF. Please try again.');
        } finally {
            setDownloadingPDF(false);
        }
    };

    const downloadCSV = async () => {
        setDownloadingCSV(true);
        try {
            const response = await api.get('/reports/csv', {
                params: { type: 'portfolio' },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'portfolio-export.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('CSV export failed', error);
            alert('Failed to export CSV. Please try again.');
        } finally {
            setDownloadingCSV(false);
        }
    };

    // ── Exact same formula as Goals.jsx ──────────────────────────────────────
    const calculateGoalProgress = (goal) => {
        return Math.min(
            (goal.monthly_contribution / goal.target_amount) * 100,
            100
        );
    };

    // ── Get final projected value from simulation ─────────────────────────────
    // Projection is array of objects: { month: 1, portfolio_value: 5050 }
    const getSimulationResult = (sim) => {
        try {
            const results = sim.results;
            if (!results) return null;
            const parsed = typeof results === 'string' ? JSON.parse(results) : results;
            const projection = parsed?.projection;
            if (Array.isArray(projection) && projection.length > 0) {
                const last = projection[projection.length - 1];
                if (last?.portfolio_value !== undefined) return last.portfolio_value;
                if (typeof last === 'number') return last;
            }
            return null;
        } catch {
            return null;
        }
    };

    // ── Get assumptions safely ────────────────────────────────────────────────
    const getAssumptions = (sim) => {
        try {
            const assumptions = sim.assumptions;
            if (!assumptions) return null;
            return typeof assumptions === 'string' ? JSON.parse(assumptions) : assumptions;
        } catch {
            return null;
        }
    };

    const formatCurrency = (value) => {
        if (value === null || value === undefined || isNaN(value)) return 'N/A';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getSortedInvestments = () => {
        if (!portfolioSummary?.investments) return [];
        return [...portfolioSummary.investments].sort((a, b) => {
            let valA, valB;
            if (sortBy === 'gain_loss') {
                valA = a.gain_loss_pct || 0;
                valB = b.gain_loss_pct || 0;
            } else {
                valA = a.current_value || 0;
                valB = b.current_value || 0;
            }
            return sortDirection === 'desc' ? valB - valA : valA - valB;
        });
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
        } else {
            setSortBy(field);
            setSortDirection('desc');
        }
    };

    const paginatedSimulations = simulations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const totalPages = Math.ceil(simulations.length / itemsPerPage);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                    <div className="flex gap-3">
                        <button
                            onClick={downloadPDF}
                            disabled={downloadingPDF}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {downloadingPDF ? '⏳ Generating...' : '📄 Download PDF Report'}
                        </button>
                        <button
                            onClick={downloadCSV}
                            disabled={downloadingCSV}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {downloadingCSV ? '⏳ Exporting...' : '📊 Export Portfolio CSV'}
                        </button>
                    </div>
                </div>

                {/* Portfolio Summary Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Portfolio Summary</h2>
                    {portfolioSummary && portfolioSummary.total_value > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <p className="text-sm text-blue-600">Total Portfolio Value</p>
                                    <p className="text-2xl font-bold text-blue-900">
                                        {formatCurrency(portfolioSummary.total_value)}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Overall Gain/Loss</p>
                                    <p className={`text-2xl font-bold ${portfolioSummary.day_change_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {portfolioSummary.day_change_percentage >= 0 ? '+' : ''}{portfolioSummary.day_change_percentage?.toFixed(2)}%
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Best / Worst Performer</p>
                                    <p className="text-sm">
                                        <span className="text-green-600">↑ {portfolioSummary.best_performer?.symbol || 'N/A'}</span>
                                        <span className="mx-2">|</span>
                                        <span className="text-red-600">↓ {portfolioSummary.worst_performer?.symbol || 'N/A'}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2">Symbol</th>
                                            <th className="text-right py-2">Units</th>
                                            <th className="text-right py-2">Cost Basis</th>
                                            <th className="text-right py-2">Current Value</th>
                                            <th
                                                className="text-right py-2 cursor-pointer hover:text-blue-600"
                                                onClick={() => handleSort('gain_loss')}
                                            >
                                                Gain/Loss {sortBy === 'gain_loss' && (sortDirection === 'desc' ? '↓' : '↑')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getSortedInvestments().map((inv, idx) => (
                                            <tr key={idx} className="border-b hover:bg-gray-50">
                                                <td className="py-2 font-medium">{inv.symbol}</td>
                                                <td className="text-right">{inv.units}</td>
                                                <td className="text-right">{formatCurrency(inv.cost_basis)}</td>
                                                <td className="text-right">{formatCurrency(inv.current_value)}</td>
                                                <td className={`text-right ${inv.gain_loss_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {inv.gain_loss_pct >= 0 ? '+' : ''}{inv.gain_loss_pct?.toFixed(2)}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No investments found. Add investments to see your portfolio summary.</p>
                    )}
                </div>

                {/* Goals Progress Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Goals Progress</h2>
                    <div className="space-y-4">
                        {goals.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No goals created yet</p>
                        ) : (
                            goals.map((goal, idx) => {
                                // ── Same formula as Goals.jsx ──────────────
                                const progress = calculateGoalProgress(goal);

                                return (
                                    <div key={idx} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold capitalize">{goal.goal_type}</h3>
                                                {progress >= 100 && (
                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Completed</span>
                                                )}
                                                {goal.status === 'paused' && (
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">Paused</span>
                                                )}
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                ₹{parseFloat(goal.monthly_contribution || 0).toLocaleString('en-IN')} / ₹{parseFloat(goal.target_amount || 0).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full transition-all"
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>{progress.toFixed(1)}% progress</span>
                                            <span>Target: {formatDate(goal.target_date)}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            ₹{parseFloat(goal.monthly_contribution || 0).toLocaleString('en-IN')}/mo contribution
                                        </p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Simulation History Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">Simulation History</h2>
                    {simulations.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No simulations saved yet</p>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2">Scenario Name</th>
                                            <th className="text-left py-2">Assumptions</th>
                                            <th className="text-right py-2">Final Value</th>
                                            <th className="text-right py-2">Total Invested</th>
                                            <th className="text-right py-2">Created Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedSimulations.map((sim, idx) => {
                                            const assumptions = getAssumptions(sim);
                                            const finalValue = getSimulationResult(sim);
                                            const totalInvested = assumptions
                                                ? assumptions.monthly_contribution * assumptions.years * 12
                                                : null;
                                            const estReturns = finalValue !== null && totalInvested !== null
                                                ? finalValue - totalInvested
                                                : null;

                                            return (
                                                <React.Fragment key={idx}>
                                                    <tr
                                                        className="border-b hover:bg-gray-50 cursor-pointer"
                                                        onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                                                    >
                                                        <td className="py-2 font-medium">
                                                            {sim.scenario_name || 'What-If Scenario'}
                                                        </td>
                                                        <td className="py-2 text-sm text-gray-600">
                                                            {assumptions ? (
                                                                <span>
                                                                    ₹{assumptions.monthly_contribution?.toLocaleString('en-IN')}/mo,{' '}
                                                                    {assumptions.expected_return}% return,{' '}
                                                                    {assumptions.years} yrs
                                                                </span>
                                                            ) : 'N/A'}
                                                        </td>
                                                        <td className="text-right font-medium text-indigo-600">
                                                            {finalValue !== null ? formatCurrency(finalValue) : 'N/A'}
                                                        </td>
                                                        <td className="text-right text-sm text-gray-600">
                                                            {totalInvested !== null ? formatCurrency(totalInvested) : 'N/A'}
                                                        </td>
                                                        <td className="text-right text-sm text-gray-500">
                                                            {formatDate(sim.created_at)}
                                                        </td>
                                                    </tr>

                                                    {expandedRow === idx && (
                                                        <tr>
                                                            <td colSpan="5" className="bg-gray-50 p-4">
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <div>
                                                                        <h4 className="font-semibold mb-2 text-sm">Assumptions</h4>
                                                                        <div className="space-y-1 text-sm text-gray-600">
                                                                            <p>Monthly: {formatCurrency(assumptions?.monthly_contribution)}</p>
                                                                            <p>Return: {assumptions?.expected_return}% p.a.</p>
                                                                            <p>Duration: {assumptions?.years} years</p>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-semibold mb-2 text-sm">Results</h4>
                                                                        <div className="space-y-1 text-sm text-gray-600">
                                                                            <p>Final Value: <span className="text-indigo-600 font-semibold">{finalValue !== null ? formatCurrency(finalValue) : 'N/A'}</span></p>
                                                                            <p>Total Invested: {totalInvested !== null ? formatCurrency(totalInvested) : 'N/A'}</p>
                                                                            <p>Est. Returns: <span className={estReturns >= 0 ? 'text-green-600' : 'text-red-600'}>{estReturns !== null ? formatCurrency(estReturns) : 'N/A'}</span></p>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-semibold mb-2 text-sm">Info</h4>
                                                                        <div className="space-y-1 text-sm text-gray-600">
                                                                            <p>Created: {formatDate(sim.created_at)}</p>
                                                                            <p>Scenario: {sim.scenario_name || 'What-If Scenario'}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center mt-4">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;