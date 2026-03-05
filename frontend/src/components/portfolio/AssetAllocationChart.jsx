import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function AssetAllocationChart({ allocation }) {
    if (!allocation || !allocation.labels || allocation.labels.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                No assets to display
            </div>
        );
    }

    const data = {
        labels: allocation.labels,
        datasets: [{
            data: allocation.percentages,
            backgroundColor: allocation.colors,
            borderColor: '#ffffff',
            borderWidth: 3,
            hoverBorderWidth: 4,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = allocation.values[context.dataIndex];
                        const percentage = context.parsed;
                        return `${label}: $${value.toLocaleString()} (${percentage.toFixed(1)}%)`;
                    }
                }
            }
        }
    };

    return (
        <div className="flex items-center gap-6">
            <div className="w-48 h-48">
                <Doughnut data={data} options={options} />
            </div>
            <div className="flex flex-col gap-2">
                {allocation.labels.map((label, index) => (
                    <div key={label} className="flex items-center gap-2">
                        <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: allocation.colors[index] }}
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                        <span className="text-sm text-gray-500">
                            ({allocation.percentages[index]}%)
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AssetAllocationChart;
