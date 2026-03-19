import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getTransactions } from '../services/transactionService';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="ml-64 p-8 w-full">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Trade History</h1>
          <p className="text-gray-500 text-sm">Your permanent audit trail of all transactions</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400 italic animate-pulse">Fetching ledger records...</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Asset</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Type</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Quantity</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Price</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Total (Incl. Fees)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      <span className="font-black text-gray-800 tracking-tight uppercase">{t.symbol}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                        t.type.toLowerCase() === 'buy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium text-gray-600">{t.quantity}</td>
                    <td className="p-4 text-right text-gray-600">₹{t.price.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <div className="font-bold text-slate-900">
                        ₹{((t.quantity * t.price) + (t.fees || 0)).toLocaleString()}
                      </div>
                      {t.fees > 0 && <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Fees: ₹{t.fees}</div>}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-gray-400 italic">
                      No trades found in the ledger. Perform a trade in the Investments tab to see it here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default Transactions;