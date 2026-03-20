import React from 'react';
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
    Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function ResultCard({ label, value, sublabel }) {
    return (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-gray-500 text-sm mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {sublabel ? <p className="text-gray-400 text-xs mt-1">{sublabel}</p> : null}
        </div>
    );
}

function LoadingPanel() {
    return (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 flex flex-col items-center justify-center h-full">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Running simulation...</p>
            <p className="text-sm text-gray-500">Crunching numbers for your plan</p>
        </div>
    );
}

function EmptyPanel({ title, subtitle }) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 flex flex-col items-center justify-center text-gray-400">
            <p className="text-lg font-medium">{title}</p>
            <p className="text-sm">{subtitle}</p>
        </div>
    );
}

function SimulatorCharts({
    activeTab,
    loading,
    sipResult,
    sipWhatIfResult,
    retirementResult,
    retirementWhatIfResult,
    loanResult,
    loanWhatIfResult,
    sipForm,
    retirementForm,
    loanForm,
    formatCurrency,
    hasActiveResult,
    onExportPDF,
    onShareResults,
    sipWhatIfLabel,
    retirementWhatIfLabel,
    loanWhatIfLabel,
}) {
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                },
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${formatCurrency(context.raw)}`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
        },
    };

    const sipChartData = sipResult
        ? {
              labels: sipResult.yearly_projections?.map((p) => `Year ${p.year}`) || [],
              datasets: [
                  {
                      label: 'Invested Amount',
                      data: sipResult.yearly_projections?.map((p) => p.invested_amount) || [],
                      borderColor: '#64748b',
                      backgroundColor: 'rgba(100, 116, 139, 0.1)',
                      fill: true,
                      tension: 0.4,
                      pointRadius: 0,
                      borderWidth: 2,
                  },
                  {
                      label: 'Total Value',
                      data: sipResult.yearly_projections?.map((p) => p.total_value) || [],
                      borderColor: '#0066cc',
                      backgroundColor: 'rgba(0, 102, 204, 0.1)',
                      fill: true,
                      tension: 0.4,
                      pointRadius: 0,
                      borderWidth: 2,
                  },
                  ...(sipWhatIfResult
                      ? [
                            {
                                label: sipWhatIfLabel || 'What-If Scenario',
                                data: sipWhatIfResult.yearly_projections?.map((p) => p.total_value) || [],
                                borderColor: '#16a34a',
                                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                                fill: false,
                                tension: 0.4,
                                pointRadius: 0,
                                borderWidth: 2,
                            },
                        ]
                      : []),
              ],
          }
        : null;

    const retirementChartData = retirementResult
        ? {
              labels:
                  retirementResult.yearly_projections
                      ?.filter((p) => p.phase === 'accumulation')
                      .map((p) => `Age ${p.age}`) || [],
              datasets: [
                  {
                      label: 'Retirement Corpus',
                      data:
                          retirementResult.yearly_projections
                              ?.filter((p) => p.phase === 'accumulation')
                              .map((p) => p.corpus) || [],
                      borderColor: '#0066cc',
                      backgroundColor: 'rgba(0, 102, 204, 0.1)',
                      fill: true,
                      tension: 0.4,
                      pointRadius: 0,
                      borderWidth: 2,
                  },
                  ...(retirementWhatIfResult
                      ? [
                            {
                                label: retirementWhatIfLabel || 'What-If Scenario',
                                data:
                                    retirementWhatIfResult.yearly_projections
                                        ?.filter((p) => p.phase === 'accumulation')
                                        .map((p) => p.corpus) || [],
                                borderColor: '#16a34a',
                                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                                fill: false,
                                tension: 0.4,
                                pointRadius: 0,
                                borderWidth: 2,
                            },
                        ]
                      : []),
              ],
          }
        : null;

    const loanChartData = loanResult
        ? {
              labels: loanResult.amortization_schedule?.map((a) => `Month ${a.month}`) || [],
              datasets: [
                  {
                      label: 'Remaining Balance',
                      data: loanResult.amortization_schedule?.map((a) => a.balance) || [],
                      borderColor: '#0066cc',
                      backgroundColor: 'rgba(0, 102, 204, 0.1)',
                      fill: true,
                      tension: 0.4,
                      pointRadius: 0,
                      borderWidth: 2,
                  },
                  ...(loanWhatIfResult
                      ? [
                            {
                                label: loanWhatIfLabel || 'What-If Scenario',
                                data: loanWhatIfResult.amortization_schedule?.map((a) => a.balance) || [],
                                borderColor: '#16a34a',
                                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                                fill: false,
                                tension: 0.4,
                                pointRadius: 0,
                                borderWidth: 2,
                            },
                        ]
                      : []),
              ],
          }
        : null;

    return (
        <div className="lg:w-2/3">
            {hasActiveResult ? (
                <div className="flex justify-end gap-3 mb-4">
                    <button
                        onClick={onExportPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 16v-8m0 8l-3-3m3 3l3-3M5 20h14"
                            />
                        </svg>
                        Export PDF
                    </button>
                    <button
                        onClick={onShareResults}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316"
                            />
                        </svg>
                        Share
                    </button>
                </div>
            ) : null}

            {activeTab === 'sip' && (
                <>
                    {loading ? (
                        <LoadingPanel />
                    ) : sipResult ? (
                        <>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <ResultCard
                                    label="Total Invested"
                                    value={formatCurrency(sipResult.total_invested)}
                                    sublabel={`Over ${sipForm.years} years`}
                                />
                                <ResultCard
                                    label="Estimated Returns"
                                    value={formatCurrency(sipResult.estimated_returns)}
                                    sublabel={`${sipForm.expected_return_rate}% annual growth`}
                                />
                                <ResultCard
                                    label="Total Value"
                                    value={formatCurrency(sipResult.total_value)}
                                    sublabel="Your wealth projection"
                                />
                            </div>

                            {sipWhatIfResult ? (
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                        <p className="text-green-700 text-sm mb-1">{sipWhatIfLabel || 'What-If Final Value'}</p>
                                        <p className="text-2xl font-bold text-green-800">
                                            {formatCurrency(sipWhatIfResult.total_value)}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                        <p className="text-green-700 text-sm mb-1">Extra Wealth vs Base</p>
                                        <p className="text-2xl font-bold text-green-800">
                                            {formatCurrency(
                                                Number(sipWhatIfResult.total_value || 0) -
                                                    Number(sipResult.total_value || 0)
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">SIP Growth Projection</h3>
                                <div className="h-80">
                                    <Line data={sipChartData} options={chartOptions} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <EmptyPanel title="Enter SIP details and calculate" subtitle="See your wealth grow over time" />
                    )}
                </>
            )}

            {activeTab === 'retirement' && (
                <>
                    {loading ? (
                        <LoadingPanel />
                    ) : retirementResult ? (
                        <>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <ResultCard
                                    label="Corpus at Retirement"
                                    value={formatCurrency(retirementResult.corpus_at_retirement)}
                                    sublabel={`At age ${retirementForm.retirement_age}`}
                                />
                                <ResultCard
                                    label="Monthly Income"
                                    value={formatCurrency(retirementResult.monthly_income_at_retirement)}
                                    sublabel="4% withdrawal rate"
                                />
                                <ResultCard
                                    label="Corpus Lasts Until"
                                    value={`Age ${retirementResult.corpus_lasts_until_age}`}
                                    sublabel="Based on expenses"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <ResultCard
                                    label="Total Invested"
                                    value={formatCurrency(retirementResult.total_invested)}
                                />
                                <ResultCard
                                    label="Total Returns"
                                    value={formatCurrency(retirementResult.total_returns)}
                                />
                            </div>

                            {retirementWhatIfResult ? (
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                        <p className="text-green-700 text-sm mb-1">{retirementWhatIfLabel || 'What-If Corpus'}</p>
                                        <p className="text-2xl font-bold text-green-800">
                                            {formatCurrency(retirementWhatIfResult.corpus_at_retirement)}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                        <p className="text-green-700 text-sm mb-1">Extra Corpus vs Base</p>
                                        <p className="text-2xl font-bold text-green-800">
                                            {formatCurrency(
                                                Number(retirementWhatIfResult.corpus_at_retirement || 0) -
                                                    Number(retirementResult.corpus_at_retirement || 0)
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Retirement Corpus Growth</h3>
                                <div className="h-80">
                                    <Line data={retirementChartData} options={chartOptions} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <EmptyPanel title="Plan your retirement" subtitle="Enter details to see corpus projections" />
                    )}
                </>
            )}

            {activeTab === 'loan' && (
                <>
                    {loading ? (
                        <LoadingPanel />
                    ) : loanResult ? (
                        <>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <ResultCard
                                    label="Monthly Payment"
                                    value={formatCurrency(loanResult.monthly_payment)}
                                    sublabel="EMI amount"
                                />
                                <ResultCard
                                    label="Total Interest"
                                    value={formatCurrency(loanResult.total_interest)}
                                    sublabel="Over loan term"
                                />
                                <ResultCard
                                    label="Payoff"
                                    value={loanResult.payoff_date}
                                    sublabel={`${loanResult.payoff_months} months`}
                                />
                            </div>

                            {loanForm.extra_monthly_payment > 0 && (
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                        <p className="text-green-700 text-sm mb-1">Interest Saved</p>
                                        <p className="text-2xl font-bold text-green-800">
                                            {formatCurrency(loanResult.interest_saved_with_extra)}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                        <p className="text-green-700 text-sm mb-1">Months Saved</p>
                                        <p className="text-2xl font-bold text-green-800">
                                            {loanResult.months_saved_with_extra} months
                                        </p>
                                    </div>
                                </div>
                            )}

                            {loanWhatIfResult ? (
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                        <p className="text-green-700 text-sm mb-1">{loanWhatIfLabel || 'What-If Payoff'}</p>
                                        <p className="text-2xl font-bold text-green-800">
                                            {loanWhatIfResult.payoff_months} months
                                        </p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                        <p className="text-green-700 text-sm mb-1">Months Reduced vs Base</p>
                                        <p className="text-2xl font-bold text-green-800">
                                            {Math.max(
                                                0,
                                                Number(loanResult.payoff_months || 0) -
                                                    Number(loanWhatIfResult.payoff_months || 0)
                                            )}{' '}
                                            months
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Balance Over Time</h3>
                                <div className="h-80">
                                    <Line data={loanChartData} options={chartOptions} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <EmptyPanel title="Plan your loan payoff" subtitle="Run the calculator to view amortization" />
                    )}
                </>
            )}
        </div>
    );
}

export default SimulatorCharts;
