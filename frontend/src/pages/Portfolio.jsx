import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api';
import OverviewCard from '../components/portfolio/OverviewCard';
import AssetAllocationChart from '../components/portfolio/AssetAllocationChart';
import PositionsTable from '../components/portfolio/PositionsTable';
import TransactionTable from '../components/portfolio/TransactionTable';

const buildOverviewFromPositions = (positionsData = []) => {
    const totalPortfolioValue = positionsData.reduce((sum, item) => sum + (Number(item.market_value) || 0), 0);
    const totalCostBasis = positionsData.reduce(
        (sum, item) => sum + ((Number(item.avg_buy_price) || 0) * (Number(item.units) || 0)),
        0
    );

    const overallGainLoss = totalPortfolioValue - totalCostBasis;
    const overallGainLossPercent = totalCostBasis > 0 ? (overallGainLoss / totalCostBasis) * 100 : 0;

    return {
        total_portfolio_value: Number(totalPortfolioValue.toFixed(2)),
        total_cost_basis: Number(totalCostBasis.toFixed(2)),
        overall_gain_loss: Number(overallGainLoss.toFixed(2)),
        overall_gain_loss_percent: Number(overallGainLossPercent.toFixed(2)),
        cash_balance: 0,
        invested_value: Number(totalPortfolioValue.toFixed(2)),
        total_positions: positionsData.length,
        performance_today: 0,
    };
};

const buildAllocationFromPositions = (positionsData = []) => {
    if (!positionsData.length) {
        return { labels: [], values: [], percentages: [], colors: [] };
    }

    const total = positionsData.reduce((sum, item) => sum + (Number(item.market_value) || 0), 0);
    const palette = ['#0D9488', '#F97316', '#EAB308', '#5EEAD4', '#14B8A6', '#6366F1', '#22C55E', '#EF4444'];

    const labels = [];
    const values = [];
    const percentages = [];
    const colors = [];

    positionsData.forEach((item, idx) => {
        const value = Number(item.market_value) || 0;
        labels.push(item.symbol || `Asset ${idx + 1}`);
        values.push(Number(value.toFixed(2)));
        percentages.push(Number((total > 0 ? (value / total) * 100 : 0).toFixed(2)));
        colors.push(palette[idx % palette.length]);
    });

    return { labels, values, percentages, colors };
};

function Portfolio() {
    // Overview state
    const [overview, setOverview] = useState({
        total_portfolio_value: 0,
        total_cost_basis: 0,
        overall_gain_loss: 0,
        overall_gain_loss_percent: 0,
        cash_balance: 0,
        invested_value: 0,
        total_positions: 0,
        performance_today: 0
    });
    const [allocation, setAllocation] = useState([]);
    const [marketWatch, setMarketWatch] = useState([]);
    const [marketWatchLoading, setMarketWatchLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Positions state with pagination
    const [positions, setPositions] = useState([]);
    const [positionsPage, setPositionsPage] = useState(1);
    const [positionsTotalPages, setPositionsTotalPages] = useState(1);

    // Transactions state with pagination, search, filter
    const [transactions, setTransactions] = useState([]);
    const [txPage, setTxPage] = useState(1);
    const [txTotalPages, setTxTotalPages] = useState(1);
    const [txSearch, setTxSearch] = useState('');
    const [txFilter, setTxFilter] = useState('');

    // Buy asset state
    const [symbol, setSymbol] = useState('');
    const [priceData, setPriceData] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [showBuyModal, setShowBuyModal] = useState(false);

    // Load overview and allocation
    const loadOverview = useCallback(async () => {
        try {
            const res = await api.get('/portfolio/overview');
            setOverview((prev) => ({ ...prev, ...res.data }));

            const nextAllocation = res.data?.asset_allocation;
            if (nextAllocation?.labels?.length) {
                setAllocation(nextAllocation);
            }
        } catch (err) {
            console.error("Overview load error", err);
        }
    }, []);

    // Load paginated positions
    const loadPositions = useCallback(async (page = 1) => {
        try {
            const res = await api.get(`/portfolio/positions?page=${page}&limit=10`);
            console.log("Positions API Response:", res.data);
            const positionsData = res.data.data || [];
            setPositions(positionsData);
            setPositionsTotalPages(res.data.total_pages || 1);
            setPositionsPage(res.data.current_page || 1);

            // Fallback: keep cards/chart populated if overview API is empty/failing.
            if (positionsData.length) {
                setOverview((prev) => {
                    if (prev.total_portfolio_value > 0) {
                        return prev;
                    }
                    return {
                        ...prev,
                        ...buildOverviewFromPositions(positionsData),
                    };
                });

                setAllocation((prev) => {
                    if (prev?.labels?.length) {
                        return prev;
                    }
                    return buildAllocationFromPositions(positionsData);
                });
            }
        } catch (err) {
            console.error("Positions load error", err);
        }
    }, []);

    // Load paginated transactions with search/filter
    const loadTransactions = async (page, search, filter) => {
        try {
            let url = `/transactions/paginated?page=${page}&limit=5`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (filter) url += `&transaction_type=${encodeURIComponent(filter)}`;
            console.log("Fetching transactions:", url);
            const res = await api.get(url);
            console.log("Transactions API Response:", res.data);
            setTransactions(res.data.data || []);
            setTxTotalPages(res.data.total_pages || 1);
            setTxPage(page);
        } catch (err) {
            console.error("Transactions load error", err);
        }
    };

    // Load a small live market watch list to show prices even with no holdings
    const loadMarketWatch = useCallback(async () => {
        const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
        setMarketWatchLoading(true);
        try {
            const results = await Promise.allSettled(
                symbols.map(async (symbolItem) => {
                    try {
                        const res = await api.get(`/stock/${symbolItem}`);
                        return {
                            symbol: res.data.symbol,
                            price: res.data.price
                        };
                    } catch {
                        // Fallback path: bypass shared API client if it is misconfigured
                        const fallbackRes = await fetch(`http://127.0.0.1:8000/stock/${symbolItem}`);
                        if (!fallbackRes.ok) {
                            throw new Error(`Fallback failed for ${symbolItem}`);
                        }
                        const fallbackData = await fallbackRes.json();
                        return {
                            symbol: fallbackData.symbol,
                            price: fallbackData.price
                        };
                    }
                })
            );

            const parsed = results
                .filter((item) => item.status === 'fulfilled')
                .map((item) => item.value);

            setMarketWatch(parsed);
        } catch (err) {
            console.error('Market watch load error', err);
            setMarketWatch([]);
        } finally {
            setMarketWatchLoading(false);
        }
    }, []);

    // Initial load only
    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            loadOverview(),
            loadPositions(1),
            loadTransactions(1, '', ''),
            loadMarketWatch()
        ]).finally(() => setIsLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle transaction search/filter changes with debounce
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const timer = setTimeout(() => {
            loadTransactions(1, txSearch, txFilter);
        }, 300);
        return () => clearTimeout(timer);
    }, [txSearch, txFilter]);

    const checkPrice = async () => {
        try {
            const res = await api.get(`/stock/${symbol}`);
            setPriceData(res.data);
        } catch (err) {
            alert("Invalid symbol");
        }
    };

    const buyAsset = async () => {
        const token = localStorage.getItem('jwt');
        if (!token) {
            alert("You must be logged in to buy assets. Please log in again.");
            window.location.href = '/login';
            return;
        }
        
        const qty = parseFloat(quantity);
        const amount = qty * priceData.price;
        const payload = {
            transaction_type: "Buy",
            asset_symbol: priceData.symbol,
            quantity: qty,
            amount: parseFloat(amount.toFixed(2))
        };
        console.log("Sending buy request with payload:", payload);
        console.log("Using token:", token ? token.substring(0, 20) + "..." : "NO TOKEN");
        
        try {
            const response = await api.post('/transactions', payload);
            console.log("Buy success:", response.data);
            setPriceData(null);
            setSymbol('');
            setQuantity('');
            setShowBuyModal(false);
            // Refresh all data
            loadOverview();
            loadPositions(positionsPage);
            loadTransactions(txPage, txSearch, txFilter);
        } catch (err) {
            console.error("Buy error details:", err);
            console.error("Error response:", err.response);
            console.error("Error config:", err.config);
            alert(`Failed to buy: ${err.response?.data?.detail || err.message}`);
        }
    };

    const handleManagePositions = () => {
        setShowBuyModal(true);
    };

    // Sell asset function
    const sellAsset = async (position) => {
        const maxQty = position.units;
        const input = window.prompt(`Enter quantity to sell (max: ${maxQty}):`, maxQty);
        
        if (input === null) return; // User cancelled
        
        const qty = parseFloat(input);
        if (isNaN(qty) || qty <= 0) {
            alert("Please enter a valid quantity.");
            return;
        }
        if (qty > maxQty) {
            alert(`You can only sell up to ${maxQty} units.`);
            return;
        }
        
        const amount = qty * position.current_price;
        const payload = {
            transaction_type: "Sell",
            asset_symbol: position.symbol,
            quantity: qty,
            amount: parseFloat(amount.toFixed(2))
        };
        
        try {
            await api.post('/transactions', payload);
            alert(`Successfully sold ${qty} shares of ${position.symbol} for $${amount.toFixed(2)}`);
            // Refresh all data
            loadOverview();
            loadPositions(positionsPage);
            loadTransactions(txPage, txSearch, txFilter);
        } catch (err) {
            console.error("Sell error:", err);
            alert("Failed to sell: " + (err.response?.data?.detail || err.message));
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-teal-800 font-bold">Fetching live portfolio data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Portfolio & Transactions</h1>
                    <p className="text-gray-500 mt-1">Manage your investments and track all transactions</p>
                </div>
                <button
                    onClick={() => setShowBuyModal(true)}
                    className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition shadow-sm"
                >
                    + Buy Asset
                </button>
            </div>

            {/* Overview Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <OverviewCard
                    title="Portfolio Value"
                    value={overview.total_portfolio_value}
                    changePercent={overview.overall_gain_loss_percent}
                    isCurrency={true}
                />
                <OverviewCard
                    title="Today's Change"
                    value={overview.performance_today}
                    isCurrency={true}
                    showSign={true}
                />
                <OverviewCard
                    title="Total Gain/Loss"
                    value={overview.overall_gain_loss}
                    changePercent={overview.overall_gain_loss_percent}
                    isCurrency={true}
                    showSign={true}
                />
                <OverviewCard
                    title="Cash Balance"
                    value={overview.cash_balance}
                    isCurrency={true}
                />
            </div>

            {/* Charts and Allocation Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Asset Allocation Chart */}
                <div className="lg:col-span-1">
                    <AssetAllocationChart allocation={allocation} />
                </div>

                {/* Positions Table */}
                <div className="lg:col-span-2">
                    <PositionsTable
                        positions={positions}
                        currentPage={positionsPage}
                        totalPages={positionsTotalPages}
                        onPageChange={(page) => loadPositions(page)}
                        onManagePositions={handleManagePositions}
                        onSell={sellAsset}
                    />
                </div>
            </div>

            {/* Live market prices for discovery, even when portfolio is empty */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Live Market Watch</h2>
                    <button
                        onClick={loadMarketWatch}
                        disabled={marketWatchLoading}
                        className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {marketWatchLoading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                {marketWatch.length === 0 ? (
                    <p className="text-gray-500 text-sm">Unable to fetch live prices right now.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {marketWatch.map((item) => (
                            <div key={item.symbol} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                <p className="text-xs text-gray-500">{item.symbol}</p>
                                <p className="text-lg font-bold text-teal-700">${Number(item.price).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Transaction Management */}
            <TransactionTable
                transactions={transactions}
                currentPage={txPage}
                totalPages={txTotalPages}
                onPageChange={(newPage) => {
                    console.log("Changing to page:", newPage, "from:", txPage);
                    loadTransactions(newPage, txSearch, txFilter);
                }}
                searchQuery={txSearch}
                onSearchChange={setTxSearch}
                filterType={txFilter}
                onFilterChange={setTxFilter}
            />

            {/* Buy Asset Modal */}
            {showBuyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Buy New Asset</h3>
                            <button
                                onClick={() => { setShowBuyModal(false); setPriceData(null); setSymbol(''); setQuantity(''); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Symbol</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="e.g., AAPL"
                                        className="border border-gray-200 p-3 rounded-lg flex-1 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none uppercase"
                                        value={symbol}
                                        onChange={e => setSymbol(e.target.value)}
                                    />
                                    <button
                                        onClick={checkPrice}
                                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
                                    >
                                        Check
                                    </button>
                                </div>
                            </div>

                            {priceData && (
                                <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="font-bold text-lg text-gray-900">{priceData.symbol}</span>
                                        <span className="text-2xl font-bold text-teal-600">${priceData.price.toFixed(2)}</span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                        <input
                                            type="number"
                                            placeholder="Enter quantity"
                                            min="1"
                                            className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                            value={quantity}
                                            onChange={e => setQuantity(e.target.value)}
                                        />
                                    </div>
                                    {quantity && parseFloat(quantity) > 0 && (
                                        <div className="mt-3 pt-3 border-t border-teal-200">
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Total Cost:</span>
                                                <span className="font-bold text-gray-900">
                                                    ${(parseFloat(quantity) * priceData.price).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => { setShowBuyModal(false); setPriceData(null); setSymbol(''); setQuantity(''); }}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={buyAsset}
                                    disabled={!priceData || !quantity || parseFloat(quantity) <= 0}
                                    className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Confirm Purchase
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Portfolio;