import React, { useState, useEffect } from 'react';
import api from '../api';

function Portfolio() {
    const [positions, setPositions] = useState([]);
    const [overview, setOverview] = useState({ total_cost_basis: 0, total_portfolio_value: 0, overall_gain_loss: 0 });
    const [symbol, setSymbol] = useState('');
    const [priceData, setPriceData] = useState(null);
    const [quantity, setQuantity] = useState('');
    
    // Sell functionality state
    const [selectedAssetToSell, setSelectedAssetToSell] = useState(null);
    const [sellQuantity, setSellQuantity] = useState('');

    const loadPortfolio = async () => {
        try {
            const res = await api.get('/portfolio');
            setPositions(res.data.positions || []);
            setOverview(res.data.overview || { total_cost_basis: 0, total_portfolio_value: 0, overall_gain_loss: 0 });
        } catch (err) { console.error("Portfolio load error", err); }
    };

    useEffect(() => { loadPortfolio(); }, []);

    const checkPrice = async () => {
        try {
            const res = await api.get(`/stock/${symbol}`);
            setPriceData(res.data);
        } catch (err) { alert("Invalid symbol"); }
    };

    const buyAsset = async () => {
        try {
            await api.post('/assets', { symbol: priceData.symbol, quantity: parseFloat(quantity), buy_price: priceData.price });
            setPriceData(null); setSymbol(''); setQuantity(''); loadPortfolio();
        } catch (err) { 
            console.error("Buy error:", err.response?.data || err.message);
            alert("Failed to buy: " + (err.response?.data?.detail || err.message)); 
        }
    };

    const handleSell = async (asset) => {
        const qty = parseFloat(sellQuantity);
        
        // Validation
        if (!qty || qty <= 0 || qty > asset.units) {
            alert(`Please enter a valid quantity (1 - ${asset.units})`);
            return;
        }

        // Calculate total amount using live current price
        const totalAmount = qty * asset.current_price;

        try {
            await api.post('/transactions', {
                transaction_type: "Sell",
                asset_symbol: asset.symbol,
                quantity: qty,
                amount: totalAmount
            });

            // Reset UI state
            setSelectedAssetToSell(null);
            setSellQuantity('');
            
            // Refresh portfolio data
            loadPortfolio();
            
            // Success feedback
            alert(`Successfully sold ${qty} shares of ${asset.symbol} for $${totalAmount.toFixed(2)}`);
        } catch (err) {
            console.error("Sell error:", err.response?.data || err.message);
            alert("Failed to sell: " + (err.response?.data?.detail || err.message));
        }
    };

    const cancelSell = () => {
        setSelectedAssetToSell(null);
        setSellQuantity('');
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-[#1B3C53]">Investment Portfolio</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-xl">
                    <h3 className="text-gray-500 text-sm mb-1 font-bold uppercase">Cost Basis</h3>
                    <p className="text-2xl font-bold text-[#1B3C53]">${overview.total_cost_basis.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-xl">
                    <h3 className="text-gray-500 text-sm mb-1 font-bold uppercase">Portfolio Value</h3>
                    <p className="text-2xl font-bold text-[#1B3C53]">${overview.total_portfolio_value.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-xl">
                    <h3 className="text-gray-500 text-sm mb-1 font-bold uppercase">Total Gain/Loss</h3>
                    <p className={`text-2xl font-bold ${overview.overall_gain_loss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {overview.overall_gain_loss >= 0 ? '+' : ''}${overview.overall_gain_loss.toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-xl">
                <h3 className="font-bold mb-4 text-[#1B3C53] text-lg">Buy New Asset</h3>
                <div className="flex gap-2">
                    <input type="text" placeholder="Stock Symbol (e.g., AAPL)" className="border p-2 rounded flex-1 focus:ring-2 focus:ring-[#234C6A] outline-none uppercase" value={symbol} onChange={e => setSymbol(e.target.value)} />
                    <button onClick={checkPrice} className="bg-[#1B3C53] text-white px-6 py-2 rounded font-medium hover:bg-[#234C6A] transition">Check Price</button>
                </div>
                {priceData && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-4">
                        <p className="font-medium text-gray-700">Live Price: <span className="font-bold text-[#1B3C53]">${priceData.price}</span></p>
                        <input type="number" placeholder="Qty" className="border p-2 rounded w-24 focus:ring-2 focus:ring-[#234C6A] outline-none" onChange={e => setQuantity(e.target.value)} />
                        <button onClick={buyAsset} className="bg-green-600 text-white px-6 py-2 rounded font-medium hover:bg-green-700 transition">Confirm Buy</button>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-xl">
                <h3 className="font-bold mb-4 text-[#1B3C53] text-lg">Your Holdings</h3>
                {positions.length === 0 ? (
                    <p className="text-gray-500 italic">You don't own any assets yet. Buy some stocks above!</p>
                ) : (
                    <div className="space-y-3">
                        {positions.map((pos, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="font-bold text-[#1B3C53] text-lg block">{pos.symbol}</span>
                                        <span className="text-sm text-gray-500">{pos.units} shares @ ${pos.avg_buy_price}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <span className="text-sm text-gray-500 block">Current: ${pos.current_price}</span>
                                            <span className={`font-bold ${pos.gain_loss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {pos.gain_loss >= 0 ? '+' : ''}${pos.gain_loss.toFixed(2)}
                                            </span>
                                        </div>
                                        {selectedAssetToSell !== pos.symbol && (
                                            <button 
                                                onClick={() => { setSelectedAssetToSell(pos.symbol); setSellQuantity(''); }}
                                                className="bg-red-500 text-white px-4 py-2 rounded font-medium hover:bg-red-600 transition"
                                            >
                                                Sell
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Inline Sell Form */}
                                {selectedAssetToSell === pos.symbol && (
                                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 flex items-center gap-4">
                                        <span className="text-sm text-gray-700">Sell Quantity:</span>
                                        <input 
                                            type="number" 
                                            placeholder="Qty" 
                                            min="1"
                                            max={pos.units}
                                            value={sellQuantity}
                                            onChange={e => setSellQuantity(e.target.value)}
                                            className="border p-2 rounded w-24 focus:ring-2 focus:ring-red-400 outline-none" 
                                        />
                                        <span className="text-sm text-gray-500">of {pos.units} shares</span>
                                        <button 
                                            onClick={() => handleSell(pos)} 
                                            className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 transition"
                                        >
                                            Confirm Sell
                                        </button>
                                        <button 
                                            onClick={cancelSell} 
                                            className="bg-gray-400 text-white px-4 py-2 rounded font-medium hover:bg-gray-500 transition"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
export default Portfolio;