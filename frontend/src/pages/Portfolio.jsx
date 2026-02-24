import React, { useState, useEffect } from 'react';
import api from '../api';

function Portfolio() {
    const [holdings, setHoldings] = useState([]);
    const [summary, setSummary] = useState({ invested: 0, current_value: 0, total_profit: 0 });
    const [symbol, setSymbol] = useState('');
    const [priceData, setPriceData] = useState(null);
    const [quantity, setQuantity] = useState('');

    const loadPortfolio = async () => {
        try {
            const res = await api.get('/portfolio/');
            setHoldings(res.data.holdings);
            setSummary(res.data.summary);
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
        await api.post('/assets/', { symbol: priceData.symbol, quantity: parseFloat(quantity), buy_price: priceData.price });
        setPriceData(null); setSymbol(''); setQuantity(''); loadPortfolio();
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-[#1B3C53]">Investment Portfolio</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-xl">
                    <h3 className="text-gray-500 text-sm mb-1 font-bold uppercase">Invested</h3>
                    <p className="text-2xl font-bold text-[#1B3C53]">${summary.invested.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-xl">
                    <h3 className="text-gray-500 text-sm mb-1 font-bold uppercase">Current Value</h3>
                    <p className="text-2xl font-bold text-[#1B3C53]">${summary.current_value.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-xl">
                    <h3 className="text-gray-500 text-sm mb-1 font-bold uppercase">Total Profit</h3>
                    <p className={`text-2xl font-bold ${summary.total_profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {summary.total_profit >= 0 ? '+' : ''}${summary.total_profit.toFixed(2)}
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
                {holdings.length === 0 ? (
                    <p className="text-gray-500 italic">You don't own any assets yet. Buy some stocks above!</p>
                ) : (
                    <div className="space-y-3">
                        {holdings.map((asset, index) => (
                            <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div>
                                    <span className="font-bold text-[#1B3C53] text-lg block">{asset.symbol}</span>
                                    <span className="text-sm text-gray-500">{asset.quantity} shares</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm text-gray-500 block">Bought at: ${asset.buy_price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
export default Portfolio;