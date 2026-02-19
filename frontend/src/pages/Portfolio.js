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
        await api.post('/assets/', {
            symbol: priceData.symbol,
            quantity: parseFloat(quantity),
            buy_price: priceData.price
        });
        setPriceData(null);
        setSymbol('');
        setQuantity('');
        loadPortfolio();
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Investment Portfolio</h1>
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-6 shadow rounded">Invested: ${summary.invested.toFixed(2)}</div>
                <div className="bg-white p-6 shadow rounded">Value: ${summary.current_value.toFixed(2)}</div>
                <div className="bg-white p-6 shadow rounded font-bold text-green-600">Profit: ${summary.total_profit.toFixed(2)}</div>
            </div>

            <div className="bg-white p-6 shadow rounded">
                <h3 className="font-bold mb-2">Buy New Asset</h3>
                <input type="text" placeholder="Symbol" className="border p-2 mr-2" value={symbol} onChange={e => setSymbol(e.target.value)} />
                <button onClick={checkPrice} className="bg-green-600 text-white px-4 py-2 rounded">Check Price</button>
                {priceData && (
                    <div className="mt-4 p-4 bg-gray-50 rounded">
                        <p>Live Price: ${priceData.price}</p>
                        <input type="number" placeholder="Qty" className="border p-2 mt-2" onChange={e => setQuantity(e.target.value)} />
                        <button onClick={buyAsset} className="bg-blue-600 text-white px-4 py-2 ml-2 rounded">Confirm Buy</button>
                    </div>
                )}
            </div>
        </div>
    );
}
export default Portfolio;