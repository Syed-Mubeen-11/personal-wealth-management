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

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280'];

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
  const isDecimal = rawSum > 0 && rawSum <= 1.1; // Safely assume decimal format if sum is near 1

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

  // Sort descending
  chartData.sort((a, b) => b.value - a.value);

  // Determine border color based on dominant class (simple hash to color)
  const getBorderColor = () => {
    if (!dominantClass) return 'border-l-blue-500';
    const sumChars = dominantClass.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const colorIndex = sumChars % COLORS.length;
    // Map to tailwind generic colors roughly corresponding to COLORS array
    const twColors = ['border-l-blue-600', 'border-l-green-500', 'border-l-yellow-500', 'border-l-purple-500', 'border-l-red-500', 'border-l-gray-500'];
    return twColors[colorIndex];
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(createdAt || Date.now()));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-md text-sm">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-gray-600">{payload[0].value.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      className={`bg-white border rounded-lg shadow-sm transition-all duration-300 relative ${getBorderColor()} border-l-4 ${isRead ? 'opacity-70 grayscale' : 'hover:shadow-md'}`}
      role="article"
      aria-labelledby={`card-title-${id}`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 id={`card-title-${id}`} className="text-xl font-bold text-gray-800 mb-1">{title}</h3>
            <p className="text-sm text-gray-400">{formattedDate}</p>
          </div>
          {!isRead && (
            <button
              onClick={() => onMarkAsRead(id)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full"
              aria-label="Mark as read"
            >
              <CheckCircle size={16} /> Mark as Read
            </button>
          )}
          {isRead && (
            <span className="flex items-center gap-1 text-sm text-gray-400 font-medium">
              <CheckCircle size={16} /> Read
            </span>
          )}
        </div>

        <p className="text-gray-600 mb-6 leading-relaxed">
          {recommendationText}
        </p>

        {/* Charts Section */}
        {chartData.length > 0 && (
          <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-gray-700 text-sm">Suggested Allocation</h4>
              <button 
                onClick={() => setIsBarView(!isBarView)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition bg-white border border-gray-200 px-2 py-1 rounded"
                aria-label="Toggle chart view"
              >
                {isBarView ? <PieChartIcon size={14} /> : <BarChart2 size={14} />}
                {isBarView ? 'Pie' : 'Bar'}
              </button>
            </div>
            
            <div className="h-64 w-full">
              {isBarView ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" unit="%" domain={[0, 'dataMax']} hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={12} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                      <LabelList dataKey="value" position="right" formatter={(val) => val.toFixed(1) + '%'} fill="#6B7280" fontSize={11} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="80%"
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* Expansion Panel */}
        <div className="mt-4 border-t pt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center gap-2 w-full text-sm text-gray-500 hover:text-gray-800 transition font-medium"
            aria-expanded={isExpanded}
            aria-controls={`breakdown-panel-${id}`}
          >
            {isExpanded ? 'Hide Full Breakdown' : 'View Full Breakdown'}
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <div 
            id={`breakdown-panel-${id}`}
            className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}
          >
            <div className="bg-white border rounded p-4 text-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="pb-2 font-medium">Asset Class</th>
                    <th className="pb-2 font-medium text-right">Allocation</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((item, idx) => (
                    <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full inline-block" 
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        ></span>
                        {item.name}
                      </td>
                      <td className="py-2 text-right font-medium">{item.value.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
