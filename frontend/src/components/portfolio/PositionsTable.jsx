import React from 'react';

function PositionsTable({ positions, currentPage, totalPages, onPageChange, onManagePositions, onSell }) {
    const formatCurrency = (val) => {
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatPercent = (val) => {
        const prefix = val >= 0 ? '+' : '';
        return `${prefix}${val.toFixed(2)}%`;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Investments Table</h3>
                {onManagePositions && (
                    <button 
                        onClick={onManagePositions}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                        Manage Positions
                    </button>
                )}
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Symbol</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Units</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg. Buy Price</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Price</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Market Value</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Gain/Loss</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {positions.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                    No positions yet. Buy some assets to get started!
                                </td>
                            </tr>
                        ) : (
                            positions.map((pos, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-semibold text-gray-900">{pos.symbol}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                        {pos.company_name || pos.symbol}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                                        {pos.units}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                                        ${formatCurrency(pos.avg_buy_price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                                        ${formatCurrency(pos.current_price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 font-medium">
                                        ${formatCurrency(pos.market_value)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className={`font-semibold ${pos.gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ${formatCurrency(Math.abs(pos.gain_loss))} ({formatPercent(pos.gain_loss_percent)})
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button
                                            onClick={() => onSell && onSell(pos)}
                                            className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
                                        >
                                            Sell
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex justify-center items-center gap-2">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => onPageChange(i + 1)}
                            className={`px-3 py-1 text-sm rounded ${
                                currentPage === i + 1 
                                    ? 'bg-teal-600 text-white' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default PositionsTable;
