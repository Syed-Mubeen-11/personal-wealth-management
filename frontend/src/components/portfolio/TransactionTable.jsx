import React from 'react';

function TransactionTable({ 
    transactions, 
    currentPage, 
    totalPages, 
    onPageChange,
    searchQuery,
    onSearchChange,
    filterType,
    onFilterChange 
}) {
    const formatCurrency = (val) => {
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypePill = (type) => {
        const styles = {
            Buy: 'bg-blue-100 text-blue-700',
            Sell: 'bg-red-100 text-red-700',
            Contribution: 'bg-green-100 text-green-700',
            Withdrawal: 'bg-gray-100 text-gray-700'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type] || styles.Buy}`}>
                {type}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Transaction Management</h3>
                </div>
                
                {/* Search and Filter Row */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => onFilterChange(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                    >
                        <option value="">All Types</option>
                        <option value="Buy">Buy</option>
                        <option value="Sell">Sell</option>
                        <option value="Contribution">Contribution</option>
                        <option value="Withdrawal">Withdrawal</option>
                    </select>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Asset</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    No transactions found.
                                </td>
                            </tr>
                        ) : (
                            transactions.map((tx, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                                        {formatDate(tx.date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getTypePill(tx.transaction_type)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-semibold text-gray-900">{tx.asset_symbol}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                                        {tx.quantity || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                                        ${formatCurrency(tx.amount)}
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
                        type="button"
                        onClick={() => {
                            console.log("Previous clicked, current:", currentPage);
                            if (currentPage > 1) onPageChange(currentPage - 1);
                        }}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }
                        return (
                            <button
                                type="button"
                                key={pageNum}
                                onClick={() => {
                                    console.log("Page button clicked:", pageNum);
                                    onPageChange(pageNum);
                                }}
                                className={`px-3 py-1 text-sm rounded ${
                                    currentPage === pageNum 
                                        ? 'bg-teal-600 text-white' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    <button
                        type="button"
                        onClick={() => {
                            console.log("Next clicked, current:", currentPage, "total:", totalPages);
                            if (currentPage < totalPages) onPageChange(currentPage + 1);
                        }}
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

export default TransactionTable;
