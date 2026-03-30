import React from 'react';

const RiskProfileBadge = ({ riskProfile, size = 'md' }) => {
  const config = {
    conservative: { color: 'bg-blue-100 text-blue-700', label: 'सुरक्षित' },
    moderate: { color: 'bg-amber-100 text-amber-700', label: 'संतुलित' },
    aggressive: { color: 'bg-red-100 text-red-700', label: 'आक्रामक' },
    pending: { color: 'bg-gray-100 text-gray-400', label: 'पेंडिंग' }
  };

  // Ensure we handle case-insensitivity from the backend
  const normalizedRisk = riskProfile?.toLowerCase() || 'pending';
  const { color, label } = config[normalizedRisk] || config.pending;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[8px]',
    md: 'px-4 py-1 text-[10px]',
    lg: 'px-6 py-2 text-xs'
  };

  return (
    <span className={`${color} ${sizeClasses[size]} rounded-xl font-black uppercase tracking-widest inline-block`}>
      {label}
    </span>
  );
};

export default RiskProfileBadge;