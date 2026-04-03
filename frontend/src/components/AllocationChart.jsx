import React, { useState } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const COLORS = {
    stocks: '#3B82F6',
    etfs: '#10B981',
    mutual_funds: '#F59E0B',
    bonds: '#8B5CF6',
    cash: '#EF4444',
    other: '#6B7280'
};

const AllocationChart = ({ allocation }) => {
    const [chartType, setChartType] = useState('doughnut');

    // Process allocation data
    const processData = () => {
        let data = Object.entries(allocation).map(([name, value]) => ({
            name: name.replace(/_/g, ' ').toUpperCase(),
            value: value * 100,
            color: COLORS[name] || COLORS.other
        }));

        // Merge values less than 2%
        const otherItems = data.filter(item => item.value < 2);
        const mainItems = data.filter(item => item.value >= 2);

        if (otherItems.length > 0) {
            const otherValue = otherItems.reduce((sum, item) => sum + item.value, 0);
            mainItems.push({
                name: 'OTHER',
                value: otherValue,
                color: COLORS.other
            });
        }

        return mainItems;
    };

    const chartData = processData();

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'white', border: '1px solid #e5e7eb',
                    borderRadius: '8px', padding: '8px 12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                }}>
                    <p style={{ margin: '0 0 2px', fontWeight: '700', color: '#111827', fontSize: '13px' }}>
                        {payload[0].name}
                    </p>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '12px' }}>
                        {payload[0].value.toFixed(1)}%
                    </p>
                </div>
            );
        }
        return null;
    };

    if (chartType === 'doughnut') {
        return (
            <div className="space-y-4">
                <div className="flex justify-end">
                    <button
                        onClick={() => setChartType('bar')}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        Switch to Bar Chart →
                    </button>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                            labelLine={false}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    onClick={() => setChartType('doughnut')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    ← Switch to Doughnut Chart
                </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#3B82F6">
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AllocationChart;