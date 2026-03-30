import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList
} from 'recharts';
import { ChevronDown, ChevronUp, CheckCircle, BarChart2, PieChart as PieChartIcon } from 'lucide-react';

const BRAND_TEAL = '#1B3C53';
const BRAND_TEAL_LIGHT = '#234C6A';
const COLORS = [BRAND_TEAL, '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#64748B'];

export default function RecommendationCard({
  id,
  title,
  recommendationText,
  createdAt,
  suggestedAllocation,
  isRead,
  onMarkAsRead
}) {
  const [isBarView, setIsBarView] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Normalize data safely
  const rawEntries = Object.entries(suggestedAllocation || {});
  const rawSum = rawEntries.reduce((acc, [_, val]) => acc + val, 0);
  const isDecimal = rawSum > 0 && rawSum <= 1.1;

  let chartData = [];
  let otherSum = 0;
  let dominantClass = '';
  let maxVal = -1;

  rawEntries.forEach(([key, val]) => {
    const percentage = isDecimal ? val * 100 : val;
    if (percentage > maxVal) {
      maxVal = percentage;
      dominantClass = key;
    }
    
    if (percentage < 2) {
      otherSum += percentage;
    } else {
      chartData.push({ name: key, value: percentage });
    }
  });

  if (otherSum > 0) {
    chartData.push({ name: 'Other', value: otherSum });
  }

  chartData.sort((a, b) => b.value - a.value);

  const getCardBorder = () => {
    if (isRead) return 'border-l-gray-200';
    return 'border-l-[#1B3C53]';
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(createdAt || Date.now()));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1B3C53] text-white p-3 border-none rounded-lg shadow-xl text-xs sm:text-sm">
          <p className="font-bold border-b border-white/20 pb-1 mb-1">{payload[0].name}</p>
          <p className="text-white/90">{payload[0].value.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      className={`bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xl transition-all duration-500 overflow-hidden ${isRead ? 'opacity-60 grayscale-[0.5]' : ''}`}
      role="article"
      aria-labelledby={`card-title-${id}`}
    >
      <div className="w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8 mt-2">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className={`h-1 w-8 rounded-full ${isRead ? 'bg-gray-300' : 'bg-[#1B3C53]'}`}></span>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">{formattedDate}</p>
            </div>
            <h3 id={`card-title-${id}`} className="text-2xl sm:text-3xl font-black text-[#1B3C53] mb-4 leading-[1.1] tracking-tight">
              {title}
            </h3>
            <div className="max-w-2xl">
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed font-medium">
                {recommendationText}
              </p>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            {!isRead ? (
              <button
                onClick={() => onMarkAsRead(id)}
                className="group flex items-center gap-3 text-[10px] sm:text-xs text-[#1B3C53] transition-all font-bold uppercase tracking-widest px-6 py-3 border-2 border-[#1B3C53] rounded-xl hover:bg-[#1B3C53] hover:text-white"
                aria-label="Mark as read"
              >
                <CheckCircle size={16} className="group-hover:scale-110 transition-transform" /> 
                Acknowledge
              </button>
            ) : (
              <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-xl text-gray-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs">
                <CheckCircle size={16} /> Executed
              </div>
            )}
          </div>
        </div>

        {/* Charts & Analytics Section */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-center bg-[#F8FAFC]/50 -mx-8 -mb-8 sm:-mx-10 sm:-mb-10 p-8 sm:p-10 mt-8 border-t border-gray-50">
            <div className="order-2 xl:order-1">
              <div className="flex justify-between items-end mb-6 pb-2 border-b border-gray-200">
                <h4 className="font-bold text-[#1B3C53] text-[10px] uppercase tracking-widest opacity-60">Target Model</h4>
                <button 
                  onClick={() => setIsBarView(!isBarView)}
                  className="text-[9px] font-bold text-gray-400 hover:text-[#1B3C53] transition uppercase tracking-widest flex items-center gap-1.5"
                >
                  {isBarView ? <PieChartIcon size={12} /> : <BarChart2 size={12} />}
                  {isBarView ? 'Radial' : 'Linear'}
                </button>
              </div>
              
              <div className="space-y-4">
                {chartData.map((item, idx) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{item.name}</span>
                      <span className="text-[11px] font-bold text-[#1B3C53]">{item.value.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200/50 h-1 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-1000 ease-out" 
                        style={{ 
                          width: `${item.value}%`, 
                          backgroundColor: COLORS[idx % COLORS.length] 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 xl:order-2 h-[280px] sm:h-[320px] relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Optimized</p>
                  <p className="text-xl font-black text-[#1B3C53] leading-none">AI</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius="65%"
                    outerRadius="90%"
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
