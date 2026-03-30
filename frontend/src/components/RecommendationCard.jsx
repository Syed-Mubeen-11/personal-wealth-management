import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { markAsRead } from '../services/recommendationService';
import StockDrawer from './StockDrawer';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const RecommendationCard = ({ recommendation }) => {
  const [isRead, setIsRead] = useState(recommendation.is_read);
  const [viewType, setViewType] = useState('pie'); 
  const [selectedStock, setSelectedStock] = useState(null);

  const chartData = Object.entries(recommendation.suggested_allocation).map(([name, value]) => ({
    name,
    value
  }));

  const handleToggleRead = async () => {
    const previousState = isRead;
    setIsRead(!isRead);
    try {
      await markAsRead(recommendation.id);
    } catch (err) {
      setIsRead(previousState);
      alert("Failed to update status");
    }
  };

  return (
    <div className={`bg-white rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${isRead ? 'opacity-60 grayscale-[0.5]' : 'border-gray-100 shadow-xl shadow-blue-900/5'}`}>
      <div className="p-10">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
               <h3 className="text-2xl font-black text-gray-800">{recommendation.title}</h3>
               {!isRead && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>}
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Strategy Generated: {new Date(recommendation.created_at).toLocaleDateString('en-IN')}
            </p>
          </div>
          <button 
            onClick={handleToggleRead}
            className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-all ${isRead ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'}`}
          >
            {isRead ? 'ARCHIVED' : 'MARK AS ACTIONED'}
          </button>
        </div>

        {/* Advisor Insight Text */}
        <div className="relative mb-10">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
          <p className="text-gray-700 text-lg leading-relaxed font-medium italic pl-6">
            "{recommendation.recommendation_text}"
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-10">
          {/* Chart Section */}
          <div className="h-[280px] w-full relative bg-gray-50/50 rounded-[2rem] p-4 border border-gray-50">
            <div className="absolute top-4 right-4 z-10 flex bg-white p-1 rounded-xl shadow-sm border">
               <button onClick={() => setViewType('pie')} className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${viewType === 'pie' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}>PIE</button>
               <button onClick={() => setViewType('bar')} className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${viewType === 'bar' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}>BAR</button>
            </div>
            
            <ResponsiveContainer width="100%" height="100%">
              {viewType === 'pie' ? (
                <PieChart>
                  <Pie data={chartData} innerRadius="65%" outerRadius="85%" paddingAngle={8} dataKey="value" stroke="none">
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                </PieChart>
              ) : (
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" fill="#4F46E5" radius={[0, 10, 10, 0]} barSize={20} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Allocation Breakdown Table */}
          <div>
             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Target Allocation</h4>
             <div className="space-y-3">
                {chartData.map((item, idx) => (
                   <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-3">
                         <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>
                         <span className="font-bold text-gray-700 uppercase text-xs">{item.name}</span>
                      </div>
                      <span className="font-black text-blue-600">{item.value}%</span>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* Market Top Picks with Live Data */}
        <div className="pt-8 border-t border-gray-100">
           <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="text-lg">📈</span> Recommended Market Entry
           </h4>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendation.top_picks?.map((stock) => (
                <div 
                  key={stock.symbol} 
                  onClick={() => setSelectedStock(stock)}
                  className="group p-5 bg-gray-50 hover:bg-blue-600 rounded-[1.5rem] transition-all duration-300 cursor-pointer border border-transparent hover:border-blue-400 shadow-sm"
                >
                   <div className="flex justify-between items-start mb-2">
                      <p className="text-[10px] font-black text-gray-400 group-hover:text-blue-200 uppercase">{stock.symbol}</p>
                      <span className={`text-[10px] font-bold ${stock.change >= 0 ? 'text-green-500 group-hover:text-green-300' : 'text-red-500 group-hover:text-red-300'}`}>
                        {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.change)}%
                      </span>
                   </div>
                   <p className="text-xl font-black text-gray-800 group-hover:text-white transition-colors">
                      ₹{stock.price.toLocaleString('en-IN')}
                   </p>
                   <div className="mt-3 text-[9px] font-black text-blue-600 group-hover:text-blue-100 flex items-center gap-1 uppercase tracking-tighter">
                      Analysis Report <span>→</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Side Drawer for Stock Details */}
      <StockDrawer 
        stock={selectedStock} 
        isOpen={!!selectedStock} 
        onClose={() => setSelectedStock(null)} 
      />
    </div>
  );
};

export default RecommendationCard;