import React from 'react';

const StockDrawer = ({ stock, isOpen, onClose }) => {
  if (!stock) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl transform transition-transform duration-500 ease-out p-8 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <button onClick={onClose} className="mb-8 text-gray-400 hover:text-black font-bold text-sm">✕ CLOSE PANEL</button>
        
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-black text-gray-900">{stock.symbol}</h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">National Stock Exchange</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-blue-600">₹{stock.price}</p>
            <p className={`font-bold ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.change)}%
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-gray-50 rounded-[2rem]">
            <h4 className="text-[10px] font-black text-gray-400 uppercase mb-2">Why this pick?</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              This asset was selected based on its 3-year alpha performance and its correlation with your existing risk profile.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 border border-gray-100 rounded-2xl">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Volatility</p>
                <p className="font-bold text-gray-800">Medium</p>
             </div>
             <div className="p-4 border border-gray-100 rounded-2xl">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Yield</p>
                <p className="font-bold text-gray-800">2.4%</p>
             </div>
          </div>

          <button className="w-full bg-black text-white py-5 rounded-2xl font-black mt-10 hover:bg-blue-600 transition-colors shadow-xl shadow-gray-200">
            TRADE ON ZERODHA / GROWW
          </button>
        </div>
      </div>
    </>
  );
};

export default StockDrawer;